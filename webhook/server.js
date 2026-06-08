const http = require("http");
const crypto = require("crypto");
const { execFile } = require("child_process");
const path = require("path");

// ============================================================
// 云路复材官网 - Webhook 自动部署服务 (支持 GitHub + Gitee)
// 监听端口: 9000
// ============================================================

const PORT = 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

// 仓库 → 部署脚本 映射 (同时映射 GitHub 和 Gitee 的仓库名)
const DEPLOY_MAP = {
  // Gitee 仓库
  "AUSIO2/Gaobei2": {
    script: path.join(__dirname, "deploy_asset_local.sh"),
    label: "资源部署 (asset only)",
  },
  "AUSIO2/Gaobei": {
    script: path.join(__dirname, "deploy_full_local.sh"),
    label: "全量部署 (full)",
  },
  // GitHub 仓库 (兼容)
  "GEM-wb-Gloria/Gaobei": {
    script: path.join(__dirname, "deploy_asset_local.sh"),
    label: "资源部署 (asset only) [GitHub]",
  },
};

// ---- 日志工具 ----
function log(level, msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level}] ${msg}`);
}

// ---- 检测 Webhook 来源平台 ----
function detectPlatform(headers) {
  if (headers["x-gitee-event"]) return "gitee";
  if (headers["x-github-event"]) return "github";
  return "unknown";
}

// ---- GitHub HMAC-SHA256 签名验证 ----
function verifyGitHubSignature(payload, signature) {
  if (!WEBHOOK_SECRET) {
    log("WARN", "WEBHOOK_SECRET 未设置，跳过签名验证");
    return true;
  }
  if (!signature) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ---- Gitee Token 验证 (明文比较) ----
function verifyGiteeToken(headers) {
  if (!WEBHOOK_SECRET) {
    log("WARN", "WEBHOOK_SECRET 未设置，跳过签名验证");
    return true;
  }
  const token = headers["x-gitee-token"] || "";
  return token === WEBHOOK_SECRET;
}

// ---- 执行部署脚本 ----
function runDeploy(config) {
  log("INFO", `开始执行: ${config.label} → ${config.script}`);
  execFile(
    "bash",
    [config.script],
    { timeout: 600000, maxBuffer: 10 * 1024 * 1024 },
    (error, stdout, stderr) => {
      if (stdout) log("INFO", `[stdout]\n${stdout}`);
      if (stderr) log("WARN", `[stderr]\n${stderr}`);
      if (error) {
        log("ERROR", `部署失败: ${error.message}`);
      } else {
        log("INFO", `${config.label} 部署完成 ✅`);
      }
    }
  );
}

// ---- HTTP 服务 ----
const server = http.createServer((req, res) => {
  // 健康检查
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    return;
  }

  // 只接受 POST /webhook
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const platform = detectPlatform(req.headers);
    log("INFO", `收到 Webhook 请求，来源平台: ${platform}`);

    // 签名/Token 验证
    if (platform === "github") {
      const signature = req.headers["x-hub-signature-256"];
      if (!verifyGitHubSignature(body, signature)) {
        log("WARN", "GitHub 签名验证失败，拒绝请求");
        res.writeHead(403);
        res.end("Forbidden: Invalid signature");
        return;
      }
    } else if (platform === "gitee") {
      if (!verifyGiteeToken(req.headers)) {
        log("WARN", "Gitee Token 验证失败，拒绝请求");
        res.writeHead(403);
        res.end("Forbidden: Invalid token");
        return;
      }
    }

    // 获取事件类型
    let event;
    if (platform === "github") {
      event = req.headers["x-github-event"];
    } else if (platform === "gitee") {
      // Gitee: "Push Hook" → "push", "Tag Push Hook" → "tag_push"
      const giteeEvent = req.headers["x-gitee-event"] || "";
      event = giteeEvent.toLowerCase().includes("push") ? "push" : giteeEvent;
    } else {
      event = "unknown";
    }

    // ping 事件
    if (event === "ping") {
      log("INFO", `收到 ${platform} ping 事件 ✅`);
      res.writeHead(200);
      res.end("pong");
      return;
    }

    if (event !== "push") {
      log("INFO", `忽略非 push 事件: ${event}`);
      res.writeHead(200);
      res.end("Ignored");
      return;
    }

    // 解析 payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      log("ERROR", "JSON 解析失败");
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    // Gitee 和 GitHub 的 payload 结构类似，都有 repository.full_name
    const repoFullName = payload.repository && payload.repository.full_name;
    const ref = payload.ref || "";
    const pusher =
      (payload.pusher && payload.pusher.name) ||
      (payload.sender && payload.sender.login) ||
      "unknown";

    log(
      "INFO",
      `收到 push 事件: 平台=${platform}, 仓库=${repoFullName}, 分支=${ref}, 推送者=${pusher}`
    );

    // 只处理 main/master 分支
    if (ref !== "refs/heads/main" && ref !== "refs/heads/master") {
      log("INFO", `忽略非主分支推送: ${ref}`);
      res.writeHead(200);
      res.end("Ignored: not main/master branch");
      return;
    }

    // 查找对应部署配置
    const config = DEPLOY_MAP[repoFullName];
    if (!config) {
      log("WARN", `未知仓库: ${repoFullName}，忽略`);
      res.writeHead(200);
      res.end("Ignored: unknown repository");
      return;
    }

    // 立即返回 200，异步执行部署
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: `已触发 ${config.label}`,
        repository: repoFullName,
      })
    );

    // 异步执行部署
    runDeploy(config);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  log("INFO", `Webhook 服务已启动，监听端口 ${PORT}`);
  log("INFO", `支持平台: GitHub, Gitee`);
  log("INFO", `健康检查: http://0.0.0.0:${PORT}/health`);
  log(
    "INFO",
    `已注册仓库: ${Object.keys(DEPLOY_MAP).join(", ")}`
  );
  if (!WEBHOOK_SECRET) {
    log("WARN", "WEBHOOK_SECRET 未设置，将不验证签名（不推荐用于生产环境）");
  }
});

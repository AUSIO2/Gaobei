# 高倍官网与管理端部署计划

## 目标

- 官网：`https://www.gaobei-tech.com` → `127.0.0.1:3000`
- 管理端：`https://admin.gaobei-tech.com` → `127.0.0.1:9001`
- Webhook/CD：保留 Gitee → `:9000/webhook`
- 公网不直接开放 `3000`、`9001`；统一由 HTTPS `443` 入口访问。

## 前置条件

- DNSPod 新增 `admin.gaobei-tech.com A 43.137.10.128`。
- 腾讯云安全组允许 TCP `80`、`443`；`9001` 不开放。
- 本地官网与管理端生产构建、内容 JSON、部署脚本校验通过。

## 执行步骤

1. 在服务器创建带时间戳的备份目录，保存 systemd、Webhook、iptables、网站资源与现有容器信息。
2. 将本地改动提交并推送至 Gitee，由现有 Webhook 完成官网全量构建。
3. 部署管理端 standalone 产物至 `/root/admin`，写入随机管理密钥与会话密钥。
4. 管理端仅监听 `127.0.0.1:9001`，启用 systemd 安全限制。
5. 在 Webhook 环境写入 `ADMIN_MODE=1`，避免后续 CD 覆盖后台维护的 `/root/asset`。
6. 安装并配置 Caddy，替代现有 `80 → 3000` iptables 转发，按域名代理官网和管理端并自动申请 TLS 证书。
7. 设置管理 Cookie 为 Secure，验证 HTTPS、安全响应头、登录、内容读取、表单数据、官网和 Webhook 健康状态。

## 验收标准

- 本机浏览器访问 `https://admin.gaobei-tech.com/login`，使用部署生成的密钥登录成功。
- 未登录访问后台自动跳转登录页。
- `https://www.gaobei-tech.com/zh` 正常返回。
- `9001` 公网不可直接访问。
- Gitee Webhook 健康检查和部署服务正常。

## 回滚方案

1. 停止并禁用 `gaobei-admin`。
2. 停止 Caddy，恢复备份的 iptables `80 → 3000` 规则。
3. 恢复原 systemd/Webhook 配置并重启服务。
4. 必要时用备份恢复 `/root/asset`、`/root/website` 和原容器镜像。

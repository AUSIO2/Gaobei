"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "登录失败");
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">高倍管理端</h1>
        <p className="mt-2 text-sm text-neutral-500">请输入管理密钥。密钥不会写入网址或浏览器历史。</p>
        <label htmlFor="access-key" className="mt-6 block text-sm font-medium text-neutral-700">管理密钥</label>
        <input
          id="access-key"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={key}
          onChange={(event) => setKey(event.target.value)}
          className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
        />
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="mt-5 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {pending ? "登录中…" : "登录"}
        </button>
      </form>
    </main>
  );
}

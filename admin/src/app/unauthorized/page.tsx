export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">会话无效</h1>
        <p className="mt-3 text-sm text-neutral-600">
          请重新登录管理后台。
        </p>
        <a href="/login" className="mt-5 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">前往登录</a>
      </div>
    </main>
  );
}

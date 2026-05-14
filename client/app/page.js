import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_30%),#050816] text-slate-100">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6 px-2 py-6">
              <span className="inline-flex rounded-full bg-violet-500/20 px-4 py-2 text-sm text-violet-200">Premium realtime chat</span>
              <h1 className="text-5xl font-semibold tracking-tight text-white">Build conversations with speed and animation.</h1>
              <p className="max-w-xl text-slate-300">Secure one-to-one messaging with modern glassmorphism, online status, typing indicator and encrypted authentication.</p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/register" className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Get started</Link>
                <Link href="/login" className="rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400">Login</Link>
              </div>
            </section>
            <section className="relative overflow-hidden rounded-3xl bg-slate-950/70 p-6 shadow-2xl shadow-violet-500/10">
              <div className="absolute -right-16 top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl"></div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-900/70 p-5 shadow-xl shadow-slate-900/20">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Current features</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    <li>Realtime one-to-one chat</li>
                    <li>JWT auth + encrypted passwords</li>
                    <li>Online/offline presence</li>
                    <li>Responsive mobile-first design</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trusted by</p>
                    <p className="mt-3 text-2xl font-semibold text-white">Creative teams</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Built for</p>
                    <p className="mt-3 text-2xl font-semibold text-white">Productive chats</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

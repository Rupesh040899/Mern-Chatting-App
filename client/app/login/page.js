'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/authService';
import { toast } from '../../utils/toast';

export default function LoginPage() {
  const { user, setAuthData } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const leftRef  = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => { if (user) router.push('/chat'); }, [user, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      // Left panel
      tl.from('[data-hero-badge]',   { x: -40, opacity: 0, duration: 0.6 })
        .from('[data-hero-title]',   { x: -40, opacity: 0, duration: 0.65 }, '-=0.35')
        .from('[data-hero-sub]',     { x: -40, opacity: 0, duration: 0.55 }, '-=0.3')
        .from('[data-hero-tag]',     { y: 14, opacity: 0, stagger: 0.07, duration: 0.45 }, '-=0.25')
      // Right panel
        .from('[data-form-head]',    { y: 24, opacity: 0, duration: 0.5 }, '-=0.5')
        .from('[data-form-hint]',    { y: 18, opacity: 0, duration: 0.45 }, '-=0.25')
        .from('[data-form-field]',   { y: 18, opacity: 0, stagger: 0.1, duration: 0.42, clearProps: 'all' }, '-=0.2')
        .from('[data-form-btn]',     { y: 14, opacity: 0, scale: 0.96, duration: 0.4, ease: 'back.out(1.7)', clearProps: 'all' }, '-=0.15');
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form);
      setAuthData(data);
      toast.success('Welcome back!');
      router.push('/chat');
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

      {/* Left panel */}
      <div ref={leftRef} className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-900 dark:bg-zinc-950 border-r border-zinc-800 p-12 lg:flex">
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-ember-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember-500 text-zinc-950 font-bold text-sm">✦</div>
          <span className="font-semibold text-white tracking-wide">R-Sync Chat</span>
        </div>

        <div className="relative space-y-6">
          <div data-hero-badge className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Realtime · Secure · Instant
          </div>
          <h1 data-hero-title className="text-5xl font-bold leading-tight tracking-tight text-white">
            Conversations<br /><span className="text-ember-400">that matter.</span>
          </h1>
          <p data-hero-sub className="max-w-sm text-base text-zinc-400 leading-relaxed">
            End-to-end realtime messaging with Socket.IO, JWT auth, and a premium interface built for focus.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-2">
          {['Socket.IO', 'JWT Auth', 'Realtime', 'Dark & Light'].map((tag) => (
            <span key={tag} data-hero-tag className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-400">{tag}</span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div ref={rightRef} className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div data-form-head className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember-500">Sign in</p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Welcome back</h2>
            <p className="text-sm text-zinc-500">Use the test accounts below or create your own.</p>
          </div>

          <div data-form-hint className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-4 text-sm">
            <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">Test accounts</p>
            <div className="space-y-1 font-mono text-xs text-zinc-500">
              <p>alice@test.com · password123</p>
              <p>bob@test.com · password123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div data-form-field className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                required placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition placeholder:text-zinc-400 focus:border-ember-400 dark:focus:border-ember-500 focus:ring-2 focus:ring-ember-400/20" />
            </div>

            <div data-form-field className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <div className="relative">
                <input id="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pr-12 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition placeholder:text-zinc-400 focus:border-ember-400 dark:focus:border-ember-500 focus:ring-2 focus:ring-ember-400/20" />
                <button type="button" onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button data-form-btn type="submit" disabled={loading}
              className="mt-2 w-full rounded-xl bg-ember-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ember-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            No account?{' '}
            <Link href="/register" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-ember-500 dark:hover:text-ember-400 transition">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

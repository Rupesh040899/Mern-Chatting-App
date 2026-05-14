'use client';

import { useEffect, useState } from 'react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const item = { ...e.detail, id: Date.now() + Math.random() };
      setToasts((prev) => [...prev.slice(-3), item]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 4000);
    };
    window.addEventListener('chat-toast', handler);
    return () => window.removeEventListener('chat-toast', handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) =>
        toast.type === 'message' ? (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-xl animate-fade-up"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ember-500/15 text-sm font-bold text-ember-500">
              {toast.sender?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{toast.sender}</p>
              <p className="mt-0.5 truncate text-xs text-zinc-500">{toast.message}</p>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-400">now</span>
          </div>
        ) : (
          <div
            key={toast.id}
            className={`pointer-events-auto w-80 rounded-2xl px-5 py-3.5 text-sm font-medium text-white shadow-xl animate-fade-up ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'error'   ? 'bg-rose-500'    : 'bg-sky-500'
            }`}
          >
            {toast.message}
          </div>
        )
      )}
    </div>
  );
}

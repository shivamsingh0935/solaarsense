import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type, id: Date.now() + Math.random() } }));
}

export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const onToast = (e) => {
      const t = e.detail;
      setItems((x) => [...x, t]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== t.id)), 3000);
    };
    window.addEventListener('app-toast', onToast);
    return () => window.removeEventListener('app-toast', onToast);
  }, []);
  return (
    <div className="fixed bottom-5 end-5 z-[100] space-y-2" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast-in relative flex items-center overflow-hidden gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-theme-md dark:border-gray-800 dark:bg-gray-800 dark:text-white/90">
          {t.type === 'error' ? <XCircle size={18} className="text-error-500" /> : <CheckCircle2 size={18} className="text-success-500" />}
          {t.message}
          <span className={`toast-bar absolute inset-x-0 bottom-0 h-0.5 ${t.type === 'error' ? 'bg-error-500' : 'bg-success-500'}`} />
        </div>
      ))}
    </div>
  );
}

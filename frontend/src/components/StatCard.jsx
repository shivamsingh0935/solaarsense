import { useRef } from 'react';
import CountUp from './CountUp';

export default function StatCard({ label, value, icon: Icon, tone = 'brand', index = 0 }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15',
    ok: 'bg-success-50 text-success-600 dark:bg-success-500/15',
    bad: 'bg-error-50 text-error-600 dark:bg-error-500/15',
    warn: 'bg-warning-50 text-warning-500 dark:bg-warning-500/15',
    gray: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300',
  };
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(1)}deg) rotateY(${(x * 8).toFixed(1)}deg) translateY(-2px)`;
  };
  const leave = () => { ref.current.style.transform = ''; };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className="card card-hover tilt group fade-up p-5" style={{ '--i': index }}>
      <div className={`icon-hover flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]} ${tone === 'bad' && Number(value) > 0 ? 'pulse-bad' : ''}`}>
        <Icon size={22} />
      </div>
      <div className="mt-5 text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90"><CountUp value={value} /></div>
    </div>
  );
}

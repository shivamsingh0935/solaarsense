import { useEffect, useState } from 'react';

export default function CountUp({ value, duration = 900 }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  const decimals = Number.isInteger(target) ? 0 : 1;
  return <>{n.toLocaleString('en-IN', { maximumFractionDigits: decimals })}</>;
}

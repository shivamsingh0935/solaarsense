import { useEffect, useRef } from 'react';
import api from '../api';

// Server se "kuch badla" ka event milta hai → callback ko reload karne do.
// Ek hi waqt par ek page mount hota hai, toh ek hi stream connection rehta hai.
export default function useLive(onChange) {
  const handler = useRef(onChange);

  useEffect(() => {
    handler.current = onChange;
  });

  useEffect(() => {
    let source = null;
    let reconnect = null;
    let debounce = null;
    let stopped = false;

    const connect = async () => {
      let ticket;
      try {
        const { data } = await api.post('/live/ticket');
        ticket = data.ticket;
      } catch {
        if (!stopped) reconnect = setTimeout(connect, 5000);
        return;
      }
      if (stopped) return;

      source = new EventSource('/api/live/stream?ticket=' + ticket);
      source.addEventListener('change', (e) => {
        const payload = JSON.parse(e.data);
        // cascade delete ek se zyada event chhod sakta hai — ek reload kaafi hai
        clearTimeout(debounce);
        debounce = setTimeout(() => handler.current?.(payload), 400);
      });
      source.onerror = () => {
        source.close();
        if (!stopped) reconnect = setTimeout(connect, 4000);
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnect);
      clearTimeout(debounce);
      source?.close();
    };
  }, []);
}

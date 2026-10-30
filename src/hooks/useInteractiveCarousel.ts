import { useEffect, useRef, useState } from 'react';

export default function useInteractiveCarousel(paused: boolean, enabled: boolean) {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; start: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [interacting, setInteracting] = useState(false);
  useEffect(() => {
    if (!enabled || paused || interacting) return;
    let frame: number;
    let previous = 0;
    const tick = (time: number) => {
      const node = viewport.current;
      if (node && previous) {
        const half = node.scrollWidth / 2;
        node.scrollLeft += Math.min(time - previous, 50) * 0.025;
        if (half > 0 && node.scrollLeft >= half) node.scrollLeft -= half;
      }
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, paused, interacting]);
  return {
    ref: viewport,
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('a')) return;
      suppressClick.current = false;
      drag.current = { id: event.pointerId, x: event.clientX, start: viewport.current?.scrollLeft || 0, moved: false };
      setInteracting(true);
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      const current = drag.current;
      const node = viewport.current;
      if (!current || !node || current.id !== event.pointerId) return;
      const delta = event.clientX - current.x;
      if (Math.abs(delta) > 6) {
        current.moved = true;
        node.setPointerCapture?.(event.pointerId);
      }
      if (current.moved) {
        suppressClick.current = true;
        const half = node.scrollWidth / 2;
        let next = current.start - delta;
        if (enabled && half > 0) next = ((next % half) + half) % half;
        node.scrollLeft = next;
      }
    },
    onPointerUp: () => { drag.current = null; setInteracting(false); },
    onPointerCancel: () => { drag.current = null; setInteracting(false); },
    onLostPointerCapture: () => { drag.current = null; setInteracting(false); },
    onMouseEnter: () => setInteracting(true),
    onMouseLeave: () => { if (!drag.current) setInteracting(false); },
    onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
  };
}

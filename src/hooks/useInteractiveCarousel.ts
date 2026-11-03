import { useCallback, useEffect, useRef, useState } from 'react';

export default function useInteractiveCarousel(paused: boolean, enabled: boolean, loop = enabled) {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; start: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const cycleWidth = useCallback(() => {
    const node = viewport.current;
    const group = node?.firstElementChild?.firstElementChild;
    return group?.getBoundingClientRect().width || (node?.scrollWidth || 0) / 2;
  }, []);
  useEffect(() => {
    if (!enabled || paused || dragging || hovering || focused) return;
    let frame: number;
    let previous: number | undefined;
    // Keep fractional pixels here: browsers may round every scrollLeft assignment.
    // Reading the rounded value each frame loses subpixel advances permanently.
    let position = viewport.current?.scrollLeft || 0;
    let lastWritten = position;
    const tick = (time: number) => {
      const node = viewport.current;
      if (node && node.scrollLeft !== lastWritten) position = node.scrollLeft;
      if (node && previous !== undefined) {
        const cycle = cycleWidth();
        position += Math.min(time - previous, 64) * 0.04;
        if (cycle > 0 && position >= cycle) position %= cycle;
        node.scrollLeft = position;
      }
      if (node) lastWritten = node.scrollLeft;
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, paused, dragging, hovering, focused, cycleWidth]);
  const release = () => { drag.current = null; setDragging(false); };
  return {
    ref: viewport,
    onPointerEnter: (event: React.PointerEvent<HTMLDivElement>) => { if (event.pointerType === 'mouse') setHovering(true); },
    onPointerLeave: () => setHovering(false),
    onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => setFocused((event.target as HTMLElement).matches(':focus-visible')),
    onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false);
    },
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('a')) return;
      suppressClick.current = false;
      setFocused(false);
      drag.current = { id: event.pointerId, x: event.clientX, start: viewport.current?.scrollLeft || 0, moved: false };
      setDragging(true);
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
        const cycle = cycleWidth();
        let next = current.start - delta;
        if (loop && cycle > 0) next = ((next % cycle) + cycle) % cycle;
        node.scrollLeft = next;
      }
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
    onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
  };
}

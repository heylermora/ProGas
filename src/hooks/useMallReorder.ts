import { useRef } from 'react';
import { moveMallItem } from 'services/MallOrderService';

export default function useMallReorder(scope: string, items: string[], onChange?: (scope: string, order: string[]) => void) {
  const start = useRef<{ id: string; x: number; y: number; moved?: boolean }>();
  const commit = (id: string, target: string) => {
    const next = moveMallItem(items, id, target);
    if (next !== items) onChange?.(scope, next);
  };
  return (id: string): React.ButtonHTMLAttributes<HTMLButtonElement> => onChange ? {
    'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown',
    ...{ 'data-mall-reorder-id': id },
    onPointerDown: event => {
      if (event.button !== 0 || !event.isPrimary) return;
      start.current = { id, x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: event => {
      const current = start.current;
      if (current && Math.hypot(event.clientX - current.x, event.clientY - current.y) > 8) current.moved = true;
    },
    onPointerUp: event => {
      const current = start.current;
      if (!current?.moved) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-mall-reorder-id]');
      if (target) commit(current.id, target.dataset.mallReorderId);
    },
    onPointerCancel: () => { start.current = undefined; },
    onClickCapture: event => {
      if (start.current?.moved) { event.preventDefault(); event.stopPropagation(); }
      start.current = undefined;
    },
    onKeyDown: event => {
      if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const target = items[items.indexOf(id) + (event.key === 'ArrowUp' ? -1 : 1)];
      if (target) commit(id, target);
    },
  } : {};
}

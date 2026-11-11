import { act, fireEvent, render, screen } from '@testing-library/react';
import useInteractiveCarousel from './useInteractiveCarousel';

const clicked = jest.fn();
function Carousel({ paused = false, enabled = true }: { paused?: boolean; enabled?: boolean }) {
  const props = useInteractiveCarousel(paused, enabled);
  return <div {...props} data-testid="carousel"><button onClick={clicked}>Negocio</button></div>;
}
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
const step = (time: number) => act(() => {
  const pending = [...frames.values()]; frames.clear(); pending.forEach(frame => frame(time));
});
beforeAll(() => {
  window.PointerEvent = class extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId || 1; this.pointerType = init.pointerType || 'mouse'; }
  } as typeof PointerEvent;
});
beforeEach(() => {
  clicked.mockClear(); frames = new Map(); nextFrame = 0;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.set(++nextFrame, callback); return nextFrame; });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => { frames.delete(id); });
});
afterEach(() => jest.restoreAllMocks());
const metrics = (node: HTMLElement) => {
  Object.defineProperty(node, 'scrollWidth', { configurable: true, value: 1000 });
  Object.defineProperty(node, 'clientWidth', { configurable: true, value: 250 });
};
it('advances automatically even when the browser rounds scrollLeft to integer pixels', () => {
  render(<Carousel />);
  const node = screen.getByTestId('carousel'); metrics(node);
  let position = 0;
  Object.defineProperty(node, 'scrollLeft', { get: () => position, set: value => { position = Math.round(value); } });
  for (let time = 0; time <= 160; time += 8) step(time);
  expect(position).toBeGreaterThanOrEqual(6);
});
it('pauses on mouse hover and resumes after leaving', () => {
  render(<Carousel />);
  const node = screen.getByTestId('carousel'); metrics(node);
  step(0); step(50); const before = node.scrollLeft;
  fireEvent.pointerEnter(node, { pointerType: 'mouse' });
  step(100); step(150); expect(node.scrollLeft).toBe(before);
  fireEvent.pointerLeave(node, { pointerType: 'mouse' });
  step(200); step(250); expect(node.scrollLeft).toBeGreaterThan(before);
});
it('resumes after a touch drag without getting stuck in a hover state', () => {
  render(<Carousel />);
  const node = screen.getByTestId('carousel'); metrics(node);
  fireEvent.pointerEnter(node, { pointerType: 'touch' });
  fireEvent.pointerDown(node, { pointerType: 'touch', clientX: 100, button: 0 });
  fireEvent.pointerMove(node, { pointerType: 'touch', clientX: 50 });
  const dragged = node.scrollLeft;
  step(0); step(50); expect(node.scrollLeft).toBe(dragged);
  fireEvent.pointerUp(node, { pointerType: 'touch' });
  step(100); step(150); expect(node.scrollLeft).toBeGreaterThan(dragged);
});
it('loops at the measured width of a complete group', () => {
  render(<Carousel />);
  const node = screen.getByTestId('carousel'); metrics(node); node.scrollLeft = 499;
  step(0); step(50); expect(node.scrollLeft).toBeCloseTo(1);
});
it('honors the explicit pause and reduced motion setting', () => {
  const view = render(<Carousel paused />);
  const node = screen.getByTestId('carousel'); metrics(node);
  step(0); step(50); expect(node.scrollLeft).toBe(0);
  view.rerender(<Carousel />); step(100); step(150); expect(node.scrollLeft).toBeGreaterThan(0);
  view.rerender(<Carousel enabled={false} />); const before = node.scrollLeft;
  step(200); step(250); expect(node.scrollLeft).toBe(before);
});
it('drags both ways and suppresses the click after dragging', () => {
  render(<Carousel />);
  const carousel = screen.getByTestId('carousel'); metrics(carousel); carousel.scrollLeft = 100;
  fireEvent.pointerDown(carousel, { clientX: 100, button: 0 });
  fireEvent.pointerMove(carousel, { clientX: 50 }); expect(carousel.scrollLeft).toBe(150);
  fireEvent.pointerMove(carousel, { clientX: 130 }); expect(carousel.scrollLeft).toBe(70);
  fireEvent.pointerUp(carousel); fireEvent.click(screen.getByRole('button')); expect(clicked).not.toHaveBeenCalled();
  fireEvent.pointerDown(carousel, { clientX: 100, button: 0 }); fireEvent.pointerUp(carousel);
  fireEvent.click(screen.getByRole('button')); expect(clicked).toHaveBeenCalledTimes(1);
});

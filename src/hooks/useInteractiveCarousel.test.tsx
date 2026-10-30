import { fireEvent, render, screen } from '@testing-library/react';
import useInteractiveCarousel from './useInteractiveCarousel';

function Carousel() {
  const props = useInteractiveCarousel(false, true);
  return <div {...props} data-testid="carousel"><button onClick={() => clicked()}>Negocio</button></div>;
}
const clicked = jest.fn();
it('drags both ways and suppresses the click after dragging', () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  render(<Carousel />);
  const carousel = screen.getByTestId('carousel');
  Object.defineProperty(carousel, 'scrollWidth', { value: 1000 });
  carousel.scrollLeft = 100;
  fireEvent.pointerDown(carousel, { clientX: 100, button: 0 });
  fireEvent.pointerMove(carousel, { clientX: 50 });
  expect(carousel.scrollLeft).toBe(150);
  fireEvent.pointerMove(carousel, { clientX: 130 });
  expect(carousel.scrollLeft).toBe(70);
  fireEvent.pointerUp(carousel);
  fireEvent.click(screen.getByRole('button'));
  expect(clicked).not.toHaveBeenCalled();
  fireEvent.pointerDown(carousel, { clientX: 100, button: 0 });
  fireEvent.pointerUp(carousel);
  fireEvent.click(screen.getByRole('button'));
  expect(clicked).toHaveBeenCalledTimes(1);
});

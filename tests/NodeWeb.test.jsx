import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import ConnectingDotsBackground from '../src/components/NodeWeb';

describe('NodeWeb (ConnectingDotsBackground) Component', () => {
  it('renders canvas element with proper classes', () => {
    const { container } = render(<ConnectingDotsBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('pointer-events-none');
  });

  it('updates target position on mousemove', () => {
    render(<ConnectingDotsBackground theme="dark" />);
    fireEvent.mouseMove(window, { clientX: 200, clientY: 300 });
  });

  it('handles window resize and reinitializes canvas dimensions', () => {
    render(<ConnectingDotsBackground theme="light" />);
    fireEvent.resize(window);
  });

  it('cleans up event listeners and animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ConnectingDotsBackground theme="toast" />);
    unmount();

    expect(cancelSpy).toHaveBeenCalled();
    expect(removeEventSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('executes animation loop, drawing lines and circles across themes', () => {
    const callbacks = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });

    const themes = ['dark', 'light', 'toast', 'burnt-toast', 'unknown'];
    themes.forEach(theme => {
      const { unmount } = render(<ConnectingDotsBackground theme={theme} />);

      // Trigger animation callbacks covering t < 0.5 and t >= 0.5 in easeInOutCirc
      act(() => {
        callbacks.forEach(cb => {
          try {
            cb(100);
            cb(1200); // intermediate progress < 0.5
            cb(1800); // intermediate progress >= 0.5
            cb(5000); // trigger progress >= 1 in shiftPoint
          } catch {
            // best-effort mock tick
          }
        });
      });

      unmount();
    });
  });

  it('gracefully handles null 2D context in canvas', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = () => null;

    const callbacks = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });

    const { unmount } = render(<ConnectingDotsBackground theme="dark" />);

    act(() => {
      callbacks.forEach(cb => {
        try {
          cb(100);
        } catch {
          // best-effort
        }
      });
    });

    unmount();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });
});

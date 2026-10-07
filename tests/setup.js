import '@testing-library/jest-dom';
import { MotionGlobalConfig } from 'framer-motion';

// Disable framer-motion animations in test environment so transitions resolve synchronously
MotionGlobalConfig.skipAnimations = true;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    if (this.callback) {
      this.callback([{ isIntersecting: true, target: element, intersectionRatio: 1 }]);
    }
  }
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: () => {},
  fillRect: () => {},
  beginPath: () => {},
  arc: () => {},
  fill: () => {},
  stroke: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  scale: () => {},
  translate: () => {},
  rotate: () => {},
  save: () => {},
  restore: () => {},
});

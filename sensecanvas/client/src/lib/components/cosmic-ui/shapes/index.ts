/**
 * Cosmic UI SVG Shapes
 * Core SVG path definitions for sci-fi themed components
 */

// Frame shapes for panels and containers
export const frameShapes = {
  default: {
    path: `M 0,10 L 10,0 L calc(100% - 10px),0 L 100%,10 L 100%,calc(100% - 10px) L calc(100% - 10px),100% L 10,100% L 0,calc(100% - 10px) Z`,
    corners: true
  },
  sharp: {
    path: `M 0,0 L 100%,0 L 100%,100% L 0,100% Z`,
    corners: false
  },
  hexagon: {
    path: `M 25%,0 L 75%,0 L 100%,50% L 75%,100% L 25%,100% L 0,50% Z`,
    corners: false
  },
  octagon: {
    path: `M 30%,0 L 70%,0 L 100%,30% L 100%,70% L 70%,100% L 30%,100% L 0,70% L 0,30% Z`,
    corners: false
  },
  cyberpunk: {
    path: `M 20,0 L calc(100% - 20px),0 L 100%,20 L 100%,calc(100% - 40px) L calc(100% - 20px),calc(100% - 20px) L calc(100% - 40px),100% L 40,100% L 20,calc(100% - 20px) L 0,calc(100% - 40px) L 0,20 Z`,
    corners: true
  }
};

// Button shapes
export const buttonShapes = {
  default: {
    path: `M 5,0 L calc(100% - 5px),0 L 100%,5 L 100%,calc(100% - 5px) L calc(100% - 5px),100% L 5,100% L 0,calc(100% - 5px) L 0,5 Z`,
    hover: `M 8,0 L calc(100% - 8px),0 L 100%,8 L 100%,calc(100% - 8px) L calc(100% - 8px),100% L 8,100% L 0,calc(100% - 8px) L 0,8 Z`
  },
  rounded: {
    path: `M 0,50% C 0,0 0,0 50%,0 L 50%,0 C 100%,0 100%,0 100%,50% L 100%,50% C 100%,100% 100%,100% 50%,100% L 50%,100% C 0,100% 0,100% 0,50% Z`,
    hover: null
  },
  hexagon: {
    path: `M 30%,0 L 70%,0 L 100%,50% L 70%,100% L 30%,100% L 0,50% Z`,
    hover: `M 25%,0 L 75%,0 L 100%,50% L 75%,100% L 25%,100% L 0,50% Z`
  }
};

// Progress bar shapes
export const progressShapes = {
  default: {
    track: `M 0,0 L 100%,0 L 100%,100% L 0,100% Z`,
    fill: `M 0,0 L var(--progress),0 L var(--progress),100% L 0,100% Z`
  },
  angled: {
    track: `M 10,0 L 100%,0 L calc(100% - 10px),100% L 0,100% Z`,
    fill: `M 10,0 L var(--progress),0 L calc(var(--progress) - 10px),100% L 0,100% Z`
  }
};

// Alert/notification shapes
export const alertShapes = {
  default: frameShapes.default,
  error: {
    path: `M 0,20 L 20,0 L calc(100% - 20px),0 L 100%,20 L 100%,calc(100% - 20px) L calc(100% - 20px),100% L 20,100% L 0,calc(100% - 20px) Z`,
    corners: true
  }
};

// Helper function to generate SVG element
export function createSVGElement(shape: { path: string; corners?: boolean }, className = '') {
  return `<svg class="${className}" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path d="${shape.path}" fill="currentColor" />
  </svg>`;
}

// Helper function to generate clip-path
export function createClipPath(shape: { path: string }) {
  return `polygon(${shape.path})`;
} 
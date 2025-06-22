declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': {
        url?: string;
        className?: string;
        style?: React.CSSProperties;
        loading?: 'lazy' | 'eager';
        'events-target'?: string;
      };
    }
  }
}

export {};
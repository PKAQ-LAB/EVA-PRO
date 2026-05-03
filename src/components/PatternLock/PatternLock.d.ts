declare interface PatternLockOptions {
  matrix?: [number, number];
  margin?: number;
  radius?: number;
  patternVisible?: boolean;
  lineOnMove?: boolean;
  delimiter?: string;
  enableSetPattern?: boolean;
  allowRepeat?: boolean;
  onDraw?: (pattern: string) => void;
  mapper?: Record<number, number> | ((idx: number) => number);
}

declare class PatternLockClass {
  constructor(holder: Element, option?: PatternLockOptions);
  option(key: string, val?: unknown): unknown;
  getPattern(): string;
  setPattern(pattern: string | string[]): void;
  enable(): void;
  disable(): void;
  reset(): void;
  error(): void;
  checkForPattern(
    pattern: string,
    success?: () => void,
    error?: () => void,
  ): void;
}

declare const PatternLock: {
  new (holder: Element, option?: PatternLockOptions): PatternLockClass;
};

export default PatternLock;

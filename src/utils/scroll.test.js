import { describe, it, expect } from 'vitest';
import { getScrubProgress, isNavSolid } from './scroll.js';

describe('getScrubProgress', () => {
  it('returns 0 when the container top is at the viewport top', () => {
    expect(getScrubProgress(0, 2000, 1000)).toBe(0);
  });

  it('returns 1 when scrolled exactly through the scrollable range', () => {
    // container height 2000, viewport 1000 -> scrollable range is 1000px
    expect(getScrubProgress(-1000, 2000, 1000)).toBe(1);
  });

  it('returns 0.5 at the midpoint of the scrollable range', () => {
    expect(getScrubProgress(-500, 2000, 1000)).toBe(0.5);
  });

  it('clamps to 0 when top is positive (not yet scrolled in)', () => {
    expect(getScrubProgress(400, 2000, 1000)).toBe(0);
  });

  it('clamps to 1 when scrolled past the end', () => {
    expect(getScrubProgress(-5000, 2000, 1000)).toBe(1);
  });

  it('returns 0 when container is not taller than the viewport (no scrollable range)', () => {
    expect(getScrubProgress(0, 800, 1000)).toBe(0);
  });
});

describe('isNavSolid', () => {
  it('is false at scrollY 0', () => {
    expect(isNavSolid(0)).toBe(false);
  });

  it('is false just under the default threshold', () => {
    expect(isNavSolid(89)).toBe(false);
  });

  it('is true at or past the default threshold', () => {
    expect(isNavSolid(90)).toBe(true);
    expect(isNavSolid(200)).toBe(true);
  });

  it('respects a custom threshold', () => {
    expect(isNavSolid(50, 40)).toBe(true);
    expect(isNavSolid(30, 40)).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { getScrubProgress } from './scroll.js';

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

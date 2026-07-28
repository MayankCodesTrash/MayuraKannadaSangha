export function getScrubProgress(top, containerHeight, viewportHeight) {
  const scrollableRange = containerHeight - viewportHeight;
  if (scrollableRange <= 0) return 0;
  const scrolled = -top;
  return Math.min(1, Math.max(0, scrolled / scrollableRange));
}

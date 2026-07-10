import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WaveDividerLayers from './WaveDividerLayers.jsx';

describe('WaveDividerLayers', () => {
  it('renders three stacked wave layers at decreasing opacity', () => {
    const { container } = render(<WaveDividerLayers />);
    const waves = container.querySelectorAll('.wave-divider');
    expect(waves).toHaveLength(3);
    const opacities = Array.from(waves).map((w) => w.style.opacity);
    expect(opacities).toEqual(['0.35', '0.6', '1']);
  });
});

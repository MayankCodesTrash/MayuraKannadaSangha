import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WaveDivider from './WaveDivider.jsx';

describe('WaveDivider', () => {
  it('renders an svg element', () => {
    const { container } = render(<WaveDivider />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies the flip class when flip is true', () => {
    const { container } = render(<WaveDivider flip />);
    expect(container.querySelector('.wave-divider--flip')).toBeInTheDocument();
  });

  it('has a valid d attribute on the path element on initial render', () => {
    const { container } = render(<WaveDivider />);
    const pathElement = container.querySelector('path');
    const dAttribute = pathElement.getAttribute('d');
    // Ensure the d attribute exists and starts with 'M' (valid SVG path)
    expect(dAttribute).toBeTruthy();
    expect(dAttribute).toMatch(/^M/);
  });
});

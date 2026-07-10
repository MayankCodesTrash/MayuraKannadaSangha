import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PeacockPattern from './PeacockPattern.jsx';

describe('PeacockPattern', () => {
  it('renders an svg with a pattern definition', () => {
    const { container } = render(<PeacockPattern />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('pattern')).toBeInTheDocument();
  });
});

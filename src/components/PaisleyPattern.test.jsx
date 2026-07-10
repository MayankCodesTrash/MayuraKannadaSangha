import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PaisleyPattern from './PaisleyPattern.jsx';

describe('PaisleyPattern', () => {
  it('renders an svg with a pattern definition', () => {
    const { container } = render(<PaisleyPattern />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('pattern')).toBeInTheDocument();
  });
});

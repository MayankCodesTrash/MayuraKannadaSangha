import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KolamPattern from './KolamPattern.jsx';

describe('KolamPattern', () => {
  it('renders an svg with a pattern definition', () => {
    const { container } = render(<KolamPattern />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('pattern')).toBeInTheDocument();
  });
});

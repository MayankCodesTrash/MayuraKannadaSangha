import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KolamPattern from './KolamPattern.jsx';

describe('KolamPattern', () => {
  it('renders a repeating background pattern element', () => {
    const { container } = render(<KolamPattern />);
    expect(container.querySelector('.kolam-pattern')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Culture from './Culture.jsx';
import { CULTURE_CONTENT } from '../data/cultureContent.js';

function renderCulture() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Culture />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Culture page', () => {
  it('renders the English heading and all four pillar transliterations by default', () => {
    renderCulture();
    expect(
      screen.getByRole('heading', { name: 'Mayura Kannada Sangha – Central Iowa' })
    ).toBeInTheDocument();
    CULTURE_CONTENT.en.pillars.forEach((pillar) => {
      expect(screen.getByText(pillar.transliteration)).toBeInTheDocument();
    });
  });

  it('switches the heading and paragraphs to Kannada when the toggle is clicked', () => {
    renderCulture();
    fireEvent.click(screen.getByRole('button', { name: 'ಕನ್ನಡ' }));

    expect(
      screen.getByRole('heading', { name: CULTURE_CONTENT.kn.heading })
    ).toBeInTheDocument();
    expect(screen.getByText(CULTURE_CONTENT.kn.closing)).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext.jsx';
import Team from './Team.jsx';

function renderTeam() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Team />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Team page', () => {
  it('renders the heading and a mailto contact link', () => {
    renderTeam();
    expect(screen.getByRole('heading', { name: '2026 Office Bearers' })).toBeInTheDocument();
    const contact = document.querySelector('.team-page__contact');
    expect(within(contact).getByRole('link', { name: 'mksdsm2024@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:mksdsm2024@gmail.com'
    );
  });

  it('renders every office bearer with their name and role', () => {
    renderTeam();
    [
      ['Arun Kumar', 'President'],
      ['Chandra Shekar', 'Secretary'],
      ['Yogeshwara Gonchigar', 'Treasurer'],
      ['Naveen Setty', 'Chairperson'],
      ['Raghunath Shammanna', 'Chairperson'],
    ].forEach(([name, role]) => {
      const card = screen.getByRole('heading', { name }).closest('.team-page__card');
      expect(card).not.toBeNull();
      expect(card.textContent).toContain(role);
    });
  });
});

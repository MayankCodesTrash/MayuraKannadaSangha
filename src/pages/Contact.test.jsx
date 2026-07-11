import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { AuthProvider } from '../auth/AuthContext.jsx';
import { isEmailjsConfigured } from '../emailjs.js';
import Contact from './Contact.jsx';

vi.mock('@emailjs/browser', () => ({ default: { send: vi.fn() } }));
vi.mock('../emailjs.js', () => ({
  EMAILJS_CONFIG: { serviceId: 'svc', templateId: 'tpl', publicKey: 'key' },
  isEmailjsConfigured: vi.fn(),
}));

function renderContact() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Contact />
      </AuthProvider>
    </MemoryRouter>
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello!' } });
}

beforeEach(() => {
  vi.mocked(emailjs.send).mockReset();
  vi.mocked(isEmailjsConfigured).mockReset();
});

describe('Contact page', () => {
  it('renders a name/email/message form', () => {
    renderContact();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
  });

  it('shows an "unavailable" message instead of crashing when EmailJS is not configured', async () => {
    vi.mocked(isEmailjsConfigured).mockReturnValue(false);
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() =>
      expect(screen.getByText(/isn't connected yet/)).toBeInTheDocument()
    );
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it('sends the message via EmailJS and shows a success message when configured', async () => {
    vi.mocked(isEmailjsConfigured).mockReturnValue(true);
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200 });
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() =>
      expect(emailjs.send).toHaveBeenCalledWith(
        'svc',
        'tpl',
        { from_name: 'Jane Doe', from_email: 'jane@example.com', message: 'Hello!' },
        'key'
      )
    );
    expect(screen.getByText('Thanks! Your message has been sent.')).toBeInTheDocument();
  });
});

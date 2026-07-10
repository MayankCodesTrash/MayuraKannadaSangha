import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutSection from './AboutSection.jsx';

describe('AboutSection', () => {
  it('renders the English and Kannada descriptions and a carousel image', () => {
    const { container } = render(<AboutSection />);
    expect(screen.getByText(/dynamic cultural organization/)).toBeInTheDocument();
    expect(screen.getByText(/ಐವಾಯಲ್ಲಿನ ಕನ್ನಡಿಗರ ಸಾಂಸ್ಕೃತಿಕ ಸಂಘಟನೆಯಾಗಿದ್ದು/)).toBeInTheDocument();
    expect(container.querySelector('.carousel img')).toBeInTheDocument();
  });
});

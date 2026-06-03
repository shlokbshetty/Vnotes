import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import PricingPage from './PricingPage';
import { apiService } from '../services/api';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType, AuthUser } from '../types';

const mockUser: AuthUser = {
  user_id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
};

const mockAuthContext: AuthContextType = {
  user: mockUser,
  sessionToken: 'token',
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../services/api', () => ({
  apiService: {
    getPricing: vi.fn(),
  },
}));

const mockPricing = {
  tiers: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Free tier',
      features: ['60 mins'],
      cta: 'Start Free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19,
      description: 'Pro tier',
      features: ['Unlimited'],
      cta: 'Upgrade',
      isPopular: true,
    },
  ],
  comparison: {
    features: ['Storage'],
    tiers: {
      free: ['1 GB'],
      pro: ['100 GB'],
    },
  },
};

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pricing cards from API response', async () => {
    vi.mocked(apiService.getPricing).mockResolvedValueOnce(mockPricing);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthContext.Provider value={mockAuthContext}>
            <PricingPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pricing-card-free')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-card-pro')).toBeInTheDocument();
    });
  });

  it('populates comparison table from API response', async () => {
    vi.mocked(apiService.getPricing).mockResolvedValueOnce(mockPricing);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthContext.Provider value={mockAuthContext}>
            <PricingPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pricing-comparison')).toBeInTheDocument();
      expect(screen.getByText('Storage')).toBeInTheDocument();
      expect(screen.getByText('1 GB')).toBeInTheDocument();
      expect(screen.getByText('100 GB')).toBeInTheDocument();
    });
  });

  it('shows error message and retry on API failure', async () => {
    vi.mocked(apiService.getPricing).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthContext.Provider value={mockAuthContext}>
            <PricingPage />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Could not load pricing data. Please try again.')
      ).toBeInTheDocument();
    });

    vi.mocked(apiService.getPricing).mockResolvedValueOnce(mockPricing);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(screen.getByTestId('pricing-card-free')).toBeInTheDocument();
    });
  });
});

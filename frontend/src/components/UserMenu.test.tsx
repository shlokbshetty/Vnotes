import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserMenu from './UserMenu';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType, AuthUser } from '../types';

/**
 * Tests for UserMenu component
 * Validates user info display, dropdown menu, and logout functionality
 * Requirements: 8.7, 8.8, 4.1, 8.9, 8.10
 */

describe('UserMenu', () => {
  const mockUser: AuthUser = {
    user_id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    profile_picture_url: 'https://example.com/avatar.jpg',
  };

  const mockAuthContext: AuthContextType = {
    user: mockUser,
    sessionToken: 'test-token',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  const renderWithAuth = (authContext: AuthContextType = mockAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <UserMenu />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('returns null when user is not authenticated', () => {
    const unauthContext: AuthContextType = {
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { container } = renderWithAuth(unauthContext);
    expect(container.firstChild).toBeNull();
  });

  it('displays user name in menu button', () => {
    renderWithAuth();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays user profile picture when available', () => {
    renderWithAuth();
    const img = screen.getByAltText('Test User') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://example.com/avatar.jpg');
  });

  it('displays user initials when profile picture not available', () => {
    const userNoPicture: AuthUser = {
      user_id: 'test-user-id',
      email: 'test@example.com',
      name: 'John Doe',
    };

    const context: AuthContextType = {
      ...mockAuthContext,
      user: userNoPicture,
    };

    renderWithAuth(context);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('opens dropdown menu when button is clicked', () => {
    renderWithAuth();
    const button = screen.getByRole('button');

    expect(screen.queryByTestId('user-menu-logout-button')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByTestId('user-menu-logout-button')).toBeInTheDocument();
  });

  it('closes dropdown menu when button is clicked again', () => {
    renderWithAuth();
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(screen.getByTestId('user-menu-logout-button')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByTestId('user-menu-logout-button')).not.toBeInTheDocument();
  });

  it('displays user email in dropdown', () => {
    renderWithAuth();
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('calls logout endpoint when logout button clicked', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    renderWithAuth();
    const button = screen.getByRole('button');

    fireEvent.click(button);

    fireEvent.click(screen.getByTestId('user-menu-logout-button'));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('calls logout method on context after logout', async () => {
    const mockLogout = vi.fn();
    const context: AuthContextType = {
      ...mockAuthContext,
      logout: mockLogout,
    };

    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

    renderWithAuth(context);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    fireEvent.click(screen.getByTestId('user-menu-logout-button'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('handles logout API failure gracefully', async () => {
    const mockLogout = vi.fn();
    const context: AuthContextType = {
      ...mockAuthContext,
      logout: mockLogout,
    };

    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderWithAuth(context);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    fireEvent.click(screen.getByTestId('user-menu-logout-button'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    renderWithAuth();
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(screen.getByTestId('user-menu-logout-button')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByTestId('user-menu-logout-button')).not.toBeInTheDocument();
    });
  });

  it('handles single-name users for initials', () => {
    const singleNameUser: AuthUser = {
      user_id: 'test-user-id',
      email: 'test@example.com',
      name: 'Madonna',
    };

    const context: AuthContextType = {
      ...mockAuthContext,
      user: singleNameUser,
    };

    renderWithAuth(context);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('limits initials to 2 characters', () => {
    const longNameUser: AuthUser = {
      user_id: 'test-user-id',
      email: 'test@example.com',
      name: 'Alexander Jean-Baptiste Emmanuel',
    };

    const context: AuthContextType = {
      ...mockAuthContext,
      user: longNameUser,
    };

    renderWithAuth(context);
    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('sets aria attributes correctly', () => {
    renderWithAuth();
    const button = screen.getByRole('button', { hidden: true });

    expect(button).toHaveAttribute('aria-haspopup', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});

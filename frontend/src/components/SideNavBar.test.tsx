import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SideNavBar from './SideNavBar';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
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

function renderSideNavBar(initialPath = '/library') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <SideNavBar />
        </AuthContext.Provider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('SideNavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(min-width: 1440px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders all navigation links', () => {
    renderSideNavBar();
    expect(screen.getByTestId('nav-link-library')).toHaveTextContent('Library');
    expect(screen.getByTestId('nav-link-recordings')).toHaveTextContent('Recordings');
    expect(screen.getByTestId('nav-link-settings')).toHaveTextContent('Settings');
    expect(screen.getByTestId('nav-link-help')).toHaveTextContent('Help');
  });

  it('positions ThemeToggle above the user profile section', () => {
    renderSideNavBar();
    const footer = screen.getByTestId('side-nav-footer');
    const themeRow = screen.getByTestId('theme-toggle-row');
    const profile = screen.getByTestId('user-profile-section');

    expect(footer).toContainElement(themeRow);
    expect(footer).toContainElement(profile);

    const children = Array.from(footer.children);
    expect(children.indexOf(themeRow)).toBeLessThan(children.indexOf(profile));
  });

  it('applies glass-edge divider classes on footer sections', () => {
    renderSideNavBar();
    const footer = screen.getByTestId('side-nav-footer');
    expect(footer.className).toMatch(/border-black\/15/);
    expect(footer.className).toMatch(/dark:border-white\/10/);

    const profile = screen.getByTestId('user-profile-section');
    expect(profile.className).toMatch(/border-black\/15/);
    expect(profile.className).toMatch(/dark:border-white\/10/);
  });

  it('highlights the active route with primary-accent background', () => {
    renderSideNavBar('/library');
    const libraryLink = screen.getByTestId('nav-link-library');
    expect(libraryLink.className).toContain('bg-primary-accent');

    const recordingsLink = screen.getByTestId('nav-link-recordings');
    expect(recordingsLink.className).not.toContain('bg-primary-accent');
  });

  it('marks Recordings active only on the root path', () => {
    renderSideNavBar('/');
    const recordingsLink = screen.getByTestId('nav-link-recordings');
    expect(recordingsLink.className).toContain('bg-primary-accent');
  });

  it('displays user profile with name and email', () => {
    renderSideNavBar();
    const profile = screen.getByTestId('user-profile-section');
    expect(within(profile).getByText('Test User')).toBeInTheDocument();
    expect(within(profile).getByText('user@example.com')).toBeInTheDocument();
  });

  it('shows a menu button on viewports below 1440px', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderSideNavBar();
    expect(screen.getByTestId('side-nav-menu-button')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppPageShell from '../components/AppPageShell';
import SideNavBar from '../components/SideNavBar';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType } from '../types';

const auth: AuthContextType = {
  user: { user_id: '1', email: 'a@b.com', name: 'User' },
  sessionToken: 't',
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
};

function mockViewport(matchesDesktop: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 1440px)' ? matchesDesktop : !matchesDesktop,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('Responsive layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('desktop (1440px+) shows SideNavBar inline without menu button', () => {
    mockViewport(true);
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthContext.Provider value={auth}>
            <SideNavBar />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('side-nav-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('side-nav-menu-button')).not.toBeInTheDocument();
  });

  it('tablet/mobile (<1440px) shows hamburger menu for drawer', () => {
    mockViewport(false);
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthContext.Provider value={auth}>
            <SideNavBar />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('side-nav-menu-button')).toBeInTheDocument();
  });

  it('AppPageShell provides nav + content regions for three-pane pages', () => {
    mockViewport(true);
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthContext.Provider value={auth}>
            <AppPageShell>
              <div data-testid="workspace-pane">Workspace</div>
            </AppPageShell>
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('side-nav-bar')).toBeInTheDocument();
    expect(screen.getByTestId('app-page-content')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-pane')).toBeInTheDocument();
  });
});

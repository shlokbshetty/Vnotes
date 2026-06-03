import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import PricingCard from './PricingCard';

const baseProps = {
  id: 'free',
  name: 'Free',
  price: 0,
  description: 'Basic plan',
  features: ['Feature A', 'Feature B'],
  cta: 'Start Free',
};

function renderCard(props: Partial<typeof baseProps & { isPopular?: boolean }> = {}) {
  return render(
    <ThemeProvider>
      <PricingCard {...baseProps} {...props} />
    </ThemeProvider>
  );
}

describe('PricingCard', () => {
  it('applies scale-105 and shadow-lg for popular tier', () => {
    const { container } = renderCard({ isPopular: true });
    const card = container.querySelector('[data-testid="pricing-card-free"]');
    expect(card?.className).toContain('scale-105');
    expect(card?.className).toContain('shadow-lg');
  });

  it('does not apply scale or shadow for non-popular tier', () => {
    const { container } = renderCard({ isPopular: false });
    const card = container.querySelector('[data-testid="pricing-card-free"]');
    expect(card?.className).not.toContain('scale-105');
    expect(card?.className).not.toContain('shadow-lg');
  });

  it('renders each feature as a separate list item', () => {
    renderCard();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Feature A');
    expect(items[1]).toHaveTextContent('Feature B');
  });

  it('uses glass-edge border classes for theme-aware dividers', () => {
    const { container } = renderCard();
    const card = container.querySelector('[data-testid="pricing-card-free"]');
    expect(card?.className).toMatch(/border-black\/\[0\.12\]/);
    expect(card?.className).toMatch(/dark:border-white\/\[0\.08\]/);
  });
});

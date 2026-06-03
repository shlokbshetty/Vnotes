import React from 'react';
import '../components/Pricing/PricingPage.css';

interface PricingTier {
  name: string;
  price: number;
  description?: string;
  features: string[];
  ctaText: string;
  ctaUrl?: string;
  highlighted?: boolean;
}

/**
 * Pricing Page
 * 
 * Features:
 * - Three pricing tiers (Free, Pro, Team)
 * - Pro tier highlighted with subtle accent border
 * - Clean, flat design (no heavy cards)
 * - Typography-driven layout
 * - Dark mode consistent with app
 */
const PricingPage: React.FC = () => {
  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        '10 recordings/month',
        '1GB storage',
        'Basic transcript',
        'Web editor',
        'Community support',
      ],
      ctaText: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 9.99,
      description: 'Best for creators and professionals',
      features: [
        'Unlimited recordings',
        '100GB storage',
        'Advanced transcripts',
        'AI-powered summaries',
        'Priority support',
        'Custom tags & categories',
        'API access',
      ],
      ctaText: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Team',
      price: 29.99,
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team management',
        '1TB shared storage',
        'Admin dashboard',
        'SSO & SAML',
        'Priority support (24/7)',
        'Custom integrations',
      ],
      ctaText: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="pricing-page">
      {/* Header */}
      <header className="pricing-header">
        <h1 className="pricing-title">Simple Pricing</h1>
        <p className="pricing-subtitle">
          Choose the perfect plan for your needs. Always flexible to scale.
        </p>
      </header>

      {/* Pricing Tiers */}
      <div className="pricing-container">
        <div className="pricing-tiers">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`pricing-tier ${tier.highlighted ? 'highlighted' : ''}`}
            >
              {/* Tier Header */}
              <div className="pricing-tier-header">
                <h2 className="pricing-tier-name">{tier.name}</h2>
                {tier.description && (
                  <p className="pricing-tier-description">{tier.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="pricing-tier-price">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">{tier.price.toFixed(2)}</span>
                <span className="pricing-period">/month</span>
              </div>

              {/* Features List */}
              <ul className="pricing-tier-features">
                {tier.features.map((feature, index) => (
                  <li key={index} className="pricing-feature">
                    <span className="pricing-feature-icon">✓</span>
                    <span className="pricing-feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`pricing-cta-button ${tier.highlighted ? 'highlighted' : ''}`}
                onClick={() => {
                  if (tier.ctaUrl) {
                    window.location.href = tier.ctaUrl;
                  }
                }}
              >
                {tier.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <footer className="pricing-footer">
        <p>
          All plans include unlimited access to the workspace. Need a custom plan?{' '}
          <a href="mailto:sales@vnotes.com" className="pricing-footer-link">
            Contact our sales team
          </a>
        </p>
      </footer>
    </div>
  );
};

export default PricingPage;

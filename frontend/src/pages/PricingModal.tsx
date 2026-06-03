import React, { useState } from 'react';
import './PricingModal.css';

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  description: string;
  features: { category: string; items: string[] }[];
  cta: {
    text: string;
    action: string;
  };
  highlighted?: boolean;
  badge?: string;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Professional Pricing Modal - Phase 2
 * Premium, SaaS-inspired design with advanced hierarchy
 */
const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      subtitle: 'Perfect for exploring',
      price: 0,
      description: 'Start your thinking journey with essential features.',
      features: [
        {
          category: 'Recording & Storage',
          items: [
            '10 recordings per month',
            '1 GB total storage',
            'Basic audio quality (128 kbps)',
          ],
        },
        {
          category: 'Transcription',
          items: ['Basic transcription', 'English only'],
        },
        {
          category: 'Collaboration',
          items: ['Personal workspace only'],
        },
      ],
      cta: {
        text: 'Get Started Free',
        action: 'signup',
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'For serious creators',
      price: billingCycle === 'monthly' ? 9.99 : 99.9,
      description: 'Unlimited recordings with AI-powered features.',
      highlighted: true,
      badge: 'Most Popular',
      features: [
        {
          category: 'Recording & Storage',
          items: [
            'Unlimited recordings',
            '100 GB cloud storage',
            'Premium audio quality (320 kbps)',
            'Video recording support',
          ],
        },
        {
          category: 'Transcription & AI',
          items: [
            'Advanced transcription (50+ languages)',
            'AI-powered summaries',
            'Smart chapter detection',
            'Speaker identification',
          ],
        },
        {
          category: 'Collaboration',
          items: [
            'Share recordings with others',
            'Comment & annotation features',
            'Priority support (email)',
          ],
        },
        {
          category: 'Integrations',
          items: ['Zapier integration', 'Webhook support'],
        },
      ],
      cta: {
        text: 'Start 14-Day Trial',
        action: 'trial',
      },
    },
    {
      id: 'team',
      name: 'Team',
      subtitle: 'For organizations',
      price: billingCycle === 'monthly' ? 49.99 : 499.9,
      description: 'Advanced features with team management and SSO.',
      features: [
        {
          category: 'Recording & Storage',
          items: [
            'Unlimited recordings per member',
            '1 TB team storage',
            'Premium audio quality (320 kbps)',
            'Batch processing',
          ],
        },
        {
          category: 'Transcription & AI',
          items: [
            'Advanced transcription (90+ languages)',
            'AI-powered insights',
            'Custom vocabulary',
            'Speaker separation',
          ],
        },
        {
          category: 'Collaboration',
          items: [
            'Team workspaces (up to 50 members)',
            'Advanced sharing & permissions',
            'Audit logs',
            'Priority support (24/7 phone)',
          ],
        },
        {
          category: 'Admin & Security',
          items: ['SSO (SAML 2.0)', 'Advanced security controls', 'Custom integrations'],
        },
      ],
      cta: {
        text: 'Contact Sales',
        action: 'contact',
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="pricing-modal-overlay" onClick={onClose}>
      <div className="pricing-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="pricing-close-btn" onClick={onClose} aria-label="Close pricing modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Section */}
        <div className="pricing-header">
          <h1 className="pricing-main-title">Upgrade Your Thinking</h1>
          <p className="pricing-subtitle-text">
            Choose the perfect plan for your creative process. Scale as you grow.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pricing-billing-toggle">
            <button
              className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual
              <span className="savings-badge">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="pricing-tiers-grid">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`pricing-tier-card ${tier.highlighted ? 'highlighted' : ''} ${
                tier.id === 'team' ? 'team-card' : ''
              }`}
            >
              {/* Tier Header */}
              <div className="tier-header">
                {tier.badge && <span className="tier-badge">{tier.badge}</span>}
                <h2 className="tier-name">{tier.name}</h2>
                <p className="tier-subtitle">{tier.subtitle}</p>
              </div>

              {/* Pricing */}
              <div className="tier-pricing">
                {tier.price === 0 ? (
                  <div className="price-display">
                    <span className="price-free">Free Forever</span>
                  </div>
                ) : (
                  <div className="price-display">
                    <span className="price-currency">$</span>
                    <span className="price-amount">{tier.price.toFixed(2)}</span>
                    <span className="price-period">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                )}
                <p className="tier-description">{tier.description}</p>
              </div>

              {/* CTA Button */}
              <button
                className={`tier-cta-btn ${tier.highlighted ? 'primary' : 'secondary'}`}
                onClick={() => {
                  console.log(`${tier.name} - ${tier.cta.action}`);
                }}
              >
                {tier.cta.text}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 12l4-4-4-4" />
                </svg>
              </button>

              {/* Features List */}
              <div className="tier-features">
                {tier.features.map((featureGroup, idx) => (
                  <div key={idx} className="feature-group">
                    <h3 className="feature-group-title">{featureGroup.category}</h3>
                    <ul className="feature-list">
                      {featureGroup.items.map((feature, itemIdx) => (
                        <li key={itemIdx} className="feature-item">
                          <svg className="feature-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill={tier.highlighted ? '#9D4EDD' : '#E8A06A'} />
                            <path
                              d="M4 8l2 2 4-4"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="feature-text">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Comparison CTA */}
        <div className="pricing-footer">
          <p className="footer-text">
            Want more details?{' '}
            <button className="footer-link" onClick={() => console.log('Compare plans')}>
              Compare all features
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;

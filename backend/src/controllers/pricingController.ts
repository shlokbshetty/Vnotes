/**
 * Pricing Controller — static tier data for GET /api/pricing
 */

import { Request, Response } from 'express';

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

export interface PricingComparison {
  features: string[];
  tiers: Record<string, string[]>;
}

export interface PricingResponse {
  tiers: PricingTier[];
  comparison: PricingComparison;
}

export function getPricingData(): PricingResponse {
  return {
    tiers: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'Get started with essential transcription and note-taking.',
        features: [
          '60 mins transcription / month',
          '1 GB storage',
          'Basic export (TXT)',
          'Personal workspace',
        ],
        cta: 'Start Free',
      },
      {
        id: 'pro',
        name: 'Professional',
        price: 19,
        description: 'Unlimited transcription, AI insights, and team-ready exports.',
        features: [
          'Unlimited transcription',
          '100 GB cloud storage',
          'AI summaries & action items',
          'Priority support',
          'Advanced export formats',
        ],
        cta: 'Upgrade to Pro',
        isPopular: true,
      },
    ],
    comparison: {
      features: [
        'Transcription length',
        'Storage',
        'AI summaries',
        'Export formats',
        'Support',
      ],
      tiers: {
        free: ['1 hr / mo', '1 GB', '—', 'TXT', 'Community'],
        pro: ['Unlimited', '100 GB', 'Included', 'TXT, PDF, DOCX', 'Priority'],
      },
    },
  };
}

export const getPricing = (_req: Request, res: Response): void => {
  try {
    res.status(200).json(getPricingData());
  } catch {
    res.status(500).json({
      success: false,
      message: 'Failed to load pricing data',
    });
  }
};

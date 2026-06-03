import { useCallback, useEffect, useState } from 'react';
import PricingCard from '../components/PricingCard';
import AppPageShell from '../components/AppPageShell';
import { apiService } from '../services/api';
import type { PricingResponse } from '../types';

const PricingPage = () => {
  const [data, setData] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPricing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getPricing();
      setData(response);
    } catch {
      setError('Could not load pricing data. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  if (loading) {
    return (
      <AppPageShell>
        <div className="flex-1 flex h-screen items-center justify-center bg-background">
          <p className="font-mono text-xs tracking-wider text-neutral-400">Loading pricing…</p>
        </div>
      </AppPageShell>
    );
  }

  if (error || !data) {
    return (
      <AppPageShell>
        <div className="flex-1 flex h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="text-neutral-300">{error ?? 'Could not load pricing data. Please try again.'}</p>
          <button
            type="button"
            onClick={loadPricing}
            className="rounded bg-primary-container text-on-primary-container px-4 py-2 font-mono text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </AppPageShell>
    );
  }

  return (
    <AppPageShell>
      <div className="flex-1 flex flex-col min-w-0 relative bg-background overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center w-full px-margin-page h-16 bg-surface border-b border-white/10 shrink-0">
          <div className="flex items-center gap-8">
            <span className="md:hidden text-headline-md font-headline-md font-bold text-on-surface">VNotes</span>
            <nav className="hidden lg:flex items-center gap-6">
              <span className="text-on-surface-variant text-body-md font-body-md">Editor</span>
              <span className="text-on-surface-variant text-body-md font-body-md">Transcript</span>
              <span className="text-on-surface-variant text-body-md font-body-md">Insights</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary-container overflow-hidden border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar waveform-bg">
          <div className="max-w-6xl mx-auto px-margin-page py-16">
            {/* Title Section */}
            <div className="text-center mb-16">
              <h2 className="text-headline-lg font-headline-lg text-on-surface mb-4">Precision Pricing for Power Users</h2>
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Scale your technical workflow with high-fidelity recording, AI-driven transcription, and real-time audio insights.
              </p>
            </div>

            {/* Bento Grid Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-20" data-testid="pricing-cards-grid">
              {data.tiers.map((tier) => (
                <PricingCard key={tier.id} {...tier} />
              ))}
              {/* Static Enterprise Tier to complete 3 columns */}
              <PricingCard
                id="enterprise"
                name="Enterprise"
                price={NaN}
                description="Custom model training, SSO, and dedicated API access."
                features={[
                  'Custom Model Training',
                  'SSO & Advanced Security',
                  'Dedicated API Access',
                ]}
                cta="Contact Sales"
                isPopular={false}
              />
            </div>

            {/* Comparison Table */}
            <div className="bg-surface-container-low glass-border rounded-xl overflow-hidden mt-12" data-testid="pricing-comparison">
              <div className="p-8 border-b border-white/10">
                <h4 className="text-headline-sm font-headline-sm text-on-surface">Feature Comparison</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/50">
                      <th className="p-6 text-label-mono font-label-mono text-on-surface-variant border-b border-white/10">Feature</th>
                      <th className="p-6 text-label-mono font-label-mono text-on-surface border-b border-white/10">Free</th>
                      <th className="p-6 text-label-mono font-label-mono text-primary border-b border-white/10">Pro</th>
                      <th className="p-6 text-label-mono font-label-mono text-on-surface border-b border-white/10">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-6 text-body-md text-on-surface-variant">Transcription Length</td>
                      <td className="p-6 text-body-md text-on-surface-variant">1 Hr / mo</td>
                      <td className="p-6 text-body-md font-bold text-on-surface">Unlimited</td>
                      <td className="p-6 text-body-md text-on-surface-variant">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-6 text-body-md text-on-surface-variant">Audio Export Formats</td>
                      <td className="p-6 text-body-md text-on-surface-variant">MP3 Only</td>
                      <td className="p-6 text-body-md font-bold text-on-surface">FLAC, WAV, MP3</td>
                      <td className="p-6 text-body-md text-on-surface-variant">Lossless Custom</td>
                    </tr>
                    <tr>
                      <td className="p-6 text-body-md text-on-surface-variant">AI Insights</td>
                      <td className="p-6 text-body-md text-on-surface-variant">—</td>
                      <td className="p-6 text-body-md text-tertiary">✓</td>
                      <td className="p-6 text-body-md text-tertiary">✓</td>
                    </tr>
                    <tr>
                      <td className="p-6 text-body-md text-on-surface-variant">Custom Vocabulary</td>
                      <td className="p-6 text-body-md text-on-surface-variant">—</td>
                      <td className="p-6 text-body-md text-on-surface-variant">—</td>
                      <td className="p-6 text-body-md text-tertiary">✓</td>
                    </tr>
                    <tr>
                      <td className="p-6 text-body-md text-on-surface-variant">Storage</td>
                      <td className="p-6 text-body-md text-on-surface-variant">1 GB</td>
                      <td className="p-6 text-body-md font-bold text-on-surface">100 GB</td>
                      <td className="p-6 text-body-md text-on-surface-variant">Unlimited</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Banner/Footer image */}
            <div className="mt-20 rounded-2xl overflow-hidden glass-border h-64 relative group">
              <img
                alt="Sound wave mixing board"
                className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-105 transition-transform duration-1000"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhJN-rB6UstRfVVHqWGPUj8hUFGuExaLHpOSo24iKJfxcYTvO0StyXxTvL01Z03936oSx5qMkwivgPSG4YiQMYh6sAbwzbLWVj0vKgDakep--oJbfUhAGHFRcq2hclgkji4_odB3FtoxxyvboQLyHV7GSsCz8jGugB_vsg8QDggVpqYM-WZzyImVO52XbZH_2Nu--YzgJJmuh13l-3-szl1j4zFjaD2c8WgHcaXCZyZp0llx_XAKueM90fgv4NlmXFW6Yv1Yxs9Mk"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-12">
                <h5 className="text-headline-md font-headline-md text-on-surface">Trusted by 50,000+ Audiophiles</h5>
                <p className="text-body-md text-on-surface-variant max-w-md">Join the elite community of researchers, developers, and creators using VNotes for precision audio capture.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppPageShell>
  );
};

export default PricingPage;


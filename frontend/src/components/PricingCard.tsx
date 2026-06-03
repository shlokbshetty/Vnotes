/**
 * PricingCard — Obsidian Echo glass-edge tier card
 */

export interface PricingCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  onCtaClick?: (id: string) => void;
}

export default function PricingCard({
  id,
  name,
  price,
  description,
  features,
  cta,
  isPopular = false,
  onCtaClick,
}: PricingCardProps) {
  const isCustomPrice = typeof price === 'string' || isNaN(price);
  
  return (
    <article
      data-testid={`pricing-card-${id}`}
      className={`
        glass-border border-black/[0.12] dark:border-white/[0.08] p-8 rounded-xl flex flex-col hover:border-primary/40 transition-all duration-300 relative
        ${isPopular ? 'bg-surface-container-high scale-105 z-10 border-primary/40 shadow-2xl shadow-lg' : 'bg-surface-container-low'}
      `}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border font-label-mono ${
          isPopular 
            ? 'bg-tertiary/10 text-tertiary border-tertiary/20' 
            : id === 'enterprise' 
              ? 'bg-secondary/10 text-secondary border-secondary/20' 
              : 'bg-primary/10 text-primary border-primary/20'
        }`}>
          {isPopular ? 'PRO' : id === 'enterprise' ? 'SCALE' : 'BASIC'}
        </span>
        <h3 className="text-headline-md font-headline-md font-bold mt-4 text-on-surface">{name}</h3>
      </div>

      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-headline-lg font-headline-lg font-bold text-on-surface">
          {isCustomPrice ? 'Custom' : `$${price}`}
        </span>
        {!isCustomPrice && (
          <span className="text-on-surface-variant text-body-md">/mo</span>
        )}
        {isCustomPrice && (
          <span className="text-on-surface-variant text-body-md">/contact</span>
        )}
      </div>

      <p className="mb-6 text-body-md text-on-surface-variant leading-relaxed h-12 overflow-hidden">{description}</p>

      <ul className="space-y-4 mb-10 flex-1" data-testid="pricing-features">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 text-body-md text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-primary text-sm select-none" aria-hidden="true">
              check_circle
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onCtaClick?.(id)}
        className={`w-full py-3 font-bold rounded-lg transition-all duration-200 ${
          isPopular 
            ? 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]' 
            : 'glass-border text-primary hover:bg-primary/5 active:scale-[0.98]'
        }`}
      >
        {cta}
      </button>
    </article>
  );
}

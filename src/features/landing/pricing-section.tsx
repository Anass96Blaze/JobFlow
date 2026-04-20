import { Link } from 'react-router-dom'
import { ArrowRight, Check, Shield, Sparkles, Star, X, Zap } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PricingFeature {
  label: string
  highlight?: boolean
  hint?: string
}

export interface PricingCardProps {
  name: string
  description: string
  price: string
  priceSuffix?: string
  priceNote?: string
  features: PricingFeature[]
  featuresHeading?: string
  missingFeatures?: string[]
  ctaLabel: string
  ctaSubLabel?: string
  ctaTo: string
  microCopy?: string
  valueLine?: string
  highlighted?: boolean
  badge?: string
  icon?: 'shield' | 'sparkles'
}

/* ------------------------------------------------------------------ */
/*  PricingCard                                                        */
/* ------------------------------------------------------------------ */

export function PricingCard({
  name,
  description,
  price,
  priceSuffix,
  priceNote,
  features,
  featuresHeading,
  missingFeatures,
  ctaLabel,
  ctaSubLabel,
  ctaTo,
  microCopy,
  valueLine,
  highlighted = false,
  badge,
  icon = 'shield',
}: PricingCardProps) {
  const Icon = icon === 'sparkles' ? Sparkles : Shield

  return (
    <div
      className={[
        'relative flex flex-col rounded-2xl bg-white p-8 transition-all duration-300',
        highlighted
          ? 'border border-primary/25 shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_24px_56px_-18px_rgba(99,102,241,0.4),0_0_0_1px_rgba(99,102,241,0.12)] lg:-translate-y-2 lg:scale-[1.025] lg:p-9'
          : 'border border-slate-200/80 shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.1)]',
      ].join(' ')}
    >
      {highlighted && (
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-200/55 via-violet-200/35 to-transparent blur-3xl"
          aria-hidden
        />
      )}

      {badge && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full cta-gradient px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_6px_16px_-4px_rgba(99,102,241,0.55)] ring-1 ring-inset ring-white/20">
          <Star className="h-3 w-3 fill-white" strokeWidth={2.5} />
          {badge}
        </span>
      )}

      <div className="relative flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Icon
            className={`h-[18px] w-[18px] ${highlighted ? 'text-indigo-600' : 'text-slate-500'}`}
            strokeWidth={2.2}
          />
          <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">{name}</h3>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{description}</p>

        {/* Price */}
        <div className="mt-7 flex items-baseline gap-1.5">
          <span className="text-[44px] font-semibold leading-none tracking-[-0.03em] text-slate-900">
            {price}
          </span>
          {priceSuffix && (
            <span className="text-[13px] font-medium text-slate-500">{priceSuffix}</span>
          )}
        </div>
        {priceNote && (
          <p className="mt-2 text-[12px] font-medium text-slate-500">{priceNote}</p>
        )}

        {/* Value callout */}
        {valueLine && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/80 via-violet-50/50 to-white px-4 py-3">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" strokeWidth={2.5} />
            <p className="text-[13.5px] font-semibold leading-snug tracking-tight text-indigo-900">
              {valueLine}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="my-7 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Features heading */}
        {featuresHeading && (
          <p className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            {featuresHeading}
          </p>
        )}

        {/* Features */}
        <ul className="space-y-3.5">
          {features.map((f) => (
            <li key={f.label} className="flex items-start gap-3">
              <span
                className={[
                  'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ring-1',
                  f.highlight
                    ? 'cta-gradient text-white ring-white/20 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.5)]'
                    : 'bg-emerald-50 text-emerald-600 ring-emerald-100',
                ].join(' ')}
              >
                <Check className="h-3 w-3" strokeWidth={3.2} />
              </span>
              <span className="flex-1">
                <span
                  className={[
                    'text-[14px] leading-relaxed',
                    f.highlight ? 'font-semibold text-slate-900' : 'text-slate-700',
                  ].join(' ')}
                >
                  {f.label}
                </span>
                {f.hint && (
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                    {f.hint}
                  </span>
                )}
              </span>
            </li>
          ))}

          {/* Missing features (only makes sense on the Free plan) */}
          {missingFeatures && missingFeatures.length > 0 && (
            <>
              <li className="pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Not included
                </p>
              </li>
              {missingFeatures.map((label) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                    <X className="h-3 w-3 text-slate-400" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] leading-relaxed text-slate-400 line-through decoration-slate-300">
                    {label}
                  </span>
                </li>
              ))}
            </>
          )}
        </ul>

        {/* Spacer pushes CTA to bottom for alignment */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="mt-9">
          {highlighted ? (
            <Link
              to={ctaTo}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl cta-gradient px-6 py-3.5 text-[14px] font-semibold tracking-tight text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_12px_28px_-6px_rgba(99,102,241,0.55),0_4px_10px_-2px_rgba(139,92,246,0.35)] ring-1 ring-inset ring-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_16px_36px_-6px_rgba(99,102,241,0.6),0_6px_14px_-2px_rgba(139,92,246,0.4)]"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent"
                aria-hidden
              />
              <span className="relative">{ctaLabel}</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              to={ctaTo}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-[14px] font-semibold tracking-tight text-slate-900 shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_1px_0_0_rgba(255,255,255,0.8)_inset] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_4px_14px_-4px_rgba(15,23,42,0.1)]"
            >
              {ctaLabel}
            </Link>
          )}
          {ctaSubLabel && (
            <p className="mt-2.5 text-center text-[12px] font-medium text-slate-600">
              {ctaSubLabel}
            </p>
          )}
          {microCopy && (
            <p className="mt-1.5 text-center text-[11.5px] font-medium text-slate-500">
              {microCopy}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PricingSection                                                     */
/* ------------------------------------------------------------------ */

export function PricingSection() {
  const freeFeatures: PricingFeature[] = [
    { label: 'Up to 20 applications' },
    { label: 'Basic application tracking' },
    { label: 'Simple dashboard' },
    { label: 'Manual follow-ups' },
  ]

  const freeMissing: string[] = [
    'Smart reminders',
    'Automatic follow-up system',
    'Advanced insights',
  ]

  const proFeatures: PricingFeature[] = [
    {
      label: 'Unlimited applications',
      highlight: true,
      hint: 'Track every opportunity without limits.',
    },
    {
      label: 'Smart reminders',
      highlight: true,
      hint: 'Get pinged the moment it’s time to follow up.',
    },
    {
      label: 'Never miss a follow-up',
      highlight: true,
      hint: 'The #1 reason job seekers lose offers — solved.',
    },
    { label: 'Full follow-up system' },
    { label: 'Advanced dashboard insights' },
    { label: 'Priority application tracking' },
    { label: 'Full actions system' },
  ]

  return (
    <section id="pricing" className="relative bg-slate-50/70 py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(99,102,241,0.08),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 shadow-sm shadow-slate-200/60 backdrop-blur">
            Pricing
          </span>
          <h2 className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[44px]">
            Start free.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Get more interviews
            </span>{' '}
            with Pro.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-slate-600 sm:text-[17px]">
            One missed follow-up can cost you the offer. Pro makes sure that never happens.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-5 lg:gap-7">
          <PricingCard
            name="Free"
            icon="shield"
            description="Good for testing the waters. Track a handful of applications manually."
            price="$0"
            priceSuffix="/ forever"
            priceNote="No credit card. No trial. Just free."
            features={freeFeatures}
            missingFeatures={freeMissing}
            ctaLabel="Start for free"
            ctaTo="/signup"
            microCopy="Great for your first 20 applications."
          />
          <PricingCard
            name="Pro"
            icon="sparkles"
            description="For serious job seekers who want a system that lands interviews."
            price="$7"
            priceSuffix="/ month"
            priceNote="Less than one coffee a week."
            features={proFeatures}
            featuresHeading="Everything in Free, plus:"
            ctaLabel="Get more interviews — Upgrade to Pro"
            ctaSubLabel="7-day free trial · Cancel anytime"
            ctaTo="/signup"
            microCopy="Join hundreds of job seekers already using Pro."
            valueLine="Never miss a follow-up again — this alone pays for itself."
            highlighted
            badge="Most popular"
          />
        </div>

        {/* Loss-aversion callout */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 px-6 py-5 text-center shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] backdrop-blur sm:px-8">
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.08),transparent_70%)]"
              aria-hidden
            />
            <p className="text-[15px] leading-relaxed text-slate-700 sm:text-[16px]">
              The cost of missing{' '}
              <span className="font-semibold text-slate-900">one</span> opportunity is far greater than{' '}
              <span className="whitespace-nowrap font-semibold text-slate-900">$7/month</span>.
            </p>
            <p className="mt-1 text-[13.5px] font-medium text-slate-500">
              Most Pro users recover the cost with their first follow-up reply.
            </p>
          </div>
        </div>

        {/* Emotional push */}
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <p className="text-[17px] leading-relaxed text-slate-600 sm:text-[18px]">
            You don’t need to apply to more jobs.
          </p>
          <p className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-slate-900 sm:text-[22px]">
            You need a better system.
          </p>
        </div>

        {/* Trust row */}
        <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[12.5px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
            No credit card required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
            Cancel anytime
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
            7-day money-back guarantee
          </span>
        </div>
      </div>
    </section>
  )
}

export default PricingSection

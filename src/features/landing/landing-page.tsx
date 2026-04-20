import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  Target,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap,
  Calendar,
  type LucideIcon,
} from 'lucide-react'
import { PricingSection } from './pricing-section'

/* ------------------------------------------------------------------ */
/*  Reusable primitives                                                */
/* ------------------------------------------------------------------ */

function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/welcome" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] cta-gradient shadow-[0_4px_14px_-2px_rgba(99,102,241,0.45)] ring-1 ring-inset ring-white/20">
        <span className="absolute inset-0 rounded-[10px] bg-gradient-to-b from-white/25 to-transparent" aria-hidden />
        <Zap className="relative h-4 w-4 text-white" strokeWidth={2.6} />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-slate-900">JobFlow</span>
    </Link>
  )
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 shadow-sm shadow-slate-200/60 backdrop-blur">
      {children}
    </span>
  )
}

function PrimaryCTA({
  children,
  to = '/signup',
  className = '',
}: {
  children: React.ReactNode
  to?: string
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl cta-gradient px-6 py-3.5 text-sm font-semibold tracking-tight text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_10px_24px_-6px_rgba(99,102,241,0.55),0_4px_10px_-2px_rgba(139,92,246,0.35)] ring-1 ring-inset ring-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_14px_32px_-6px_rgba(99,102,241,0.6),0_6px_14px_-2px_rgba(139,92,246,0.4)] active:translate-y-0 ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent"
        aria-hidden
      />
      <span className="relative">{children}</span>
      <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  )
}

function SecondaryCTA({
  children,
  to,
  className = '',
}: {
  children: React.ReactNode
  to: string
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold tracking-tight text-slate-900 shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_1px_0_0_rgba(255,255,255,0.8)_inset] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_4px_14px_-4px_rgba(15,23,42,0.1),0_1px_0_0_rgba(255,255,255,0.8)_inset] ${className}`}
    >
      {children}
    </Link>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = 'indigo',
}: {
  icon: LucideIcon
  title: string
  description: string
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose'
}) {
  const accents: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', glow: 'from-indigo-100/60' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', glow: 'from-violet-100/60' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'from-emerald-100/60' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', glow: 'from-amber-100/60' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', glow: 'from-rose-100/60' },
  }
  const a = accents[accent]
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-7 shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_1px_0_0_rgba(255,255,255,0.8)_inset] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_20px_40px_-16px_rgba(15,23,42,0.12),0_8px_16px_-8px_rgba(15,23,42,0.08)]">
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${a.glow} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
        aria-hidden
      />
      <div className={`relative mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${a.bg} ${a.text} ${a.ring}`}>
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <h3 className="relative mb-2 text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="relative text-[14px] leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.6} />
      </span>
      <span className="text-[15px] leading-relaxed text-slate-700">{children}</span>
    </li>
  )
}

function EyebrowHeading({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <>
      <SectionBadge>{eyebrow}</SectionBadge>
      <h2 className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[42px]">
        {children}
      </h2>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-9 md:flex">
          <a href="#features" className="text-[13.5px] font-medium text-slate-600 transition hover:text-slate-900">
            Features
          </a>
          <a href="#how-it-works" className="text-[13.5px] font-medium text-slate-600 transition hover:text-slate-900">
            How it works
          </a>
          <a href="#pricing" className="text-[13.5px] font-medium text-slate-600 transition hover:text-slate-900">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            to="/login"
            className="hidden rounded-lg px-3 py-2 text-[13.5px] font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg cta-gradient px-4 py-2 text-[13.5px] font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_12px_-2px_rgba(99,102,241,0.45)] ring-1 ring-inset ring-white/10 transition hover:opacity-95"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function HeroVisual() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-5xl sm:mt-20">
      <div
        className="absolute -inset-x-8 -inset-y-6 -z-10 rounded-[2.5rem] bg-gradient-to-b from-indigo-200/30 via-violet-200/20 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.25),0_20px_40px_-15px_rgba(15,23,42,0.15),0_0_0_1px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-[11px] font-medium tracking-wide text-slate-400">jobflow.app / dashboard</span>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:p-7 md:grid-cols-3 md:gap-5">
          {[
            { label: 'Applications', value: '24', hint: '+3 this week' },
            { label: 'Pending actions', value: '7', hint: '2 overdue' },
            { label: 'Interviews', value: '4', hint: 'Next: Tue 10am' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/50 p-4 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="mt-2.5 text-[26px] font-semibold tracking-tight text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.hint}</p>
            </div>
          ))}
          <div className="md:col-span-3">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-slate-900">Next actions</p>
                <span className="text-[11px] font-medium text-slate-400">Today</span>
              </div>
              <div className="space-y-2">
                {[
                  { t: 'Follow up — Stripe · Senior Frontend', due: 'Due today', tag: 'bg-amber-50 text-amber-700 ring-amber-100' },
                  { t: 'Send portfolio — Linear · Product Eng.', due: 'In 2 days', tag: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
                  { t: 'Prep interview — Notion · Growth', due: 'Fri · 3pm', tag: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded border border-slate-300 bg-white" />
                      <span className="text-[13.5px] font-medium text-slate-800">{r.t}</span>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${r.tag}`}>
                      {r.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(65%_55%_at_50%_0%,rgba(99,102,241,0.13),transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(rgba(15,23,42,1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,1)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_30%,transparent_70%)]"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-6xl px-6 pb-12 pt-20 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <SectionBadge>
            <Sparkles className="h-3 w-3" /> For serious job seekers
          </SectionBadge>
          <h1 className="mt-6 text-[44px] font-semibold leading-[1.04] tracking-[-0.03em] text-slate-900 sm:text-[56px] md:text-[68px]">
            Never miss a{' '}
            <span className="relative whitespace-nowrap bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              follow-up
            </span>{' '}
            again.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-[1.6] text-slate-600 sm:text-[19px]">
            Turn your job search into a system that gets more interviews — with smart reminders,
            actions, and real tracking.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCTA to="/signup">Start tracking — it's free</PrimaryCTA>
            <SecondaryCTA to="/login">I already have an account</SecondaryCTA>
          </div>
          <p className="mt-5 text-[12.5px] font-medium text-slate-500">
            No credit card required · Free forever plan
          </p>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Problem                                                            */
/* ------------------------------------------------------------------ */

function Problem() {
  const pains = [
    'You apply… then forget',
    'You don’t follow up',
    'You lose track of applications',
    'You miss important opportunities',
    'You have no clear system',
  ]
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <EyebrowHeading eyebrow="The problem">
            Most job seekers fail here
          </EyebrowHeading>
        </div>
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {pains.map((p) => (
            <div
              key={p}
              className="flex items-start gap-3 rounded-xl border border-rose-100/80 bg-gradient-to-b from-rose-50/60 to-rose-50/20 p-4 shadow-[0_1px_2px_0_rgba(244,63,94,0.04)]"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" strokeWidth={2.2} />
              <span className="text-[15px] font-medium text-slate-800">{p}</span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-xl text-center text-[19px] font-semibold tracking-tight text-slate-900">
          And that’s why you don’t get interviews.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Solution                                                           */
/* ------------------------------------------------------------------ */

function Solution() {
  const items = [
    { icon: Target, label: 'what action to take' },
    { icon: Clock, label: 'when to take it' },
    { icon: AlertCircle, label: 'what’s overdue' },
    { icon: Sparkles, label: 'what needs attention' },
  ]
  return (
    <section id="how-it-works" className="relative bg-slate-50/70 py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <EyebrowHeading eyebrow="The solution">
            JobFlow turns your job search into a system
          </EyebrowHeading>
          <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
            Instead of guessing what to do next, JobFlow tells you exactly:
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-7 text-center shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(15,23,42,0.12)]"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl cta-gradient text-white shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-4px_rgba(99,102,241,0.5)] ring-1 ring-inset ring-white/15">
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <p className="text-[15px] font-semibold tracking-tight text-slate-900">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Smart Reminders                                                    */
/* ------------------------------------------------------------------ */

function SmartReminders() {
  return (
    <section id="features" className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div>
          <EyebrowHeading eyebrow="Smart reminders">
            Reminders that work like a personal assistant
          </EyebrowHeading>
          <ul className="mt-10 space-y-4">
            <CheckItem>Get notified when it’s time to follow up</CheckItem>
            <CheckItem>See overdue actions instantly</CheckItem>
            <CheckItem>Know exactly what to do next</CheckItem>
            <CheckItem>Never forget an opportunity again</CheckItem>
          </ul>
          <p className="mt-10 rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 px-5 py-4 text-[15px] font-medium italic text-slate-700 shadow-sm">
            “No more ‘I forgot to follow up’ — ever.”
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-100/70 via-violet-100/40 to-transparent blur-3xl" />
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-600" />
              <span className="text-[13px] font-semibold text-slate-900">Reminders</span>
              <span className="ml-auto rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-100">
                2 overdue
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { t: 'Follow up · Stripe', s: 'Overdue by 1 day', bad: true },
                { t: 'Send thank-you · Linear', s: 'Due today' },
                { t: 'Prep for Notion interview', s: 'Tomorrow · 3pm' },
                { t: 'Reply recruiter · Vercel', s: 'In 3 days' },
              ].map((r) => (
                <div
                  key={r.t}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-2.5 transition hover:border-slate-200 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset ${
                        r.bad ? 'bg-rose-50 text-rose-600 ring-rose-100' : 'bg-indigo-50 text-indigo-600 ring-indigo-100'
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold text-slate-900">{r.t}</p>
                      <p className={`text-[12px] ${r.bad ? 'text-rose-600' : 'text-slate-500'}`}>{r.s}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Actions System                                                     */
/* ------------------------------------------------------------------ */

function ActionsSystem() {
  return (
    <section className="bg-slate-50/70 py-24 sm:py-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="order-2 lg:order-1">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-violet-600" />
              <span className="text-[13px] font-semibold text-slate-900">
                Actions · Stripe · Senior Frontend
              </span>
            </div>
            <div className="space-y-2">
              {[
                { t: 'Submit application', done: true },
                { t: 'Follow up with recruiter', done: true },
                { t: 'Send portfolio link', done: false, tag: 'Today' },
                { t: 'Prepare for technical interview', done: false, tag: 'Fri' },
                { t: 'Send thank-you note', done: false, tag: 'Next week' },
              ].map((a) => (
                <div
                  key={a.t}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        a.done
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {a.done && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span
                      className={`text-[13.5px] ${
                        a.done ? 'text-slate-400 line-through' : 'font-medium text-slate-800'
                      }`}
                    >
                      {a.t}
                    </span>
                  </div>
                  {a.tag && (
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                      {a.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/5 cta-gradient" />
              </div>
              <span className="text-[11px] font-semibold tracking-wide text-slate-500">40%</span>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <EyebrowHeading eyebrow="Actions">
            Your job search, organized like a pro
          </EyebrowHeading>
          <ul className="mt-10 space-y-4">
            <CheckItem>Create actions for every application</CheckItem>
            <CheckItem>Track follow-ups, interviews, and tasks</CheckItem>
            <CheckItem>Mark progress and stay focused</CheckItem>
            <CheckItem>Always know your next move</CheckItem>
          </ul>
          <p className="mt-10 text-[20px] font-semibold tracking-tight text-slate-900">
            It’s not a tracker.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              It’s a system.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Dashboard / Clarity                                                */
/* ------------------------------------------------------------------ */

function DashboardClarity() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <EyebrowHeading eyebrow="Dashboard">
            See everything in one place
          </EyebrowHeading>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={LayoutDashboard}
            title="All your applications"
            description="Every company, every role — in one clean view you'll actually enjoy using."
            accent="indigo"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Status, priority & sources"
            description="Know where each opportunity stands, and where your best leads come from."
            accent="violet"
          />
          <FeatureCard
            icon={Calendar}
            title="Upcoming interviews"
            description="Never double-book, never miss prep. Everything on one calm timeline."
            accent="emerald"
          />
          <FeatureCard
            icon={ListChecks}
            title="Pending actions"
            description="What needs your attention today, this week — and what's overdue."
            accent="amber"
          />
        </div>
        <p className="mt-16 text-center text-[26px] font-semibold tracking-[-0.02em] text-slate-900">
          No more chaos.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Emotional Trigger                                                  */
/* ------------------------------------------------------------------ */

function EmotionalTrigger() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_65%_at_50%_50%,rgba(99,102,241,0.10),transparent_70%)]"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.025em] text-slate-900 sm:text-[44px] md:text-[54px]">
          Stop missing opportunities because of{' '}
          <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            disorganization
          </span>
          .
        </h2>
        <div className="mx-auto mt-8 max-w-xl text-[17px] leading-[1.65] text-slate-600 sm:text-[19px]">
          <p>You don’t need to apply to more jobs.</p>
          <p className="mt-1 font-semibold text-slate-900">
            You need to manage your applications better.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] cta-gradient px-6 py-16 text-center shadow-[0_40px_80px_-20px_rgba(99,102,241,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset] sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_65%_at_50%_0%,rgba(255,255,255,0.3),transparent_60%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
            aria-hidden
          />
          <h2 className="relative text-[34px] font-semibold leading-[1.08] tracking-[-0.025em] text-white sm:text-[44px] md:text-[52px]">
            Ready to get more interviews?
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/85 sm:text-[18px]">
            Turn your chaotic job hunt into a focused system — starting today.
          </p>
          <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[14px] font-semibold tracking-tight text-slate-900 shadow-[0_1px_0_0_rgba(255,255,255,0.8)_inset,0_10px_30px_-6px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.8)_inset,0_14px_36px_-6px_rgba(15,23,42,0.4)]"
            >
              Start using JobFlow — it’s free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="relative mt-5 text-[12px] font-medium text-white/70">No credit card required</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  const cols: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', to: '#features', external: true },
        { label: 'How it works', to: '#how-it-works', external: true },
        { label: 'Pricing', to: '#pricing', external: true },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Log in', to: '/login' },
        { label: 'Sign up', to: '/signup' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', to: '#', external: true },
        { label: 'Terms', to: '#', external: true },
      ],
    },
  ]
  return (
    <footer className="relative border-t border-slate-200/70 bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[14px] leading-relaxed text-slate-500">
              JobFlow turns your job search into a system that actually gets you more interviews.
            </p>
            <div className="mt-5">
              <SectionBadge>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                All systems operational
              </SectionBadge>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) =>
                  l.external ? (
                    <li key={l.label}>
                      <a
                        href={l.to}
                        className="text-[13.5px] font-medium text-slate-600 transition hover:text-slate-900"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-[13.5px] font-medium text-slate-600 transition hover:text-slate-900"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-6 text-[12px] text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} JobFlow. All rights reserved.</p>
          <p className="tracking-tight">Built for job seekers who want more interviews.</p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-indigo-200/60 selection:text-indigo-900">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <SmartReminders />
        <ActionsSystem />
        <DashboardClarity />
        <EmotionalTrigger />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage

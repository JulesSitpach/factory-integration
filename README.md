# TradeNavigatorPro

**Empowering US SMBs to Navigate Trade Policy and Tariff Volatility**

A modern SaaS platform built with Next.js 14, Supabase, and Stripe, offering AI-powered tools, seamless integrations, and a polished, responsive UI to help SMBs thrive amid global trade uncertainty.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Core Applications](#core-applications)
3. [UI/UX Style Guide](#uiux-style-guide)
   - [Navigation](#navigation)
   - [Color Palette](#color-palette)
   - [Typography](#typography)
   - [Layout & Spacing](#layout--spacing)
   - [App Structure & Placement](#app-structure--placement)
   - [Accessibility & Responsiveness](#accessibility--responsiveness)
   - [Tailwind CSS Configuration](#tailwind-css-configuration)
   - [Sample Navigation Code (Next.js/React)](#sample-navigation-code-nextjsreact)
4. [Technical Architecture](#technical-architecture)
5. [Project Structure](#project-structure)
6. [Payments](#payments)
7. [Multilanguage Support](#multilanguage-support)
8. [Integrations & Automation](#integrations--automation)
9. [Security & Compliance](#security--compliance)
10. [Monitoring & Testing](#monitoring--testing)
11. [Getting Started](#getting-started)
12. [Additional Recommendations](#additional-recommendations)

---

## Problem Statement

US trade policies and tariffs create unpredictable costs and supply chain challenges for SMBs. TradeNavigatorPro delivers actionable intelligence and automation so SMBs can:

- Instantly calculate real tariff and landed costs
- Discover alternative suppliers and optimize sourcing
- Model pricing strategies and protect margins
- Stay ahead of policy changes with proactive alerts
- Streamline trade route planning and documentation

**Target Users:** 40,000+ US SMBs impacted by trade policy (importers, exporters, manufacturers, e-commerce, and suppliers)

---

## Core Applications

### 1. Emergency Cost Calculator
- Upload purchase orders for instant, AI-powered landed cost and tariff calculations
- Visual before/after impact analysis and exportable reports
- Integration with accounting/ERP tools for seamless data flow
- Automated alerts for significant cost changes

### 2. Supply Chain Pivot Planner
- AI-driven alternative supplier recommendations with verified contacts
- Country-specific tariff and logistics comparisons
- Predictive analytics for supply chain risk and disruption
- Industry-specific templates (e.g., retail, manufacturing)
- Integration with inventory management systems

### 3. Pricing Strategy Optimizer
- Scenario modeling (absorb, pass-through, split costs)
- Margin and break-even analysis with competitive benchmarks
- Customizable dashboards and KPI tracking
- Exportable, stakeholder-ready reports
- Customer communication templates

### 4. Tariff Timeline Tracker
- Real-time monitoring of USTR and global trade announcements
- 30/60/90 day advance warnings and historical trend analysis
- Granular, product-specific alerts and recommended action steps
- Automated calendar integration for key deadlines

### 5. Trade Route Optimizer
- Multi-country routing suggestions leveraging trade agreements (e.g., USMCA)
- Duty drawback and cost-saving opportunity identification
- Real-time logistics partner integration and automated customs documentation
- Collaboration tools for team planning

---

## UI/UX Style Guide

### Navigation

#### Pre Sign-In (Public/Marketing)
- **Top Navigation Bar:** Fixed, full width, subtle shadow
- **Logo:** Left-aligned, clickable
- **Links (right):** Features | Pricing | Resources | About | 🌐 Language | Sign In (primary button)
- **Call to Action:** “Sign Up Free” (accent color)
- **Mobile:** Hamburger menu

#### Post Sign-In (App/Dashboard)
- **Top Navigation Bar:** Compact, fixed, full width
- **Logo:** Left
- **App Navigation:** Dashboard | Calculator | Planner | Optimizer | Tracker | Route | (Dropdown for more)
- **User Profile:** Avatar, dropdown (Profile, Settings, Billing, Logout)
- **Notifications:** Bell icon
- **Language Selector:** 🌐
- **Org Switcher:** If multi-tenant

### Color Palette

| Purpose         | Color         | Hex        |
|-----------------|--------------|------------|
| Primary         | Deep Blue    | #2340A1    |
| Accent          | Orange       | #FF7A59    |
| Secondary      | Soft Gray    | #F4F6FA    |
| Slate           | Slate        | #2D3748    |
| Background      | White        | #FFFFFF    |
| Success         | Green        | #38B2AC    |
| Error/Warning   | Red          | #E53E3E    |
| Link            | Blue         | #3B82F6    |

### Typography

- **Font:** [Inter](https://rsms.me/inter/)
- **Headings:** Inter SemiBold/Bold (H1: 2.5rem, H2: 2rem, H3: 1.5rem)
- **Body:** Inter Regular (1rem, 16px)
- **Buttons/Inputs:** Inter Medium

### Layout & Spacing

- **Container:** Max 1200px, centered, 24px padding
- **Section Spacing:** 48px
- **Card Padding:** 24px
- **Sidebar (optional):** For quick app switching
- **Spacing Scale:** Multiples of 8px

### App Structure & Placement

#### Pre Sign-In
- **Hero:** Headline, subheadline, CTA, illustration/screenshot
- **Features:** Icons, short descriptions, alternating layouts
- **Testimonials/Logos:** Carousel or grid
- **Pricing Table:** Clear, with checkmarks
- **Footer:** Links, social, copyright

#### Post Sign-In
- **Top Navigation:** Always visible
- **Sidebar (optional):** Quick links, collapsible
- **Main Content:** Dashboard (KPI cards, alerts, recent activity), tool pages (centered, export/action buttons top right)
- **Notifications:** Slide-in/modal
- **Settings/Profile:** Modal or page

### Accessibility & Responsiveness

- **Mobile First:** All layouts responsive, navigation collapses to hamburger, cards stack vertically
- **Accessibility:** High contrast, focus states, keyboard navigation, ARIA labels

### Tailwind CSS Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2340A1',
        accent: '#FF7A59',
        secondary: '#F4F6FA',
        slate: '#2D3748',
        success: '#38B2AC',
        danger: '#E53E3E',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
};
```

### Sample Navigation Code (Next.js/React)

#### Pre Sign-In Navigation

```jsx
// components/NavBar.js
import Link from 'next/link';

export default function NavBar() {
  return (
    
      
        TradeNavigatorPro
        
          Features
          Pricing
          Resources
          About
          🌐
          
            Sign In
          
          
            Sign Up Free
          
        
        {/* Mobile hamburger here */}
      
    
  );
}
```

#### Post Sign-In Navigation

```jsx
// components/AppNavBar.js
import Link from 'next/link';

export default function AppNavBar() {
  return (
    
      
        TradeNavigatorPro
        
          Dashboard
          Calculator
          Planner
          Optimizer
          Tracker
          Route
          🌐
          
            notifications
            {/* Notification badge */}
          
          
            {/* Avatar dropdown for profile/settings/logout */}
            
          
        
      
    
  );
}
```

---

## Technical Architecture

| Area         | Technology/Service              | Best Practices & Improvements                        |
|--------------|--------------------------------|------------------------------------------------------|
| Frontend     | Next.js 14, TypeScript, Tailwind CSS | Native i18n, modular UI, global style guide          |
| Backend      | Next.js API routes, Supabase (Postgres) | Row-Level Security, tenant isolation, API integrations|
| Payments     | Stripe                         | PCI-compliant, subscriptions, customer portal, webhook sync|
| AI           | OpenRouter API                 | Predictive analytics, recommendations, chatbots      |
| Data         | Real-time USTR feeds, HTS DB, supplier networks | Automated sync, caching, integration with ERP/inventory|
| Deployment   | Vercel (frontend), Supabase (backend), Upstash (caching) | CDN for static assets, global performance            |
| Multilanguage| Next.js i18n, next-i18next     | Scalable translation management, locale routing      |
| Monitoring   | Sentry, Datadog                | Error/performance monitoring, alerting               |
| Testing      | Jest, Playwright               | Automated backend, UI, and i18n testing              |

---

## Project Structure

```
TradeNavigatorPro/
├── app/
│   ├── (auth)/                # Authentication routes
│   ├── (dashboard)/[locale]/  # Protected app routes (multi-language)
│   ├── (marketing)/[locale]/  # Public marketing site (multi-language)
│   ├── api/                   # API endpoints (auth, apps, data, ai, webhooks, cron)
├── components/                # Modular React components (UI, charts, forms, layout)
├── lib/                       # Utilities (auth, data, ai, integrations, db, i18n)
├── types/                     # TypeScript definitions
├── scripts/                   # Build, data sync, deployment scripts
├── docs/                      # API, deployment, and development docs
├── tests/                     # Unit and integration tests
└── public/                    # Static assets
```

---

## Payments

- Stripe handles secure, PCI-compliant subscription payments and billing.
- Webhooks keep Supabase user access and billing data in sync.
- Stripe Customer Portal for user self-service management.
- Store Stripe customer IDs and subscription status in Supabase for efficiency.

---

## Multilanguage Support

- Next.js i18n and `next-i18next` for seamless locale routing and translation management.
- Translation files organized by language (e.g., `en.json`, `es.json`).
- UI tested for all supported languages and ready for third-party translation management.
- Interactive onboarding and in-app guidance for each language.

---

## Integrations & Automation

- **ERP, Accounting, and Inventory:** API connectors for popular SMB platforms.
- **AI Chatbot:** In-app assistant for onboarding and support.
- **Automated Data Sync:** Real-time updates from USTR, HTS, and logistics partners.
- **Customizable Dashboards:** User-defined KPIs and exportable reports.

---

## Security & Compliance

- Supabase Row-Level Security (RLS) for tenant data isolation.
- Stripe for PCI-compliant payments.
- MFA, data encryption, and compliance certifications.
- Automated monitoring and logging (Sentry, Datadog).

---

## Monitoring & Testing

- Comprehensive monitoring with Sentry/Datadog.
- Automated backend, frontend, and i18n tests (Jest, Playwright).
- Feature flags for controlled rollouts and A/B testing.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- OpenRouter API key
- USTR data access
- WTO API key

### Quick Setup

```sh
git clone https://github.com/yourusername/TradeNavigatorPro.git
cd TradeNavigatorPro
npm install

cp .env.example .env.local
# Add your API keys and credentials to .env.local

npm run db:setup
npm run db:seed

npm run dev
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
OPENROUTER_API_KEY=your_openrouter_key
USTR_API_KEY=public_access
HTS_DATABASE_URL=https://hts.usitc.gov/api
```

---

## Additional Recommendations

- Use feature flags for controlled rollouts and A/B testing.
- Maintain clear API documentation for internal and third-party integrations.
- Regularly optimize database queries and indexes.
- Use CDN for static assets to improve global performance.
- Plan for scaling translation management as you add more languages.
- Offer freemium or pay-per-use pricing to lower the barrier for SMBs.
- Provide interactive onboarding and in-app help for every language.

---

**TradeNavigatorPro** is designed for rapid development, security, and global scale—empowering SMBs to thrive in an ever-changing trade landscape.

---

*See `/docs` for detailed guides and API documentation.*

---

**You now have a complete, actionable README that covers everything from business value to technical setup and visual design. If you need Figma references, more code samples, or further customization, just ask!**

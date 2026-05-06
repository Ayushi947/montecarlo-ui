/**
 * Simulix Site Configuration
 *
 * Central configuration for site metadata, navigation, and constants
 */

export const siteConfig = {
  name: "Simulix",
  description:
    "Institutional-Grade Monte Carlo Projections for Personal Wealth",
  tagline: "GPU-Accelerated Financial Simulations",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // API Configuration
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    timeout: 30000,
  },

  // Social Links
  links: {
    twitter: "https://twitter.com/simulix",
    github: "https://github.com/simulix",
    linkedin: "https://linkedin.com/company/simulix",
    docs: "/docs",
  },

  // Contact
  contact: {
    email: "support@simulix.io",
    sales: "sales@simulix.io",
  },

  // Company Info
  company: {
    name: "Simulix Inc.",
    founded: 2024,
    location: "San Francisco, CA",
  },
};

/**
 * Public Navigation Items (Marketing Pages)
 */
export const publicNavItems = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Dashboard Navigation Items (Authenticated)
 */
export const dashboardNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Portfolio Builder",
    href: "/dashboard/builder",
    icon: "Briefcase",
  },
  {
    label: "Simulation Lab",
    href: "/dashboard/simulate",
    icon: "LineChart",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
];

/**
 * Footer Navigation
 */
export const footerNavItems = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "API Docs", href: "/docs/api" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
};

/**
 * Pricing Plans Configuration
 */
export const pricingPlans = [
  {
    id: "lite" as const,
    name: "Lite",
    price: 30,
    priceAnnual: 24,
    description: "For individual researchers",
    cta: "Start Lite",
    features: [
      { name: "Daily Simulations", included: true, value: "1,000" },
      { name: "Asset Classes", included: true, value: "5" },
      { name: "Projection Horizon", included: true, value: "5 Years" },
      { name: "Model Types", included: true, value: "Standard GBM" },
      { name: "Historical Data", included: true, value: "1 Year" },
      { name: "API Rate Limit", included: true, value: "100/min" },
      { name: "Export Formats", included: true, value: "CSV" },
      { name: "Support", included: true, value: "Standard" },
      { name: "Dedicated Manager", included: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 50,
    priceAnnual: 40,
    description: "For professional analysts",
    cta: "Get Pro",
    highlighted: true,
    features: [
      { name: "Daily Simulations", included: true, value: "10,000" },
      { name: "Asset Classes", included: true, value: "50" },
      { name: "Projection Horizon", included: true, value: "20 Years" },
      { name: "Model Types", included: true, value: "+ Jump Diffusion" },
      { name: "Historical Data", included: true, value: "5 Years" },
      { name: "API Rate Limit", included: true, value: "1,000/min" },
      { name: "Export Formats", included: true, value: "CSV, JSON" },
      { name: "Support", included: true, value: "Priority Email" },
      { name: "Dedicated Manager", included: false },
    ],
  },
  {
    id: "elite" as const,
    name: "Elite",
    price: 80,
    priceAnnual: 64,
    description: "For institutional users",
    cta: "Contact Sales",
    features: [
      { name: "Daily Simulations", included: true, value: "Unlimited" },
      { name: "Asset Classes", included: true, value: "Unlimited" },
      { name: "Projection Horizon", included: true, value: "50 Years" },
      { name: "Model Types", included: true, value: "+ Custom Stochastic" },
      { name: "Historical Data", included: true, value: "Full History" },
      { name: "API Rate Limit", included: true, value: "Dedicated" },
      { name: "Export Formats", included: true, value: "All + Parquet/HDF5" },
      { name: "Support", included: true, value: "24/7 Phone + Slack" },
      { name: "Dedicated Manager", included: true },
    ],
  },
];

/**
 * Chart colors for Recharts
 */
export const chartColors = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",

  // Percentile bands
  lowCase: "#EF4444", // Red - 10th percentile
  baseCase: "#3B82F6", // Blue - 50th percentile
  highCase: "#22C55E", // Green - 90th percentile

  // Goal status
  onTrack: "#22C55E",
  atRisk: "#F59E0B",
  critical: "#EF4444",
};

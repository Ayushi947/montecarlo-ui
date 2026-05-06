/**
 * Simulix Type Definitions
 *
 * Core types used across the application
 */

// ===========================================
// User & Authentication
// ===========================================

/** Backend plan names: "free", "basic", "pro" */
export type PlanTier = "free" | "basic" | "pro";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  plan: PlanTier;
  simulationsUsed: number;
  simulationsLimit: number;
  portfoliosLimit: number;
}

/** Shape returned by the backend auth endpoints (signup/login) */
export interface ApiUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

/** Backend subscription shape returned by GET /auth/me */
export interface ApiSubscription {
  id: string;
  plan: {
    name: string;
    displayName: string;
    maxSimulationsPerMonth: number;
    maxPortfolios: number;
    price: number;
  };
  status: string;
  startDate: string;
  endDate: string;
}

/** POST /auth/signup request */
export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/** POST /auth/login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Response from POST /auth/signup and POST /auth/login */
export interface AuthApiResponse {
  success: boolean;
  message: string;
  data: {
    user: ApiUser;
    token: string;
    defaultPortfolio?: {
      id: string;
      portfolioCode: string;
      portfolioName: string;
      allocations: {
        assetCode: string;
        assetName: string;
        targetAllocationPercentage: number;
      }[];
    };
  };
}

/** Response from GET /auth/me */
export interface MeApiResponse {
  success: boolean;
  data: ApiUser & {
    phoneNumber: string | null;
    emailVerified: boolean;
    subscription: ApiSubscription | null;
    createdAt: string;
    lastLoginAt: string | null;
  };
}

/** POST /auth/forgot-password request */
export interface ForgotPasswordRequest {
  email: string;
}

/** POST /auth/forgot-password response */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/** POST /auth/reset-password request */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/** POST /auth/reset-password response */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/** POST /auth/change-password request */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** POST /auth/change-password response */
export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/** PUT /auth/profile request */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/** PUT /auth/profile response */
export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    emailVerified: boolean;
  };
}

/** DELETE /auth/account request */
export interface DeleteAccountRequest {
  password: string;
}

/** DELETE /auth/account response */
export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

/** POST /auth/verify-email request */
export interface VerifyEmailRequest {
  token: string;
}

/** POST /auth/verify-email response */
export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

/** POST /auth/send-verification response */
export interface SendVerificationResponse {
  success: boolean;
  message: string;
}

// ===========================================
// Portfolio & Assets
// ===========================================

export interface Asset {
  ticker: string;
  name: string;
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  weight: number;
  assetClass: AssetClass;
  assetClassName?: string;
  expectedReturn?: number;
}

export type AssetClass =
  | "equity"
  | "fixed_income"
  | "commodity"
  | "real_estate"
  | "cash"
  | "alternative";

export interface PortfolioBucket {
  id: string;
  name: string;
  description?: string;
  assets: Asset[];
  totalWeight: number;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
  isFromApi?: boolean;
  portfolioCode?: string;
}

export interface AssetAllocation {
  assetClass: AssetClass;
  weight: number;
  color: string;
}

// ===========================================
// Portfolio API Types (Backend Shapes)
// ===========================================

/** Backend allocation shape (part of a portfolio) */
export interface ApiAllocation {
  id: string;
  assetCode: string;
  assetName: string;
  assetClassName: string;
  targetAllocationPercentage: number;
  expectedReturn: number;
  sortOrder: number;
}

/** Backend portfolio shape */
export interface ApiPortfolio {
  id: string;
  portfolioCode: string;
  portfolioName: string;
  description: string | null;
  expectedReturn: number;
  volatilityPercentage: number;
  isDefault: boolean;
  allocations: ApiAllocation[];
  createdAt: string;
  updatedAt: string;
}

/** Backend default ticker shape */
export interface ApiDefaultTicker {
  id: string;
  assetCode: string;
  assetName: string;
  assetClassName: string;
  allocationPercentage: number;
  expectedReturn: number;
  sortOrder: number;
  isActive: boolean;
}

/** POST /portfolios request body */
export interface CreatePortfolioRequest {
  portfolioName: string;
  description?: string;
  allocations: {
    assetCode: string;
    assetName: string;
    assetClassName: string;
    targetAllocationPercentage: number;
    expectedReturn: number;
    sortOrder?: number;
  }[];
}

/** PUT /portfolios/:id request body */
export interface UpdatePortfolioRequest {
  portfolioName?: string;
  description?: string;
  allocations?: {
    assetCode: string;
    assetName: string;
    assetClassName: string;
    targetAllocationPercentage: number;
    expectedReturn: number;
    sortOrder?: number;
  }[];
}

/** Response from GET /portfolios */
export interface PortfolioListResponse {
  success: boolean;
  data: ApiPortfolio[];
  count: number;
}

/** Response from GET/POST/PUT /portfolios/:id */
export interface PortfolioResponse {
  success: boolean;
  message?: string;
  data: ApiPortfolio;
}

/** Response from DELETE /portfolios/:id */
export interface DeletePortfolioResponse {
  success: boolean;
  message: string;
}

/** Response from GET /portfolios/tickers/default */
export interface DefaultTickersResponse {
  success: boolean;
  data: ApiDefaultTicker[];
  count: number;
}

// ===========================================
// Dashboard API Types (Aggregated)
// ===========================================

/** Response from GET /dashboard */
export interface DashboardOverviewResponse {
  success: boolean;
  data: {
    portfolios: ApiPortfolio[];
    simulations: ApiSimulation[];
  };
}

// ===========================================
// Simulation API Types (Backend Shapes)
// ===========================================

/** Backend simulation status values */
export type ApiSimulationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

/** Backend simulation parameters */
export interface ApiSimulationParameters {
  portfolioId: string;
  goalId?: number;
  initialInvestment: number;
  monthlyInvestment: number;
  tenure: number;
  iterations: number;
  targetCorpus?: number;
  inflationRate?: number;  // Annual inflation rate (e.g., 0.06 for 6%)
  taxRate?: number;
}

/** Backend scenario shape (low/medium/high instead of p10/p50/p90) */
export interface ApiScenario {
  finalValue: number;
  annualizedReturn: number;
}

/** Backend suggestion statistics from completed simulations */
export interface ApiSuggestionStatistics {
  mean: number;
  median: number;
  std_dev: number;
  min: number;
  max: number;
  percentile_25: number;
  percentile_75: number;
  success_rate: number;
}

/** Backend suggestion analysis from completed simulations */
export interface ApiSuggestionAnalysis {
  risk_level: string;       // "low" | "moderate" | "high"
  expected_return_annual: number;
  volatility: number;
  sharpe_ratio: number;
}

/** Backend recommendation object (rich format from Python service) */
export interface ApiRecommendation {
  type?: string;
  title?: string;
  message?: string;
  impact?: string;
  changes?: Record<string, unknown>;
  priority?: number;
  feasibility?: string;
  projectedValue?: number;
}

/** Backend suggestions object (part of simulation results) */
export interface ApiSuggestions {
  statistics?: ApiSuggestionStatistics;
  analysis?: ApiSuggestionAnalysis;
  recommendations?: (string | ApiRecommendation)[];  // Can be strings or rich objects
  needsSuggestions?: boolean;
  targetAchieved?: boolean;
  gap?: number;
  gapPercentage?: number;
  currentProjection?: number;
  targetCorpus?: number;           // User's goal (today's value)
  inflatedTargetCorpus?: number;   // Inflation-adjusted goal (future value)
  inflationRate?: number;          // Inflation rate used
  message?: string;
}

/** Backend simulation result (only present when status=completed) */
export interface ApiSimulationResult {
  scenarios: {
    low: ApiScenario;
    medium: ApiScenario;
    high: ApiScenario;
  };
  chartData: {
    days: number[];
    timestamps?: number[]; // Added for Simulix specific monthly/timestamp support
    low: number[];
    medium: number[];
    high: number[];
    real_low?: number[];
    real_medium?: number[];
    real_high?: number[];
    milestones?: Array<{
      year: number;
      label: string;
      value: number;
    }>;
    goal_probabilities?: number[];
    post_tax_low?: number[];
    post_tax_medium?: number[];
    post_tax_high?: number[];
  };
  suggestions?: ApiSuggestions;
  inflationRate?: number;
  taxRate?: number;
}

/** Full backend simulation object */
export interface ApiSimulation {
  id: string;
  userId?: string;
  portfolioId?: string;
  name?: string;  // Custom simulation name
  status: ApiSimulationStatus;
  portfolio?: {
    portfolioName: string;
    portfolioCode: string;
    allocations: Array<{
      assetCode: string;
      assetName: string;
      targetAllocationPercentage: number;
    }>;
  };
  parameters?: ApiSimulationParameters;
  results?: ApiSimulationResult; // ← Changed from "result" to "results"
  createdAt?: string;
  updatedAt?: string;
}

/** Allocation input for simulation (supports unsaved portfolio changes) */
export interface AllocationInput {
  assetCode: string;
  assetName: string;
  assetClassName?: string;
  targetAllocationPercentage: number;
  expectedReturn?: number;
}

/** POST /simulations request body */
export interface CreateSimulationRequest {
  portfolioId: string;
  goalId?: number;
  initialInvestment: number;
  monthlyInvestment: number;
  tenure: number;
  iterations?: number;
  targetCorpus?: number;
  inflationRate?: number;  // Annual inflation rate (e.g., 0.06 for 6%)
  name?: string;
  /** Pass current allocations from UI (used if portfolio has unsaved changes) */
  allocations?: AllocationInput[];
}

/** Response from POST /simulations */
export interface CreateSimulationResponse {
  success: boolean;
  message: string;
  data: {
    simulationId: string;
    status: ApiSimulationStatus;
  };
}

/** PATCH /simulations/:id request body */
export interface UpdateSimulationRequest {
  name?: string;
}

/** Response from PATCH /simulations/:id */
export interface UpdateSimulationResponse {
  success: boolean;
  message: string;
  data: ApiSimulation;
}

/** Response from GET /simulations */
export interface SimulationListResponse {
  success: boolean;
  data: ApiSimulation[];
  count: number;
}

/** Response from GET /simulations/:id */
export interface SimulationDetailResponse {
  success: boolean;
  data: ApiSimulation;
  message?: string;
}

/** Response from DELETE /simulations/:id */
export interface DeleteSimulationResponse {
  success: boolean;
  message: string;
}

// ===========================================
// Plan & Subscription API Types (Backend Shapes)
// ===========================================

/** Backend plan shape from GET /plans */
export interface ApiPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  maxSimulationsPerMonth: number;
  maxPortfolios: number;
  features: string[];
  stripeProductId?: string | null;
  stripePriceId?: string | null;
}

/** Response from POST /stripe/create-checkout-session */
export interface CheckoutSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    url: string;
  };
}

/** Response from POST /stripe/create-portal-session */
export interface PortalSessionResponse {
  success: boolean;
  data: {
    url: string;
  };
}

/** Individual invoice from Stripe */
export interface ApiInvoice {
  id: string;
  number: string | null;
  status: string | null;
  currency: string;
  amountPaid: number;
  amountDue: number;
  planName: string | null;
  invoicePdfUrl: string | null;
  hostedInvoiceUrl: string | null;
  created: number;
  periodStart: number;
  periodEnd: number;
}

/** Response from GET /stripe/invoices */
export interface InvoiceListResponse {
  success: boolean;
  data: {
    invoices: ApiInvoice[];
    hasMore: boolean;
  };
}

/** Response from POST /stripe/cancel-subscription or /stripe/resume-subscription */
export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number;
  };
}

/** Response from GET /plans */
export interface PlanListResponse {
  success: boolean;
  data: ApiPlan[];
}

/** Backend subscription shape from GET /subscriptions/current */
export interface ApiCurrentSubscription {
  id: string;
  plan: ApiPlan;
  status: string;
  startDate: string;
  endDate: string;
  usage: {
    simulationsUsed: number;
    simulationsLimit: number;
  };
}

/** Response from GET /subscriptions/current */
export interface CurrentSubscriptionResponse {
  success: boolean;
  data: ApiCurrentSubscription;
}

/** Backend usage shape from GET /subscriptions/usage */
export interface ApiUsage {
  currentPlan: string;
  simulationsRun: number;        // Backend field name
  simulationsRemaining: number;  // -1 means unlimited
  maxSimulations: number;        // -1 means unlimited
  resetAt: string;
  upgradeRequired: boolean;
  suggestedPlans?: string[];
  // Mapped frontend fields (added by service)
  simulationsUsed?: number;
  simulationsLimit?: number;
  portfoliosLimit?: number;
}

/** Response from GET /subscriptions/usage */
export interface UsageResponse {
  success: boolean;
  message?: string;
  data: ApiUsage;
}

// ===========================================
// Simulation (Frontend Shapes)
// ===========================================

export type SimulationStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed";

export interface SimulationConfig {
  bucketId: string;
  initialInvestment: number;
  monthlyContribution: number;
  withdrawalRate: number;
  yearsToProject: number;
  inflationRate: number;  // Annual inflation rate (e.g., 0.06 for 6%)
  taxRate?: number; // Capital Gains Tax rate (e.g., 0.10 for 10%)
  iterations: number;
  targetCorpus?: number;  // User's goal amount (today's value)
}

export interface SimulationResult {
  id: string;
  bucketId: string;
  name?: string;  // Optional custom name for the simulation
  config: SimulationConfig;
  status: SimulationStatus;
  progress?: number;

  // Percentile projections (array of values per year)
  percentiles: {
    p10: number[]; // Low scenario (10th percentile)
    p50: number[]; // Medium scenario (50th percentile)
    p90: number[]; // High scenario (90th percentile)
  };

  // Post-tax projections (array of values per year)
  postTaxPercentiles?: {
    p10: number[];
    p50: number[];
    p90: number[];
  };

  // Real (inflation-adjusted) percentiles
  realPercentiles?: {
    p10: number[];
    p50: number[];
    p90: number[];
  };

  // Milestone markers
  milestones?: Array<{
    year: number;
    label: string;
    value: number;
  }>;

  // Goal achievement probability at each time point (0-100%)
  goalProbabilities?: number[];

  // Timeline (years)
  timeline: number[];

  // Portfolio context
  portfolioName?: string;
  portfolioCode?: string;
  allocations?: Array<{
    assetCode: string;
    assetName: string;
    targetAllocationPercentage: number;
  }>;

  // Key metrics
  probabilityOfSuccess?: number;
  medianTerminalWealth: number;
  downsideRisk: number;
  failureYearMode: number | null;

  // Distribution data for histogram
  distribution?: {
    bins: number[];
    frequencies: number[];
  };

  // Statistics
  statistics?: {
    mean: number;
    standardDeviation: number;
    skewness: number;
    kurtosis: number;
  };

  // Analysis fields from backend suggestions
  riskLevel?: string;
  sharpeRatio?: number;
  volatility?: number;
  successRate?: number;
  recommendations?: string[];

  // Goal analysis from backend suggestions (when targetCorpus was set)
  targetCorpus?: number;           // User's goal (today's value)
  inflatedTargetCorpus?: number;   // Inflation-adjusted goal (future value)
  inflationRate?: number;          // Inflation rate used
  targetAchieved?: boolean;
  projectionGap?: number;          // Gap against inflated target
  projectionGapPercent?: number;
  currentProjection?: number;
  suggestionMessage?: string;

  createdAt: string;
  completedAt?: string;
  computeTimeMs?: number;
}

// ===========================================
// Goal Tracking
// ===========================================

export type GoalStatus = "on_track" | "at_risk" | "critical" | "achieved";

export interface GoalProgress {
  targetCorpus: number;
  currentProjection: number;
  probabilityOfSuccess: number;
  status: GoalStatus;
  statusColor: "green" | "yellow" | "red";
  yearsRemaining: number;
}

// ===========================================
// Pricing & Plans
// ===========================================

export interface PricingPlan {
  id: PlanTier;
  name: string;
  price: number;
  priceAnnual: number;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  cta: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  value?: string | number;
}

// ===========================================
// API Responses
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

// ===========================================
// Form Types
// ===========================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// ===========================================
// UI Types
// ===========================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

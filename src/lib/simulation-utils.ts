import type { ApiSimulation, SimulationResult, SimulationStatus } from "@/types";

/**
 * Simulation Utility Functions
 *
 * Maps between backend API shapes and frontend store shapes.
 *
 * Key mismatches handled:
 * - Backend scenarios.low/medium/high  →  Frontend percentiles.p10/p50/p90 (Low/Medium/High)
 * - Backend status "processing"        →  Frontend status "running"
 * - Backend result.medianOutcome       →  Frontend medianTerminalWealth
 * - Backend result.statistics.stdDev   →  Frontend statistics.standardDeviation
 * - Backend parameters.portfolioId     →  Frontend bucketId
 */

/**
 * Get next goalId from localStorage (auto-incrementing counter).
 * Shared across all pages that create simulations.
 */
export function nextGoalId(): number {
  if (typeof window === "undefined") return 101;
  const current = parseInt(localStorage.getItem("goalIdCounter") || "101", 10);
  localStorage.setItem("goalIdCounter", (current + 1).toString());
  return current;
}

/**
 * Map backend ApiSimulationStatus → frontend SimulationStatus
 */
function mapApiStatus(status: string): SimulationStatus {
  switch (status) {
    case "processing":
      return "running";
    case "pending":
      return "pending";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    default:
      return "pending";
  }
}

/**
 * Map backend ApiSimulation → frontend SimulationResult
 *
 * Handles both incomplete (pending/processing) and completed simulations.
 * For incomplete simulations, percentiles/timeline are empty arrays.
 */
export function mapApiSimulationToResult(api: ApiSimulation): SimulationResult {
  const frontendStatus = mapApiStatus(api.status);

  // Base shape for pending/processing simulations
  const base: SimulationResult = {
    id: api.id,
    bucketId: api.portfolioId || api.parameters?.portfolioId || "",
    name: api.name,  // Custom simulation name from backend
    config: {
      bucketId: api.portfolioId || api.parameters?.portfolioId || "",
      initialInvestment: api.parameters?.initialInvestment || 0,
      monthlyContribution: api.parameters?.monthlyInvestment || 0,
      withdrawalRate: 0,
      yearsToProject: api.parameters?.tenure || 0,
      // Read effective rates from results if available, otherwise fall back to parameters
      inflationRate: api.results?.inflationRate ?? (api.parameters?.inflationRate || 0),
      taxRate: api.results?.taxRate ?? (api.parameters?.taxRate || 0),
      iterations: api.parameters?.iterations || 1000,
      targetCorpus: api.parameters?.targetCorpus,
    },
    status: frontendStatus,
    percentiles: { p10: [], p50: [], p90: [] },
    timeline: [],
    medianTerminalWealth: 0,
    downsideRisk: 0,
    failureYearMode: null,
    createdAt: api.createdAt || new Date().toISOString(),
    portfolioName: api.portfolio?.portfolioName || "Unknown Portfolio",
    portfolioCode: api.portfolio?.portfolioCode || "",
    allocations: api.portfolio?.allocations || [],
  };

  // If completed and results exists, populate the data
  if (api.status === "completed" && api.results) {
    const { scenarios, chartData } = api.results;

    // Map chartData arrays to percentiles (low/medium/high → p10/p50/p90)
    if (chartData) {
      const tenure = api.parameters?.tenure || 30;
      const startYear = new Date().getFullYear();

      // DEBUG LOG
      console.log('[Frontend] Mapping Simulation Result. chartData present?', !!chartData, 'days length:', chartData?.days?.length);

      // Convert days to years and limit to tenure
      if (chartData.days && chartData.days.length > 0) {
        // Generate timeline based on unique years within tenure
        // Use FULL resolution (monthly/daily steps) instead of deduplicating by year
        const startDate = new Date();
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();

        // Populate all data points
        base.timeline = [];
        const p10: number[] = [];
        const p50: number[] = [];
        const p90: number[] = [];

        for (let i = 0; i < chartData.days.length; i++) {
          const dayOffset = chartData.days[i];

          // Calculate timestamp for this data point
          // If value is large (> 1M), treat as timestamp. Else treat as day offset from start.
          let timestamp: number;
          if (dayOffset > 1_000_000) {
            timestamp = dayOffset;
          } else {
            const date = new Date(startYear, startMonth, startDay + dayOffset);
            timestamp = date.getTime();
          }

          base.timeline.push(timestamp);
          p10.push(chartData.low[i]);
          p50.push(chartData.medium[i]);
          p90.push(chartData.high[i]);
        }

        base.percentiles = { p10, p50, p90 };

        // Map real (inflation-adjusted) percentiles if available
        if (chartData.real_low && chartData.real_medium && chartData.real_high) {
          const realP10: number[] = [];
          const realP50: number[] = [];
          const realP90: number[] = [];

          for (let i = 0; i < chartData.days.length; i++) {
            realP10.push(chartData.real_low[i]);
            realP50.push(chartData.real_medium[i]);
            realP90.push(chartData.real_high[i]);
          }

          base.realPercentiles = { p10: realP10, p50: realP50, p90: realP90 };
        }

        // Map milestones
        if (chartData.milestones) {
          base.milestones = chartData.milestones;
        }

        if (chartData.goal_probabilities) {
          base.goalProbabilities = chartData.goal_probabilities;
        }

        // Map post-tax percentiles
        if (chartData.post_tax_low && chartData.post_tax_medium && chartData.post_tax_high) {
          const postTaxP10: number[] = [];
          const postTaxP50: number[] = [];
          const postTaxP90: number[] = [];

          for (let i = 0; i < chartData.days.length; i++) {
            postTaxP10.push(chartData.post_tax_low[i]);
            postTaxP50.push(chartData.post_tax_medium[i]);
            postTaxP90.push(chartData.post_tax_high[i]);
          }

          base.postTaxPercentiles = { p10: postTaxP10, p50: postTaxP50, p90: postTaxP90 };
        }
      } else {

        // Fallback: use arrays as-is but limit to tenure
        // UPDATE: Generate TIMESTAMPS even for fallback so chart renders dates correctly
        const maxPoints = Math.min(chartData.low?.length || 0, tenure + 1);
        base.percentiles = {
          p10: (chartData.low || []).slice(0, maxPoints),
          p50: (chartData.medium || []).slice(0, maxPoints),
          p90: (chartData.high || []).slice(0, maxPoints),
        };

        // Generate start-of-year timestamps
        base.timeline = Array.from({ length: maxPoints }, (_, i) => {
          return new Date(startYear + i, 0, 1).getTime();
        });
      }
    }

    // Use medium final value as median terminal wealth
    base.medianTerminalWealth = scenarios?.medium?.finalValue || 0;

    // Use backend-calculated annualized return for low scenario as downside risk
    base.downsideRisk = scenarios?.low?.annualizedReturn || 0;

    base.completedAt = api.updatedAt || new Date().toISOString();

    // Map statistics from backend suggestions.statistics
    const stats = api.results?.suggestions?.statistics;
    base.statistics = {
      mean: stats?.mean || scenarios?.medium?.finalValue || 0,
      standardDeviation: stats?.std_dev || 0,
      skewness: 0,     // Not provided by backend
      kurtosis: 0,     // Not provided by backend
    };

    // Map analysis & recommendations from backend suggestions
    const analysis = api.results?.suggestions?.analysis;
    base.riskLevel = analysis?.risk_level;
    base.sharpeRatio = analysis?.sharpe_ratio;
    base.volatility = analysis?.volatility;
    base.successRate = stats?.success_rate;

    // Recommendations can be strings or objects with a 'message' field
    const rawRecs = api.results?.suggestions?.recommendations;
    if (rawRecs && Array.isArray(rawRecs)) {
      base.recommendations = rawRecs.map((rec) =>
        typeof rec === "string" ? rec : rec?.message || rec?.title || String(rec)
      );
    }

    // Map goal analysis fields from suggestions
    const suggestions = api.results?.suggestions;
    if (suggestions) {
      base.targetCorpus = suggestions.targetCorpus;
      base.inflatedTargetCorpus = suggestions.inflatedTargetCorpus;
      base.inflationRate = suggestions.inflationRate || api.parameters?.inflationRate;
      base.targetAchieved = suggestions.targetAchieved;
      base.projectionGap = suggestions.gap;
      base.projectionGapPercent = suggestions.gapPercentage;
      base.currentProjection = suggestions.currentProjection;
      base.suggestionMessage = suggestions.message;
    }

    // Use backend success_rate for probability of success
    if (stats?.success_rate != null) {
      base.probabilityOfSuccess = stats.success_rate;
    }
  }

  return base;
}

/**
 * Check if a simulation is in a terminal state (no more polling needed)
 */
export function isSimulationTerminal(status: string): boolean {
  return status === "completed" || status === "failed";
}

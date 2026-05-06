import { useMemo } from "react";

/**
 * useGoalCalculator
 *
 * Pure frontend FV-based calculator that gives instant suggestions
 * as the user fills in the simulation form.
 *
 * Uses the same Future Value formula as the Python suggestion_service:
 *   FV = P × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
 *
 * Solves for PMT or P depending on which field is missing.
 */

interface GoalCalculatorInput {
  targetCorpus: number; // Today's price (e.g. 2,000,000)
  initialInvestment: number; // Lump sum
  monthlyInvestment: number; // Monthly SIP
  years: number; // Investment tenure
  inflationRate: number; // Annual inflation as percentage (e.g. 6 for 6%)
  expectedReturn: number; // Portfolio annual return as percentage (e.g. 12 for 12%)
}

interface GoalCalculatorResult {
  /** Target adjusted for inflation over the tenure */
  inflatedTarget: number;
  /** Projected FV with current initial + monthly */
  projectedValue: number;
  /** Gap (positive = shortfall, negative = surplus) */
  gap: number;
  /** true if projected >= inflatedTarget */
  onTrack: boolean;
  /** Required monthly SIP if keeping initial fixed (null if not applicable) */
  requiredSIP: number | null;
  /** Required initial if keeping monthly fixed (null if not applicable) */
  requiredInitial: number | null;
  /** Ready to show suggestion (target > 0, return > 0, years > 0) */
  ready: boolean;
}

export function useGoalCalculator(input: GoalCalculatorInput): GoalCalculatorResult {
  return useMemo(() => {
    const { targetCorpus, initialInvestment, monthlyInvestment, years, inflationRate, expectedReturn } = input;

    const empty: GoalCalculatorResult = {
      inflatedTarget: 0,
      projectedValue: 0,
      gap: 0,
      onTrack: false,
      requiredSIP: null,
      requiredInitial: null,
      ready: false,
    };

    // Need at minimum: target, years, return
    if (targetCorpus <= 0 || years <= 0 || expectedReturn <= 0) return empty;

    // Convert percentages to decimals
    const annualReturn = expectedReturn / 100;
    const annualInflation = inflationRate / 100;

    // Monthly rate and total months
    const r = Math.pow(1 + annualReturn, 1 / 12) - 1;
    const n = years * 12;

    // Inflation-adjusted target
    const inflatedTarget = annualInflation > 0
      ? targetCorpus * Math.pow(1 + annualInflation, years)
      : targetCorpus;

    // Projected FV with current inputs
    const fvInitial = initialInvestment * Math.pow(1 + r, n);
    const fvMonthly = r > 0
      ? monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r)
      : monthlyInvestment * n;
    const projectedValue = fvInitial + fvMonthly;

    const gap = inflatedTarget - projectedValue;
    const onTrack = projectedValue >= inflatedTarget;

    // Calculate required SIP (keeping initial fixed)
    let requiredSIP: number | null = null;
    if (r > 0) {
      const numerator = (inflatedTarget - initialInvestment * Math.pow(1 + r, n)) * r;
      const denominator = Math.pow(1 + r, n) - 1;
      if (denominator !== 0) {
        const sip = numerator / denominator;
        requiredSIP = sip > 0 ? Math.round(sip) : null;
      }
    }

    // Calculate required initial (keeping monthly fixed)
    let requiredInitial: number | null = null;
    {
      const fvSip = r > 0
        ? monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r)
        : monthlyInvestment * n;
      const compound = Math.pow(1 + r, n);
      if (compound !== 0) {
        const initial = (inflatedTarget - fvSip) / compound;
        requiredInitial = initial > 0 ? Math.round(initial) : null;
      }
    }

    return {
      inflatedTarget: Math.round(inflatedTarget),
      projectedValue: Math.round(projectedValue),
      gap: Math.round(gap),
      onTrack,
      requiredSIP,
      requiredInitial,
      ready: true,
    };
  }, [
    input.targetCorpus,
    input.initialInvestment,
    input.monthlyInvestment,
    input.years,
    input.inflationRate,
    input.expectedReturn,
  ]);
}

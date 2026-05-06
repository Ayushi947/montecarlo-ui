import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SimulationResult } from "@/types";

/**
 * Asset in a portfolio
 */
interface Asset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  weight: number;
  /** Backend asset class (e.g. "Equity", "Debt", "Gold") */
  assetClassName?: string;
  /** Expected annual return (%) — required by backend */
  expectedReturn?: number;
}

/**
 * Portfolio bucket configuration
 */
interface PortfolioBucket {
  id: string;
  name: string;
  description?: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
  /** True if this bucket was loaded from the backend API */
  isFromApi?: boolean;
  /** Backend-generated code (e.g. "P001") */
  portfolioCode?: string;
}

/**
 * Simulation Store State
 */
interface SimulationState {
  // Portfolio Builder
  currentBucket: PortfolioBucket | null;
  savedBuckets: PortfolioBucket[];

  // Simulation
  currentSimulation: SimulationResult | null;
  simulationHistory: SimulationResult[];

  // API sync
  portfoliosLoaded: boolean;
  simulationsLoaded: boolean;

  // Trial Guard
  sessionSimulationCount: number;
  trialLimit: number;

  // Actions
  setCurrentBucket: (bucket: PortfolioBucket | null) => void;
  saveBucket: (bucket: PortfolioBucket) => void;
  deleteBucket: (bucketId: string) => void;
  setSavedBuckets: (buckets: PortfolioBucket[]) => void;
  setPortfoliosLoaded: (loaded: boolean) => void;
  updateAssetWeight: (ticker: string, weight: number) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (ticker: string) => void;

  setCurrentSimulation: (simulation: SimulationResult | null) => void;
  addSimulationToHistory: (simulation: SimulationResult) => void;
  setSimulationHistory: (simulations: SimulationResult[]) => void;
  setSimulationsLoaded: (loaded: boolean) => void;
  updateSimulationInHistory: (simulation: SimulationResult) => void;
  deleteSimulationFromHistory: (id: string) => void;
  incrementSessionCount: () => void;
  resetSessionCount: () => void;
}

/**
 * Zustand Simulation Store
 *
 * Manages:
 * - Portfolio bucket creation and editing
 * - Asset weights and allocation
 * - Simulation results
 * - Trial guard session tracking
 */
export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBucket: null,
      savedBuckets: [],
      portfoliosLoaded: false,
      simulationsLoaded: false,
      currentSimulation: null,
      simulationHistory: [],
      sessionSimulationCount: 0,
      trialLimit: 3,

      // Portfolio actions
      setCurrentBucket: (bucket) => set({ currentBucket: bucket }),

      saveBucket: (bucket) =>
        set((state) => {
          const existingIndex = state.savedBuckets.findIndex(
            (b) => b.id === bucket.id
          );
          if (existingIndex >= 0) {
            const updated = [...state.savedBuckets];
            updated[existingIndex] = bucket;
            return { savedBuckets: updated };
          }
          return { savedBuckets: [...state.savedBuckets, bucket] };
        }),

      deleteBucket: (bucketId) =>
        set((state) => ({
          savedBuckets: state.savedBuckets.filter((b) => b.id !== bucketId),
          currentBucket:
            state.currentBucket?.id === bucketId ? null : state.currentBucket,
        })),

      setSavedBuckets: (buckets) => set({ savedBuckets: buckets }),
      setPortfoliosLoaded: (loaded) => set({ portfoliosLoaded: loaded }),

      updateAssetWeight: (ticker, weight) =>
        set((state) => {
          if (!state.currentBucket) return state;
          const assets = state.currentBucket.assets.map((a) =>
            a.ticker === ticker ? { ...a, weight } : a
          );
          return {
            currentBucket: {
              ...state.currentBucket,
              assets,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addAsset: (asset) =>
        set((state) => {
          if (!state.currentBucket) return state;
          const exists = state.currentBucket.assets.some(
            (a) => a.ticker === asset.ticker
          );
          if (exists) return state;
          return {
            currentBucket: {
              ...state.currentBucket,
              assets: [...state.currentBucket.assets, asset],
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeAsset: (ticker) =>
        set((state) => {
          if (!state.currentBucket) return state;
          return {
            currentBucket: {
              ...state.currentBucket,
              assets: state.currentBucket.assets.filter(
                (a) => a.ticker !== ticker
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      // Simulation actions
      setCurrentSimulation: (simulation) =>
        set({ currentSimulation: simulation }),

      addSimulationToHistory: (simulation) =>
        set((state) => ({
          simulationHistory: [simulation, ...state.simulationHistory].slice(
            0,
            50
          ), // Keep last 50
        })),

      setSimulationHistory: (simulations) =>
        set({ simulationHistory: simulations }),

      setSimulationsLoaded: (loaded) =>
        set({ simulationsLoaded: loaded }),

      updateSimulationInHistory: (simulation) =>
        set((state) => ({
          simulationHistory: state.simulationHistory.map((s) =>
            s.id === simulation.id ? simulation : s
          ),
          // Also update currentSimulation if it matches
          currentSimulation:
            state.currentSimulation?.id === simulation.id
              ? simulation
              : state.currentSimulation,
        })),

      deleteSimulationFromHistory: (id) =>
        set((state) => ({
          simulationHistory: state.simulationHistory.filter((s) => s.id !== id),
          currentSimulation:
            state.currentSimulation?.id === id ? null : state.currentSimulation,
        })),

      incrementSessionCount: () =>
        set((state) => ({
          sessionSimulationCount: state.sessionSimulationCount + 1,
        })),

      resetSessionCount: () => set({ sessionSimulationCount: 0 }),
    }),
    {
      name: "simulix-simulation",
      partialize: (state) => ({
        savedBuckets: state.savedBuckets,
        simulationHistory: state.simulationHistory,
      }),
    }
  )
);

/**
 * Selector: Check if trial limit reached
 */
export const useTrialLimitReached = () =>
  useSimulationStore(
    (state) => state.sessionSimulationCount >= state.trialLimit
  );

/**
 * Selector: Get total weight of current bucket
 */
export const useTotalWeight = () =>
  useSimulationStore((state) =>
    state.currentBucket?.assets.reduce((sum, a) => sum + a.weight, 0) ?? 0
  );

/**
 * Selector: Check if weights are valid (sum to 100)
 */
export const useWeightsValid = () => {
  const totalWeight = useTotalWeight();
  return Math.abs(totalWeight - 100) < 0.01;
};

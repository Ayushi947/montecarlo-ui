
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import {
    Loader2,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Briefcase,
    Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGuest } from "@/context/GuestContext";
import { guestGetSimulationApi } from "@/services/guest-service";
import { mapApiSimulationToResult } from "@/lib/simulation-utils";
import { SimulationFanChart } from "@/components/dashboard/simulation-fan-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import type { SimulationResult } from "@/types";

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function GuestSimulationResultPage() {
    const params = useParams();
    const searchParams = useSearchParams(); // Hook to get query params
    const simulationId = params?.id as string;
    const router = useRouter();

    // Check if routed from Sandbox with ?guest=true
    // Not strictly needed for logic but good for tracking or UI tweaks
    const isGuestMode = searchParams.get("guest") === "true";

    const { guestId, fingerprint, isLoading: isGuestContextLoading } = useGuest();

    const [simulation, setSimulation] = React.useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isProcessing, setIsProcessing] = React.useState(true); // Start as processing
    const [progress, setProgress] = React.useState(0);

    const pollIdRef = React.useRef(0);
    const cancelledRef = React.useRef(false);

    // View Mode
    const [viewMode, setViewMode] = React.useState<"day" | "month" | "year">("year");

    // ─── Polling Logic ───
    React.useEffect(() => {
        if (isGuestContextLoading) return;
        if (!guestId) {
            // If no guest ID, they shouldn't be here. Redirect to sandbox start.
            router.replace("/sandbox");
            return;
        }

        cancelledRef.current = false;
        // Don't reset loading to true if we just re-rendered, only on ID change

        const startPolling = () => {
            const myPollId = ++pollIdRef.current;
            let pollCount = 0;
            const maxPolls = 100;
            const pollInterval = 3000;

            // Fake progress bar
            const progressTimer = setInterval(() => {
                if (myPollId !== pollIdRef.current) {
                    clearInterval(progressTimer);
                    return;
                }
                setProgress((prev) => (prev >= 95 ? 95 : prev + Math.random() * 5));
            }, 500);

            const poll = async () => {
                if (cancelledRef.current || myPollId !== pollIdRef.current) {
                    clearInterval(progressTimer);
                    return;
                }

                if (pollCount >= maxPolls) {
                    clearInterval(progressTimer);
                    toast.error("Simulation timeout");
                    setIsProcessing(false);
                    setIsLoading(false);
                    return;
                }

                try {
                    const response = await guestGetSimulationApi(simulationId, guestId, fingerprint);

                    if (cancelledRef.current || myPollId !== pollIdRef.current) {
                        clearInterval(progressTimer);
                        return;
                    }

                    const status = response.data?.status;
                    pollCount++;

                    if (status === "completed" && response.success && response.data) {
                        const mapped = mapApiSimulationToResult(response.data);
                        console.log('[Guest Simulation] Mapped simulation:', mapped);
                        console.log('[Guest Simulation] Allocations:', mapped.allocations);
                        console.log('[Guest Simulation] Raw API data (full):', JSON.stringify(response.data, null, 2));
                        setSimulation(mapped);
                        clearInterval(progressTimer);
                        setProgress(100);

                        // Small delay to let user see 100% completion
                        setTimeout(() => {
                            setIsProcessing(false);
                            setIsLoading(false);
                        }, 600);
                    } else if (status === "failed") {
                        setIsProcessing(false);
                        setIsLoading(false);
                        clearInterval(progressTimer);
                        toast.error("Simulation failed");
                    } else {
                        // Still processing
                        setTimeout(poll, pollInterval);
                    }
                } catch (error: any) {
                    // If 404, maybe it's not created yet or wrong ID
                    if (error?.response?.status === 404) {
                        // Wait and try again
                        setTimeout(poll, pollInterval);
                    } else if (error?.response?.status === 403) {
                        clearInterval(progressTimer);
                        toast.error("Access Denied");
                        router.push("/sandbox");
                    } else {
                        // Start retrying
                        setTimeout(poll, pollInterval);
                    }
                }
            };

            poll();
        };

        startPolling();

        return () => {
            cancelledRef.current = true;
            pollIdRef.current++;
        };
    }, [simulationId, guestId, fingerprint, isGuestContextLoading, router]);

    // ─── Chart Data Preparation ───
    const allChartData = React.useMemo(() => {
        if (!simulation) return [];
        return simulation.timeline.map((year, i) => ({
            year,
            p10: simulation.percentiles.p10[i] || 0,
            p50: simulation.percentiles.p50[i] || 0,
            p90: simulation.percentiles.p90[i] || 0,
            goalValue: simulation.targetCorpus || 0, // Add Goal Value for chart line
        }));
    }, [simulation]);

    const filteredChartData = React.useMemo(() => {
        if (allChartData.length === 0) return [];
        if (viewMode === "day") return allChartData;
        if (viewMode === "year") {
            const seenYears = new Set<number>();
            return allChartData.filter((point) => {
                if (point.year <= 10000) return true;
                const year = new Date(point.year).getFullYear();
                if (seenYears.has(year)) return false;
                seenYears.add(year);
                return true;
            });
        }
        return allChartData;
    }, [allChartData, viewMode]);

    // ─── Render ───

    if (isGuestContextLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Back Link */}
                <div className="flex justify-between items-center">
                    <Link href="/sandbox" className="text-sm text-muted-foreground hover:text-foreground">
                        &larr; Back to Sandbox
                    </Link>
                    <Button size="sm" asChild className="bg-gradient-to-r from-primary to-purple-600 border-0">
                        <Link href="/auth/signup">Sign Up to Save Results</Link>
                    </Button>
                </div>

                {/* Loading / Processing */}
                {isProcessing && (
                    <div className="py-20 text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <h2 className="text-xl font-semibold">Simulating Your Wealth...</h2>
                        <div className="w-64 mx-auto bg-muted rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Results */}
                {!isProcessing && simulation && (
                    <>
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    {simulation.name}
                                    <Badge variant="outline" className="text-xs font-normal">Guest Mode</Badge>
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {simulation.config.yearsToProject} year projection • {simulation.config.iterations.toLocaleString()} scenarios
                                </p>
                            </div>

                            {/* View Mode Toggle Removed as per user request */}
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Chart (Spans 2 cols) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="rounded-xl border bg-card p-4 sm:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-sm">Wealth Projection</h3>
                                        <Badge variant="outline" className="gap-1 text-xs"><Activity className="h-3 w-3" /> Complete</Badge>
                                    </div>
                                    <SimulationFanChart
                                        data={filteredChartData}
                                        goalAmount={simulation.targetCorpus}
                                        height={320}
                                        granularity={viewMode}
                                    />
                                </div>

                                {/* Goal Analysis */}
                                {simulation.targetCorpus && (
                                    <div className="rounded-xl border bg-card p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold">Goal Analysis</h3>
                                            <Badge variant={simulation.targetAchieved ? "default" : "secondary"}>
                                                {simulation.targetAchieved ? "On Track" : "Needs Adjustment"}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-muted/30 rounded-lg border">
                                                <p className="text-xs text-muted-foreground">Target (Inflation Adjusted)</p>
                                                <p className="text-xl font-bold font-mono">
                                                    {formatCurrency(simulation.inflatedTargetCorpus || simulation.targetCorpus)}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-muted/30 rounded-lg border">
                                                <p className="text-xs text-muted-foreground">Projected (Median)</p>
                                                <p className={cn("text-xl font-bold font-mono", simulation.targetAchieved ? "text-green-600" : "text-amber-600")}>
                                                    {formatCurrency(simulation.medianTerminalWealth)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats Sidebar */}
                            <div className="space-y-4">
                                {/* Metrics */}
                                <div className="rounded-xl border bg-card p-4 space-y-4">
                                    <h3 className="font-semibold text-sm">Key Metrics</h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">P90 (Optimistic)</span>
                                            <span className="font-mono font-medium text-green-600">
                                                {formatCurrency(allChartData[allChartData.length - 1]?.p90 || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">P50 (Median)</span>
                                            <span className="font-mono font-medium">
                                                {formatCurrency(simulation.medianTerminalWealth)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">P10 (Pessimistic)</span>
                                            <span className="font-mono font-medium text-red-600">
                                                {formatCurrency(allChartData[allChartData.length - 1]?.p10 || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Portfolio Allocation */}
                                {simulation.allocations && simulation.allocations.length > 0 && (
                                    <div className="rounded-xl border bg-card p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="font-semibold text-sm">Portfolio Allocation</h3>
                                        </div>
                                        <AllocationChart
                                            data={(simulation.allocations || []).map((asset) => ({
                                                ticker: asset.assetCode,
                                                name: asset.assetName,
                                                value: asset.targetAllocationPercentage,
                                            }))}
                                        />
                                    </div>
                                )}

                                {/* CTA Card */}
                                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 text-center space-y-3">
                                    <Lock className="h-6 w-6 text-primary mx-auto" />
                                    <h3 className="font-bold text-foreground">Unlock Full Access</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Sign up to save this simulation, create custom portfolios, and get detailed insights.
                                    </p>
                                    <Button className="w-full" asChild>
                                        <Link href="/auth/signup">Create Free Account</Link>
                                    </Button>
                                </div>

                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

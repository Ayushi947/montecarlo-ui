
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Loader2, Target, Info, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuest } from "@/context/GuestContext";
import { guestSimulateApi } from "@/services/guest-service";
import { formatNumberWithCommas, parseFormattedNumber, cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PortfolioBuilder, AssetAllocation } from "@/components/sandbox/portfolio-builder";
import { PortfolioChart } from "@/components/sandbox/portfolio-chart";

export default function SandboxPage() {
    const router = useRouter();
    const { guestId, fingerprint, isLoading: isGuestLoading } = useGuest();

    const [simulationName, setSimulationName] = React.useState("My Free Simulation");
    const [initialInvestment, setInitialInvestment] = React.useState(100000);
    const [monthlyContribution, setMonthlyContribution] = React.useState(1000);
    const [timeHorizon, setTimeHorizon] = React.useState(20);
    const [targetCorpus, setTargetCorpus] = React.useState(2000000);

    // Strategy State: Custom Only
    const [customAllocations, setCustomAllocations] = React.useState<AssetAllocation[]>([]);

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showLimitModal, setShowLimitModal] = React.useState(false);

    const handleSubmit = async () => {
        if (!guestId) return;
        setIsSubmitting(true);

        try {
            // Validate custom allocations
            const total = customAllocations.reduce((sum, a) => sum + a.targetAllocationPercentage, 0);
            if (total !== 100) {
                toast.error("Allocation Error", { description: `Total must be 100% (Current: ${total}%)` });
                setIsSubmitting(false);
                return;
            }
            if (customAllocations.length === 0) {
                toast.error("Allocation Error", { description: "You must add at least one asset." });
                setIsSubmitting(false);
                return;
            }

            const response = await guestSimulateApi(
                {
                    portfolioId: "GUEST", // Ignored by backend, uses allocations
                    name: simulationName,
                    initialInvestment,
                    monthlyInvestment: monthlyContribution,
                    tenure: timeHorizon,
                    targetCorpus,
                    iterations: 1000,
                    inflationRate: 0.06,
                    allocations: customAllocations,
                },
                guestId,
                fingerprint
            );

            if (response.success && response.data?.simulationId) {
                // Redirect to public result page
                router.push(`/public/simulate/${response.data.simulationId}?guest=true`);
            }
        } catch (error: any) {
            if (error?.response?.status === 403) {
                setShowLimitModal(true);
            } else {
                toast.error("Simulation failed", {
                    description: error.message || "Something went wrong"
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isGuestLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center">

            {/* Header */}
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Free Sandbox</h1>
                <p className="text-muted-foreground">
                    Try our Monte Carlo engine without signing up. (Limit: 2 runs)
                </p>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">

                {/* LEFT COLUMN: Main Configuration Card (Spans 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">

                        {/* Goal Input */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Target className="h-5 w-5" />
                                <h3 className="font-semibold">Your Goal</h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Amount ($)</label>
                                    <Input
                                        value={formatNumberWithCommas(targetCorpus)}
                                        onChange={(e) => setTargetCorpus(parseFormattedNumber(e.target.value))}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Time Horizon (Years)</label>
                                    <Input
                                        type="number"
                                        value={timeHorizon}
                                        onChange={(e) => setTimeHorizon(Number(e.target.value))}
                                        className="font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Info className="h-5 w-5" />
                                <h3 className="font-semibold">Investment Details</h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Initial Investment ($)</label>
                                    <Input
                                        value={formatNumberWithCommas(initialInvestment)}
                                        onChange={(e) => setInitialInvestment(parseFormattedNumber(e.target.value))}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Monthly Contribution ($)</label>
                                    <Input
                                        value={formatNumberWithCommas(monthlyContribution)}
                                        onChange={(e) => setMonthlyContribution(parseFormattedNumber(e.target.value))}
                                        className="font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr />

                        {/* Portfolio Builder Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Portfolio Composition</h3>
                            </div>

                            <PortfolioBuilder
                                allocations={customAllocations}
                                onChange={setCustomAllocations}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Chart Component (Spans 1 col) */}
                <div className="lg:col-span-1">
                    <PortfolioChart allocations={customAllocations} />
                </div>

            </div>

            {/* BOTTOM CENTER: Run Button & Login Link */}
            <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-4 pb-12">
                <Button
                    size="lg"
                    className="w-full h-14 text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all bg-gradient-to-r from-primary to-blue-600"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                    Run Free Simulation
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account? <Link href="/auth/login" className="underline hover:text-primary transition-colors">Log in here</Link>
                </p>
            </div>

            {/* Limit Reached Modal */}
            <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Lock className="h-5 w-5" /> Limit Reached
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            You have used your <strong>2 free guest simulations</strong>.
                            <br /><br />
                            Please create a free account to continue running unlimited simulations and save your progress.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLimitModal(false)}>Cancel</Button>
                        <Button asChild>
                            <Link href="/auth/signup">Create Free Account</Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

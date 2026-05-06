
"use client";

import * as React from "react";
import { Plus, Trash2, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { guestSearchAssetsApi } from "@/services/guest-service";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface AssetAllocation {
    assetCode: string;
    assetName: string;
    assetClassName: string;
    targetAllocationPercentage: number;
    expectedReturn: number;
}

interface PortfolioBuilderProps {
    allocations: AssetAllocation[];
    onChange: (allocations: AssetAllocation[]) => void;
}

export function PortfolioBuilder({ allocations, onChange }: PortfolioBuilderProps) {
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);

    // Derived state
    const totalAllocation = allocations.reduce((sum, a) => sum + a.targetAllocationPercentage, 0);

    // Search Assets
    React.useEffect(() => {
        if (!isSearchOpen) return;

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await guestSearchAssetsApi(searchQuery);
                // Filter out already selected assets
                const available = results.filter(r => !allocations.find(a => a.assetCode === r.assetCode));
                setSearchResults(available);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, isSearchOpen, allocations]);

    const handleAddAsset = (asset: any) => {
        const newAlloc: AssetAllocation = {
            assetCode: asset.assetCode,
            assetName: asset.assetName,
            assetClassName: asset.assetClassName,
            targetAllocationPercentage: 0, // Start at 0, user adjusts
            expectedReturn: asset.expectedReturn
        };
        onChange([...allocations, newAlloc]);
        setIsSearchOpen(false);
        setSearchQuery("");
    };

    const handleRemoveAsset = (code: string) => {
        onChange(allocations.filter(a => a.assetCode !== code));
    };

    const handleUpdatePercentage = (code: string, value: number) => {
        onChange(allocations.map(a =>
            a.assetCode === code ? { ...a, targetAllocationPercentage: value } : a
        ));
    };

    // Equal Weights Logic
    const handleEqualWeights = () => {
        if (allocations.length === 0) return;
        const count = allocations.length;
        const equalShare = Math.floor(100 / count);
        const remainder = 100 % count;

        const newAllocations = allocations.map((a, i) => ({
            ...a,
            targetAllocationPercentage: i === 0 ? equalShare + remainder : equalShare
        }));

        onChange(newAllocations);
    };

    return (
        <div className="space-y-4">
            {/* Allocation List */}
            <div className="space-y-3">
                {allocations.map((asset) => (
                    <div key={asset.assetCode} className="group bg-muted/30 p-3 rounded-lg border hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-medium text-sm flex items-center gap-2">
                                    {asset.assetCode}
                                    <Badge variant="outline" className="text-[10px] h-4 px-1">{asset.assetClassName}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[180px]">{asset.assetName}</div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-1"
                                onClick={() => handleRemoveAsset(asset.assetCode)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={asset.targetAllocationPercentage}
                                onChange={(e) => handleUpdatePercentage(asset.assetCode, Number(e.target.value))}
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="w-12 text-right font-mono text-sm font-bold">
                                {asset.targetAllocationPercentage}%
                            </div>
                        </div>
                    </div>
                ))}

                {allocations.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                        No assets selected. Add one to start.
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1 border-dashed">
                                <Plus className="mr-2 h-4 w-4" /> Add Asset
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Asset</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 pt-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by ticker or name..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-1">
                                    {isSearching ? (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((result) => (
                                            <button
                                                key={result.assetCode}
                                                onClick={() => handleAddAsset(result)}
                                                className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex justify-between items-center group"
                                            >
                                                <div>
                                                    <div className="font-medium text-sm">{result.assetCode}</div>
                                                    <div className="text-xs text-muted-foreground">{result.assetName}</div>
                                                </div>
                                                <div className="text-xs text-muted-foreground group-hover:text-primary">
                                                    Add +
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground p-4">
                                            {searchQuery ? "No assets found" : "Type to search..."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {allocations.length > 0 && (
                        <Button variant="secondary" onClick={handleEqualWeights} title="Distribute Evenly">
                            Equal Weights
                        </Button>
                    )}
                </div>
            </div>

            {/* Validation Message */}
            {totalAllocation !== 100 && (
                <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded border border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    Allocation must sum to 100% (Current: {totalAllocation}%)
                </div>
            )}
        </div>
    );
}

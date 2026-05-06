"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";
import { AssetAllocation } from "./portfolio-builder";

interface PortfolioChartProps {
  allocations: AssetAllocation[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function PortfolioChart({ allocations }: PortfolioChartProps) {
  const totalAllocation = allocations.reduce(
    (sum, a) => sum + a.targetAllocationPercentage,
    0,
  );
  const expectedReturn = allocations.reduce(
    (sum, a) => sum + (a.expectedReturn * a.targetAllocationPercentage) / 100,
    0,
  );

  // Prepare data for rendering. If total is 0, we might want to show a placeholder or just the legend.
  // Recharts Pie needs data > 0 to render anything visible.
  // We'll handle the "visual empty state" by rendering a gray ring if total is 0 but assets exist.
  const hasAssets = allocations.length > 0;
  const isZeroTotal = totalAllocation === 0;

  // Placeholder data for 0% allocation
  const placeholderData = [{ name: "Empty", value: 100 }];

  if (!hasAssets) {
    return (
      <Card className="h-fit sticky top-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieIcon className="h-4 w-4" /> Allocation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col items-center justify-center text-muted-foreground text-sm">
          <PieIcon className="h-16 w-16 opacity-20 mb-4" />
          <p>Add assets to see breakdown</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PieIcon className="h-4 w-4" /> Allocation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Render placeholder ring if total is 0 */}
              {isZeroTotal && (
                <Pie
                  data={placeholderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  dataKey="value"
                  stroke="none"
                  fill="hsl(var(--muted))"
                  opacity={0.3}
                />
              )}

              {/* Actual Data Pie */}
              <Pie
                data={allocations}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                dataKey="targetAllocationPercentage"
                nameKey="assetCode"
                stroke="hsl(var(--card))"
                strokeWidth={2}
              >
                {allocations.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value ?? 0}%`}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{ color: "hsl(var(--popover-foreground))" }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value, entry: any) => (
                  <span className="text-xs text-muted-foreground ml-1 font-medium">
                    {entry.payload?.assetCode || value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-3xl font-bold font-mono tracking-tighter">
              {totalAllocation}%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Allocated
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Est. Annual Return</span>
            <BadgeWrapper returnVal={expectedReturn} />
          </div>
          {isZeroTotal && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 text-center mt-2">
              Adjust sliders to allocate funds.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeWrapper({ returnVal }: { returnVal: number }) {
  if (returnVal > 8)
    return (
      <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
        {returnVal.toFixed(2)}%
      </span>
    );
  if (returnVal > 5)
    return (
      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
        {returnVal.toFixed(2)}%
      </span>
    );
  return (
    <span className="font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
      {returnVal.toFixed(2)}%
    </span>
  );
}

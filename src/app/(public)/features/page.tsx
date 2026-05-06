"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  TrendingUp,
  Zap,
  Layers,
  Gauge,
  Lightbulb,
  Camera,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Features Page
 *
 * Screen ID: features
 *
 * Sections:
 * 1. Hero - Feature overview
 * 2. Tabbed Feature Categories
 * 3. Detailed Feature Cards
 * 4. How It Works
 * 5. CTA
 *
 * Updated to reflect actual implemented features
 */
export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 sm:mb-6 py-1.5 px-3 sm:px-4 text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
              Platform Features
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              Powerful tools for{" "}
              <span className="text-gradient">smarter investing</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Build portfolios, run Monte Carlo simulations, and visualize your
              financial future with confidence bands.
            </p>
            <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
              <Link href="/auth/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Categories (Tabbed) */}
      <section className="py-8 sm:py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="simulation" className="space-y-8 sm:space-y-12">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-full max-w-lg text-xs sm:text-sm">
                <TabsTrigger value="simulation">Simulation</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
            </div>

            {/* Simulation Tab */}
            <TabsContent value="simulation" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  Monte Carlo Simulation Engine
                </h2>
                <p className="text-muted-foreground">
                  Run thousands of market scenarios to understand your portfolio&apos;s potential outcomes
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    icon: Gauge,
                    title: "Up to 100K Iterations",
                    description:
                      "Configure 1,000 to 100,000 simulation paths for statistically robust results.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Fan Chart Visualization",
                    description:
                      "Interactive charts showing P10 (pessimistic), P50 (median), and P90 (optimistic) bands.",
                  },
                  {
                    icon: Target,
                    title: "Goal Analysis",
                    description:
                      "Set a target corpus and see if your strategy can achieve it, with success probability.",
                  },
                  {
                    icon: Lightbulb,
                    title: "Smart Suggestions",
                    description:
                      "Get real-time suggestions as you fill in your parameters, plus detailed recommendations after simulation.",
                  },
                  {
                    icon: Layers,
                    title: "Inflation Adjustment",
                    description:
                      "Set an inflation rate and see your goal adjusted for rising costs over your time horizon.",
                  },
                  {
                    icon: Camera,
                    title: "Allocation Snapshots",
                    description:
                      "Each simulation captures an immutable record of your portfolio allocation at run time.",
                  },
                ].map((feature) => (
                  <Card key={feature.title} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  Portfolio Builder
                </h2>
                <p className="text-muted-foreground">
                  Create and manage your investment portfolios with intuitive tools
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    icon: SlidersHorizontal,
                    title: "Weight Sliders",
                    description:
                      "Adjust asset allocations with intuitive sliders. Changes sync in real-time.",
                  },
                  {
                    icon: PieChart,
                    title: "Visual Allocation",
                    description:
                      "See your portfolio breakdown with interactive donut charts and weight displays.",
                  },
                  {
                    icon: Layers,
                    title: "Multiple Portfolios",
                    description:
                      "Create and manage multiple portfolios for different investment strategies.",
                  },
                  {
                    icon: BarChart3,
                    title: "Asset Selection",
                    description:
                      "Choose from a library of stocks, ETFs, and funds with expected returns.",
                  },
                  {
                    icon: Target,
                    title: "Auto-Save",
                    description:
                      "Portfolios auto-save when you run simulations, capturing the exact allocation used.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Run Simulations",
                    description:
                      "Launch Monte Carlo simulations directly from your portfolio builder.",
                  },
                ].map((feature) => (
                  <Card key={feature.title} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  Results & Analysis
                </h2>
                <p className="text-muted-foreground">
                  Understand your simulation results with clear metrics and visualizations
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    icon: LineChart,
                    title: "Percentile Bands",
                    description:
                      "P10, P50, P90 projections show the range of possible outcomes over time.",
                  },
                  {
                    icon: Target,
                    title: "Terminal Wealth",
                    description:
                      "See your projected portfolio value at the end of your investment horizon.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Annualized Returns",
                    description:
                      "Understand your expected CAGR across pessimistic, median, and optimistic scenarios.",
                  },
                  {
                    icon: Gauge,
                    title: "Success Rate",
                    description:
                      "When you set a goal, see what percentage of simulations achieved the target.",
                  },
                  {
                    icon: Lightbulb,
                    title: "Gap Analysis",
                    description:
                      "See your shortfall after inflation adjustment, with actionable suggestions to bridge the gap.",
                  },
                  {
                    icon: BarChart3,
                    title: "Simulation History",
                    description:
                      "Track all your past simulations with full parameter and result history.",
                  },
                ].map((feature) => (
                  <Card key={feature.title} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <Badge variant="secondary" className="mb-3 sm:mb-4">
              How It Works
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Three steps to clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Build Your Portfolio",
                description:
                  "Add assets and adjust weights with sliders. See your allocation visualized in real-time.",
              },
              {
                step: "2",
                title: "Run Simulation",
                description:
                  "Set your target amount, initial investment, monthly SIP, time horizon, and inflation rate.",
              },
              {
                step: "3",
                title: "Analyze Results",
                description:
                  "View fan charts with P10/P50/P90 bands, terminal wealth projections, and goal analysis.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Ready to get started?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Create your first portfolio and run a simulation in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                <Link href="/auth/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

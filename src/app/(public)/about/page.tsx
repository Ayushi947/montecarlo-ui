"use client";

import Link from "next/link";
import {
  ArrowRight,
  Target,
  Shield,
  Zap,
  Heart,
  Lightbulb,
  LineChart,
  Calculator,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * About Us Page
 */
export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 sm:mb-6 py-1.5 px-4 text-sm">
              About Simulix
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              See your financial future{" "}
              <span className="text-gradient">before it happens</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Simulix brings institutional-grade Monte Carlo simulation to individual investors.
              Make informed decisions with data, not guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - Two Column */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-start">
            <div>
              <Badge variant="secondary" className="mb-3">
                The Problem We Solve
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Single-point projections are misleading
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  &quot;If I invest $10,000 at 8% for 30 years, I&apos;ll have $100,627.&quot;
                  This is how most financial planning works. One number. One outcome.
                  But markets don&apos;t deliver steady 8% returns year after year.
                </p>
                <p>
                  In reality, you might see +22% one year, -15% the next, then +5%.
                  The sequence of returns matters enormously, especially when you&apos;re
                  adding or withdrawing money along the way.
                </p>
                <p>
                  <strong className="text-foreground">Monte Carlo simulation</strong> runs
                  thousands of different market scenarios to show you the full range
                  of possible outcomes — not just the average case, but the best and worst
                  cases too.
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-6 lg:p-8 border border-border/50">
              <h3 className="font-semibold mb-5 text-foreground">How Simulix Works</h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Up to 100,000 Simulations</p>
                    <p className="text-sm text-muted-foreground">Each with randomized returns based on historical patterns</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Fan Chart Visualization</p>
                    <p className="text-sm text-muted-foreground">See P10 (pessimistic), P50 (median), and P90 (optimistic) bands</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Inflation-Adjusted Goals</p>
                    <p className="text-sm text-muted-foreground">Set your target and inflation rate — see the real amount you need in future dollars</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 sm:py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <Badge variant="secondary" className="mb-3">
              Our Principles
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Built on trust and transparency
            </h2>
            <p className="text-muted-foreground">
              We believe in showing you reality, not selling you dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: "No Cherry-Picking",
                description:
                  "We show pessimistic, median, and optimistic outcomes — not just the best case.",
              },
              {
                icon: Lightbulb,
                title: "Clear Insights",
                description:
                  "Complex statistics translated into actionable visualizations anyone can understand.",
              },
              {
                icon: Heart,
                title: "Your Data, Your Control",
                description:
                  "Your portfolios and simulations are private. We never sell or share your data.",
              },
              {
                icon: Zap,
                title: "Fast & Simple",
                description:
                  "Run a full Monte Carlo simulation in seconds, not hours. No spreadsheets required.",
              },
            ].map((value) => (
              <Card key={value.title} className="border-border/50 bg-card">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <Badge variant="secondary" className="mb-3">
              Key Features
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Everything you need to plan with confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: LineChart,
                title: "Visual Portfolio Builder",
                description:
                  "Drag sliders to adjust asset weights. See your allocation update in real-time with interactive donut charts.",
              },
              {
                icon: Target,
                title: "Powerful Simulation Engine",
                description:
                  "Run up to 100,000 market scenarios in seconds. Get P10, P50, and P90 projections with fan chart visualization.",
              },
              {
                icon: Eye,
                title: "Smart Goal Tracking",
                description:
                  "Set a target with inflation rate and get real-time suggestions as you plan. After simulation, see your gap analysis and recommendations.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Stop guessing. Start simulating.
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
              Build your first portfolio and run a Monte Carlo simulation in under 5 minutes.
              Free to start, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 w-full sm:w-auto" asChild>
                <Link href="/auth/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 sm:h-12 px-6 sm:px-8 w-full sm:w-auto" asChild>
                <Link href="/features">See All Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  Play,
  Star,
  Quote,
  Briefcase,
  Calculator,
  Eye,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Homepage
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <VisualizationSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}

/**
 * Hero Section
 */
function HeroSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-12">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 sm:mb-6 py-1.5 px-3 sm:px-4 text-xs sm:text-sm">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
            Monte Carlo Simulation Engine
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            See Your Financial Future
            <span className="block text-gradient">Before It Happens</span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Build portfolios, run thousands of Monte Carlo simulations, and visualize
            your wealth projections with interactive fan charts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 px-4 sm:px-0">
            <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
              <Link href="/sandbox">
                Try It for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
              asChild
            >
              <Link href="/features">
                <Play className="mr-2 h-4 w-4" />
                See Features
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              Free plan available
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              Up to 10,000 simulation paths
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 relative">
          <div className="absolute -inset-1 sm:-inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-2xl sm:blur-3xl opacity-50" />
          <div className="relative rounded-xl shadow-2xl overflow-hidden border border-border bg-background">
            <Image
              src="/images/product/hero-dashboard.png"
              alt="Simulix Dashboard showing fan chart projections"
              width={1920}
              height={1080}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Features Section
 */
function FeaturesSection() {
  const features = [
    {
      icon: Briefcase,
      title: "Portfolio Builder",
      description:
        "Create custom portfolios with intuitive weight sliders. Add any ticker, set allocations, and see your distribution in real-time.",
    },
    {
      icon: Calculator,
      title: "Monte Carlo Simulation",
      description:
        "Run up to 100,000 simulation paths to model thousands of possible market scenarios and see how your portfolio might perform.",
    },
    {
      icon: LineChart,
      title: "Fan Chart Projections",
      description:
        "Visualize P10, P50, and P90 percentile bands showing optimistic, expected, and conservative outcomes over your time horizon.",
    },
    {
      icon: Target,
      title: "Goal Analysis",
      description:
        "Set a target amount with inflation rate, and see if your strategy can achieve it. Get real-time suggestions as you plan.",
    },
    {
      icon: Sparkles,
      title: "Smart Suggestions",
      description:
        "Get instant suggestions while filling your form — required SIP, initial amount, or projected shortfall — plus detailed recommendations after simulation.",
    },
    {
      icon: Eye,
      title: "Allocation Snapshots",
      description:
        "Every simulation captures your exact portfolio allocation at that moment, so you can always see what was actually simulated.",
    },
  ];

  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            Features
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Everything you need to plan your financial future
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Professional Monte Carlo simulation tools, designed for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 hover:border-primary/50 transition-colors group"
            >
              <CardContent className="pt-5 sm:pt-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * How It Works Section
 */
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Build Your Portfolio",
      description:
        "Add tickers to your portfolio and set weight allocations. Use the slider or enter exact percentages — weights must total 100%.",
    },
    {
      step: "02",
      title: "Configure & Simulate",
      description:
        "Set your target amount, initial investment, monthly SIP, time horizon, and inflation rate. Get instant suggestions as you type.",
    },
    {
      step: "03",
      title: "Analyze Results",
      description:
        "View your fan chart with P10/P50/P90 projections. Set a target goal to see your success probability and get recommendations.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            How It Works
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            From portfolio to projection in minutes
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Three simple steps to visualize your financial future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}
              <div className="relative bg-card border border-border rounded-xl p-5 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground text-lg sm:text-xl font-bold flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Visualization Section
 */
function VisualizationSection() {
  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-3 sm:mb-4">
              Visualization
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Understand your range of outcomes
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6">
              Our interactive fan chart shows you the full distribution of possible futures.
              See the optimistic (P90), expected (P50), and conservative (P10) projections
              for your portfolio over time.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">P90 — Best Case</p>
                  <p className="text-sm text-muted-foreground">Top 10% of simulation outcomes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">P50 — Median Outcome</p>
                  <p className="text-sm text-muted-foreground">The most likely scenario</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <LineChart className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">P10 — Conservative</p>
                  <p className="text-sm text-muted-foreground">Bottom 10% — plan for this</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-blue-500/10 to-green-500/10 rounded-xl blur-2xl opacity-50" />
            <div className="relative rounded-xl shadow-lg overflow-hidden border border-border bg-card p-4">
              <Image
                src="/images/product/fan-chart-preview.png"
                alt="Fan chart showing P10, P50, P90 wealth projections"
                width={800}
                height={500}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Testimonials Section
 */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Finally, a tool that makes Monte Carlo simulations accessible. I can see exactly how my retirement portfolio might perform under different scenarios.",
      author: "Sarah M.",
      role: "Individual Investor",
      rating: 5,
    },
    {
      quote:
        "The fan chart visualization is incredibly intuitive. I love seeing the P10/P50/P90 bands — it really helps me understand my risk exposure.",
      author: "James K.",
      role: "Financial Planner",
      rating: 5,
    },
    {
      quote:
        "Being able to set a target goal and see my probability of success has completely changed how I plan my investments.",
      author: "Maria L.",
      role: "Small Business Owner",
      rating: 5,
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            Testimonials
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            What our users say
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            See how Simulix is helping people plan their financial futures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author} className="border-border/50">
              <CardContent className="pt-5 sm:pt-6">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>

                <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary/20 mb-2" />
                <p className="text-sm sm:text-base text-foreground mb-5 sm:mb-6">{testimonial.quote}</p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Section
 */
function CTASection() {
  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-6 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />

          <div className="relative text-center">
            <Target className="h-10 w-10 sm:h-12 sm:w-12 text-white/80 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to see your financial future?
            </h2>
            <p className="text-sm sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto">
              Create your first portfolio and run a Monte Carlo simulation in minutes.
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
                asChild
              >
                <Link href="/sandbox">
                  Try It Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

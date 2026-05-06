"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";

/**
 * Footer Links Configuration
 */
const footerLinks = {
  product: {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
    ],
  },
};

/**
 * Social Links
 */
const socialLinks = [
  { href: "https://twitter.com/simulix", icon: Twitter, label: "Twitter" },
  { href: "https://github.com/simulix", icon: Github, label: "GitHub" },
  { href: "https://linkedin.com/company/simulix", icon: Linkedin, label: "LinkedIn" },
  { href: "mailto:hello@simulix.io", icon: Mail, label: "Email" },
];

/**
 * Footer Component
 *
 * Features:
 * - Multi-column link sections
 * - Social media links
 * - Newsletter signup (optional)
 * - Copyright & legal links
 *
 * Matches Stitch UI: Simulix Footer
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Logo size="sm" />
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground max-w-xs">
              Enterprise-grade Monte Carlo simulation platform for portfolio
              analysis and risk management.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-4 sm:mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1 touch-manipulation"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {currentYear} Simulix. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

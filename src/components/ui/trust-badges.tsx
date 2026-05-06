import { Shield, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  className?: string;
}

/**
 * Trust Badges Component
 *
 * Displays security certifications matching Stitch UI.
 * Used in: Auth Portal, Footer, Pricing page
 */
export function TrustBadges({ className }: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground",
        className
      )}
    >
      {/* SOC2 Removed as per request */}

    </div>
  );
}

interface TrustBadgeItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

function TrustBadge({ icon: Icon, label, description }: TrustBadgeItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}

/**
 * Inline Trust Badge (single line)
 */
export function TrustBadgeInline({ className }: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >

    </div>
  );
}

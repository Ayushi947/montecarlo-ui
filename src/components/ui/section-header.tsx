import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Right-side action (button, link, etc.) */
  action?: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

/**
 * Section Header Component
 *
 * Consistent section headers across pages.
 * Matches Stitch UI style for dashboard sections.
 */
export function SectionHeader({
  title,
  description,
  action,
  size = "md",
  className,
}: SectionHeaderProps) {
  const sizes = {
    sm: {
      title: "text-base font-semibold",
      description: "text-xs",
    },
    md: {
      title: "text-lg font-semibold",
      description: "text-sm",
    },
    lg: {
      title: "text-xl font-bold",
      description: "text-base",
    },
  };

  const { title: titleClass, description: descClass } = sizes[size];

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        <h2 className={cn(titleClass, "text-foreground")}>{title}</h2>
        {description && (
          <p className={cn(descClass, "text-muted-foreground")}>{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Page Header Component
 *
 * Used at the top of pages with breadcrumbs support.
 */
interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description */
  description?: string;
  /** Right-side actions */
  actions?: React.ReactNode;
  /** Breadcrumb trail */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Additional className */
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Card Header (for dashboard widgets)
 */
interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function WidgetHeader({
  title,
  description,
  icon,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 pb-4 border-b border-border",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0 text-primary">{icon}</div>
        )}
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

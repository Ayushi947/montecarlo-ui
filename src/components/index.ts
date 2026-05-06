/**
 * Simulix Component Exports
 *
 * Central export file for all shared components.
 */

// Theme
export { ThemeToggle, ThemeToggleGroup, ThemeToggleCards } from "./theme-toggle";

// Branding
export { Logo, LogoIcon, LogoAnimated } from "./logo";

// Layout
export { Navbar } from "./navbar";
export { Footer } from "./footer";

// UI Components (shadcn/ui)
export { Button, buttonVariants } from "./ui/button";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./ui/card";
export { Input } from "./ui/input";
export { Label } from "./ui/label";
export { Badge, badgeVariants } from "./ui/badge";
export { Separator } from "./ui/separator";
export { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "./ui/dropdown-menu";
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./ui/sheet";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";
export { Toaster } from "./ui/sonner";
export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, useFormField } from "./ui/form";
export { Progress } from "./ui/progress";

// Custom UI Components
export { TrustBadges, TrustBadgeInline } from "./ui/trust-badges";

export { Spinner, PageLoader, SectionLoader, ButtonLoader, InlineLoader } from "./ui/spinner";
export { StatusIndicator, StatusDot, GoalStatusIndicator, SimulationStatusIndicator } from "./ui/status-indicator";
export { SectionHeader, PageHeader, WidgetHeader } from "./ui/section-header";

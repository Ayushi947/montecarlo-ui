import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/**
 * Public Pages Layout
 *
 * Shared layout for all public-facing pages:
 * - Homepage
 * - About Us
 * - Features
 * - Pricing
 * - Contact
 *
 * Includes:
 * - Sticky navbar with navigation
 * - Footer with links
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

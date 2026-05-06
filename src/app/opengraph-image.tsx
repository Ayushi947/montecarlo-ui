import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Simulix - Institutional-Grade Monte Carlo Projections";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph Image
 *
 * Generated at build/request time using Next.js ImageResponse.
 * Shows the Simulix brand, tagline, and key stats on a dark gradient.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo Mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: "#2563EB",
            marginBottom: 32,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 18C3 18 6 18 8 16C10 14 11 6 11 6C11 6 12 14 14 16C16 18 19 18 19 18"
              stroke="white"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M5 20L17 4"
              stroke="white"
              strokeLinecap="round"
              strokeWidth="2"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#F8FAFC",
            letterSpacing: "-0.025em",
            marginBottom: 12,
          }}
        >
          Simulix
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#94A3B8",
            marginBottom: 48,
          }}
        >
          Institutional-Grade Monte Carlo Projections
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            gap: 64,
          }}
        >
          {[
            { value: "10K+", label: "Simulations/sec" },
            { value: "64-bit", label: "Precision" },

          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#3B82F6",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: "#64748B" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

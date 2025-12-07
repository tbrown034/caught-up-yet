import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Caught Up Yet? - Watch Games Together, But No Spoilers";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            borderRadius: "48px",
            padding: "20px",
            marginBottom: "40px",
          }}
        >
          <svg
            width="160"
            height="160"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 340 140 A 140 140 0 1 0 340 372"
              stroke="white"
              strokeWidth="48"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 300 280 L 340 320 L 400 240"
              stroke="white"
              strokeWidth="40"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Caught Up Yet?
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
          }}
        >
          Watch Games Together, But No Spoilers
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

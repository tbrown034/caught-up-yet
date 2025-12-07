import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          borderRadius: "6px",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized "C" progress arc */}
          <path
            d="M 340 140 A 140 140 0 1 0 340 372"
            stroke="white"
            strokeWidth="48"
            strokeLinecap="round"
            fill="none"
          />
          {/* Checkmark */}
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
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from "next/og";

export const alt = "GoComores — guide indépendant des îles Comores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(160deg,#082F49 0%,#0C4A6E 60%,#0A3C5C 100%)", color: "#fff" }}>
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#FDBA74", display: "flex" }}>Guide indépendant</div>
        <div style={{ fontSize: 120, fontWeight: 700, marginTop: 16, display: "flex" }}>
          Go<span style={{ color: "#FDBA74" }}>Comores</span>
        </div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#E0F2FE", display: "flex" }}>Les îles à visiter, de Ngazidja à Mwali</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "#EA580C", display: "flex" }} />
      </div>
    ),
    size,
  );
}

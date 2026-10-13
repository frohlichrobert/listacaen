import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "listacaen.ro - Coduri CAEN Rev. 3";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "#163028",
          color: "#fffdf8",
        }}
      >
        <div style={{ fontSize: 40, color: "#e7a07a" }}>CAEN Rev. 3</div>
        <div style={{ fontSize: 120, fontWeight: 700, marginTop: 10 }}>
          Coduri CAEN
        </div>
        <div style={{ fontSize: 40, marginTop: 24, opacity: 0.85 }}>
          Lista CAEN completa, cu cautare
        </div>
        <div style={{ fontSize: 34, marginTop: 70, color: "#e7a07a" }}>
          listacaen.ro
        </div>
      </div>
    ),
    size,
  );
}

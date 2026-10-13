import { ImageResponse } from "next/og";
import { caenNodes, getBySlug, levelLabel } from "@/lib/caen";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Cod CAEN Rev. 3 - listacaen.ro";

export function generateStaticParams() {
  return caenNodes.map((node) => ({ code: node.slug }));
}

const ascii = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "");

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: slug } = await params;
  const node = getBySlug(slug);
  const code = node?.code ?? "";
  const level = node ? ascii(levelLabel[node.level]) : "";

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
        <div style={{ fontSize: 40, color: "#e7a07a" }}>
          {`${level} - CAEN Rev. 3`}
        </div>
        <div style={{ fontSize: 200, fontWeight: 700, marginTop: 10 }}>
          {code}
        </div>
        <div style={{ fontSize: 34, marginTop: 50, color: "#e7a07a" }}>
          listacaen.ro
        </div>
      </div>
    ),
    size,
  );
}

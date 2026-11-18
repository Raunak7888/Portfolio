import { ImageResponse } from "next/og";

export const alt = "Raunak Yadav, Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 64,
                    background: "#0a0a0a",
                    color: "#fafafa",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#a1a1aa" }}>
                    Portfolio
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", fontSize: 120, fontWeight: 700, lineHeight: 1.05 }}>
                        Raunak Yadav<span style={{ color: "#7C3AED" }}>.</span>
                    </div>
                    <div style={{ display: "flex", fontSize: 48, marginTop: 16 }}>Full-Stack Developer</div>
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 32,
                        padding: "16px 28px",
                        border: "4px solid #fafafa",
                        boxShadow: "10px 10px 0 0 #7C3AED",
                        alignSelf: "flex-start",
                    }}
                >
                    Java · Spring Boot · React · TypeScript
                </div>
            </div>
        ),
        size,
    );
}

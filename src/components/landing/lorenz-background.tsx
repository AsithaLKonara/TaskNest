"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function LorenzBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme, systemTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // ALIGNMENT: Right side
            // Move center to 75% of width
            ctx.translate(width * 0.75, height * 0.55);

            // SCALE: "4x" -> 9 * 4 = 36
            ctx.scale(36, 36);

            // Clear
            ctx.fillStyle = isDark ? "black" : "white";
            ctx.fillRect(-width, -height, width * 2, height * 2);
        };

        resize();
        window.addEventListener("resize", resize);

        const sigma = 10;
        const rho = 28;
        const beta = 8 / 3;
        const dt = 0.005;

        let x = 1, y = 1, z = 1;
        let hue = 200;

        let animationId: number;
        let prevX = x, prevY = y;

        function step() {
            // Ghost trails
            ctx.fillStyle = isDark ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
            ctx.fillRect(-width, -height, width * 2, height * 2);

            // Gradient Stroke (Blue/Purple/Cyan)
            hue = (hue + 0.1) % 360;
            const dynamicHue = 200 + Math.abs(Math.sin(Date.now() * 0.0002) * 60);

            // LINE WIDTH: 0.1 - 0.3
            ctx.lineWidth = 0.2;

            const lightness = isDark ? "60%" : "40%";
            ctx.strokeStyle = `hsl(${dynamicHue}, 80%, ${lightness})`;

            ctx.globalAlpha = isDark ? 0.6 : 0.5;

            for (let i = 0; i < 7; i++) { // Increased steps slightly for speed with larger scale
                const dx = sigma * (y - x) * dt;
                const dy = (x * (rho - z) - y) * dt;
                const dz = (x * y - beta * z) * dt;

                x += dx;
                y += dy;
                z += dz;

                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.stroke();

                prevX = x;
                prevY = y;
            }

            animationId = requestAnimationFrame(step);
        }

        step();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
        };
    }, [theme, systemTheme]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: -1,
                filter: "blur(0.5px)",
                opacity: 0.9,
                pointerEvents: "none"
            }}
        />
    );
}

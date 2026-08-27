import type { CSSProperties } from 'react';

/**
 * The moving layer on the home weather card.
 *
 * Sits between the green gradient and the readings and shows what the sky is
 * actually doing: cloud drifting across an overcast day, rain raking down,
 * snow turning over as it falls, a storm flashing twice and going quiet.
 *
 * Three rules it follows:
 *
 * 1. Deterministic. Every position, delay and duration comes from the literal
 *    tables below, never from Math.random(). Random values would differ
 *    between the server render and the client hydration, and React would throw
 *    a mismatch on a card that only exists to look nice.
 * 2. Transform and opacity only. Nothing animates width/top/left, so the
 *    browser composites the scene without re-laying-out the card.
 * 3. Cheap. At most fifteen elements, and the whole thing collapses to nothing
 *    under prefers-reduced-motion (handled in globals.css).
 */

type Scene = 'clear' | 'cloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

/**
 * WMO codes, in the same buckets `api/weather/forecast` maps to its icons —
 * keep this in step with `weatherMetaByCode` there.
 */
export function sceneForCode(code: number): Scene {
    if (code === 0) return 'clear';
    if (code === 1 || code === 2) return 'cloudy';
    if (code === 3) return 'overcast';
    if (code === 45 || code === 48) return 'fog';
    if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if ([95, 96, 99].includes(code)) return 'storm';
    return 'cloudy';
}

/** [top %, width px, height px, duration s, delay s, opacity] */
const CLOUDS: [number, number, number, number, number, number][] = [
    [8, 96, 30, 34, 0, 0.16],
    [34, 132, 38, 46, -14, 0.11],
    [62, 74, 24, 28, -22, 0.13],
];

/** [left %, duration s, delay s, height px, opacity] */
const DROPS: [number, number, number, number, number][] = [
    [6, 0.85, 0, 14, 0.45], [14, 1.05, -0.5, 11, 0.32], [23, 0.75, -0.2, 16, 0.5],
    [31, 0.95, -0.8, 12, 0.36], [40, 0.8, -0.35, 15, 0.46], [48, 1.1, -0.65, 10, 0.3],
    [57, 0.88, -0.15, 14, 0.44], [65, 0.98, -0.9, 12, 0.34], [73, 0.78, -0.45, 16, 0.48],
    [82, 1.02, -0.25, 11, 0.33], [90, 0.9, -0.7, 14, 0.42], [97, 0.82, -0.05, 13, 0.4],
];

/** [left %, duration s, delay s, size px, opacity] */
const FLAKES: [number, number, number, number, number][] = [
    [8, 6.5, 0, 5, 0.75], [19, 8, -2, 4, 0.6], [29, 7, -4, 6, 0.8],
    [41, 9, -1, 4, 0.55], [52, 6.8, -3.5, 5, 0.7], [63, 8.5, -5, 4, 0.6],
    [74, 7.2, -1.5, 6, 0.78], [86, 9.2, -4.5, 4, 0.58], [95, 7.6, -2.8, 5, 0.68],
];

function Clouds({ opacityScale = 1, speedScale = 1 }: { opacityScale?: number; speedScale?: number }) {
    return (
        <>
            {CLOUDS.map(([top, w, h, dur, delay, op], i) => (
                <div
                    key={i}
                    className="absolute animate-wx-drift rounded-full bg-white blur-md"
                    style={{
                        top: `${top}%`,
                        width: w,
                        height: h,
                        opacity: op * opacityScale,
                        animationDuration: `${dur * speedScale}s`,
                        animationDelay: `${delay}s`,
                    } as CSSProperties}
                />
            ))}
        </>
    );
}

function Rain({
    drops,
    widthPx,
    speedScale = 1,
}: {
    drops: typeof DROPS;
    widthPx: number;
    speedScale?: number;
}) {
    return (
        <>
            {drops.map(([left, dur, delay, h, op], i) => (
                <div
                    key={i}
                    className="absolute top-0 animate-wx-fall rounded-full bg-white"
                    style={{
                        left: `${left}%`,
                        width: widthPx,
                        height: h,
                        opacity: op,
                        animationDuration: `${dur * speedScale}s`,
                        animationDelay: `${delay}s`,
                    } as CSSProperties}
                />
            ))}
        </>
    );
}

export default function WeatherScene({ code, isDay }: { code: number; isDay: boolean }) {
    const scene = sceneForCode(code);

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {scene === 'clear' && (
                <>
                    {/* Day gets a warm sun bloom, night a cooler one. */}
                    <div
                        className="absolute -top-8 -right-6 h-32 w-32 rounded-full blur-2xl animate-wx-glow"
                        style={{ background: isDay ? 'rgba(255,236,150,0.85)' : 'rgba(200,225,255,0.65)' }}
                    />
                    <Clouds opacityScale={0.35} speedScale={1.6} />
                </>
            )}

            {scene === 'cloudy' && <Clouds opacityScale={0.9} />}

            {scene === 'overcast' && (
                <>
                    <div className="absolute inset-0 bg-black/10" />
                    <Clouds opacityScale={1.35} speedScale={1.25} />
                </>
            )}

            {scene === 'fog' && (
                <>
                    {[18, 44, 70].map((top, i) => (
                        <div
                            key={i}
                            className="absolute -inset-x-8 animate-wx-haze rounded-full bg-white/20 blur-lg"
                            style={{
                                top: `${top}%`,
                                height: 22,
                                animationDuration: `${9 + i * 3}s`,
                                animationDelay: `${-i * 2}s`,
                            } as CSSProperties}
                        />
                    ))}
                </>
            )}

            {scene === 'drizzle' && (
                <>
                    <Clouds opacityScale={0.8} />
                    {/* Half the drops, thinner and slower than proper rain. */}
                    <Rain drops={DROPS.filter((_, i) => i % 2 === 0)} widthPx={1} speedScale={1.5} />
                </>
            )}

            {scene === 'rain' && (
                <>
                    <div className="absolute inset-0 bg-black/10" />
                    <Clouds opacityScale={1.1} speedScale={1.2} />
                    <Rain drops={DROPS} widthPx={2} />
                </>
            )}

            {scene === 'snow' && (
                <>
                    <Clouds opacityScale={0.8} speedScale={1.5} />
                    {FLAKES.map(([left, dur, delay, size, op], i) => (
                        <div
                            key={i}
                            className="absolute top-0 animate-wx-flake rounded-full bg-white"
                            style={{
                                left: `${left}%`,
                                width: size,
                                height: size,
                                opacity: op,
                                animationDuration: `${dur}s`,
                                animationDelay: `${delay}s`,
                            } as CSSProperties}
                        />
                    ))}
                </>
            )}

            {scene === 'storm' && (
                <>
                    <div className="absolute inset-0 bg-black/20" />
                    <Clouds opacityScale={1.2} speedScale={0.9} />
                    <Rain drops={DROPS} widthPx={2} speedScale={0.8} />
                    {/* A full-card white veil, not a drawn bolt — a bolt at this
                        size reads as a smudge. */}
                    <div className="absolute inset-0 bg-white animate-wx-flash" />
                </>
            )}
        </div>
    );
}

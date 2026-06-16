"use client";

import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- *
 *  Verana Council hero — the Council Ring.
 *
 *  A quiet, ceremonial governance motif (deliberately calmer than the
 *  Foundation's busy trust-graph): a tilted ring of 25 seats around a central
 *  core (the network they secure), each seat casting a vote line inward; a
 *  slow, periodic quorum tally sweeps the ring and flashes when a ⅔
 *  supermajority is reached.
 *
 *  Encodes the Council's facts:
 *    - 25 seats, capped, with a few left open ("an open seat is an invitation").
 *    - One member, one vote — the tally fills seat by seat.
 *    - ⅔ supermajority — the whole ring brightens when it crosses ⅔.
 *    - Sole securer — every seat casts its vote inward to the central core
 *      (a validator ring around the protocol).
 *
 *  Zero dependencies. Canvas 2D + a hand-rolled perspective projection
 *  (~4 kB). Austere palette: indigo primary + neutral, no purple/green, to
 *  match the simplified Council brand.
 *
 *  Theme-aware: the Council site is LIGHT-first (theme driven by
 *  `data-theme` on <html>, not Tailwind's `dark:`). On dark we use additive
 *  ("lighter") compositing for a soft glow; on light that washes to white,
 *  so we fall back to "source-over". A MutationObserver re-reads the theme
 *  live when the user toggles.
 *
 *  Honours prefers-reduced-motion (one static frame, no RAF loop, no
 *  listeners). The canvas is decorative (aria-hidden, pointer-events: none).
 * -------------------------------------------------------------------------- */

type Rgb = readonly [number, number, number];
type Vec3 = { x: number; y: number; z: number };

/* -------------------------------------------------------------------------- */
/*  Scene constants                                                           */
/* -------------------------------------------------------------------------- */

const SEAT_COUNT = 25; // the Council cap
const RING_RADIUS = 0.25; // world units (positions live in ~[-0.5, 0.5]); 30% smaller than the original 0.46
// The disk never tilts more than 30° from its flat "plane" position. It rocks
// gently in two axes; the per-axis amplitude is chosen so the *combined* tilt
// of the disk's plane stays within MAX_TILT (√2 × 0.7 ≈ 0.99 < 1).
const MAX_TILT = (15 * Math.PI) / 180; // 30°
const TILT_AMP = MAX_TILT * 0.7; // per-axis ≈ 21° → combined ≤ ~29.4°
const SPIN_SPEED = 0.02; // slow, continuous in-plane rotation of the disk

// The ring sits in the bottom-right of the hero (the copy sits top-left), so
// the projection is centred low and to the right rather than dead-centre.
const CENTER_X_RATIO = 0.72;
const CENTER_Y_RATIO = 0.57;

// Seats left open — spread around the ring so it reads as a diverse, mostly
// seated council with standing invitations rather than a half-empty room.
const OPEN_SEATS = new Set([2, 7, 13, 18, 22]);

// The Council carries protocol-governance motions on a ⅔ supermajority. When
// the winning side reaches this the result reads as "carried" with a brighter
// centre flash; a simple majority is softer.
const SUPERMAJORITY = 2 / 3;

/* ---- vote-session phases (real seconds). One session is:
   ballot → result(draw) → hold → reset → idle. The ambient drift uses the
   scaled clock below; the session runs on the raw real-time clock. --------- */
const T_BALLOT = 2.2; // seated dots reveal their yes/no choice
const T_DRAW = 1.8; // the winner's vote lines draw inward; the core fills
const T_HOLD = 2.8; // the result stands
const T_RESET = 1.8; // everything fades back to a neutral assembly
const T_IDLE = 1.4; // calm gap before the next session
const SESSION = T_BALLOT + T_DRAW + T_HOLD + T_RESET + T_IDLE;

// A curated sequence of "yes" shares so sessions vary: some motions carry by
// supermajority, some pass on a simple majority, some fail. Cycled in order.
const YES_SHARES = [0.8, 0.44, 0.92, 0.6, 0.36, 0.68, 0.52, 0.4];

/** Global speed dial for the ambient drift (not the vote cadence). */
const ANIMATION_SPEED = 0.4;

/* -------------------------------------------------------------------------- */
/*  Palette — resolved per theme each frame (cheap)                           */
/* -------------------------------------------------------------------------- */

const INDIGO_LIGHT: Rgb = [46, 42, 143]; // #2e2a8f — primary (neutral / at rest)
const INDIGO_DARK: Rgb = [138, 133, 255]; // #8a85ff
const BRIGHT_LIGHT: Rgb = [120, 110, 235]; // lightened tone for a "carried" flash
const BRIGHT_DARK: Rgb = [205, 200, 255];
const NEUTRAL_LIGHT: Rgb = [120, 120, 132]; // open-seat outline
const NEUTRAL_DARK: Rgb = [128, 128, 144];

// Functional vote signals (yes/no) — not brand colours, matching the site's
// green/amber/red-for-status convention.
const YES_LIGHT: Rgb = [5, 150, 105]; // green #059669
const YES_DARK: Rgb = [52, 211, 153]; // #34d399
const NO_LIGHT: Rgb = [220, 38, 38]; // red   #dc2626
const NO_DARK: Rgb = [248, 113, 113]; // #f87171

const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function HeroRing() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- theme awareness ----------------------------------------- */
    let isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (reduceMotion) render(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    /* ---------- mutable state ------------------------------------------- */
    let width = 0;
    let height = 0;
    let rafId = 0;
    const start = performance.now();

    /* ---------- seat positions — a flat ring ---------------------------- */
    // 25 seats evenly spaced around a circle (seat 0 at the top, clockwise),
    // tilted into a disk by the projection. Index order runs around the ring,
    // so the quorum tally sweeps seat by seat.
    const SEAT_POS: Vec3[] = [];
    for (let i = 0; i < SEAT_COUNT; i++) {
      const a = -Math.PI / 2 + (i / SEAT_COUNT) * Math.PI * 2;
      SEAT_POS.push({
        x: Math.cos(a) * RING_RADIUS,
        y: Math.sin(a) * RING_RADIUS,
        z: 0,
      });
    }

    /* ---------- sizing -------------------------------------------------- */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const scaleRef = () => Math.max(0.55, Math.min(width, height) / 900);
    const worldScale = () => Math.min(width, height) * 1.15;

    /* ---------- math helpers ------------------------------------------- */
    const rotate = (v: Vec3, yaw: number, pitch: number): Vec3 => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const x1 = v.x * cy + v.z * sy;
      const z1 = -v.x * sy + v.z * cy;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const y1 = v.y * cp - z1 * sp;
      const z2 = v.y * sp + z1 * cp;
      return { x: x1, y: y1, z: z2 };
    };

    const FOCAL = 1.25;
    const project = (v: Vec3) => {
      const k = FOCAL / (FOCAL + v.z);
      const ws = worldScale();
      return {
        x: width * CENTER_X_RATIO + v.x * ws * k,
        y: height * CENTER_Y_RATIO + v.y * ws * k,
        k,
        z: v.z,
      };
    };

    // Depth fog: nearer (z<0) ~1, farther (z>0) fades toward 0.4.
    const fog = (z: number) => Math.max(0.4, Math.min(1, (0.55 - z) / 1.0));

    // Deterministic per-(seat, session) pseudo-random in [0, 1).
    const hash = (i: number, s: number) => {
      const x = Math.sin((i + 1) * 12.9898 + (s + 1) * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    /* ---------- vote session ------------------------------------------- *
     * One looping governance vote. Among the seated members (the open seats
     * abstain) each casts yes/no for the session; the side with more votes
     * wins, its members draw lines inward, and the core takes its colour. A
     * ⅔ supermajority reads as "carried" with a brighter flash. Runs on the
     * raw real-time clock, independent of the ambient drift speed.
     * ------------------------------------------------------------------- */
    const sessionState = (elapsed: number) => {
      const idx = Math.floor(elapsed / SESSION);
      const t = elapsed - idx * SESSION;
      const yesShare = YES_SHARES[idx % YES_SHARES.length];

      const votes: ("yes" | "no" | "open")[] = [];
      let yes = 0;
      let no = 0;
      for (let i = 0; i < SEAT_COUNT; i++) {
        if (OPEN_SEATS.has(i)) {
          votes.push("open");
          continue;
        }
        const v = hash(i, idx) < yesShare ? "yes" : "no";
        votes.push(v);
        v === "yes" ? yes++ : no++;
      }
      const seated = yes + no;
      const winner = yes > no ? "yes" : no > yes ? "no" : "tie";
      const superMaj =
        winner !== "tie" && Math.max(yes, no) / seated >= SUPERMAJORITY;
      const margin = seated > 0 ? Math.abs(yes - no) / seated : 0;

      let reveal = 0; // dots show their yes/no colour
      let lineAmt = 0; // winner lines draw inward [0..1]
      let centerFill = 0; // core takes the winner colour [0..1]
      if (t < T_BALLOT) {
        reveal = t / T_BALLOT;
      } else if (t < T_BALLOT + T_DRAW) {
        const p = (t - T_BALLOT) / T_DRAW;
        reveal = 1;
        lineAmt = p;
        centerFill = p;
      } else if (t < T_BALLOT + T_DRAW + T_HOLD) {
        reveal = 1;
        lineAmt = 1;
        centerFill = 1;
      } else if (t < T_BALLOT + T_DRAW + T_HOLD + T_RESET) {
        const p = (t - T_BALLOT - T_DRAW - T_HOLD) / T_RESET;
        reveal = 1 - p;
        lineAmt = 1 - p;
        centerFill = 1 - p;
      }

      // "Carried" flash, centred on the moment the result lands.
      const boundary = T_BALLOT + T_DRAW;
      const flash = superMaj ? Math.max(0, 1 - Math.abs(t - boundary) / 0.6) : 0;

      return { votes, winner, margin, superMaj, reveal, lineAmt, centerFill, flash };
    };

    /* ---------- draw ---------------------------------------------------- */
    const render = (nowMs: number) => {
      const elapsed = (nowMs - start) / 1000;
      const timeSec = elapsed * ANIMATION_SPEED;

      // A slow, gentle rock in two axes that eases through the flat plane
      // position and never tilts more than 30° from it, plus a slow continuous
      // in-plane spin. The mouse and scroll deliberately do not affect this.
      const spin = timeSec * SPIN_SPEED;
      const yaw = TILT_AMP * Math.sin(timeSec * 0.35);
      const pitch = TILT_AMP * Math.sin(timeSec * 0.25 + 1.0);

      const indigo = isDark ? INDIGO_DARK : INDIGO_LIGHT;
      const bright = isDark ? BRIGHT_DARK : BRIGHT_LIGHT;
      const neutral = isDark ? NEUTRAL_DARK : NEUTRAL_LIGHT;
      const yesC = isDark ? YES_DARK : YES_LIGHT;
      const noC = isDark ? NO_DARK : NO_LIGHT;
      const ss = sessionState(elapsed);
      const winnerColour =
        ss.winner === "yes" ? yesC : ss.winner === "no" ? noC : indigo;

      ctx.clearRect(0, 0, width, height);

      // Project the central core and all seats once.
      const core = project(rotate({ x: 0, y: 0, z: 0 }, yaw, pitch));
      const seats = [];
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      for (let i = 0; i < SEAT_COUNT; i++) {
        const b = SEAT_POS[i];
        // Spin the ring in its own plane (about Z), then apply the tilt rock.
        const spun = { x: b.x * cs - b.y * sn, y: b.x * sn + b.y * cs, z: b.z };
        const r = rotate(spun, yaw, pitch);
        seats.push({ i, open: OPEN_SEATS.has(i), r, s: project(r) });
      }

      // 1) Vote lines — the winning party's members draw a line from their dot
      //    inward to the core. The number of lines = the winner's vote count,
      //    so the margin is visible; the line colour matches the winner.
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      if (ss.winner !== "tie" && ss.lineAmt > 0) {
        for (const seat of seats) {
          if (seat.open || ss.votes[seat.i] !== ss.winner) continue;
          const f = fog(seat.r.z);
          const tipX = seat.s.x + (core.x - seat.s.x) * ss.lineAmt;
          const tipY = seat.s.y + (core.y - seat.s.y) * ss.lineAmt;
          const a = (isDark ? 0.4 : 0.34) * f + ss.flash * 0.15;
          ctx.strokeStyle = rgba(winnerColour, a);
          ctx.lineWidth = 1.25 * scaleRef();
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(seat.s.x, seat.s.y);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
        }
      }

      // 2) Seats, painted back-to-front so depth reads. Each dot reveals its
      //    yes/no colour during the ballot; losers dim a touch at the result.
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      const ordered = [...seats].sort((a, b) => b.r.z - a.r.z);
      for (const seat of ordered) {
        drawSeat(seat, timeSec, ss, { indigo, neutral, yes: yesC, no: noC });
      }

      // 3) Central core — the network the Council secures. It takes on the
      //    winner's colour as the result lands.
      ctx.globalCompositeOperation = "source-over";
      drawCore(core, timeSec, ss, { indigo, bright, yes: yesC, no: noC });

      if (!reduceMotion) rafId = requestAnimationFrame(render);
    };

    const drawSeat = (
      seat: { i: number; open: boolean; r: Vec3; s: ReturnType<typeof project> },
      timeSec: number,
      ss: ReturnType<typeof sessionState>,
      colors: { indigo: Rgb; neutral: Rgb; yes: Rgb; no: Rgb },
    ) => {
      const { s, r: rot, open, i } = seat;
      const f = fog(rot.z);
      const k = Math.max(0.6, s.k);
      const radius = (open ? 4.2 : 5.4) * scaleRef() * k;

      if (open) {
        // Hollow outline — an open seat / standing invitation (abstains).
        ctx.strokeStyle = rgba(colors.neutral, 0.5 * f);
        ctx.lineWidth = 1.1 * scaleRef() * k;
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      const pulse = 0.85 + 0.15 * Math.sin(timeSec * 0.9 + i * 0.7);
      const vote = ss.votes[i]; // "yes" | "no"
      const voteColour = vote === "yes" ? colors.yes : colors.no;
      // Neutral indigo at rest → the vote colour as the ballot reveals.
      const col = mix(colors.indigo, voteColour, ss.reveal);

      // Winner emphasis once the result lands; losers dim slightly.
      const isWinner = ss.winner !== "tie" && vote === ss.winner;
      const settle = Math.max(ss.lineAmt, ss.centerFill); // 0 ballot → 1 result
      const dim = ss.winner !== "tie" && !isWinner ? 1 - 0.4 * settle : 1;
      const boost = isWinner ? 1 + 0.4 * settle : 1;

      const haloA = (isDark ? 0.3 : 0.22) * pulse * f * dim * boost;
      const halo = ctx.createRadialGradient(s.x, s.y, radius * 0.3, s.x, s.y, radius * 3);
      halo.addColorStop(0, rgba(col, haloA));
      halo.addColorStop(0.6, rgba(col, haloA * 0.22));
      halo.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgba(col, ((isDark ? 0.85 : 0.92) * f + ss.flash * 0.1) * dim);
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCore = (
      core: ReturnType<typeof project>,
      timeSec: number,
      ss: ReturnType<typeof sessionState>,
      colors: { indigo: Rgb; bright: Rgb; yes: Rgb; no: Rgb },
    ) => {
      const k = Math.max(0.6, core.k);
      const r = 9 * scaleRef() * k;
      const pulse = 0.8 + 0.2 * Math.sin(timeSec * 0.7);

      const winnerColour =
        ss.winner === "yes"
          ? colors.yes
          : ss.winner === "no"
            ? colors.no
            : colors.indigo;
      // Neutral indigo at rest → winner colour as the result lands; a carried
      // supermajority lightens it further with the flash.
      const filled = mix(colors.indigo, winnerColour, ss.centerFill);
      const colour = mix(filled, colors.bright, ss.flash * 0.6);

      const glow = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, r * 4);
      const a =
        (isDark ? 0.26 : 0.18) * pulse +
        ss.centerFill * 0.28 * (0.6 + 0.4 * ss.margin) +
        ss.flash * 0.3;
      glow.addColorStop(0, rgba(colour, a));
      glow.addColorStop(1, rgba(colour, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(core.x, core.y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      // A small open hexagon — the protocol core, secured by the ring.
      ctx.save();
      ctx.translate(core.x, core.y);
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const ang = (Math.PI / 3) * j - Math.PI / 6;
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(colour, 0.9);
      ctx.lineWidth = 1.6 * scaleRef() * k;
      ctx.stroke();
      ctx.restore();
    };

    /* ---------- wiring -------------------------------------------------- */
    resize();
    render(performance.now());

    const onResize = () => {
      resize();
      if (reduceMotion) render(performance.now());
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="hero-canvas absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

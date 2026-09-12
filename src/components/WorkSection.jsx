import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══ LANGUAGE COLOR MAP ═══ */
const LANG_COLORS = {
  Python: "#3572A5", JavaScript: "#f1e05a", Java: "#b07219",
  HTML: "#e34c26", TypeScript: "#3178c6", "Jupyter Notebook": "#DA5B0B",
  PyTorch: "#ee4c2c", TensorFlow: "#ff6f00", React: "#61dafb",
  "Node.js": "#339933", Docker: "#2496ed", FastAPI: "#009688",
  Kafka: "#231F20", OpenCV: "#5C3EE8", GSAP: "#88CE02",
  Streamlit: "#ff4b4b", PostgreSQL: "#336791", Redis: "#DC382D",
  NLP: "#00d4aa", "AI/ML": "#ff5f1f", AI: "#ff5f1f", CV: "#6c5ce7",
  GNNs: "#9b59b6", "Deep Learning": "#e74c3c", Transformers: "#f39c12",
  DistilBERT: "#2ecc71", "Whisper AI": "#1abc9c", MLOps: "#e67e22",
};

/* Multi-Lane vertical offsets — Upper, Mid, Lower zones for dynamic streaming */
const LANES = [
  { y: "-22vh" },
  { y:  "20vh" },
  { y: "-10vh" },
  { y:  "12vh" },
  { y: "-26vh" },
  { y:  "24vh" },
];

const COPIES   = 2;    // 2x tiling for project cards
const CARD_DUR = 2.8;  // Duration for card to cross viewport (slower)
const CARD_GAP = 0.9;  // Stagger between cards

/* ═══ MODAL via React Portal (outside GSAP DOM tree) ═══ */
function WorkModal({ project, onClose }) {
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    if (backdropRef.current && contentRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
      tl.fromTo(
        contentRef.current,
        { scale: 0.8, opacity: 0, rotateX: -15, y: 30 },
        { scale: 1, opacity: 1, rotateX: 0, y: 0, duration: 0.5, ease: "back.out(1.4)" },
        "-=0.1"
      );
    }
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  return createPortal(
    <div className="work-modal-backdrop" ref={backdropRef} onClick={onClose} style={{ opacity: 0 }}>
      <div className="work-modal-content" ref={contentRef} onClick={(e) => e.stopPropagation()}>
        <button className="work-modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        <div className="work-modal-header">
          <p className="work-modal-cat">
            {(project.stack || []).join(" / ").toUpperCase() || "ENGINEERING"}
          </p>
          <h3>{project.name}</h3>
        </div>
        <div className="work-modal-body">
          <p>{project.desc}</p>
          {project.metrics && project.metrics.length > 0 && (
            <div className="work-modal-metrics">
              {project.metrics.map((m) => (
                <span key={m} className="work-metric-chip">⚡ {m}</span>
              ))}
            </div>
          )}
          <div className="work-modal-stack">
            {(project.stack || []).map((s) => (
              <span key={s} className="work-stack-pill">
                {LANG_COLORS[s] && <span className="work-lang-dot" style={{ background: LANG_COLORS[s] }} />}
                {s}
              </span>
            ))}
          </div>
          {project.links && project.links.length > 0 && (
            <div className="work-modal-links">
              {project.links.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-modal-link"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function WorkSection({ data = [] }) {
  const triggerRef  = useRef(null);
  const pillMaskRef = useRef(null);
  const badgeRef    = useRef(null);
  const bgGridRef   = useRef(null);
  const cardRefs    = useRef([]);
  const [activeModal, setActiveModal] = useState(null);

  /* Filter projects */
  const candidates = data.filter((p) => p.name && p.desc);
  const featured   = candidates.filter((p) => p.featured);
  const base       = featured.length >= 2 ? featured : candidates;

  /* Tile 2x for a crisp stream */
  const allCards = Array.from({ length: COPIES }, (_, ci) =>
    base.map((p, pi) => {
      const globalIdx = ci * base.length + pi;
      return {
        ...p,
        _id: `${ci}-${pi}`,
        displayIndex: (pi % base.length) + 1,
        totalCount: base.length,
        lane: LANES[globalIdx % LANES.length],
      };
    })
  ).flat();

  useGSAP(() => {
    const trigger = triggerRef.current;
    const pill    = pillMaskRef.current;
    const badge   = badgeRef.current;
    const grid    = bgGridRef.current;
    if (!trigger || !pill || !badge || !grid) return;

    const totalCards = allCards.length;
    
    // Timeline relative units
    const P1_V_STRETCH = 1.0; // Phase 1a: Pill vertical stretch
    const P1_H_EXPLODE = 1.2; // Phase 1b: Pill horizontal explosion
    const P1_TOTAL     = P1_V_STRETCH + P1_H_EXPLODE;

    const STREAM_DUR   = (totalCards - 1) * CARD_GAP + CARD_DUR;
    const P2_START     = P1_TOTAL;
    const P3_START     = P2_START + STREAM_DUR + 0.4;
    const P3_TOTAL     = 1.0;
    const TOTAL_UNITS  = P3_START + P3_TOTAL;

    // Scroll budget (increased to slow down scroll speed)
    const SCROLL_PX    = Math.max(6000, TOTAL_UNITS * 650);

    // Lock pill to exact center of viewport
    gsap.set(pill, {
      top: "50%",
      left: "50%",
      xPercent: -50,
      yPercent: -50,
      transformOrigin: "50% 50%",
    });

    /* Initial flat setup for letter rows */
    const rows = grid.querySelectorAll(".work-letter-row");
    
    // Set grid initial state
    gsap.set(grid, { perspective: 800 });


    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: "top top",
        end: `+=${SCROLL_PX}`,
        pin: true,
        scrub: 1.2, // Silky smooth inertia on scroll
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    /* ────────────────────────────────────────────────
       PHASE 1A: Pill stretches vertically from DEAD CENTER
    ──────────────────────────────────────────────── */
    tl.fromTo(
      pill,
      {
        width: "190px",
        height: "420px",
        borderRadius: "999px",
        opacity: 1,
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
      },
      {
        width: "190px",
        height: "92vh",
        borderRadius: "999px",
        opacity: 1,
        duration: P1_V_STRETCH,
        ease: "power2.inOut",
      },
      0
    );

    /* ────────────────────────────────────────────────
       PHASE 1B: Pill explodes horizontally outward from DEAD CENTER
    ──────────────────────────────────────────────── */
    tl.to(
      pill,
      {
        width: "102vw",
        height: "102vh",
        borderRadius: "0px",
        opacity: 0,
        duration: P1_H_EXPLODE,
        ease: "expo.inOut",
      },
      P1_V_STRETCH
    );

    /* Capsule badge letters scale up & blur out from center */
    tl.fromTo(
      badge,
      { opacity: 1, scale: 1, filter: "blur(0px)" },
      { opacity: 0, scale: 2.8, filter: "blur(20px)", duration: P1_TOTAL, ease: "power2.out" },
      0
    );

    /* Background Kinetic Grid fades in smoothly as pill explodes */
    tl.fromTo(
      grid,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: P1_H_EXPLODE, ease: "power2.out" },
      P1_V_STRETCH
    );

    /* Overall pan motion for the main typography grid */
    tl.to(
      grid,
      {
        scale: 1.05,
        ease: "none",
        duration: TOTAL_UNITS,
      },
      0
    );

    /* Text Depth Extrusion & Marquee Pan for each letter row */
    rows.forEach((row, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const proxy = { depth: 0 };
      const shadowColor = i === 1 || i === 3 ? "#3c3080" : "#a32b00"; // Darker accent colors for extrusion depth

      // Depth Extrusion
      tl.to(proxy, {
        depth: 70, // 70px deep solid extrusion
        ease: "power2.out",
        duration: P1_TOTAL,
        onUpdate: () => {
          let shadow = "";
          const d = Math.floor(proxy.depth);
          for (let j = 1; j <= d; j++) {
            shadow += `${j}px ${j}px 0px ${shadowColor}${j === d ? "" : ", "}`;
          }
          row.style.textShadow = shadow || "none";
        }
      }, P1_V_STRETCH * 0.4);

      // Horizontal Marquee Pan
      tl.to(
        row,
        {
          x: `${-dir * 25}vw`,
          ease: "none",
          duration: TOTAL_UNITS,
        },
        0
      );
    });

    /* ────────────────────────────────────────────────
       PHASE 2: Multi-Lane Right → Left Continuous Stream
    ──────────────────────────────────────────────── */
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      
      // Set initial position offscreen right
      gsap.set(card, { x: "115vw" });
      
      const start = P2_START + i * CARD_GAP;

      // Glide horizontally straight from Right to Left (offscreen)
      tl.to(
        card,
        { x: "-125vw", ease: "none", duration: CARD_DUR },
        start
      );
    });

    /* ────────────────────────────────────────────────
       PHASE 3: Clean Exit Transition
    ──────────────────────────────────────────────── */
    tl.to(grid, { opacity: 0, scale: 0.6, duration: 0.6, ease: "power2.in" }, P3_START);
    tl.to(
      pill,
      { width: "190px", height: "420px", borderRadius: "999px", opacity: 0, duration: 0.6, ease: "power3.in" },
      P3_START + 0.1
    );

  }, { scope: triggerRef });

  return (
    <section className="work-pinned-section" ref={triggerRef} id="work">
      {/* Background Matrix Mesh */}
      <div className="work-matrix-bg" />

      {/* Kinetic 3D W O R K Typography Spiral Grid */}
      <div className="work-kinetic-grid" ref={bgGridRef} aria-hidden="true">
        {["W", "O", "R", "K"].map((letter) => (
          <div key={letter} className={`work-letter-row row-${letter.toLowerCase()}`}>
            {Array(10)
              .fill(letter)
              .map((l, i) => (
                <span key={i}>{l}</span>
              ))}
          </div>
        ))}
      </div>

      {/* Multi-Lane Cards Stream (Upper / Mid / Lower lanes) */}
      <div className="work-cards-stream">
        {allCards.map((proj, i) => (
          <div
            key={proj._id}
            ref={(el) => (cardRefs.current[i] = el)}
            className="work-showcase-card"
            style={{
              top: `calc(50% + ${proj.lane.y})`,
            }}
            onClick={() => setActiveModal(proj)}
          >
            <div className="work-card-bar">
              <span className="work-card-tag">
                #{String(proj.displayIndex).padStart(2, "0")} / {String(proj.totalCount).padStart(2, "0")}
              </span>
              <span className="work-card-year">{proj.status || "2026"}</span>
            </div>

            <h4 className="work-card-title">{proj.name}</h4>

            {proj.desc && (
              <p className="work-card-desc">
                {proj.desc.length > 130 ? proj.desc.slice(0, 130) + "…" : proj.desc}
              </p>
            )}

            <div className="work-card-footer">
              <div className="work-card-stack">
                {(proj.stack || []).slice(0, 4).map((st) => (
                  <span key={st} className="work-stack-pill">
                    {LANG_COLORS[st] && (
                      <span className="work-lang-dot" style={{ background: LANG_COLORS[st] }} />
                    )}
                    {st}
                  </span>
                ))}
              </div>
              <div className="work-click-prompt">EXPLORE ↗</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3D Depth Pill Mask & Capsule Badge */}
      <div className="work-pill-mask" ref={pillMaskRef}>
        <div className="work-pill-dot-overlay" />
        <div className="work-capsule-badge" ref={badgeRef}>
          <span>W</span>
          <span>O</span>
          <span>R</span>
          <span>K</span>
        </div>
      </div>

      {/* Corner Section Label */}
      <div className="work-section-label">
        <span>02 — Selected Work</span>
      </div>

      {/* Render Portal Modal */}
      <WorkModal project={activeModal} onClose={() => setActiveModal(null)} />
    </section>
  );
}

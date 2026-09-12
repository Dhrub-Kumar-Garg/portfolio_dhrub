import CRTTerminal from './components/CRTTerminal';
import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import portfolioData from '../data/portfolio.json';
import DinoGame from './components/DinoGame';
import ShootingStars from './components/ShootingStars';
import WorkSection from './components/WorkSection';
import './index.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });
// ScrollTrigger.normalizeScroll(true); // Removed to prevent conflict with Lenis and scroll jumping

const SKILLS = [
  'C++', '◆', 'Python', '◆', 'JavaScript', '◆', 'Java', '◆',
  'React', '◆', 'Next.js', '◆', 'Node.js', '◆', 'Tailwind CSS', '◆',
  'HTML', '◆', 'CSS', '◆', 'MySQL', '◆', 'PostgreSQL', '◆',
  'Oracle SQL', '◆', 'Firebase', '◆', 'SQLite', '◆', 'AWS', '◆',
  'Docker', '◆', 'Git', '◆', 'GitHub', '◆', 'Postman', '◆',
  'OAuth', '◆', 'WCAG 2.1 AA', '◆', 'WAI-ARIA', '◆',
  'Computer Networks', '◆', 'Multithreading', '◆', 'Embedded C', '◆',
  'IoT', '◆'
];

import imgTransformer from './assets/images/transformer_pixel.png';
import imgNads from './assets/images/nads_pixel.png';
import imgFlowbert from './assets/images/flowbert_pixel.png';

const PROJECT_IMAGES = {
  'Transformer From Scratch': imgTransformer,
  'NADS — Anomaly Detection': imgNads,
  'FlowBERT': imgFlowbert,
};

const ASCII_ART = [
  ' ██████╗ ██╗  ██╗██████╗ ██╗   ██╗██████╗ ',
  ' ██╔══██╗██║  ██║██╔══██╗██║   ██║██╔══██╗',
  ' ██║  ██║███████║██████╔╝██║   ██║██████╔╝',
  ' ██║  ██║██╔══██║██╔══██╗██║   ██║██╔══██╗',
  ' ██████╔╝██║  ██║██████╔╝╚██████╔╝██████╔╝',
  ' ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝ ',
];

/* ═══ SPLIT WORD REVEAL HELPER ═══ */
const SplitWordReveal = ({ text, className = '' }) => {
  // Handles mixed content like raw strings and simple JSX elements (if passed as array)
  // For simplicity, we just split a plain string here
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', verticalAlign: 'bottom' }}>
      {text.split(' ').map((word, i) => (
        <span key={i} style={{ display: 'inline-flex', overflow: 'hidden', paddingRight: '0.25em', paddingBottom: '0.1em', verticalAlign: 'bottom', marginBottom: '-0.1em' }}>
          <span className={className} style={{ display: 'inline-block', transform: 'translateY(120%)' }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

/* ═══ SECTION TRANSITION WRAPPER ═══ */
const SectionTransition = ({ children, zIndex, glass = false }) => {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(el,
      { opacity: 0.85 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top 25%',
          scrub: 0.4,
        }
      }
    );
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex, width: '100%' }}>
      <div className="section-inner-content">
        {children}
      </div>
    </div>
  );
};

/* ═══ KINETIC SECTION INTERSTITIAL (5 ULTRA-HEAVY WOW MODES) ═══ */
function SectionInterstitial({ tag, title, sub, diag, mode = 'scramble' }) {
  const ref = useRef(null);
  const [displayText, setDisplayText] = useState(title);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const titleEl = el.querySelector('.interstitial-title');
    const tagEl = el.querySelector('.interstitial-tag');
    const subEl = el.querySelector('.interstitial-sub');
    const chars = el.querySelectorAll('.interstitial-title .char');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: 0.8
      }
    });

    if (mode === 'scramble') {
      // MODE 1: Kinetic Blur Materialize & Dissolve
      tl.fromTo(titleEl,
        { scale: 0.3, opacity: 0, letterSpacing: '0.4em', filter: 'blur(30px)' },
        { scale: 1, opacity: 1, letterSpacing: '-0.05em', filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' },
        0
      );
      tl.to(titleEl, {
        scale: 1.8, opacity: 0, filter: 'blur(25px)', letterSpacing: '0.15em', duration: 0.35, ease: 'power2.in'
      }, 0.65);
    }
    else if (mode === 'slice') {
      // MODE 2: 3D Character Flip & Explosive Scatter
      if (chars.length) {
        tl.fromTo(chars,
          { rotateY: 180, rotateX: -90, opacity: 0, scale: 0.2 },
          { rotateY: 0, rotateX: 0, opacity: 1, scale: 1, stagger: 0.06, duration: 0.35, ease: 'back.out(2.5)' },
          0
        );
        chars.forEach((c, idx) => {
          const xDir = idx % 2 === 0 ? -200 : 200;
          const yDir = idx % 3 === 0 ? -100 : 100;
          tl.to(c, { xPercent: xDir, yPercent: yDir, opacity: 0, rotateZ: 45, duration: 0.35, ease: 'power3.in' }, 0.65);
        });
      }
    }
    else if (mode === 'curtain') {
      // MODE 3: High-Contrast Solid Shutter Inversion (Double-door camera shutter)
      tl.fromTo(el,
        { clipPath: 'inset(0 50% 0 50%)', opacity: 1 },
        { clipPath: 'inset(0 0% 0 0%)', opacity: 1, duration: 0.35, ease: 'power3.out' },
        0
      );
      tl.to(el, {
        clipPath: 'inset(0 50% 0 50%)', opacity: 0, duration: 0.35, ease: 'power3.in'
      }, 0.65);
    }
    else if (mode === 'tunnel') {
      // MODE 4: 3D Warp Drive Perspective Zoom (Passes Through Camera)
      tl.fromTo(titleEl,
        { scale: 3.5, opacity: 0, y: 150 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' },
        0
      );
      tl.to(titleEl, {
        scale: 4.5, opacity: 0, duration: 0.35, ease: 'expo.in'
      }, 0.65);
    }
    else if (mode === 'matrix') {
      // MODE 5: Crisp Odometer Roll & Disintegration (NO NEON GLOW!)
      tl.fromTo(titleEl,
        { opacity: 0, letterSpacing: '0.6em', filter: 'blur(15px)' },
        { opacity: 1, letterSpacing: '-0.05em', filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' },
        0
      );
      tl.to(titleEl, {
        letterSpacing: '1.4em', opacity: 0, filter: 'blur(20px)', duration: 0.35, ease: 'power3.in'
      }, 0.65);
    }

    // Shared Tag & Sub animations
    tl.fromTo([tagEl, subEl],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
      0.1
    );
    tl.to([tagEl, subEl], {
      y: -30, opacity: 0, duration: 0.35, ease: 'power3.in'
    }, 0.65);

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.revert();
      tl.revert();
      tl.kill();
    };
  }, [mode, title]);

  // Hacker Scramble Effect (for scramble & matrix mode)
  useEffect(() => {
    if (mode !== 'scramble' && mode !== 'matrix') return;
    let interval;
    const chars = mode === 'matrix' ? '010101010189347209' : '!@#$%^&*()_+-=[]{}|;:,.<>?/';
    const original = title;
    let iteration = 0;

    const handleScramble = () => {
      clearInterval(interval);
      iteration = 0;
      interval = setInterval(() => {
        setDisplayText(
          original
            .split('')
            .map((char, index) => {
              if (index < iteration) return original[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iteration >= original.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3;
      }, 30);
    };

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 60%',
      onEnter: handleScramble,
      onEnterBack: handleScramble
    });

    return () => {
      clearInterval(interval);
      trigger.kill();
    };
  }, [mode, title]);

  return (
    <div className={`interstitial-sect mode-${mode}`} ref={ref}>
      <div className="interstitial-diag">{diag || 'LATENCY: 0.2ms // SECURE'}</div>
      <div className="interstitial-tag">{tag}</div>
      <h2 className={(mode === 'curtain' || mode === 'slice') ? 'interstitial-title' : 'interstitial-title gradient-text-1'}>
        {mode === 'slice' ? (
          title.split('').map((char, i) => (
            <span key={i} className="char gradient-text-1">{char}</span>
          ))
        ) : (
          displayText
        )}
      </h2>
      {sub && <p className="interstitial-sub">{sub}</p>}
    </div>
  );
}

/* ═══ PRELOADER ═══ */
function Preloader({ onDone }) {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    const chars = el.querySelectorAll('.preloader-text span');
    const sub = el.querySelector('.preloader-sub span');
    const fill = el.querySelector('.preloader-fill');

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(el, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          onComplete: () => { el.classList.add('done'); onDone(); },
        });
      },
    });

    tl.to(chars, { y: '0%', duration: 0.7, stagger: 0.035, ease: 'power3.out', delay: 0.4 });
    tl.to(sub, { y: '0%', duration: 0.5, ease: 'power3.out' }, '-=0.2');
    tl.to(fill, { width: '100%', duration: 1.2, ease: 'power2.inOut' }, '-=0.3');
    tl.to({}, { duration: 0.3 });
  }, { scope: ref });

  return (
    <div className="preloader" ref={ref}>
      <div className="preloader-text">
        {'Dhrub Kumar Garg'.split('').map((c, i) => (
          <span key={i}>{c === ' ' ? '\u00A0' : c}</span>
        ))}
      </div>
      <div className="preloader-sub">
        <span>Full-Stack Developer &amp; Builder</span>
      </div>
      <div className="preloader-bar"><div className="preloader-fill" /></div>
    </div>
  );
}

/* ═══ CURSOR (HUD TARGETING RETICLE) ═══ */
function Cursor() {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Performant GSAP quick setters
    const xTo = gsap.quickTo(el, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.15, ease: "power2.out" });

    // Subtle continuous rotation for the targeting ring
    gsap.to(el.querySelector('.hud-cursor-ring'), {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "none"
    });

    const move = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    
    const over = (e) => {
      // Expand on interactive elements
      if (e.target.closest('a, button, .project-card, .magnetic, .meta-row, .tl-item, .pixel-cat, input, textarea')) {
        setExpanded(true);
      }
    };
    const out = () => setExpanded(false);

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  return (
    <div ref={ref} className={`hud-cursor ${expanded ? 'expand' : ''}`}>
      <div className="hud-cursor-crosshair x" />
      <div className="hud-cursor-crosshair y" />
      <div className="hud-cursor-ring">
        <div className="hud-tick tl" />
        <div className="hud-tick tr" />
        <div className="hud-tick bl" />
        <div className="hud-tick br" />
      </div>
      <div className="hud-cursor-dot" />
    </div>
  );
}

/* ═══ SCROLL PROGRESS ═══ */
function ScrollProgress() {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.to(ref.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.2
      }
    });
  }, []);
  return <div ref={ref} className="scroll-progress" />;
}

/* ═══ MAGNETIC ═══ */
const Magnetic = ({ children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

    const mouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.35);
      yTo(y * 0.35);
    };

    const mouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mousemove', mouseMove);
    el.addEventListener('mouseleave', mouseLeave);

    return () => {
      el.removeEventListener('mousemove', mouseMove);
      el.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  return React.cloneElement(children, { ref });
};

/* ═══ ANIMATED BACKGROUND ═══ */
function AnimatedBG() {
  const orbARef = useRef(null);
  const orbBRef = useRef(null);
  const orbCRef = useRef(null);
  const watermarkRef = useRef(null);
  const watermarkRef2 = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.body.scrollHeight;
      const ratio = y / h;

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (!isLight) {
        if (ratio < 0.2) {
          document.body.style.backgroundColor = '#030305';
        } else if (ratio < 0.5) {
          document.body.style.backgroundColor = '#050308';
        } else if (ratio < 0.8) {
          document.body.style.backgroundColor = '#020505';
        } else {
          document.body.style.backgroundColor = '#050202';
        }
      } else {
        document.body.style.backgroundColor = 'var(--bg)';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(() => {
    // Deep Parallax for Orbs
    gsap.to(orbARef.current, { y: '100vh', x: '50vw', scale: 2, ease: 'none', scrollTrigger: { scrub: 0.5 } });
    gsap.to(orbBRef.current, { y: '-80vh', x: '-40vw', scale: 1.5, ease: 'none', scrollTrigger: { scrub: 0.8 } });
    gsap.to(orbCRef.current, { y: '120vh', x: '20vw', rotation: 360, ease: 'none', scrollTrigger: { scrub: 1 } });

    // Deep Parallax for Watermarks
    gsap.to(watermarkRef.current, { x: '-50vw', ease: 'none', scrollTrigger: { scrub: true } });
    gsap.fromTo(watermarkRef2.current, { x: '-30vw' }, { x: '20vw', ease: 'none', scrollTrigger: { scrub: true } });
  }, []);

  return (
    <>
      <div className="gradient-bg">
        <div className="mesh-orb orb-a" ref={orbARef} />
        <div className="mesh-orb orb-b" ref={orbBRef} />
        <div className="mesh-orb orb-c" ref={orbCRef} />
      </div>
      <div className="grid-overlay" />
      <ShootingStars />
      <div className="name-watermark" ref={watermarkRef}>
        DHRUB KUMAR GARG &nbsp;&nbsp;&mdash;&nbsp;&nbsp; DHRUB KUMAR GARG &nbsp;&nbsp;&mdash;&nbsp;&nbsp; DHRUB KUMAR GARG
      </div>
      <div className="name-watermark w2" ref={watermarkRef2}>
        FULL-STACK DEV &nbsp;&nbsp;&mdash;&nbsp;&nbsp; SYSTEM DESIGN &nbsp;&nbsp;&mdash;&nbsp;&nbsp; OPEN SOURCE
      </div>
    </>
  );
}



const PixelAvatarSVG = ({ isLight }) => (
  <svg viewBox="0 0 16 16" style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}>
    <rect width="16" height="16" fill={isLight ? "#e2e8f0" : "#0a0a0c"} />

    {/* Head / Skin */}
    <rect x="4" y="3" width="8" height="8" fill={isLight ? "#ffcda2" : "#e2a88d"} />
    <rect x="3" y="5" width="10" height="5" fill={isLight ? "#ffcda2" : "#e2a88d"} />
    <rect x="4" y="10" width="8" height="1" fill={isLight ? "#e5b38a" : "#c48a70"} /> {/* Chin shadow */}

    {/* Hair */}
    <rect x="4" y="2" width="8" height="2" fill="#1c1c1c" />
    <rect x="3" y="3" width="10" height="1" fill="#1c1c1c" />
    <rect x="2" y="4" width="2" height="4" fill="#1c1c1c" />
    <rect x="12" y="4" width="2" height="4" fill="#1c1c1c" />
    <rect x="3" y="4" width="3" height="1" fill="#1c1c1c" />

    {/* Cyberpunk Visor/Glasses */}
    <rect x="3" y="6" width="10" height="2" fill="#0a0a0a" />
    <rect x="3" y="6" width="10" height="1" fill={isLight ? "#0a0a0a" : "var(--cyan)"} />
    <rect x="4" y="6" width="2" height="1" fill="#fff" /> {/* Glare */}
    <rect x="11" y="6" width="1" height="1" fill="#fff" />
    <rect x="2" y="6" width="1" height="1" fill="#0a0a0a" />
    <rect x="13" y="6" width="1" height="1" fill="#0a0a0a" />

    {/* Neck */}
    <rect x="6" y="11" width="4" height="2" fill={isLight ? "#e5b38a" : "#c48a70"} />

    {/* Tech Jacket */}
    <rect x="3" y="12" width="10" height="1" fill={isLight ? "#ffffff" : "#2d2d35"} />
    <rect x="2" y="13" width="12" height="3" fill={isLight ? "#ffffff" : "#2d2d35"} />
    <rect x="1" y="14" width="14" height="2" fill={isLight ? "#ffffff" : "#2d2d35"} />

    {/* Jacket collar and zipper glow */}
    <rect x="5" y="12" width="2" height="1" fill={isLight ? "#e2e8f0" : "#444"} />
    <rect x="9" y="12" width="2" height="1" fill={isLight ? "#e2e8f0" : "#444"} />
    <rect x="7" y="12" width="2" height="4" fill={isLight ? "#e2e8f0" : "var(--cyan)"} />
    <rect x="7" y="13" width="1" height="3" fill={isLight ? "#cbd5e1" : "#fff"} />
  </svg>
);


/* ═══ LANYARD ID CARD (HERO RIGHT) ═══ */
function LanyardCard({ loaded, themeMode }) {
  const isLight = themeMode === 'light';
  const dropRef = useRef(null);
  const swingRef = useRef(null);
  const stringRef = useRef(null);
  const dragData = useRef({ isDragging: false });

  // 1. Smooth GSAP Drop Animation
  useEffect(() => {
    if (!loaded || !dropRef.current) return;
    // initial smooth drop from ceiling
    gsap.fromTo(dropRef.current,
      { y: -1500 },
      { y: 0, duration: 2.2, ease: "elastic.out(1, 0.4)", delay: 0.1 }
    );
  }, [loaded]);

  // 2. Interactive Physics Engine
  useEffect(() => {
    if (!loaded) return;

    // Physics Configuration
    const L = 220; // Longer rest length for the string
    const k = 0.025; // Spring constant (lower = softer/slower bounce)
    const damping = 0.95; // Air resistance
    const gravity = 1.0;
    const mass = 1;

    // Start in perfect equilibrium
    let x = 0;
    let y = 220;
    let vx = 0;
    let vy = 0;

    let animId;
    let lastTime = performance.now();
    const timeStep = 1000 / 60; // 60fps fixed time step

    const update = () => {
      const now = performance.now();
      let dt = now - lastTime;

      // Prevent physics explosion if tab was inactive
      if (dt > 100) dt = 16.66;

      // Fixed timestep loop for perfect consistency across all monitor refresh rates (60hz, 144hz, etc)
      while (dt >= timeStep) {
        if (!dragData.current.isDragging) {
          const currentL = Math.sqrt(x * x + y * y) || 1;

          // Hooke's Law: F = -k * x
          let stretch = currentL - L;

          // Clamp stretch to prevent physics explosion if pulled too far
          const MAX_STRETCH = 500;
          if (stretch > MAX_STRETCH) stretch = MAX_STRETCH;
          if (stretch < -MAX_STRETCH) stretch = -MAX_STRETCH;

          const F_spring = -k * stretch;

          // Break spring force into x and y vectors
          const Fx = F_spring * (x / currentL);
          const Fy = F_spring * (y / currentL);

          // F = ma -> a = F/m
          const ax = Fx / mass;
          const ay = (Fy + gravity) / mass;

          // Apply acceleration to velocity
          vx += ax;
          vy += ay;

          // Clamp velocity to prevent glitching out of frame bounds
          const MAX_V = 80;
          if (vx > MAX_V) vx = MAX_V;
          if (vx < -MAX_V) vx = -MAX_V;
          if (vy > MAX_V) vy = MAX_V;
          if (vy < -MAX_V) vy = -MAX_V;

          // Apply damping
          vx *= damping;
          vy *= damping;

          // Apply velocity to position
          x += vx;
          y += vy;
        }
        dt -= timeStep;
      }
      lastTime = now - dt; // save remainder

      // Calculate angle and stretch for DOM
      const currentL = Math.sqrt(x * x + y * y) || 1;
      const angle = -Math.atan2(x, y);

      if (swingRef.current) {
        swingRef.current.style.transform = `rotate(${angle}rad)`;
      }
      if (stringRef.current) {
        stringRef.current.style.height = `${currentL}px`;
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    // Realistic Drag & Release interaction
    const onMouseMove = (e) => {
      if (dragData.current.isDragging) {
        const pivot = document.getElementById('lanyard-pivot');
        if (!pivot) return;
        const rect = pivot.getBoundingClientRect();
        const pivotX = rect.left + rect.width / 2;
        const pivotY = rect.top;

        // Set physics coords based on mouse
        x = e.clientX - pivotX;
        y = Math.max(20, e.clientY - pivotY);

        vx = 0;
        vy = 0;
      }
    };
    const onMouseUp = () => { dragData.current.isDragging = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [loaded]);

  return (
    <div id="lanyard-pivot" className="lanyard-pivot" ref={dropRef} style={{ position: 'absolute', top: -50, right: '15%', width: 320, zIndex: 50, pointerEvents: 'none', transform: 'translateY(-1500px)' }}>
      <div
        ref={swingRef}
        style={{ width: '100%', transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >

        {/* The String */}
        <div ref={stringRef} style={{ width: 6, height: 220, background: isLight ? 'repeating-linear-gradient(45deg, #bbb, #bbb 10px, #ddd 10px, #ddd 20px)' : 'repeating-linear-gradient(45deg, #111, #111 10px, #222 10px, #222 20px)', boxShadow: isLight ? '2px 0 5px rgba(0,0,0,0.1)' : '4px 0 10px rgba(0,0,0,0.8)', minHeight: 40 }} />

        {/* The Clip Hardware */}
        <div style={{ width: 24, height: 16, border: isLight ? '2px solid #aaa' : '2px solid #666', borderRadius: '6px 6px 0 0', background: isLight ? 'linear-gradient(to right, #ccc, #eee, #ccc)' : 'linear-gradient(to right, #333, #555, #333)', marginTop: -2, zIndex: 2 }} />
        <div style={{ width: 14, height: 20, border: isLight ? '2px solid #bbb' : '2px solid #777', borderTop: 'none', background: isLight ? '#eee' : '#444', marginTop: 0, zIndex: 1 }} />
        <div style={{ width: 30, height: 8, background: isLight ? '#ddd' : '#222', borderRadius: 4, marginTop: -4, border: isLight ? '1px solid #aaa' : '1px solid #444', zIndex: 3 }} />

        {/* The ID Card */}
        <div
          className="id-card"
          onMouseDown={(e) => { dragData.current.isDragging = true; e.preventDefault(); }}
          style={{
            pointerEvents: 'auto',
            cursor: 'grab',
            width: 320, height: 500,
            background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(10, 10, 12, 0.65)',
            backdropFilter: 'blur(30px)',
            border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20, padding: 24,
            boxShadow: isLight ? '0 30px 60px rgba(0,0,0,0.15), inset 0 0 30px rgba(0,0,0,0.02)' : '0 50px 100px rgba(0,0,0,0.9), inset 0 0 30px rgba(0, 212, 170, 0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 8, position: 'relative', overflow: 'hidden'
          }}>
          {/* Holographic Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: isLight ? 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.6) 50%, transparent 60%)' : 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.1) 50%, transparent 60%)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: isLight ? '#000' : '#fff', fontFamily: 'var(--sans)', letterSpacing: '-0.03em', lineHeight: 1 }}>Innovators Quest</span>
              <span style={{ fontSize: 9, letterSpacing: 3, color: isLight ? 'var(--accent2)' : 'var(--cyan)', textTransform: 'uppercase', fontFamily: 'var(--mono)', marginTop: 4 }}>TECHNICAL CLUB</span>
            </div>

            {/* Microchip */}
            <div style={{ width: 40, height: 30, background: '#d4af37', borderRadius: 4, border: '1px solid #aa8822', display: 'flex', flexWrap: 'wrap', padding: 2, gap: 2, opacity: 0.9 }}>
              {Array(15).fill(0).map((_, i) => <div key={i} style={{ width: '15%', height: '25%', background: 'rgba(0,0,0,0.2)' }} />)}
            </div>
          </div>

          {/* Photo Section */}
          <div style={{ width: '100%', display: 'flex', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 140, height: 160, borderRadius: 8, overflow: 'hidden', border: isLight ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(255,255,255,0.1)', background: isLight ? '#e2e8f0' : '#000', position: 'relative' }}>
              <PixelAvatarSVG isLight={isLight} />
              {/* Scanline overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)', pointerEvents: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <div>
                <div style={{ fontSize: 9, color: isLight ? '#666' : '#666', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Position</div>
                <div style={{ fontSize: 13, color: isLight ? '#000' : '#fff', fontFamily: 'var(--mono)' }}>Core_Member</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: isLight ? '#666' : '#666', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Club</div>
                <div style={{ fontSize: 11, color: isLight ? 'var(--accent2)' : 'var(--cyan)', fontFamily: 'var(--mono)', fontWeight: 'bold' }}>Innovators_Quest</div>
              </div>
            </div>
          </div>

          {/* Main Info */}
          <h3 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 4px', color: isLight ? '#000' : '#fff', fontFamily: 'var(--sans)', letterSpacing: '-0.02em' }}>Dhrub Kumar Garg</h3>
          <p style={{ color: 'var(--dim)', fontSize: 14, margin: '0 0 20px', fontFamily: 'var(--mono)' }}>ID: <span style={{ color: isLight ? '#000' : '#fff' }}>0x7F4A_99B</span></p>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer Barcode */}
          <div style={{ width: '100%', borderTop: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ width: '70%', height: 40, display: 'flex', alignItems: 'center', opacity: 0.8 }}>
              {/* Complex Barcode */}
              <div style={{ width: '100%', height: '100%', backgroundImage: isLight ? 'repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 5px, #000 5px, #000 6px, transparent 6px, transparent 11px, #000 11px, #000 15px, transparent 15px, transparent 17px, #000 17px, #000 20px, transparent 20px, transparent 24px)' : 'repeating-linear-gradient(90deg, #fff 0, #fff 2px, transparent 2px, transparent 5px, #fff 5px, #fff 6px, transparent 6px, transparent 11px, #fff 11px, #fff 15px, transparent 15px, transparent 17px, #fff 17px, #fff 20px, transparent 20px, transparent 24px)' }} />
            </div>
            {/* Fake Signature */}
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)', transform: 'rotate(-5deg)' }}>D.Garg</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ HERO ═══ */
function Hero({ loaded, themeMode }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (!loaded || !ref.current) return;
    const el = ref.current;

    const tl = gsap.timeline({ delay: 0.1 });
    const nameEls = el.querySelectorAll('.hero-name');
    const taglineEl = el.querySelector('.hero-tagline');
    const descEl = el.querySelector('.hero-desc');
    const actionEls = el.querySelectorAll('.hero-actions > *');

    if (nameEls.length) {
      tl.to(nameEls, {
        y: '0%', duration: 1.4, stagger: 0.1, ease: 'expo.out',
      });
    }
    if (taglineEl) {
      tl.to(taglineEl, {
        y: '0%', duration: 1.2, ease: 'expo.out',
      }, '-=1.0');
    }
    if (descEl) {
      tl.to(descEl, {
        y: '0%', duration: 1.2, ease: 'expo.out',
      }, '-=1.0');
    }
    if (actionEls.length) {
      tl.to(actionEls, {
        y: '0%', duration: 1, stagger: 0.1, ease: 'expo.out',
      }, '-=1.0');
    }
  }, { scope: ref, dependencies: [loaded] });

  return (
    <section className="sect hero" id="home" ref={ref}>

      <div className="hero-content">
        <div className="hero-name-wrap">
          <div className="hero-name gradient-text-1" style={{ transform: 'translateY(120%)' }}>Dhrub</div>
        </div>
        <div className="hero-name-wrap">
          <div className="hero-name gradient-text-2" style={{ transform: 'translateY(120%)' }}>
            <span className="serif-accent">Kumar Garg.</span>
          </div>
        </div>
        <div className="hero-tagline-wrap">
          <p className="hero-tagline" style={{ transform: 'translateY(120%)' }}>
            <span className="accent">●</span> &nbsp;Full-Stack Developer &nbsp;/ &nbsp;React & Next.js &nbsp;/ &nbsp;Building Real Products
          </p>
        </div>
        <div className="hero-desc-wrap">
          <p className="hero-desc" style={{ transform: 'translateY(120%)' }}>
            I'm a Full-Stack Developer who enjoys turning ideas into fast, reliable,
            and user-friendly products. I love building, experimenting with new technologies,
            and solving problems that create real impact.
          </p>
        </div>
        
      </div>

      <div className="scroll-cue">
        <div className="scroll-cue-line" />
        <span>Scroll down</span>
      </div>

      {/* Right Content */}
      <LanyardCard loaded={loaded} themeMode={themeMode} />

    </section>
  );
}

/* ═══ MARQUEE ═══ */
function Marquee() {
  const items = [...SKILLS, ...SKILLS, ...SKILLS];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {items.map((s, i) => (
          <span key={i} className={s === '◆' ? 'dot' : ''}>{s}</span>
        ))}
      </div>
    </div>
  );
}



/* ═══ ABOUT ═══ */
function About() {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;

    // Word reveal with stagger + subtle rotation
    gsap.fromTo(el.querySelectorAll('.sect-heading .word-reveal'),
      { y: '120%', rotateX: 40, opacity: 0 },
      { scrollTrigger: { trigger: el, start: 'top 85%' }, y: '0%', rotateX: 0, opacity: 1, duration: 1.4, stagger: 0.08, ease: 'expo.out' }
    );

    // About grid: slide from left with clip reveal
    const aboutText = el.querySelector('.about-text');
    const aboutMeta = el.querySelector('.about-meta');
    if (aboutText) {
      gsap.fromTo(aboutText,
        { x: -60, opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        { scrollTrigger: { trigger: el, start: 'top 70%' }, x: 0, opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.out' }
      );
    }
    if (aboutMeta) {
      gsap.fromTo(aboutMeta,
        { x: 60, opacity: 0, clipPath: 'inset(0 0 0 100%)' },
        { scrollTrigger: { trigger: el, start: 'top 70%' }, x: 0, opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: 1.2, ease: 'power4.out', delay: 0.2 }
      );
    }

    // Meta rows stagger from right
    gsap.fromTo(el.querySelectorAll('.meta-row'),
      { x: 40, opacity: 0 },
      { scrollTrigger: { trigger: el, start: 'top 65%' }, x: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' }
    );

    gsap.fromTo(el.querySelectorAll('.reveal'),
      { y: 40, opacity: 0 },
      { scrollTrigger: { trigger: el, start: 'top 75%' }, y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
  }, { scope: ref });

  return (
    <section className="sect sect-about" id="about" ref={ref}>
      <p className="sect-label reveal">01 — About</p>
      <h2 className="sect-heading gradient-text-1">
        <span style={{ display: 'inline-flex', flexWrap: 'wrap', overflow: 'hidden' }}>
          <span className="word-reveal" style={{ transform: 'translateY(120%)', display: 'inline-block', marginRight: '0.25em' }}>I</span>
          <span className="word-reveal" style={{ transform: 'translateY(120%)', display: 'inline-block', marginRight: '0.25em' }}>Build</span>
          <span className="word-reveal" style={{ transform: 'translateY(120%)', display: 'inline-block', marginRight: '0.25em' }}>Beyond</span>
          <span className="word-reveal serif" style={{ transform: 'translateY(120%)', display: 'inline-block' }}>The Surface...</span>
        </span>
      </h2>
      <div className="about-grid">
        <div className="about-text reveal">
          <p>
            I don't just build interfaces — I <strong>build what makes them work</strong>.
            I've built a full-stack trading platform deployed on AWS, a multithreaded
            Deep Packet Inspection engine processing ~196K packets/sec, and an IoT
            wearable system backed by a <strong>published Indian patent</strong>.
          </p>
          <p>
            I'm currently pursuing B.Tech in Information Technology at
            <strong> VIT Vellore</strong>, focused on full-stack engineering,
            systems, and problem solving. I care about <strong>craft</strong> —
            clean code, thoughtful architecture, accessible interfaces,
            and building software that works beyond the demo.
          </p>
        </div>
        <div className="about-meta reveal">
          {[
            ['LOCATION', 'Vellore, Tamil Nadu'],
            ['EDUCATION', 'B.Tech IT · VIT Vellore'],
            ['FOCUS', 'Full-Stack Engineering & Systems'],
            ['CURRENTLY', 'B.Tech IT · 2024–2028'],
            ['LANGUAGES', 'C++ · JavaScript · C · Java · Python'],
            ['INTERESTS', 'Software Engineering · System Design · Problem Solving'],
          ].map(([k, v]) => (
            <div className="meta-row" key={k}>
              <span className="meta-k">{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ PROFESSIONAL EDITORIAL PROJECTS ═══ */
function Projects({ data }) {
  const sectionRef = useRef(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Header animation
    gsap.fromTo(section.querySelectorAll('.pro-header-anim'),
      { opacity: 0, y: 30 },
      { scrollTrigger: { trigger: section, start: 'top 80%' }, opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }
    );

    // Stagger in the rows
    gsap.fromTo(section.querySelectorAll('.pro-row'),
      { opacity: 0, x: -20 },
      { scrollTrigger: { trigger: section, start: 'top 75%' }, opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
    );
  }, { dependencies: [data] });

  const toggleRow = (i) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <section className="sect projects-sect pro" id="projects" ref={sectionRef}>
      <div className="pro-header-container">
        <div className="sect-label pro-header-anim">Selected Work</div>
        <h2 className="sect-heading pro-header-anim">Engineering & Design</h2>
      </div>

      <div className="pro-list">
        {data.map((proj, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div
              key={i}
              className={`pro-row ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleRow(i)}
            >
              <div className="pro-row-header">
                <span className="pro-year">202{6 - i}</span>
                <h3 className="pro-name">{proj.name}</h3>
                <div className="pro-tags">
                  {proj.stack.slice(0, 3).map(s => <span className="pro-tag" key={s}>{s}</span>)}
                </div>
                <div className="pro-arrow">↗</div>
              </div>

              <div className="pro-row-body">
                <div className="pro-row-body-inner">
                  <div className="pro-content-grid">
                    <div className="pro-image-wrap">
                      <img src={PROJECT_IMAGES[proj.name] || imgTransformer} alt={proj.name} className="pro-image" />
                    </div>

                    <div className="pro-details">
                      <p className="pro-desc">
                        {proj.desc}. Focused on performance, minimal dependencies, and high-quality user experience. Built from first principles to ensure complete control over the architecture.
                      </p>

                      <div className="pro-metrics">
                        {proj.stack.map(s => <span className="pro-metric" key={s}>{s}</span>)}
                        {proj.metrics && proj.metrics.map(m => <span className="pro-metric" key={m}>{m}</span>)}
                      </div>

                      <div className="pro-links">
                        {proj.links.map(l => (
                          <a
                            key={l.label}
                            href={l.url}
                            className="pro-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                          >
                            {l.label} <span>↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══ EXPERIENCE ═══ */
function Experience({ data }) {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    // Heading: dramatic scale-up from nothing
    gsap.fromTo(el.querySelector('.sect-heading'),
      { opacity: 0, y: 50, scale: 0.8, filter: 'blur(12px)' },
      { scrollTrigger: { trigger: el, start: 'top 80%' }, opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }
    );

    // Each experience item: horizontal slide with clip-path reveal
    const items = el.querySelectorAll('.exp-item');
    items.forEach((item, i) => {
      gsap.fromTo(item,
        {
          clipPath: 'inset(0 0 0 100%)',
          x: 80,
          opacity: 0
        },
        {
          scrollTrigger: { trigger: item, start: 'top 85%' },
          clipPath: 'inset(0 0 0 0%)',
          x: 0,
          opacity: 1,
          duration: 1,
          delay: i * 0.12,
          ease: 'power4.out'
        }
      );
    });

    gsap.fromTo(el.querySelectorAll('.reveal'),
      { y: 60, opacity: 0 },
      { scrollTrigger: { trigger: el, start: 'top 80%' }, y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
  }, { scope: ref, dependencies: [data] });

  return (
    <section className="sect sect-experience" id="experience" ref={ref}>
      <p className="sect-label reveal">03 — Experience</p>
      <h2 className="sect-heading reveal">Where I’ve <em className="serif">contributed.</em></h2>
      {data.map((exp, i) => (
        <div className="exp-item reveal" key={i}>
          <span className="exp-date">{exp.date}</span>
          <div>
            <h3 className="exp-role">{exp.role}</h3>
            <p className="exp-org">{exp.org}</p>
            <ul className="exp-bullets">
              {exp.desc.map((d, j) => <li key={j}>{d}</li>)}
            </ul>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ═══ 3D SCROLL-DRIVEN NOTEBOOK ═══ */

// Minimal SVG illustrations per page
const PAGE_ILLUSTRATIONS = [
  // 2023 — A simple monitor/laptop
  <svg key="0" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="40" y="20" width="120" height="80" rx="6" />
    <line x1="40" y1="90" x2="160" y2="90" />
    <line x1="85" y1="110" x2="115" y2="110" />
    <line x1="75" y1="110" x2="125" y2="110" />
    <rect x="55" y="32" width="90" height="48" rx="2" strokeOpacity="0.4" />
    <line x1="65" y1="44" x2="105" y2="44" strokeOpacity="0.5" />
    <line x1="65" y1="52" x2="120" y2="52" strokeOpacity="0.5" />
    <line x1="65" y1="60" x2="95" y2="60" strokeOpacity="0.5" />
    <circle cx="100" cy="100" r="2" fill="currentColor" strokeWidth="0" />
  </svg>,
  // 2024 — Eye + neural connections (computer vision)
  <svg key="1" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <ellipse cx="100" cy="60" rx="60" ry="30" />
    <circle cx="100" cy="60" r="15" />
    <circle cx="100" cy="60" r="6" fill="currentColor" fillOpacity="0.15" strokeWidth="0" />
    <circle cx="100" cy="60" r="3" fill="currentColor" strokeWidth="0" />
    <line x1="50" y1="100" x2="100" y2="75" strokeOpacity="0.4" />
    <line x1="100" y1="75" x2="150" y2="100" strokeOpacity="0.4" />
    <circle cx="50" cy="105" r="5" strokeOpacity="0.6" />
    <circle cx="150" cy="105" r="5" strokeOpacity="0.6" />
    <circle cx="100" cy="110" r="5" strokeOpacity="0.6" />
  </svg>,
  // 2025 — Transformer architecture blocks
  <svg key="2" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="20" y="50" width="40" height="40" rx="4" />
    <rect x="80" y="25" width="40" height="40" rx="4" />
    <rect x="80" y="75" width="40" height="40" rx="4" />
    <rect x="140" y="50" width="40" height="40" rx="4" />
    <line x1="60" y1="70" x2="80" y2="45" strokeOpacity="0.5" />
    <line x1="60" y1="70" x2="80" y2="95" strokeOpacity="0.5" />
    <line x1="120" y1="45" x2="140" y2="70" strokeOpacity="0.5" />
    <line x1="120" y1="95" x2="140" y2="70" strokeOpacity="0.5" />
    <text x="95" y="50" fontSize="8" strokeWidth="0.5" textAnchor="middle" dominantBaseline="middle">Attn</text>
    <text x="95" y="100" fontSize="8" strokeWidth="0.5" textAnchor="middle" dominantBaseline="middle">FFN</text>
  </svg>,
  // 2026 — Shield / defence badge
  <svg key="3" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M100 20 L150 40 L150 85 Q150 120 100 130 Q50 120 50 85 L50 40 Z" />
    <path d="M100 35 L135 50 L135 80 Q135 108 100 118 Q65 108 65 80 L65 50 Z" strokeOpacity="0.4" />
    <polyline points="82,72 95,85 120,60" strokeWidth="2.5" />
  </svg>,
  // 2027 — Rocket / arrow up
  <svg key="4" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M100 15 C115 25 130 55 130 80 L100 95 L70 80 C70 55 85 25 100 15Z" />
    <circle cx="100" cy="58" r="10" />
    <path d="M75 95 L65 115 L80 110 L100 125 L120 110 L135 115 L125 95" strokeOpacity="0.5" />
    <line x1="100" y1="125" x2="100" y2="135" strokeOpacity="0.4" />
  </svg>,
];

/* ═══ 3D FULL-PAGE SCROLL-DRIVEN CAMERA MANUSCRIPT ═══ */

const MANUSCRIPT_ENTRIES = [
  {
    year: '2024',
    chapter: '01',
    title: 'Started B.Tech IT @ VIT Vellore',
    subtitle: 'THE BEGINNING',
    desc: 'Built my foundations in Data Structures, Algorithms, OOP, and DBMS while exploring software development.',
    badge: 'FOUNDATIONS',
    svg: (
      <svg viewBox="0 0 160 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="20" y="15" width="120" height="70" rx="4" strokeOpacity="0.8" />
        <line x1="20" y1="72" x2="140" y2="72" strokeOpacity="0.3" />
        <line x1="32" y1="30" x2="80" y2="30" stroke="var(--accent)" strokeWidth="2" />
        <line x1="32" y1="42" x2="110" y2="42" strokeOpacity="0.5" />
        <line x1="32" y1="52" x2="95" y2="52" strokeOpacity="0.5" />
        <circle cx="125" cy="30" r="4" fill="var(--accent)" strokeWidth="0" />
      </svg>
    )
  },
  {
    year: '—',
    chapter: '02',
    title: 'Systems & Full-Stack',
    subtitle: 'ENGINEERING',
    desc: 'Moved from learning concepts to building real systems — from full-stack applications to networking and IoT projects.',
    badge: 'REAL SYSTEMS',
    svg: (
      <svg viewBox="0 0 160 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <ellipse cx="80" cy="50" rx="50" ry="25" stroke="var(--accent)" />
        <circle cx="80" cy="50" r="14" stroke="var(--accent)" />
        <circle cx="80" cy="50" r="5" fill="var(--accent)" strokeWidth="0" />
        <line x1="30" y1="85" x2="80" y2="65" strokeOpacity="0.4" />
        <line x1="80" y1="65" x2="130" y2="85" strokeOpacity="0.4" />
        <circle cx="30" cy="85" r="3" fill="currentColor" strokeWidth="0" />
        <circle cx="130" cy="85" r="3" fill="currentColor" strokeWidth="0" />
      </svg>
    )
  },
  {
    year: '2026',
    chapter: '03',
    title: 'Open Source Contributor',
    subtitle: 'COMMUNITY & IMPACT',
    desc: 'Selected for GirlScript Summer of Code 2026, collaborating with mentors and maintainers on GitHub-based projects.',
    badge: 'GSSOC 2026',
    svg: (
      <svg viewBox="0 0 160 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="15" y="35" width="35" height="30" rx="3" stroke="var(--accent)" />
        <rect x="62" y="15" width="36" height="30" rx="3" />
        <rect x="62" y="55" width="36" height="30" rx="3" />
        <rect x="110" y="35" width="35" height="30" rx="3" stroke="var(--accent)" />
        <line x1="50" y1="50" x2="62" y2="30" strokeOpacity="0.5" />
        <line x1="50" y1="50" x2="62" y2="70" strokeOpacity="0.5" />
        <line x1="98" y1="30" x2="110" y2="50" strokeOpacity="0.5" />
        <line x1="98" y1="70" x2="110" y2="50" strokeOpacity="0.5" />
      </svg>
    )
  },
  {
    year: '2026',
    chapter: '04',
    title: 'Published Patent',
    subtitle: 'INNOVATION',
    desc: 'Built a wearable acoustic monitoring system with ESP8266, Embedded C, real-time detection, and automated alerts.',
    badge: 'INDIAN PATENT',
    svg: (
      <svg viewBox="0 0 160 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M80 15 L120 30 L120 65 Q120 90 80 98 Q40 90 40 65 L40 30 Z" stroke="var(--accent)" />
        <path d="M80 28 L108 38 L108 62 Q108 80 80 86 Q52 80 52 62 L52 38 Z" strokeOpacity="0.4" />
        <polyline points="66,55 76,65 96,45" stroke="var(--accent)" strokeWidth="2" />
      </svg>
    )
  },
  {
    year: '2028',
    chapter: '05',
    title: 'Next: Software Engineer',
    subtitle: 'THE FUTURE',
    desc: 'Building toward SDE roles with a focus on full-stack engineering, systems, problem solving, and clean architecture.',
    badge: 'SDE READY',
    svg: (
      <svg viewBox="0 0 160 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M80 12 C92 20 104 45 104 65 L80 78 L56 65 C56 45 68 20 80 12Z" stroke="var(--accent)" />
        <circle cx="80" cy="46" r="8" stroke="var(--accent)" />
        <path d="M60 78 L52 92 L64 88 L80 98 L96 88 L108 92 L100 78" strokeOpacity="0.5" />
      </svg>
    )
  }
];

function Timeline({ data }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useGSAP(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const path = pathRef.current;
    const head = headRef.current;
    if (!section || !canvas) return;

    let pathLength = 0;
    if (path) {
      pathLength = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
      });
      if (head) {
        const startPt = path.getPointAtLength(0);
        head.setAttribute('cx', startPt.x);
        head.setAttribute('cy', startPt.y);
      }
    }

    // High-performance manuscript camera sequence mapped across 2500vh scroll runway
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=2500vh',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          let step = 0;
          if (self.progress < (3.0 / 12.0)) step = 0;
          else if (self.progress < (5.0 / 12.0)) step = 1;
          else if (self.progress < (7.0 / 12.0)) step = 2;
          else if (self.progress < (9.0 / 12.0)) step = 3;
          else step = 4;
          setActiveStep(step);

          // Real-time Tour Guide Head Marker Tracking
          if (path && head) {
            // Path drawing happens between 1.0 and 11.0 seconds on the 12-second timeline
            const drawProgress = Math.max(0, Math.min(1, (self.progress * 12.0 - 1.0) / 10.0));
            const pt = path.getPointAtLength(drawProgress * pathLength);
            head.setAttribute('cx', pt.x);
            head.setAttribute('cy', pt.y);
          }
        }
      }
    });

    // Continuous, unbroken drawing of the freehand ink line across scroll runway
    if (path) {
      tl.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        duration: 10.0
      }, 1.0); // Starts after the 2D hold
    }

    // Hold perfectly flat 2D state at the very beginning
    tl.to(canvas, { scale: 1.0, xPercent: 0, yPercent: 0, rotateZ: 0, rotateX: 0, rotateY: 0, duration: 1.0 }, 0)

      // Chapter 01 (2023 - Top Left)
      .to(canvas, { scale: 1.28, xPercent: 22, yPercent: 20, rotateZ: -1, rotateX: -8, rotateY: 4, ease: 'power2.inOut', duration: 1.0 }, 1.0)
      .to(canvas, { scale: 1.28, xPercent: 22, yPercent: 20, rotateZ: -1, rotateX: -8, rotateY: 4, ease: 'none', duration: 1.0 }, 2.0)

      // Chapter 02 (2024 - Bottom Left)
      .to(canvas, { scale: 1.28, xPercent: 22, yPercent: -20, rotateZ: 1, rotateX: -10, rotateY: 3, ease: 'power2.inOut', duration: 1.0 }, 3.0)
      .to(canvas, { scale: 1.28, xPercent: 22, yPercent: -20, rotateZ: 1, rotateX: -10, rotateY: 3, ease: 'none', duration: 1.0 }, 4.0)

      // Chapter 03 (2025 - Top Right)
      .to(canvas, { scale: 1.28, xPercent: -22, yPercent: 22, rotateZ: -1, rotateX: -8, rotateY: -4, ease: 'power2.inOut', duration: 1.0 }, 5.0)
      .to(canvas, { scale: 1.28, xPercent: -22, yPercent: 22, rotateZ: -1, rotateX: -8, rotateY: -4, ease: 'none', duration: 1.0 }, 6.0)

      // Chapter 04 (2026 - Middle Right)
      .to(canvas, { scale: 1.28, xPercent: -22, yPercent: 0, rotateZ: 1, rotateX: -10, rotateY: -3, ease: 'power2.inOut', duration: 1.0 }, 7.0)
      .to(canvas, { scale: 1.28, xPercent: -22, yPercent: 0, rotateZ: 1, rotateX: -10, rotateY: -3, ease: 'none', duration: 1.0 }, 8.0)

      // Chapter 05 (2027 - Bottom Right)
      .to(canvas, { scale: 1.28, xPercent: -22, yPercent: -22, rotateZ: -0.5, rotateX: -12, rotateY: -2, ease: 'power2.inOut', duration: 1.0 }, 9.0)
      .to(canvas, { scale: 1.28, xPercent: -22, yPercent: -22, rotateZ: -0.5, rotateX: -12, rotateY: -2, ease: 'none', duration: 1.0 }, 10.0)

      // Pull back smoothly to a perfectly flat 2D overview revealing the complete manuscript spread!
      .to(canvas, { scale: 1.0, xPercent: 0, yPercent: 0, rotateZ: 0, rotateX: 0, rotateY: 0, ease: 'power2.inOut', duration: 1.0 }, 11.0);

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.revert();
      tl.revert();
      tl.kill();
    };
  }, { scope: sectionRef });

  return (
    <section className="manuscript-section" id="journey" ref={sectionRef}>
      {/* HUD Header Bar */}
      <div className="manuscript-hud">
        <div className="hud-badge">
          <span className="hud-dot" /> 04 — JOURNEY MANUSCRIPT
        </div>
        <div className="hud-chapters">
          {MANUSCRIPT_ENTRIES.map((item, idx) => (
            <div
              key={idx}
              className={`hud-chip ${activeStep === idx ? 'active' : ''}`}
            >
              <span className="hud-year">{item.year}</span>
              <span className="hud-title-mini">{item.subtitle}</span>
            </div>
          ))}
        </div>
        <div className="hud-hint">
          <span>SCROLL TO EXPLORE MANUSCRIPT</span> ↓
        </div>
      </div>

      {/* 3D Camera Scene */}
      <div className="manuscript-scene">
        {/* The Fullpage Open Manuscript Canvas */}
        <div className="manuscript-canvas" ref={canvasRef}>
          <div className="manuscript-book">
            {/* Dynamic Freehand Organic Ink Path overlaying the notebook spread */}
            <svg
              className="manuscript-ink-svg"
              viewBox="0 0 1400 850"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 25,
                pointerEvents: 'none',
                overflow: 'visible'
              }}
            >
              <path
                ref={pathRef}
                d="M 320 170 C 450 280, 180 430, 320 550 C 500 750, 800 50, 1080 135 C 1250 220, 920 300, 1080 375 C 1220 460, 940 540, 1080 615"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="320" cy="170" r="5" fill="var(--accent)" />
              <circle cx="320" cy="550" r="5" fill="var(--accent)" />
              <circle cx="1080" cy="135" r="5" fill="var(--accent)" />
              <circle cx="1080" cy="375" r="5" fill="var(--accent)" />
              <circle cx="1080" cy="615" r="5" fill="var(--accent)" />

              {/* Glowing Line-Tracking Tour Guide Marker Head */}
              <circle
                ref={headRef}
                cx="320"
                cy="170"
                r="7"
                fill="#ffffff"
                stroke="var(--accent)"
                strokeWidth="3.5"
              />
            </svg>

            {/* Book Spine */}
            <div className="mb-spine">
              <span className="mb-spine-text">DHRUB KUMAR GARG // JOURNEY & LOG</span>
            </div>

            {/* LEFT PAGE */}
            <div className="mb-page mb-page-left">
              <div className="mb-paper-lines" />
              <div className="mb-watermark">2023—2024</div>

              {/* ENTRY 2023 (Top Left) */}
              <div className={`mb-entry entry-2023 ${activeStep === 0 ? 'focused' : ''}`}>
                <div className="entry-head">
                  <span className="entry-num">CH.01</span>
                  <span className="entry-year">{MANUSCRIPT_ENTRIES[0].year}</span>
                  <span className="entry-pill">{MANUSCRIPT_ENTRIES[0].badge}</span>
                </div>
                <h3 className="entry-title">{MANUSCRIPT_ENTRIES[0].title}</h3>
                <p className="entry-desc">{MANUSCRIPT_ENTRIES[0].desc}</p>
                <div className="entry-svg">{MANUSCRIPT_ENTRIES[0].svg}</div>
                <div className="entry-stamp">VERIFIED // VIT VELLORE</div>
              </div>

              {/* ENTRY 2024 (Bottom Left) */}
              <div className={`mb-entry entry-2024 ${activeStep === 1 ? 'focused' : ''}`}>
                <div className="entry-head">
                  <span className="entry-num">CH.02</span>
                  <span className="entry-year">{MANUSCRIPT_ENTRIES[1].year}</span>
                  <span className="entry-pill">{MANUSCRIPT_ENTRIES[1].badge}</span>
                </div>
                <h3 className="entry-title">{MANUSCRIPT_ENTRIES[1].title}</h3>
                <p className="entry-desc">{MANUSCRIPT_ENTRIES[1].desc}</p>
                <div className="entry-svg">{MANUSCRIPT_ENTRIES[1].svg}</div>
                <div className="entry-margin-note">→ Real-time Autoencoder latency &lt; 5ms</div>
              </div>
            </div>

            {/* RIGHT PAGE */}
            <div className="mb-page mb-page-right">
              <div className="mb-paper-lines" />
              <div className="mb-margin-red" />
              <div className="mb-coffee-stain" />

              {/* ENTRY 2025 (Top Right) */}
              <div className={`mb-entry entry-2025 ${activeStep === 2 ? 'focused' : ''}`}>
                <div className="entry-head">
                  <span className="entry-num">CH.03</span>
                  <span className="entry-year">{MANUSCRIPT_ENTRIES[2].year}</span>
                  <span className="entry-pill">{MANUSCRIPT_ENTRIES[2].badge}</span>
                </div>
                <h3 className="entry-title">{MANUSCRIPT_ENTRIES[2].title}</h3>
                <p className="entry-desc">{MANUSCRIPT_ENTRIES[2].desc}</p>
                <div className="entry-svg">{MANUSCRIPT_ENTRIES[2].svg}</div>
                <div className="entry-sticky">
                  <span>★ Self-Attention from scratch</span>
                </div>
              </div>

              {/* ENTRY 2026 (Bottom Right) */}
              <div className={`mb-entry entry-2026 ${activeStep === 3 ? 'focused' : ''}`}>
                <div className="entry-head">
                  <span className="entry-num">CH.04</span>
                  <span className="entry-year">{MANUSCRIPT_ENTRIES[3].year}</span>
                  <span className="entry-pill">{MANUSCRIPT_ENTRIES[3].badge}</span>
                </div>
                <h3 className="entry-title">{MANUSCRIPT_ENTRIES[3].title}</h3>
                <p className="entry-desc">{MANUSCRIPT_ENTRIES[3].desc}</p>
                <div className="entry-svg">{MANUSCRIPT_ENTRIES[3].svg}</div>
                <div className="entry-stamp defence">PATENTED // INDIA 202641062287</div>
              </div>

              {/* ENTRY 2027 / FOOTNOTE (Center Bottom Summary) */}
              <div className={`mb-entry entry-2027 ${activeStep === 4 ? 'focused' : ''}`}>
                <div className="entry-head">
                  <span className="entry-num">CH.05</span>
                  <span className="entry-year">{MANUSCRIPT_ENTRIES[4].year}</span>
                  <span className="entry-pill">{MANUSCRIPT_ENTRIES[4].badge}</span>
                </div>
                <h3 className="entry-title">{MANUSCRIPT_ENTRIES[4].title}</h3>
                <p className="entry-desc">{MANUSCRIPT_ENTRIES[4].desc}</p>
                <div className="entry-signature">
                  <span>Dhrub Kumar Garg</span>
                  <p>Building intelligence from first principles.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ HEATMAP COMPONENT ═══ */
function HeatmapGrid({ activity }) {
  if (!activity || !activity.length) return null;
  
  // activity is correctly ordered oldest -> newest by the API
  const sorted = activity;

  return (
    <div className="heatmap-container" style={{
      display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem'
    }}>
      <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: '4px', minWidth: 'max-content' }}>
        {sorted.map((day, i) => {
          let color = 'rgba(255,255,255,0.05)';
          if (day.intensity === 1) color = '#0e4429';
          else if (day.intensity === 2) color = '#006d32';
          else if (day.intensity === 3) color = '#26a641';
          else if (day.intensity === 4) color = '#39d353';
          
          return (
            <div 
              key={day.date} 
              style={{ width: '12px', height: '12px', backgroundColor: color, borderRadius: '2px' }}
              title={`${day.date}: ${day.count} submissions`}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['rgba(255,255,255,0.05)', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
            <div key={c} style={{ width: '12px', height: '12px', backgroundColor: c, borderRadius: '2px' }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

/* ═══ STATS ═══ */
function Stats({ themeMode }) {
  const ref = useRef(null);
  const [codolioStats, setCodolioStats] = useState(null);
  const [syncTime, setSyncTime] = useState(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetch('/api/codolio')
      .then(res => {
        if (!res.ok) throw new Error('API route not available');
        return res.json();
      })
      .then(data => {
        setCodolioStats(data);
        if (data.lastSynced) {
          const d = new Date(data.lastSynced);
          const formatted = d.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
          }).toUpperCase() + ' ' + d.toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit', hour12: false
          }) + ' IST';
          setSyncTime(formatted);
        }
      })
      .catch(err => {
        console.error("Failed to load live Codolio stats", err);
        setApiError(true);
      });
  }, []);

  useGSAP(() => {
    const el = ref.current;
    if (!el || !codolioStats) return; // Wait until fetched or fallback applied

    gsap.fromTo(el.querySelector('.sect-heading'),
      { opacity: 0, y: 30 },
      { scrollTrigger: { trigger: el, start: 'top 85%' }, opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );

    gsap.fromTo(el.querySelectorAll('.stat-cell'),
      { y: 60, opacity: 0, skewY: 5 },
      { scrollTrigger: { trigger: el, start: 'top 80%' }, y: 0, opacity: 1, skewY: 0, duration: 1, stagger: 0.1, ease: 'power4.out', transformOrigin: "left top" }
    );

    gsap.fromTo(el.querySelector('.codolio-panel'),
      { y: 40, opacity: 0 },
      { scrollTrigger: { trigger: el, start: 'top 75%' }, y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    );

    el.querySelectorAll('.stat-number').forEach((numEl) => {
      const target = parseInt(numEl.dataset.value, 10);
      if (isNaN(target)) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: numEl, start: 'top 85%' },
        onUpdate: () => {
          numEl.textContent = Math.round(obj.val).toLocaleString();
        },
      });
    });
  }, { scope: ref, dependencies: [codolioStats] });

  return (
    <section className="sect sect-stats" id="stats" ref={ref}>
      <p className="sect-label">05 — STATS</p>
      <h2 className="sect-heading">Engineering <em className="serif">Metrics.</em></h2>
      
      {apiError ? (
        <div style={{ padding: '3rem', border: '1px solid rgba(255,0,0,0.2)', background: 'rgba(255,0,0,0.05)', borderRadius: '8px', textAlign: 'center', color: 'var(--dim)' }}>
          <p style={{ fontFamily: 'var(--font-mono)' }}>ERR: TELEMETRY_UNAVAILABLE</p>
          <p>Failed to establish connection to Codolio network.</p>
        </div>
      ) : (
        <>
          <div className="stats-row">
            {codolioStats ? [
              [codolioStats.questionsSolved.toString(), 'QUESTIONS SOLVED'],
              [codolioStats.activeDays.toString(), 'ACTIVE DAYS'],
              [codolioStats.maxStreak.toString(), 'MAX STREAK'],
            ].map(([n, l]) => (
              <div className="stat-cell" key={l}>
                <div className="stat-number" data-value={n}>0</div>
                <div className="stat-label">{l}</div>
              </div>
            )) : (
              <div className="stat-cell loading">
                <div className="stat-number" style={{ opacity: 0.5, animation: 'pulse 1.5s infinite' }}>---</div>
                <div className="stat-label" style={{ opacity: 0.5 }}>SYNCING TELEMETRY...</div>
              </div>
            )}
          </div>

          {codolioStats && (
            <div className="codolio-panel" style={{ 
              marginTop: '4rem', 
              padding: '2rem', 
              border: '1px solid var(--border)', 
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="label" style={{ display: 'block', fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text)' }}>Problem Solving Activity</span>
                  <span style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Last 6 Months</span>
                </div>
                {syncTime && (
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>
                    LAST SYNCED · {syncTime}
                  </div>
                )}
              </div>
              
              <HeatmapGrid activity={codolioStats.activity} />
              
              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--accent)' }}>
                    {codolioStats.currentStreak} <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 400 }}>Days</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--dim)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>CURRENT STREAK</div>
                </div>
                
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 600 }}>
                    {codolioStats.maxStreak} <span style={{ fontSize: '0.85rem', color: 'var(--dim)', fontWeight: 400 }}>Days</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--dim)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>ALL-TIME MAX STREAK</div>
                </div>
                
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 600 }}>
                    {codolioStats.submissions}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--dim)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>TOTAL SUBMISSIONS</div>
                </div>
              </div>
            </div>
          )}

          {codolioStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              {/* COMPETITIVE PROGRAMMING PANEL */}
              <div style={{ padding: '2rem', border: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: '1.5rem', fontWeight: 500 }}>Competitive Programming</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 600, color: 'var(--accent)', lineHeight: 1 }}>{codolioStats.currentRating}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--dim)', paddingBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>MAX RATING</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--dim)' }}>Contests Attended</span>
                    <span>{codolioStats.contestsAttended}</span>
                  </div>
                  {Object.entries(codolioStats.platforms || {}).map(([plat, count]) => count > 0 && (
                    <div key={plat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'var(--dim)', textTransform: 'capitalize' }}>{plat}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DSA DISTRIBUTION PANEL */}
              <div style={{ padding: '2rem', border: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: '1.5rem', fontWeight: 500 }}>DSA Distribution</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 600, lineHeight: 1 }}>{codolioStats.dsa?.total || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--dim)', paddingBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>TOTAL SOLVED</div>
                </div>
                
                {/* Segmented Bar */}
                <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: `${((codolioStats.dsa?.easy || 0) / Math.max(codolioStats.dsa?.total || 1, 1)) * 100}%`, background: '#26a641' }} />
                  <div style={{ width: `${((codolioStats.dsa?.medium || 0) / Math.max(codolioStats.dsa?.total || 1, 1)) * 100}%`, background: '#fb8500' }} />
                  <div style={{ width: `${((codolioStats.dsa?.hard || 0) / Math.max(codolioStats.dsa?.total || 1, 1)) * 100}%`, background: '#e63946' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--dim)' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#26a641', marginRight: '8px' }}></span>Easy</span>
                    <span>{codolioStats.dsa?.easy || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--dim)' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#fb8500', marginRight: '8px' }}></span>Medium</span>
                    <span>{codolioStats.dsa?.medium || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--dim)' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#e63946', marginRight: '8px' }}></span>Hard</span>
                    <span>{codolioStats.dsa?.hard || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ═══ CRT TERMINAL ═══ */

/* ═══ CONTACT ═══ */
function Contact() {
  const ref = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  useGSAP(() => {
    const el = ref.current;

    gsap.fromTo(el.querySelector('.contact-heading'),
      { opacity: 0, y: 30 },
      { scrollTrigger: { trigger: el, start: 'top 80%' }, opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );

    gsap.fromTo(el.querySelectorAll('.reveal'),
      { y: 30, opacity: 0 },
      { scrollTrigger: { trigger: el, start: 'top 75%' }, y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
  }, { scope: ref });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) { 
      console.error(err); 
      setError(true);
    }
    setSending(false);
  };

  return (
    <section className="sect sect-contact" id="contact" ref={ref}>
      <div className="contact-split">
        <div className="reveal">
          <h2 className="contact-heading gradient-text-1">
            Let's build<br />something <em className="serif">together.</em>
          </h2>
          <p className="contact-info">
            Open to collaborations, interesting projects,
            or conversations about full-stack architecture and systems design.
          </p>
          <div className="contact-links">
            <a href="mailto:dhrubkumargarg@gmail.com">→ dhrubkumargarg@gmail.com</a>
            <a href="https://github.com/Dhrub-Kumar-Garg" target="_blank" rel="noopener noreferrer">→ github.com/Dhrub-Kumar-Garg</a>
            <a href="https://www.linkedin.com/in/dhrub-kumar-garg" target="_blank" rel="noopener noreferrer">→ linkedin.com/in/dhrub-kumar-garg</a>
            <a href="https://codolio.com/profile/dhruvii" target="_blank" rel="noopener noreferrer">→ codolio.com/profile/dhruvii</a>
          </div>
        </div>
        <form className="form-stack reveal" onSubmit={submit}>
          {sent ? (
            <div style={{ padding: '40px 0', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--cyan)' }}>
              <strong>MESSAGE SENT.</strong><br/>
              I'll get back to you soon.
            </div>
          ) : error ? (
            <div style={{ padding: '40px 0', fontFamily: 'var(--mono)', fontSize: 14, color: '#ff5f56' }}>
              <strong>MESSAGE FAILED.</strong><br/>
              Please try again or email me directly.
            </div>
          ) : (
            <>
              <div className="form-field">
                <label htmlFor="name-input">Name</label>
                <input id="name-input" type="text" name="name" placeholder="Your name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label htmlFor="email-input">Email</label>
                <input id="email-input" type="email" name="email" placeholder="your@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-field">
                <label htmlFor="message-input">Message</label>
                <textarea id="message-input" name="message" placeholder="What's on your mind?" value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <Magnetic>
                <button type="submit" className="submit-btn" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message →'}
                </button>
              </Magnetic>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

/* ═══ THE MONOLITH FOOTER ═══ */
function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTime(new Intl.DateTimeFormat([], options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer-monolith">
      {/* Infinite Scrolling Top Bar */}
      <div className="footer-ticker">
        <div className="ticker-track">
          {Array(3).fill(SKILLS.join(' ')).map((text, i) => (
            <span key={i}>{text} ◆ </span>
          ))}
        </div>
      </div>

      <div className="footer-monolith-center">
        <Magnetic>
          <a href="mailto:dhrubkumargarg@gmail.com" className="monolith-cta">
            <div className="cta-spin-text">
              <svg viewBox="0 0 200 200" className="spin-svg">
                <path id="circlePath" d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" fill="none" />
                <text>
                  <textPath href="#circlePath" startOffset="0%">
                    LET'S BUILD SOMETHING FASCINATING • LET'S BUILD SOMETHING FASCINATING •
                  </textPath>
                </text>
              </svg>
            </div>
            <div className="cta-arrow">↗</div>
          </a>
        </Magnetic>
      </div>

      <div className="footer-monolith-bottom">
        <div className="fm-left">
          <p>DHRUB KUMAR GARG</p>
          <p>VIT VELLORE // {time ? `${time} IST` : '...'}</p>
        </div>
        <div className="fm-right">
          <a href="https://codolio.com/profile/dhruvii" target="_blank" rel="noopener noreferrer">CODOLIO</a>
          <a href="https://www.linkedin.com/in/dhrub-kumar-garg" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
          <a href="https://github.com/Dhrub-Kumar-Garg" target="_blank" rel="noopener noreferrer">GITHUB</a>
        </div>
      </div>
    </footer>
  );
}

/* ═══ PIXEL CAT (INTEGRATED RUNNING MASCOT) ═══ */
const PixelCat = ({ onClick, innerRef, style }) => (
  <div
    className="pixel-cat pixel-cat-running"
    onClick={onClick}
    ref={innerRef}
    style={style}
    title="Play Retro Cat Game"
    aria-label="Play Retro Cat Game"
  >
    <svg viewBox="0 0 16 16" width="28" height="28" fill="currentColor">
      <g className="cat-frame-1">
        <rect x="10" y="4" width="1" height="1" />
        <rect x="13" y="4" width="1" height="1" />
        <rect x="10" y="5" width="4" height="3" />
        <rect x="3" y="6" width="7" height="3" />
        <rect x="2" y="5" width="1" height="2" />
        <rect x="4" y="9" width="1" height="2" />
        <rect x="8" y="9" width="1" height="2" />
        <rect x="11" y="8" width="1" height="2" />
      </g>
      <g className="cat-frame-2">
        <rect x="10" y="5" width="1" height="1" />
        <rect x="13" y="5" width="1" height="1" />
        <rect x="10" y="6" width="4" height="3" />
        <rect x="3" y="7" width="7" height="3" />
        <rect x="1" y="6" width="2" height="1" />
        <rect x="5" y="10" width="1" height="2" />
        <rect x="7" y="10" width="1" height="2" />
        <rect x="12" y="9" width="1" height="2" />
      </g>
    </svg>
  </div>
);

/* ═══ SECTION PROGRESS DOTS ═══ */
const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'journey', label: 'Journey' },
  { id: 'stats', label: 'Stats' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'contact', label: 'Contact' },
];

function SectionDots({ scrollTo }) {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const triggers = SECTIONS.map(s => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActive(s.id),
        onEnterBack: () => setActive(s.id),
      });
    }).filter(Boolean);
    return () => triggers.forEach(t => t.kill());
  }, []);

  return (
    <div className="section-dots">
      {SECTIONS.map(s => (
        <button
          key={s.id}
          className={`section-dot${active === s.id ? ' active' : ''}`}
          data-label={s.label}
          onClick={() => scrollTo(s.id)}
          aria-label={`Navigate to ${s.label}`}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════ */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [themeMode, setThemeMode] = useState('dark');
  const [sweep, setSweep] = useState(null);
  const [showDinoGame, setShowDinoGame] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const catRef = useRef(null);
  const [catRect, setCatRect] = useState(null);

  const handleOpenGame = () => {
    if (catRef.current) {
      setCatRect(catRef.current.getBoundingClientRect());
    }
    setShowDinoGame(true);
  };

  const toggleTheme = (e) => {
    const isDark = themeMode === 'dark';
    const applyTheme = () => {
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'light');
        setThemeMode('light');
      } else {
        document.documentElement.removeAttribute('data-theme');
        setThemeMode('dark');
      }
    };

    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      applyTheme();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 1000,
          easing: 'cubic-bezier(0.85, 0, 0.15, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeMode(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setData(portfolioData);
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    if (!loaded) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after layout settles
    setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => lenis.destroy();
  }, [loaded]);

  const onPreloaderDone = useCallback(() => setLoaded(true), []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!data || !data.projects) return null;

  return (
    <>
      {!loaded && <Preloader onDone={onPreloaderDone} />}
      <ScrollProgress />
      <Cursor />
      <div className="grain" />
      <AnimatedBG />
      <SectionDots scrollTo={scrollTo} />

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        {['about', 'projects', 'experience', 'journey', 'terminal', 'contact'].map((s) => (
          <a key={s} onClick={() => { scrollTo(s); setMobileMenuOpen(false); }}>{s}</a>
        ))}
      </div>

      <nav className="nav">
        <div className="nav-logo" onClick={() => scrollTo('home')}>DKG.</div>
        <ul className="nav-links">
          {['about', 'projects', 'experience', 'journey', 'terminal'].map((s) => (
            <li key={s}><a onClick={() => scrollTo(s)}>{s}</a></li>
          ))}
        </ul>
        <div className="nav-right">
          <PixelCat
            innerRef={catRef}
            onClick={handleOpenGame}
            style={{ opacity: showDinoGame ? 0 : 1 }}
          />
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {themeMode === 'light' ? '🌙' : '☀️'}
          </button>
          <Magnetic>
            <button className="nav-cta" onClick={() => scrollTo('contact')}>Contact</button>
          </Magnetic>
          <button
            className={`hamburger${mobileMenuOpen ? ' open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <SectionTransition zIndex={10} glass={false} entrance={false}>
        <Hero loaded={loaded} themeMode={themeMode} />
      </SectionTransition>

      <Marquee />

      <SectionInterstitial
        mode="scramble"
        tag="[ SYSTEM INDEX ]"
        title="WHO?"
        sub="01 — DHRUB KUMAR GARG"
        diag="STATUS: READY // DEV MODE"
      />
      <SectionTransition zIndex={20}>
        <About />
      </SectionTransition>

      <WorkSection data={data.projects} />

      <SectionInterstitial
        mode="curtain"
        tag="[ EXPERIENCE ]"
        title="IMPACT."
        diag="SECURITY CLEARANCE: ACTIVE"
      />
      <SectionTransition zIndex={40}>
        <Experience data={data.experience} />
      </SectionTransition>

      <SectionInterstitial
        mode="tunnel"
        tag="[ MILESTONES ]"
        title="PATH."
        sub="04 — 2024 TO 2028"
        diag="TIMELINE_INDEX: ACTIVE"
      />
      <Timeline data={data.timeline} />

      <SectionInterstitial
        mode="matrix"
        tag="[ METRICS ]"
        title="DATA."
        sub="05 — TELEMETRY & REPOS"
        diag="API_STATUS: SYNCED"
      />
      <SectionTransition zIndex={60}>
        <Stats themeMode={themeMode} />
      </SectionTransition>

      <SectionTransition zIndex={70}>
        <CRTTerminal />
      </SectionTransition>

      <SectionTransition zIndex={80}>
        <Contact />
      </SectionTransition>

      <Footer scrollTo={scrollTo} />
      {showDinoGame && <DinoGame onClose={() => setShowDinoGame(false)} />}
    </>
  );
}

import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
          <span className="word-reveal" style={{ transform: 'translateY(120%)', display: 'inline-block', marginRight: '0.25em' }}>Not</span>
          <span className="word-reveal" style={{ transform: 'translateY(120%)', display: 'inline-block', marginRight: '0.25em' }}>just</span>
          <span className="word-reveal" style={{ transform: 'translateY(120%)', display: 'inline-block', marginRight: '0.25em' }}>another</span>
          <span className="word-reveal serif" style={{ transform: 'translateY(120%)', display: 'inline-block' }}>developer.</span>
        </span>
      </h2>
      <div className="about-grid">
        <div className="about-text reveal">
          <p>
            I don't just write code — I <strong>build products that matter</strong>.
            I've built a full-stack autonomous trading platform (StockWise), a patented
            IoT wearable with Indian Patent No. 202641062287, and a high-performance
            C++ DPI engine processing 196K packets/sec with 100% classification accuracy.
          </p>
          <p>
            Currently a B.Tech IT student at <strong>VIT Vellore</strong>, I care about
            <strong> craft</strong> — clean architecture, scalable systems, and products
            that solve real problems. I love exploring new technologies and pushing
            what's possible with modern web and systems engineering.
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
export default About;
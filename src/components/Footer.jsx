import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Magnetic } from './UI';
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
           {Array(6).fill("SYSTEMS ONLINE // FULL-STACK DEVELOPER // OPEN TO OPPORTUNITIES // ").map((text, i) => (
             <span key={i}>{text}</span>
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
          <a href="https://github.com/Dhrub-Kumar-Garg" target="_blank" rel="noopener noreferrer">GITHUB</a>
          <a href="https://www.linkedin.com/in/dhrub-kumar-garg" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
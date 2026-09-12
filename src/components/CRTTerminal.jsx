import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ASCII_ART } from '../data/constants';
/* ═══ CRT TERMINAL ═══ */
function CRTTerminal() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const bodyRef = useRef(null);
  const sectionRef = useRef(null);

  useGSAP(() => {
    const el = sectionRef.current;
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      once: true,
      onEnter: () => runBootSequence(),
    });
  }, { scope: sectionRef });

  const runBootSequence = () => {
    const bootLines = [
      { type: 'ascii', text: ASCII_ART.join('\n') },
      { type: 'out', text: '' },
      { type: 'system', text: '> Initializing dhrub.sh v1.0...' },
      { type: 'system', text: '> Loading modules... ██████████ 100%' },
      { type: 'system', text: '> System ready.' },
      { type: 'out', text: '' },
      { type: 'success', text: 'Welcome. Type "help" to see what I can do.' },
      { type: 'success', text: 'Try: "about", "skills", "theme light", "theme dark"' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= bootLines.length) {
        clearInterval(interval);
        setBooted(true);
        return;
      }
      const line = bootLines[i]; 
      setLines((prev) => [...prev, line]);
      i++;
      if (bodyRef.current) bodyRef.current.scrollTop = 99999;
    }, 180);
  };

  const commands = {
    help: () => [
      { type: 'out', text: '┌─────────────────────────────────────┐' },
      { type: 'out', text: '│  COMMANDS                           │' },
      { type: 'out', text: '├─────────────────────────────────────┤' },
      { type: 'out', text: '│  about      → Who am I              │' },
      { type: 'out', text: '│  skills     → Tech stack            │' },
      { type: 'out', text: '│  projects   → My work               │' },
      { type: 'out', text: '│  contact    → Reach me              │' },
      { type: 'out', text: '│  whoami     → Identity              │' },
      { type: 'out', text: '│  theme <mode> → dark | light        │' },
      { type: 'out', text: '│  clear      → Clear terminal        │' },
      { type: 'out', text: '│  neofetch   → System info           │' },
      { type: 'out', text: '└─────────────────────────────────────┘' },
    ],
    about: () => [
      { type: 'out', text: 'Dhrub Kumar Garg — IT @ VIT Vellore' },
      { type: 'out', text: 'I build fast, reliable, and user-friendly products.' },
      { type: 'out', text: 'Currently: B.Tech IT Student & Open Source Contributor' },
      { type: 'out', text: 'Focus: Full-Stack, System Design, Cloud' },
    ],
    skills: () => [
      { type: 'success', text: '▸ React.js  ▸ Next.js  ▸ Node.js  ▸ TypeScript' },
      { type: 'success', text: '▸ AWS      ▸ Docker   ▸ PostgreSQL  ▸ MongoDB' },
      { type: 'success', text: '▸ Python   ▸ C++     ▸ Git        ▸ NGINX' },
    ],
    projects: () => [
      { type: 'out', text: '[01] StockWise — Autonomous Algorithmic Trading Platform' },
      { type: 'out', text: '[02] Wearable Acoustic Monitor — Indian Patent 202641062287' },
      { type: 'out', text: '[03] DPI Engine — 196K pps, 100% classification accuracy' },
    ],
    contact: () => [
      { type: 'success', text: 'Email: dhrubkumargarg@gmail.com' },
      { type: 'success', text: 'GitHub: github.com/Dhrub-Kumar-Garg' },
      { type: 'success', text: 'LinkedIn: linkedin.com/in/dhrub-kumar-garg' },
    ],
    whoami: () => [{ type: 'success', text: 'A curious mind with a GPU and too many tabs open.' }],
    neofetch: () => [
      { type: 'ascii', text: ASCII_ART.join('\n') },
      { type: 'out', text: '' },
      { type: 'out', text: 'OS: Human v22.0 (Vellore Edition)' },
      { type: 'out', text: 'Shell: dhrub.sh v1.0' },
      { type: 'out', text: 'Uptime: ~22 years' },
      { type: 'out', text: 'CPU: Full-Stack Brain (always context-switching)' },
      { type: 'out', text: 'GPU: AWS EC2 when needed' },
      { type: 'out', text: 'Memory: Mostly StackOverflow + docs' },
      { type: 'out', text: 'Theme: Dark (always)' },
    ],
    clear: () => '__CLEAR__',
  };

  const handleTheme = (arg) => {
    if (arg === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      return [{ type: 'success', text: 'Theme switched to Light Mode ☀️' }];
    } else if (arg === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      return [{ type: 'success', text: 'Theme switched to Dark Mode 🌙' }];
    }
    return [{ type: 'error', text: `Unknown theme: "${arg}". Try: light, dark` }];
  };

  const exec = (e) => {
    if (e.key !== 'Enter' || !input.trim()) return;
    const raw = input.trim();
    const [cmd, ...args] = raw.toLowerCase().split(' ');
    const newLines = [{ type: 'cmd', text: raw }];

    if (cmd === 'theme') {
      newLines.push(...handleTheme(args[0] || ''));
    } else if (cmd === 'clear') {
      setLines([]);
      setInput('');
      return;
    } else {
      const fn = commands[cmd];
      if (fn) {
        const result = fn();
        if (Array.isArray(result)) newLines.push(...result);
      } else {
        newLines.push({ type: 'error', text: `Command not found: "${cmd}". Type "help" for commands.` });
      }
    }

    setLines((prev) => [...prev, ...newLines]);
    setInput('');
    setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = 99999; }, 50);
  };

  return (
    <section className="crt-section" id="terminal" ref={sectionRef}>
      <div className="crt-wrapper">
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-buttons">
              <span className="btn-close" />
              <span className="btn-min" />
              <span className="btn-max" />
            </div>
            <span className="terminal-title">dhrub.sh — v1.0</span>
          </div>
          <div className="terminal-body" ref={bodyRef}>
            {lines.map((l, i) => {
              if (!l) return null;
              return (
                <div className="term-line" key={i}>
                  {l.type === 'cmd' && <><span className="prompt">dhrub@portfolio:~$ </span><span className="user">{l.text}</span></>}
                  {l.type === 'out' && <span>{l.text}</span>}
                  {l.type === 'system' && <span style={{ color: '#888' }}>{l.text}</span>}
                  {l.type === 'success' && <span style={{ color: 'var(--cyan)' }}>{l.text}</span>}
                  {l.type === 'error' && <span style={{ color: '#ff5f56' }}>{l.text}</span>}
                  {l.type === 'ascii' && <pre style={{ color: 'var(--accent)', fontSize: '11px' }}>{l.text}</pre>}
                </div>
              );
            })}
            {!booted && lines.length > 0 && <span className="cursor-block">█</span>}
            
            {booted && (
              <div className="term-input-line">
                <span className="prompt">dhrub@portfolio:~$</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={exec}
                  placeholder="type a command..."
                  autoComplete="off"
                  spellCheck="false"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export default CRTTerminal;
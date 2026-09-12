import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ASCII_ART } from '../data/constants';

/* ═══ CRT TERMINAL ═══ */
function CRTTerminal() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  
  // New States
  const [windowState, setWindowState] = useState('open'); // 'open', 'minimized', 'maximized', 'closed'
  const [showHint, setShowHint] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const bodyRef = useRef(null);
  const sectionRef = useRef(null);
  const inputRef = useRef(null);

  // Subtle Entry Animation
  useGSAP(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Initially hide terminal wrapper slightly
    gsap.set('.crt-wrapper', { opacity: 0, y: 20 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to('.crt-wrapper', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        runBootSequence();
      },
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
      { type: 'success', text: 'Welcome. Type "help" to explore.' },
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
      
      // Force scroll during boot
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
      i++;
    }, 150); // Slightly faster boot as requested
  };

  const commands = {
    help: () => [
      { type: 'out', text: '┌────────────────────────────────────┐' },
      { type: 'out', text: '│ about    → Who am I                │' },
      { type: 'out', text: '│ skills   → Tech stack              │' },
      { type: 'out', text: '│ projects → Things I built          │' },
      { type: 'out', text: '│ stats    → Problem solving         │' },
      { type: 'out', text: '│ contact  → Reach me                │' },
      { type: 'out', text: '└────────────────────────────────────┘' },
    ],
  
    about: () => [
      { type: 'out', text: "I'm Dhrub — B.Tech IT @ VIT Vellore." },
      { type: 'out', text: 'I build full-stack products and systems.' },
      { type: 'out', text: 'Focus: software engineering, systems & problem solving.' },
    ],
  
    skills: () => [
      { type: 'success', text: 'C++ · Python · JavaScript · React · Next.js · Node.js' },
      { type: 'success', text: 'AWS · Docker · PostgreSQL · MySQL · Git' },
    ],
  
    projects: () => [
      { type: 'out', text: '[01] StockWise — Full-Stack Trading Platform' },
      { type: 'out', text: '[02] Wearable Acoustic Monitor — Published Patent' },
      { type: 'out', text: '[03] DPI Engine — C++ · Networking · Multithreading' },
    ],
  
    stats: () => [
      { type: 'out', text: 'Questions Solved : 197' },
      { type: 'out', text: 'Active Days      : 120' },
      { type: 'out', text: 'Max Streak       : 34 days' },
      { type: 'out', text: 'Rating           : 1433' },
    ],
  
    contact: () => [
      { type: 'success', text: 'dhrubkumargarg@gmail.com' },
      { type: 'success', text: 'github.com/Dhrub-Kumar-Garg' },
      { type: 'success', text: 'linkedin.com/in/dhrub-kumar-garg' },
    ],
  
    clear: () => '__CLEAR__',
  };

  // Smart Auto-Scroll Logic
  const scrollToBottomIfNear = useCallback(() => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    
    // If user is within 100px of the bottom, auto-scroll. Otherwise, preserve their scroll.
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom) {
      bodyRef.current.scrollTop = scrollHeight;
    }
  }, []);

  const handleInteraction = () => {
    if (showHint) setShowHint(false);
  };

  const handleKeyDown = (e) => {
    handleInteraction();
    
    if (e.key === 'Enter') {
      if (!input.trim()) return;
      
      const raw = input.trim();
      const [cmd, ...args] = raw.toLowerCase().split(' ').filter(Boolean);
      const newLines = [{ type: 'cmd', text: raw }];
  
      if (cmd === 'clear') {
        setLines([]);
      } else {
        const fn = commands[cmd];
        if (fn) {
          const result = fn();
          if (Array.isArray(result)) newLines.push(...result);
        } else {
          newLines.push({ type: 'error', text: `Command not found: "${cmd}". Type "help" for commands.` });
        }
      }
  
      setLines((prev) => (cmd === 'clear' ? [] : [...prev, ...newLines]));
      setHistory((prev) => [raw, ...prev]);
      setHistoryIndex(-1);
      setInput('');
      
      // Attempt smart scroll after state updates
      setTimeout(scrollToBottomIfNear, 50);
      
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setInput(history[prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  // Keep input focused when clicking inside terminal body
  const handleBodyClick = () => {
    handleInteraction();
    if (inputRef.current) inputRef.current.focus();
  };

  // Window Controls
  const toggleMaximize = () => {
    handleInteraction();
    setWindowState(prev => prev === 'maximized' ? 'open' : 'maximized');
  };
  
  const toggleMinimize = () => {
    handleInteraction();
    setWindowState(prev => prev === 'minimized' ? 'open' : 'minimized');
  };
  
  const closeTerminal = () => {
    handleInteraction();
    setWindowState('closed');
  };

  const reopenTerminal = () => {
    setWindowState('open');
    if (inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
  };

  return (
    <section className="crt-section" id="terminal" ref={sectionRef}>
      {windowState === 'closed' ? (
        <button className="btn-reopen-terminal" onClick={reopenTerminal}>
          OPEN TERMINAL
        </button>
      ) : (
        <div className="crt-wrapper">
          <div className={`terminal-window ${windowState}`}>
            <div className="terminal-header">
              <div className="terminal-buttons">
                <button className="btn-close" aria-label="Close Terminal" onClick={closeTerminal} />
                <button className="btn-min" aria-label="Minimize Terminal" onClick={toggleMinimize} />
                <button className="btn-max" aria-label="Maximize Terminal" onClick={toggleMaximize} />
                
                {showHint && (
                  <div className="terminal-hint">
                    WINDOW CONTROLS ↙
                  </div>
                )}
              </div>
              <span className="terminal-title">dhrub.sh — v1.0</span>
            </div>
            
            <div className="terminal-body" ref={bodyRef} onClick={handleBodyClick}>
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
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      handleInteraction();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="type a command..."
                    autoComplete="off"
                    spellCheck="false"
                    aria-label="Terminal command input"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CRTTerminal;
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "./MacbookMockup.module.css";

const MUSIC_PLAYLIST = [
  { title: "Midnight Lo-Fi Code Flow", artist: "Saumya's Studio", mood: "Deep Focus" },
  { title: "Cyberpunk Synthwave Pulse", artist: "Kernel Beats", mood: "Night Coding" },
  { title: "Ambient Flow State", artist: "Silicon Reverie", mood: "Chill" },
];

export default function MacbookMockup({ interactive = true }) {
  const [activeApp, setActiveApp] = useState("terminal"); // 'terminal' | 'editor' | 'music' | 'monitor'
  const [currentTime, setCurrentTime] = useState("9:30 PM");
  
  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState([
    { type: "sys", text: "SaumyaOS 2.5.0-release (darwin-arm64) — Ready" },
    { type: "cmd", text: "saumya --status" },
    { 
      type: "out", 
      text: "⚡ Saumya Mirajkar | Computer Engineer & Developer\n🟢 Status: Available for High-Impact Roles & Projects\n💡 Type 'help' or click quick commands below:" 
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const terminalBottomRef = useRef(null);

  // Editor State
  const [editorFile, setEditorFile] = useState("profile.py");

  // Music Player State
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // System Monitor State
  const [cpuVal, setCpuVal] = useState(3.4);
  const [ramVal, setRamVal] = useState(4.2);
  const [netSpeed, setNetSpeed] = useState(6.8);

  // Update clock & live telemetry
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 10000);

    const telemetryTimer = setInterval(() => {
      setCpuVal(+(2.0 + Math.random() * 3.5).toFixed(1));
      setRamVal(+(4.1 + Math.random() * 0.4).toFixed(2));
      setNetSpeed(+(5.0 + Math.random() * 4.5).toFixed(1));
    }, 2500);

    return () => {
      clearInterval(clockTimer);
      clearInterval(telemetryTimer);
    };
  }, []);

  // 3D Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 25 });

  const handleMouseMove = (e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(nx);
    y.set(ny);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Run Terminal Command
  const runCommand = (cmdText) => {
    const clean = cmdText.trim().toLowerCase();
    if (!clean) return;

    if (clean === "clear") {
      setTerminalHistory([]);
      setInputVal("");
      return;
    }

    let output = "";
    switch (clean) {
      case "help":
        output = "Available commands: whoami, skills, projects, stack, contact, hire, clear";
        break;
      case "whoami":
        output = "Saumya Mirajkar — Computer Engineering Student, Full-Stack Developer & IoT Engineer based in Pune, India.";
        break;
      case "skills":
        output = "🚀 Languages: Python, C++, JavaScript, TypeScript, SQL\n⚡ Frameworks: Next.js, FastAPI, React, Tailwind CSS\n🛠️ Systems: ESP32/IoT, Docker, Git, SQLite/PostgreSQL";
        break;
      case "projects":
        output = "📁 1. Smart Automated Rain Wiper (IoT / ESP32 / C++)\n📁 2. Saumya Portfolio Engine (FastAPI + Next.js)\n📁 3. Edge Telemetry Node (Real-time MQTT)";
        break;
      case "stack":
        output = "💻 Frontend: Next.js 16 + React 19 + Framer Motion\n⚙️ Backend: FastAPI + SQLAlchemy + SQLite\n🌐 Infra: Cloud-native, REST APIs, JWT Auth";
        break;
      case "contact":
        output = "📬 Email: saumyamirajkar25@icloud.com\n📍 Location: Pune, Maharashtra, India";
        break;
      case "hire":
        output = "🚀 Ready to engineer reliable, high-performance systems. Let's build something exceptional!";
        break;
      case "ielts":
      case "secret":
      case "vault":
        output = "🔓 Secret IELTS Command Center unlocked! Redirecting to /ielts...";
        setTimeout(() => {
          window.location.href = "/ielts";
        }, 800);
        break;
      default:
        output = `zsh: command not found: ${clean}. Type 'help' for commands.`;
    }

    setTerminalHistory((prev) => [
      ...prev,
      { type: "cmd", text: cmdText },
      { type: "out", text: output },
    ]);
    setInputVal("");

    setTimeout(() => {
      terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      runCommand(inputVal);
    }
  };

  const currentTrack = MUSIC_PLAYLIST[trackIdx];

  return (
    <div 
      className={styles.macbookContainer}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.ambientScreenGlow} />

      <motion.div 
        className={styles.macbookFrame}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Display Lid */}
        <div className={styles.displayLid}>
          <div className={styles.screenBezel}>
            {/* Top Camera Notch */}
            <div className={styles.cameraNotch}>
              <div className={styles.cameraLens} />
              <div className={styles.cameraIndicator} />
            </div>

            {/* Inner Screen Glass */}
            <div className={styles.screenGlass}>
              <div className={styles.glassReflection} />

              {/* 1. macOS Menu Bar */}
              <div className={styles.macosMenuBar}>
                <div className={styles.menuLeft}>
                  <span className={styles.appleLogo}></span>
                  <span className={styles.appName}>
                    {activeApp === "terminal" ? "Terminal" : activeApp === "editor" ? "Code" : activeApp === "music" ? "Spotify" : "Activity Monitor"}
                  </span>
                  <span className={styles.menuItem}>File</span>
                  <span className={styles.menuItem}>Edit</span>
                  <span className={styles.menuItem}>View</span>
                  <span className={styles.menuItem}>Help</span>
                </div>

                <div className={styles.menuRight}>
                  <span className={styles.menuStatusPill}>⚡ LIVE</span>
                  <span>📶 5G</span>
                  <span>🔋 100%</span>
                  <span>{currentTime}</span>
                </div>
              </div>

              {/* 2. Desktop Workspace / Active App Window */}
              <div className={styles.desktopArea}>
                <div className={styles.osWindow}>
                  {/* Window Header Bar */}
                  <div className={styles.windowHeader}>
                    <div className={styles.trafficDots}>
                      <div className={styles.dotClose} />
                      <div className={styles.dotMin} />
                      <div className={styles.dotMax} />
                    </div>

                    <div className={styles.windowTitle}>
                      {activeApp === "terminal" && "💻 zsh — saumya@mbp: ~/portfolio"}
                      {activeApp === "editor" && `⚡ visual-studio-code — ${editorFile}`}
                      {activeApp === "music" && "🎵 Spotify — Lo-Fi Coding Beats"}
                      {activeApp === "monitor" && "📊 Activity Monitor — Developer Telemetry"}
                    </div>

                    <div className={styles.windowHeaderRight}>
                      {activeApp === "terminal" ? "zsh 5.9" : activeApp === "editor" ? "UTF-8" : "Active"}
                    </div>
                  </div>

                  {/* App 1: Interactive Terminal */}
                  {activeApp === "terminal" && (
                    <div className={styles.terminalBody}>
                      <div className={styles.terminalScroll}>
                        {terminalHistory.map((item, idx) => (
                          <div key={idx} className={styles.terminalRow}>
                            {item.type === "sys" && (
                              <span style={{ color: "#64748B", fontSize: "8px" }}>{item.text}</span>
                            )}
                            {item.type === "cmd" && (
                              <div>
                                <span className={styles.terminalPrompt}>saumya@mbp</span>
                                <span className={styles.terminalHost}>:~$</span>
                                <span className={styles.terminalCmd}>{item.text}</span>
                              </div>
                            )}
                            {item.type === "out" && (
                              <div className={styles.terminalOutput}>{item.text}</div>
                            )}
                          </div>
                        ))}
                        <div ref={terminalBottomRef} />
                      </div>

                      {/* Quick action chips */}
                      <div className={styles.terminalPillGroup}>
                        {["whoami", "skills", "projects", "stack", "contact", "hire", "clear"].map((cmd) => (
                          <button
                            key={cmd}
                            type="button"
                            className={styles.terminalPill}
                            onClick={() => runCommand(cmd)}
                          >
                            ${cmd}
                          </button>
                        ))}
                      </div>

                      {/* Interactive Prompt Input */}
                      <div className={styles.terminalInputLine}>
                        <span className={styles.terminalPrompt}>saumya@mbp</span>
                        <span className={styles.terminalHost}>:~$</span>
                        <input
                          type="text"
                          className={styles.terminalInput}
                          placeholder="type a command & hit Enter..."
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    </div>
                  )}

                  {/* App 2: Code Editor (VS Code) */}
                  {activeApp === "editor" && (
                    <div className={styles.editorContainer}>
                      <div className={styles.editorTabs}>
                        <div 
                          className={`${styles.editorTab} ${editorFile === "profile.py" ? styles.editorTabActive : ""}`}
                          onClick={() => setEditorFile("profile.py")}
                        >
                          <span>🐍</span> profile.py
                        </div>
                        <div 
                          className={`${styles.editorTab} ${editorFile === "skills.json" ? styles.editorTabActive : ""}`}
                          onClick={() => setEditorFile("skills.json")}
                        >
                          <span>⚙️</span> skills.json
                        </div>
                        <div 
                          className={`${styles.editorTab} ${editorFile === "edge_ai.cpp" ? styles.editorTabActive : ""}`}
                          onClick={() => setEditorFile("edge_ai.cpp")}
                        >
                          <span>⚡</span> edge_ai.cpp
                        </div>
                      </div>

                      <div className={styles.editorCodeBody}>
                        {editorFile === "profile.py" && (
                          <>
                            <div className={styles.codeLine}><span className={styles.lineNum}>1</span><span><span className={styles.codeKw}>class</span> <span className={styles.codeFn}>Engineer</span>:</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>2</span><span>    name = <span className={styles.codeStr}>"Saumya Mirajkar"</span></span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>3</span><span>    focus = [<span className={styles.codeStr}>"Full-Stack"</span>, <span className={styles.codeStr}>"IoT & Embedded"</span>, <span className={styles.codeStr}>"FastAPI"</span>]</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>4</span><span></span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>5</span><span>    <span className={styles.codeKw}>def</span> <span className={styles.codeFn}>build_future</span>(self):</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>6</span><span>        <span className={styles.codeKw}>return</span> &#123;<span className={styles.codeStr}>"drive"</span>: <span className={styles.codeVal}>"100%"</span>, <span className={styles.codeStr}>"impact"</span>: <span className={styles.codeVal}>True</span>&#125;</span></div>
                          </>
                        )}

                        {editorFile === "skills.json" && (
                          <>
                            <div className={styles.codeLine}><span className={styles.lineNum}>1</span><span>&#123;</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>2</span><span>  <span className={styles.codeVar}>"backend"</span>: [<span className={styles.codeStr}>"Python"</span>, <span className={styles.codeStr}>"FastAPI"</span>, <span className={styles.codeStr}>"SQLAlchemy"</span>],</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>3</span><span>  <span className={styles.codeVar}>"frontend"</span>: [<span className={styles.codeStr}>"Next.js"</span>, <span className={styles.codeStr}>"React"</span>, <span className={styles.codeStr}>"Framer Motion"</span>],</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>4</span><span>  <span className={styles.codeVar}>"embedded"</span>: [<span className={styles.codeStr}>"C++"</span>, <span className={styles.codeStr}>"ESP32"</span>, <span className={styles.codeStr}>"MQTT"</span>]</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>5</span><span>&#125;</span></div>
                          </>
                        )}

                        {editorFile === "edge_ai.cpp" && (
                          <>
                            <div className={styles.codeLine}><span className={styles.lineNum}>1</span><span><span className={styles.codeKw}>#include</span> <span className={styles.codeStr}>&lt;wifi_telemetry.h&gt;</span></span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>2</span><span><span className={styles.codeKw}>void</span> <span className={styles.codeFn}>setup</span>() &#123;</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>3</span><span>  <span className={styles.codeFn}>Serial.begin</span>(<span className={styles.codeVal}>115200</span>);</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>4</span><span>  <span className={styles.codeFn}>connectTelemetryNode</span>(<span className={styles.codeStr}>"saumya-edge-01"</span>);</span></div>
                            <div className={styles.codeLine}><span className={styles.lineNum}>5</span><span>&#125;</span></div>
                          </>
                        )}
                      </div>

                      <div className={styles.editorStatusBar}>
                        <span>🐍 Python 3.13 • Git: main*</span>
                        <span>Ln 6, Col 32 • UTF-8</span>
                      </div>
                    </div>
                  )}

                  {/* App 3: Music Player (Spotify Widget) */}
                  {activeApp === "music" && (
                    <div className={styles.musicPlayerBody}>
                      <div className={styles.musicCard}>
                        <div className={styles.musicTrackRow}>
                          <div className={styles.musicArt}>🎧</div>
                          <div className={styles.musicInfo}>
                            <span className={styles.musicTitle}>{currentTrack.title}</span>
                            <span className={styles.musicArtist}>{currentTrack.artist} • {currentTrack.mood}</span>
                          </div>
                        </div>

                        {/* Animated Equalizer */}
                        <div className={styles.equalizerTrack}>
                          {[40, 75, 55, 90, 100, 60, 35, 80, 95, 50, 65, 85, 45, 90].map((h, i) => (
                            <div 
                              key={i}
                              className={styles.eqBar}
                              style={{
                                height: isPlaying ? `${Math.min(100, h * (0.6 + (i % 3) * 0.2))}%` : "15%",
                                opacity: isPlaying ? 0.9 : 0.4,
                              }}
                            />
                          ))}
                        </div>

                        {/* Controls */}
                        <div className={styles.musicControls}>
                          <button 
                            type="button" 
                            className={styles.ctrlBtn} 
                            onClick={() => setTrackIdx((prev) => (prev > 0 ? prev - 1 : MUSIC_PLAYLIST.length - 1))}
                          >
                            ⏮ Prev
                          </button>

                          <button 
                            type="button" 
                            className={styles.ctrlPlay}
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? "❚❚" : "▶"}
                          </button>

                          <button 
                            type="button" 
                            className={styles.ctrlBtn}
                            onClick={() => setTrackIdx((prev) => (prev + 1) % MUSIC_PLAYLIST.length)}
                          >
                            Next ⏭
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* App 4: Activity Monitor / Telemetry */}
                  {activeApp === "monitor" && (
                    <div className={styles.monitorBody}>
                      <div className={styles.monitorGrid}>
                        <div className={styles.monitorCard}>
                          <span className={styles.monitorLabel}>CPU Load</span>
                          <div className={styles.monitorValue}>
                            <span>{cpuVal}%</span>
                            <span className={styles.monitorSub}>8 Cores Active</span>
                          </div>
                          <div className={styles.monitorProgressTrack}>
                            <div className={styles.monitorProgressFill} style={{ width: `${cpuVal * 12}%` }} />
                          </div>
                        </div>

                        <div className={styles.monitorCard}>
                          <span className={styles.monitorLabel}>RAM Allocation</span>
                          <div className={styles.monitorValue}>
                            <span>{ramVal} GB</span>
                            <span className={styles.monitorSub}>/ 16 GB</span>
                          </div>
                          <div className={styles.monitorProgressTrack}>
                            <div className={styles.monitorProgressFill} style={{ width: `${(ramVal / 16) * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className={styles.gitCommitBar}>
                        <span>⚡ GitHub Activity: <strong>520+ Contributions</strong></span>
                        <span style={{ color: "#38BDF8" }}>99.9% Build Pass</span>
                      </div>

                      <div className={styles.gitCommitBar}>
                        <span>🌐 Network Throughput: <strong>{netSpeed} MB/s</strong></span>
                        <span style={{ color: "#34D399" }}>Pune, IN • 12ms</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. macOS Floating Dock */}
                <div className={styles.macosDock}>
                  <div 
                    className={`${styles.dockItem} ${activeApp === "terminal" ? styles.dockItemActive : ""}`}
                    onClick={() => setActiveApp("terminal")}
                    title="Terminal"
                    role="button"
                    tabIndex={0}
                  >
                    <span>💻</span>
                    {activeApp === "terminal" && <div className={styles.dockDot} />}
                  </div>

                  <div 
                    className={`${styles.dockItem} ${activeApp === "editor" ? styles.dockItemActive : ""}`}
                    onClick={() => setActiveApp("editor")}
                    title="VS Code"
                    role="button"
                    tabIndex={0}
                  >
                    <span>⚡</span>
                    {activeApp === "editor" && <div className={styles.dockDot} />}
                  </div>

                  <div 
                    className={`${styles.dockItem} ${activeApp === "music" ? styles.dockItemActive : ""}`}
                    onClick={() => setActiveApp("music")}
                    title="Spotify"
                    role="button"
                    tabIndex={0}
                  >
                    <span>🎵</span>
                    {activeApp === "music" && <div className={styles.dockDot} />}
                  </div>

                  <div 
                    className={`${styles.dockItem} ${activeApp === "monitor" ? styles.dockItemActive : ""}`}
                    onClick={() => setActiveApp("monitor")}
                    title="Activity Monitor"
                    role="button"
                    tabIndex={0}
                  >
                    <span>📊</span>
                    {activeApp === "monitor" && <div className={styles.dockDot} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MacBook Base & Hinge */}
        <div className={styles.macbookBase}>
          <div className={styles.baseHingeNotch} />
        </div>

        {/* Ground Drop Shadow */}
        <div className={styles.macbookShadow} />
      </motion.div>
    </div>
  );
}
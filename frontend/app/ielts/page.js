"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStoredAuthToken,
  setStoredAuthToken,
  clearStoredAuthToken,
  verifyPasscode,
  getIELTSLogs,
  createIELTSLog,
  updateIELTSLog,
  deleteIELTSLog,
  getIELTSStats,
  getIELTSSettings,
  updateIELTSSettings,
  rawToBand,
  calculateWritingBand,
  calculateOverallBand,
} from "@/lib/ielts";
import styles from "./ielts.module.css";

function fmtBand(val, fallback = "0.0") {
  if (val === null || val === undefined || val === "") return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num.toFixed(1);
}

const TABS = [
  { id: "logger", label: "📝 Log Today's Practice" },
  { id: "analytics", label: "📈 Analytics & Trends" },
  { id: "history", label: "📅 History & Records" },
  { id: "converter", label: "🧮 Score Converter" },
  { id: "settings", label: "⚙️ Target & Settings" },
];

export default function IELTSPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // App state
  const [activeTab, setActiveTab] = useState("logger");
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formTestType, setFormTestType] = useState("Academic");
  const [formTestSource, setFormTestSource] = useState("");

  // Modules State — All set to 0 clean slate
  const [listeningRaw, setListeningRaw] = useState(0);
  const [listeningBand, setListeningBand] = useState(0.0);
  const [listeningNotes, setListeningNotes] = useState("");

  const [readingRaw, setReadingRaw] = useState(0);
  const [readingBand, setReadingBand] = useState(0.0);
  const [readingNotes, setReadingNotes] = useState("");

  const [writingTask1, setWritingTask1] = useState(0.0);
  const [writingTask2, setWritingTask2] = useState(0.0);
  const [writingBand, setWritingBand] = useState(0.0);
  const [writingPrompt, setWritingPrompt] = useState("");
  const [writingNotes, setWritingNotes] = useState("");

  const [speakingBand, setSpeakingBand] = useState(0.0);
  const [speakingCueCard, setSpeakingCueCard] = useState("");
  const [speakingNotes, setSpeakingNotes] = useState("");

  const [studyMinutes, setStudyMinutes] = useState(60);
  const [whatWentWell, setWhatWentWell] = useState("");
  const [mistakesToFix, setMistakesToFix] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [searchFilter, setSearchFilter] = useState("");

  // Converter tool state
  const [convModule, setConvModule] = useState("listening");
  const [convType, setConvType] = useState("Academic");
  const [convRaw, setConvRaw] = useState(0);

  // Settings form state
  const [targetOverall, setTargetOverall] = useState(8.0);
  const [targetListening, setTargetListening] = useState(8.5);
  const [targetReading, setTargetReading] = useState(8.5);
  const [targetWriting, setTargetWriting] = useState(7.5);
  const [targetSpeaking, setTargetSpeaking] = useState(7.5);
  const [examDate, setExamDate] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("idle");

  // Always start strictly locked on mount
  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  // Fetch data on auth
  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [logsData, statsData, settingsData] = await Promise.all([
        getIELTSLogs(),
        getIELTSStats(),
        getIELTSSettings(),
      ]);
      setLogs(logsData || []);
      setStats(statsData);
      setSettings(settingsData);

      if (settingsData) {
        setTargetOverall(settingsData.target_overall_band || 8.0);
        setTargetListening(settingsData.target_listening_band || 8.5);
        setTargetReading(settingsData.target_reading_band || 8.5);
        setTargetWriting(settingsData.target_writing_band || 7.5);
        setTargetSpeaking(settingsData.target_speaking_band || 7.5);
        setExamDate(settingsData.exam_date || "");
      }
    } catch (e) {
      console.error("Failed to load IELTS data", e);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Live score recalculations
  useEffect(() => {
    setListeningBand(rawToBand(listeningRaw, "listening", formTestType));
  }, [listeningRaw, formTestType]);

  useEffect(() => {
    setReadingBand(rawToBand(readingRaw, "reading", formTestType));
  }, [readingRaw, formTestType]);

  useEffect(() => {
    setWritingBand(calculateWritingBand(writingTask1, writingTask2));
  }, [writingTask1, writingTask2]);

  const liveOverallBand = useMemo(() => {
    return calculateOverallBand(listeningBand, readingBand, writingBand, speakingBand);
  }, [listeningBand, readingBand, writingBand, speakingBand]);

  // Handle Passcode Submit
  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError("Please enter your secret passcode.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");

    const res = await verifyPasscode(passcode.trim(), rememberMe);
    if (res.ok) {
      setIsAuthenticated(true);
      setPasscode("");
    } else {
      setAuthError(res.error || "Access Denied: Incorrect passcode.");
    }
    setAuthLoading(false);
  };

  const handleLock = () => {
    clearStoredAuthToken();
    setIsAuthenticated(false);
  };

  // Handle Save Log
  const handleSaveLog = async (e) => {
    e.preventDefault();
    setSaveStatus("saving");

    const payload = {
      date: formDate,
      test_type: formTestType,
      test_source: formTestSource.trim() || "Cambridge Practice Test",
      listening_raw: parseInt(listeningRaw, 10) || 0,
      listening_band: listeningBand || 0.0,
      listening_notes: listeningNotes.trim(),
      reading_raw: parseInt(readingRaw, 10) || 0,
      reading_band: readingBand || 0.0,
      reading_notes: readingNotes.trim(),
      writing_task1_band: parseFloat(writingTask1) || 0.0,
      writing_task2_band: parseFloat(writingTask2) || 0.0,
      writing_band: writingBand || 0.0,
      writing_prompt: writingPrompt.trim(),
      writing_notes: writingNotes.trim(),
      speaking_band: parseFloat(speakingBand) || 0.0,
      speaking_cue_card: speakingCueCard.trim(),
      speaking_notes: speakingNotes.trim(),
      overall_band: liveOverallBand || 0.0,
      study_duration_minutes: parseInt(studyMinutes, 10) || 60,
      what_went_well: whatWentWell.trim(),
      mistakes_to_fix: mistakesToFix.trim(),
    };

    let res;
    if (editingId) {
      res = await updateIELTSLog(editingId, payload);
    } else {
      res = await createIELTSLog(payload);
    }

    if (res.ok) {
      setSaveStatus("success");
      setEditingId(null);
      // Reset form to 0 clean slate
      setListeningRaw(0);
      setListeningNotes("");
      setReadingRaw(0);
      setReadingNotes("");
      setWritingTask1(0.0);
      setWritingTask2(0.0);
      setWritingPrompt("");
      setWritingNotes("");
      setSpeakingBand(0.0);
      setSpeakingCueCard("");
      setSpeakingNotes("");
      setWhatWentWell("");
      setMistakesToFix("");
      setFormTestSource("");

      await loadData();
      setTimeout(() => setSaveStatus("idle"), 3500);
      setActiveTab("analytics");
    } else {
      setSaveStatus("error");
    }
  };

  // Edit Log
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormDate(item.date);
    setFormTestType(item.test_type || "Academic");
    setFormTestSource(item.test_source || "");
    setListeningRaw(item.listening_raw || 0);
    setListeningNotes(item.listening_notes || "");
    setReadingRaw(item.reading_raw || 0);
    setReadingNotes(item.reading_notes || "");
    setWritingTask1(item.writing_task1_band || 0.0);
    setWritingTask2(item.writing_task2_band || 0.0);
    setWritingPrompt(item.writing_prompt || "");
    setWritingNotes(item.writing_notes || "");
    setSpeakingBand(item.speaking_band || 0.0);
    setSpeakingCueCard(item.speaking_cue_card || "");
    setSpeakingNotes(item.speaking_notes || "");
    setStudyMinutes(item.study_duration_minutes || 60);
    setWhatWentWell(item.what_went_well || "");
    setMistakesToFix(item.mistakes_to_fix || "");
    setActiveTab("logger");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Log
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this practice log?")) {
      await deleteIELTSLog(id);
      await loadData();
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsStatus("saving");
    const payload = {
      target_overall_band: parseFloat(targetOverall),
      target_listening_band: parseFloat(targetListening),
      target_reading_band: parseFloat(targetReading),
      target_writing_band: parseFloat(targetWriting),
      target_speaking_band: parseFloat(targetSpeaking),
      exam_date: examDate,
      new_passcode: newPasscode.trim() || undefined,
    };
    const res = await updateIELTSSettings(payload);
    if (res.ok) {
      setSettingsStatus("success");
      setNewPasscode("");
      await loadData();
      setTimeout(() => setSettingsStatus("idle"), 3000);
    } else {
      setSettingsStatus("error");
    }
  };

  // Export Data JSON
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `saumya_ielts_logs_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Seed Demo Week if empty
  const handleSeedSample = async () => {
    const samples = [
      {
        date: "2026-09-17",
        test_type: "Academic",
        test_source: "Cambridge 18 — Test 4",
        listening_raw: 36,
        listening_band: 8.5,
        listening_notes: "Strong on Section 4 multiple choice. Keep practicing spelling of names.",
        reading_raw: 35,
        reading_band: 8.0,
        reading_notes: "Fast scan on Passage 2. Completed with 6 mins left.",
        writing_task1_band: 7.5,
        writing_task2_band: 8.0,
        writing_band: 8.0,
        writing_prompt: "Technology in education: advantages and drawbacks.",
        writing_notes: "Well structured PEEL paragraphs. Good lexical collocations.",
        speaking_band: 8.0,
        speaking_cue_card: "Describe an innovative tech project you built.",
        speaking_notes: "Used natural intonation and idiomatic vocabulary.",
        overall_band: 8.0,
        study_duration_minutes: 150,
        what_went_well: "Hit overall Band 8.0 milestone! Balanced across all 4 modules.",
        mistakes_to_fix: "Double check hyphenated words in listening.",
      },
      {
        date: "2026-09-16",
        test_type: "Academic",
        test_source: "Cambridge 18 — Test 3",
        listening_raw: 34,
        listening_band: 7.5,
        listening_notes: "Lost focus during section 3 audio distractor.",
        reading_raw: 33,
        reading_band: 7.5,
        reading_notes: "T/F/NG questions had tricky synonyms in Paragraph E.",
        writing_task1_band: 7.0,
        writing_task2_band: 7.5,
        writing_band: 7.5,
        writing_prompt: "Urban vs rural environmental impact.",
        writing_notes: "Task 1 bar chart overview was crisp.",
        speaking_band: 7.5,
        speaking_cue_card: "Describe a memorable journey you took.",
        speaking_notes: "Fluency was smooth, need more conditional sentences.",
        overall_band: 7.5,
        study_duration_minutes: 130,
        what_went_well: "Writing task 2 timing improved to 38 minutes.",
        mistakes_to_fix: "Practice True/False/Not Given keyword matching.",
      },
      {
        date: "2026-09-15",
        test_type: "Academic",
        test_source: "Cambridge 18 — Test 2",
        listening_raw: 35,
        listening_band: 8.0,
        listening_notes: "Section 1 and 2 perfect 20/20.",
        reading_raw: 32,
        reading_band: 7.5,
        reading_notes: "Passage 3 science article was dense.",
        writing_task1_band: 7.0,
        writing_task2_band: 7.0,
        writing_band: 7.0,
        writing_prompt: "Government funding on space exploration.",
        writing_notes: "Good cohesive devices, work on complex punctuation.",
        speaking_band: 7.5,
        speaking_cue_card: "Describe a leader you admire.",
        speaking_notes: "Good vocabulary for leadership and ethics.",
        overall_band: 7.5,
        study_duration_minutes: 120,
        what_went_well: "Listening Section 1 accuracy.",
        mistakes_to_fix: "Time management on Reading passage 3.",
      },
    ];

    for (const sample of samples) {
      await createIELTSLog(sample);
    }
    await loadData();
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!searchFilter.trim()) return logs;
    const q = searchFilter.toLowerCase();
    return logs.filter(
      (l) =>
        (l.date && l.date.includes(q)) ||
        (l.test_source && l.test_source.toLowerCase().includes(q)) ||
        (l.test_type && l.test_type.toLowerCase().includes(q)) ||
        (l.what_went_well && l.what_went_well.toLowerCase().includes(q)) ||
        (l.mistakes_to_fix && l.mistakes_to_fix.toLowerCase().includes(q))
    );
  }, [logs, searchFilter]);

  // ------------------------------------------------------------
  // 1. RENDER: Passcode Lock Screen
  // ------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.lockGateContainer}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={styles.lockCard}
          >
            <div className={styles.lockIconWrap}>🔒</div>

            <h1 className={styles.lockTitle}>Restricted System Vault</h1>
            <p className={styles.lockSubtitle}>
              Private security clearance required. Enter your passcode to decrypt access.
            </p>

            <form className={styles.lockForm} onSubmit={handleUnlock}>
              <div className={styles.passcodeInputGroup}>
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={styles.passcodeInput}
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.togglePassBtn}
                  onClick={() => setShowPasscode((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPasscode ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "12px", color: "#94A3B8" }}>
                <a href="/" style={{ color: "#38BDF8", textDecoration: "none" }}>
                  ← Return to Portfolio
                </a>
              </div>

              {authError && <div className={styles.errorMsg}>{authError}</div>}

              <button type="submit" className={styles.unlockBtn} disabled={authLoading}>
                {authLoading ? "Verifying..." : "Authenticate & Decrypt ⚡"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // 2. RENDER: Authenticated Command Center Dashboard
  // ------------------------------------------------------------
  return (
    <div className={styles.pageWrapper}>
      {/* Top Sticky Header */}
      <header className={styles.dashboardHeader}>
        <div className="wrap headerInner" style={{ width: "min(1400px, calc(100% - 48px))", margin: "0 auto" }}>
          <div className={styles.headerBrand}>
            <span className={styles.vaultBadge}>
              <span className={styles.badgeDot} />
              VAULT UNLOCKED
            </span>
            <div className={styles.headerTitleGroup}>
              <span className={styles.headerMainTitle}>IELTS Daily Command Center</span>
              <span className={styles.headerSubTitle}>
                Saumya Mirajkar • Daily Practice &amp; Band Intelligence
              </span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={`${styles.headerBtn} ${styles.headerBtnPrimary}`}
              onClick={() => {
                setEditingId(null);
                setActiveTab("logger");
              }}
            >
              + Log Today's Practice
            </button>

            <button
              className={`${styles.headerBtn} ${styles.headerBtnSecondary}`}
              onClick={handleExport}
              title="Export all records as JSON backup"
            >
              📥 Backup
            </button>

            <a
              href="/"
              className={`${styles.headerBtn} ${styles.headerBtnSecondary}`}
              title="Go to main portfolio site"
            >
              Portfolio ↗
            </a>

            <button
              className={`${styles.headerBtn} ${styles.headerBtnSecondary}`}
              onClick={handleLock}
              title="Lock secret session"
            >
              🔒 Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="wrap" style={{ width: "min(1400px, calc(100% - 48px))", margin: "0 auto" }}>
        {/* Top 5 KPI Metrics Banner */}
        <div className={styles.metricsGrid}>
          {/* 1. Overall Band */}
          <div className={`${styles.metricCard} ${styles.metricCardHero}`}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Overall Average</span>
              <span className={styles.metricIcon}>🏆</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {fmtBand(stats?.average_overall)}
              </span>
              <span className={styles.metricTarget}>/ Band {fmtBand(targetOverall)} Target</span>
            </div>
            <div className={styles.metricFooter}>
              <span>Best: Band {fmtBand(stats?.best_overall_band)}</span>
              <span className={styles.metricBadge}>
                {stats?.current_streak_days ? `🔥 ${stats.current_streak_days} Day Streak` : "0 Day Streak"}
              </span>
            </div>
          </div>

          {/* 2. Listening */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Listening</span>
              <span className={styles.metricIcon}>🎧</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {fmtBand(stats?.average_listening)}
              </span>
              <span className={styles.metricTarget}>Band</span>
            </div>
            <div className={styles.metricFooter}>
              <span>Target: Band {fmtBand(targetListening)}</span>
              <span className={styles.metricBadge}>Raw: /40</span>
            </div>
          </div>

          {/* 3. Reading */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Reading</span>
              <span className={styles.metricIcon}>📖</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {fmtBand(stats?.average_reading)}
              </span>
              <span className={styles.metricTarget}>Band</span>
            </div>
            <div className={styles.metricFooter}>
              <span>Target: Band {fmtBand(targetReading)}</span>
              <span className={styles.metricBadge}>{formTestType}</span>
            </div>
          </div>

          {/* 4. Writing */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Writing</span>
              <span className={styles.metricIcon}>✍️</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {fmtBand(stats?.average_writing)}
              </span>
              <span className={styles.metricTarget}>Band</span>
            </div>
            <div className={styles.metricFooter}>
              <span>Target: Band {fmtBand(targetWriting)}</span>
              <span className={styles.metricBadge}>Task 1 + 2</span>
            </div>
          </div>

          {/* 5. Speaking */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Speaking</span>
              <span className={styles.metricIcon}>🗣️</span>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricValue}>
                {fmtBand(stats?.average_speaking)}
              </span>
              <span className={styles.metricTarget}>Band</span>
            </div>
            <div className={styles.metricFooter}>
              <span>Target: Band {fmtBand(targetSpeaking)}</span>
              <span className={styles.metricBadge}>Interview</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}

          {logs.length === 0 && (
            <button
              className={styles.tabBtn}
              onClick={handleSeedSample}
              style={{ marginLeft: "auto", color: "#38BDF8", borderColor: "rgba(56, 189, 248, 0.3)" }}
            >
              ⚡ Load Sample Week Data
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------
            TAB 1: Practice Logger Form
           ------------------------------------------------------------ */}
        {activeTab === "logger" && (
          <form onSubmit={handleSaveLog}>
            <div className={styles.loggerGrid}>
              {/* Left Column: 4 Modules Inputs */}
              <div className={styles.loggerMain}>
                {/* Session Meta */}
                <div className={styles.formCard}>
                  <div className={styles.cardSectionTitle}>
                    <span>📅 Test Session Information</span>
                  </div>
                  <div className={styles.scoreInputsRow} style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div className={styles.inputField}>
                      <label className={styles.inputLabel}>Practice Date</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className={styles.textInput}
                        required
                      />
                    </div>

                    <div className={styles.inputField}>
                      <label className={styles.inputLabel}>IELTS Stream</label>
                      <select
                        value={formTestType}
                        onChange={(e) => setFormTestType(e.target.value)}
                        className={styles.textInput}
                      >
                        <option value="Academic">Academic</option>
                        <option value="General">General Training</option>
                      </select>
                    </div>

                    <div className={styles.inputField}>
                      <label className={styles.inputLabel}>Study Time (Minutes)</label>
                      <input
                        type="number"
                        min="10"
                        max="600"
                        value={studyMinutes}
                        onChange={(e) => setStudyMinutes(e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>Test Material / Source</label>
                    <input
                      type="text"
                      placeholder="e.g. Cambridge 18 — Academic Test 2"
                      value={formTestSource}
                      onChange={(e) => setFormTestSource(e.target.value)}
                      className={styles.textInput}
                      required
                    />
                  </div>
                </div>

                {/* Module 1: Listening */}
                <div className={styles.moduleInputCard}>
                  <div className={styles.moduleHeaderRow}>
                    <span className={styles.moduleName}>
                      <span>🎧</span> 1. Listening Module
                    </span>
                    <span className={styles.calculatedBandPill}>
                      Band {fmtBand(listeningBand)} ({listeningRaw}/40)
                    </span>
                  </div>

                  <div className={styles.rangeSliderRow}>
                    <span className={styles.inputLabel} style={{ minWidth: "120px" }}>Raw Score (0-40):</span>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={listeningRaw}
                      onChange={(e) => setListeningRaw(e.target.value)}
                      className={styles.rangeSlider}
                    />
                    <span className={styles.sliderValueDisplay}>{listeningRaw} / 40</span>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>Section Notes &amp; Mistakes to Avoid</label>
                    <textarea
                      placeholder="e.g. Lost 2 marks on Section 3 multiple choice distractor. Need to pre-read question stems."
                      value={listeningNotes}
                      onChange={(e) => setListeningNotes(e.target.value)}
                      className={`${styles.textInput} ${styles.textareaInput}`}
                    />
                  </div>
                </div>

                {/* Module 2: Reading */}
                <div className={styles.moduleInputCard}>
                  <div className={styles.moduleHeaderRow}>
                    <span className={styles.moduleName}>
                      <span>📖</span> 2. Reading Module
                    </span>
                    <span className={styles.calculatedBandPill}>
                      Band {fmtBand(readingBand)} ({readingRaw}/40)
                    </span>
                  </div>

                  <div className={styles.rangeSliderRow}>
                    <span className={styles.inputLabel} style={{ minWidth: "120px" }}>Raw Score (0-40):</span>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={readingRaw}
                      onChange={(e) => setReadingRaw(e.target.value)}
                      className={styles.rangeSlider}
                    />
                    <span className={styles.sliderValueDisplay}>{readingRaw} / 40</span>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>Passage Notes &amp; Question Types</label>
                    <textarea
                      placeholder="e.g. Passage 3 science article was dense. True/False/Not Given questions took 22 minutes."
                      value={readingNotes}
                      onChange={(e) => setReadingNotes(e.target.value)}
                      className={`${styles.textInput} ${styles.textareaInput}`}
                    />
                  </div>
                </div>

                {/* Module 3: Writing */}
                <div className={styles.moduleInputCard}>
                  <div className={styles.moduleHeaderRow}>
                    <span className={styles.moduleName}>
                      <span>✍️</span> 3. Writing Module
                    </span>
                    <span className={styles.calculatedBandPill}>
                      Calculated Band {fmtBand(writingBand)} (Task 1: {writingTask1} • Task 2: {writingTask2})
                    </span>
                  </div>

                  <div className={styles.scoreInputsRow}>
                    <div className={styles.inputField}>
                      <label className={styles.inputLabel}>Task 1 Band (1/3 weight)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        value={writingTask1}
                        onChange={(e) => setWritingTask1(e.target.value)}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.inputField}>
                      <label className={styles.inputLabel}>Task 2 Essay Band (2/3 weight)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        value={writingTask2}
                        onChange={(e) => setWritingTask2(e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>Essay Topic / Prompt</label>
                    <input
                      type="text"
                      placeholder="e.g. Some argue technology improves classroom collaboration..."
                      value={writingPrompt}
                      onChange={(e) => setWritingPrompt(e.target.value)}
                      className={styles.textInput}
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>Evaluation Notes &amp; Lexical Improvements</label>
                    <textarea
                      placeholder="e.g. Good paragraph structure. Used 'inadvertently', 'counterproductive'. Need to balance conclusion."
                      value={writingNotes}
                      onChange={(e) => setWritingNotes(e.target.value)}
                      className={`${styles.textInput} ${styles.textareaInput}`}
                    />
                  </div>
                </div>

                {/* Module 4: Speaking */}
                <div className={styles.moduleInputCard}>
                  <div className={styles.moduleHeaderRow}>
                    <span className={styles.moduleName}>
                      <span>🗣️</span> 4. Speaking Module
                    </span>
                    <span className={styles.calculatedBandPill}>
                      Band {fmtBand(speakingBand)}
                    </span>
                  </div>

                  <div className={styles.scoreInputsRow}>
                    <div className={styles.inputField}>
                      <label className={styles.inputLabel}>Estimated Speaking Band</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        value={speakingBand}
                        onChange={(e) => setSpeakingBand(e.target.value)}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.inputField}>
                      <label className={styles.inputLabel}>Cue Card Topic (Part 2)</label>
                      <input
                        type="text"
                        placeholder="e.g. Describe an ambitious project you worked on."
                        value={speakingCueCard}
                        onChange={(e) => setSpeakingCueCard(e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>Fluency, Pronunciation &amp; Vocabulary Feedback</label>
                    <textarea
                      placeholder="e.g. Maintained continuous flow for 2 minutes on Part 2. Work on reducing 'umm' pauses in Part 3."
                      value={speakingNotes}
                      onChange={(e) => setSpeakingNotes(e.target.value)}
                      className={`${styles.textInput} ${styles.textareaInput}`}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Overall Score + Action Panel */}
              <div className={styles.loggerSide}>
                {/* Live Overall Band Banner */}
                <div className={styles.overallBandBanner}>
                  <div>
                    <span className={styles.overallBandLabel}>Predicted Overall Band</span>
                    <div className={styles.overallBandBig}>
                      {fmtBand(liveOverallBand)}
                    </div>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                      Official Cambridge IELTS Mean Rounding
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "24px" }}>🎯</div>
                    <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: "700" }}>
                      Target: {fmtBand(targetOverall)}
                    </span>
                  </div>
                </div>

                {/* Qualitative Reflection */}
                <div className={styles.formCard}>
                  <div className={styles.cardSectionTitle}>
                    <span>💡 Daily Reflection</span>
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>🌟 What Went Well Today?</label>
                    <textarea
                      placeholder="e.g. High focus during Section 4 listening. Writing Task 2 was completed in under 40 mins."
                      value={whatWentWell}
                      onChange={(e) => setWhatWentWell(e.target.value)}
                      className={`${styles.textInput} ${styles.textareaInput}`}
                    />
                  </div>

                  <div className={styles.inputField}>
                    <label className={styles.inputLabel}>⚠️ Key Mistakes to Fix Tomorrow</label>
                    <textarea
                      placeholder="e.g. Double-check singular/plural nouns in listening. Practice 3 True/False passages."
                      value={mistakesToFix}
                      onChange={(e) => setMistakesToFix(e.target.value)}
                      className={`${styles.textInput} ${styles.textareaInput}`}
                    />
                  </div>

                  <button type="submit" className={styles.saveLogBtn} disabled={saveStatus === "saving"}>
                    {saveStatus === "saving"
                      ? "Saving Practice Log..."
                      : editingId
                      ? "Update Practice Log 💾"
                      : "Save Today's Practice Log 🚀"}
                  </button>

                  {saveStatus === "success" && (
                    <div style={{ color: "#4ADE80", fontSize: "13px", textAlign: "center", fontWeight: "600" }}>
                      ✓ Practice log recorded successfully!
                    </div>
                  )}

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className={styles.btnSm}
                      style={{ padding: "10px", marginTop: "4px" }}
                    >
                      Cancel Edit Mode
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------
            TAB 2: Analytics & Progression Charts
           ------------------------------------------------------------ */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Progression Chart Card */}
            <div className={styles.chartContainer}>
              <div className={styles.cardSectionTitle}>
                <span>📈 Band Progression Over Time</span>
                <span style={{ fontSize: "12px", color: "#94A3B8", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                  {logs.length} Recorded Tests
                </span>
              </div>

              {logs.length > 0 ? (
                <div>
                  <svg className={styles.chartSvg} viewBox="0 0 800 200">
                    {/* Grid Lines */}
                    {[5, 6, 7, 8, 9].map((b) => {
                      const y = 180 - ((b - 4) / 5) * 160;
                      return (
                        <g key={b}>
                          <line x1="40" y1={y} x2="780" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                          <text x="15" y={y + 4} fill="#64748B" fontSize="10" fontFamily="monospace">
                            {b}.0
                          </text>
                        </g>
                      );
                    })}

                    {/* Overall Score Line */}
                    {(() => {
                      const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
                      const points = sorted.map((l, i) => {
                        const x = 50 + (i / Math.max(sorted.length - 1, 1)) * 710;
                        const y = 180 - ((Math.min(9, Math.max(4, l.overall_band)) - 4) / 5) * 160;
                        return { x, y, band: l.overall_band, date: l.date };
                      });

                      const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

                      return (
                        <>
                          <path d={pathD} fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                          {points.map((p, idx) => (
                            <g key={idx}>
                              <circle cx={p.x} cy={p.y} r="5" fill="#05080E" stroke="#38BDF8" strokeWidth="2.5" />
                              <text x={p.x} y={p.y - 10} fill="#FFFFFF" fontSize="10" textAnchor="middle" fontWeight="bold">
                                {p.band}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>

                  <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "16px", fontSize: "12px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#38BDF8" }}>
                      <span style={{ width: "12px", height: "3px", background: "#38BDF8", borderRadius: "2px" }} />
                      Overall Band
                    </span>
                    <span style={{ color: "#94A3B8" }}>🎯 Target: Band {fmtBand(targetOverall)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>
                  No practice tests logged yet. Log your first test or click "Load Sample Week Data" to view trends.
                </div>
              )}
            </div>

            {/* Module Balance Matrix */}
            <div className={styles.formCard}>
              <div className={styles.cardSectionTitle}>
                <span>📊 Module Balance &amp; Strength Breakdown</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "12px" }}>
                {[
                  { name: "Listening", val: stats?.average_listening || 0, target: targetListening, icon: "🎧" },
                  { name: "Reading", val: stats?.average_reading || 0, target: targetReading, icon: "📖" },
                  { name: "Writing", val: stats?.average_writing || 0, target: targetWriting, icon: "✍️" },
                  { name: "Speaking", val: stats?.average_speaking || 0, target: targetSpeaking, icon: "🗣️" },
                ].map((m) => {
                  const pct = Math.min(100, ((parseFloat(m.val) || 0) / 9.0) * 100);
                  return (
                    <div key={m.name} className={styles.moduleInputCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "700", color: "#FFF" }}>{m.icon} {m.name}</span>
                        <span style={{ fontFamily: "monospace", color: "#38BDF8", fontWeight: "700" }}>
                          {fmtBand(m.val)}
                        </span>
                      </div>

                      <div style={{ position: "relative", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#1683FF", borderRadius: "4px" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748B" }}>
                        <span>Avg: {fmtBand(m.val, "—")}</span>
                        <span>Target: {fmtBand(m.target)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            TAB 3: History & Records Table
           ------------------------------------------------------------ */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <input
                type="text"
                placeholder="🔍 Search past logs by date, test book, or notes..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className={styles.textInput}
                style={{ maxWidth: "420px" }}
              />
              <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                Showing <strong>{filteredLogs.length}</strong> practice sessions
              </span>
            </div>

            <div className={styles.historyCardList}>
              {filteredLogs.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <div className={styles.historyHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className={styles.historyDateBadge}>
                        📅 {item.date}
                      </span>
                      <span className={styles.historySource}>
                        <strong>{item.test_source || "Practice Test"}</strong> ({item.test_type})
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className={styles.calculatedBandPill} style={{ fontSize: "14px", padding: "6px 14px" }}>
                        Overall Band {fmtBand(item.overall_band, "—")}
                      </span>
                    </div>
                  </div>

                  {/* 4 Modules Scores Pill Row */}
                  <div className={styles.historyScoresRow}>
                    <div className={styles.historyScoreBox}>
                      <span className={styles.historyScoreLabel}>🎧 LISTENING</span>
                      <span className={styles.historyScoreVal}>
                        Band {fmtBand(item.listening_band, "—")}
                        {item.listening_raw !== null && <span style={{ fontSize: "11px", color: "#94A3B8" }}> ({item.listening_raw}/40)</span>}
                      </span>
                    </div>

                    <div className={styles.historyScoreBox}>
                      <span className={styles.historyScoreLabel}>📖 READING</span>
                      <span className={styles.historyScoreVal}>
                        Band {fmtBand(item.reading_band, "—")}
                        {item.reading_raw !== null && <span style={{ fontSize: "11px", color: "#94A3B8" }}> ({item.reading_raw}/40)</span>}
                      </span>
                    </div>

                    <div className={styles.historyScoreBox}>
                      <span className={styles.historyScoreLabel}>✍️ WRITING</span>
                      <span className={styles.historyScoreVal}>
                        Band {fmtBand(item.writing_band, "—")}
                        {item.writing_task1_band && <span style={{ fontSize: "10px", color: "#94A3B8" }}> (T1:{item.writing_task1_band} T2:{item.writing_task2_band})</span>}
                      </span>
                    </div>

                    <div className={styles.historyScoreBox}>
                      <span className={styles.historyScoreLabel}>🗣️ SPEAKING</span>
                      <span className={styles.historyScoreVal}>
                        Band {fmtBand(item.speaking_band, "—")}
                      </span>
                    </div>

                    <div className={styles.historyScoreBox}>
                      <span className={styles.historyScoreLabel}>⏱️ DURATION</span>
                      <span className={styles.historyScoreVal}>{item.study_duration_minutes || 60}m</span>
                    </div>
                  </div>

                  {/* Qualitative Notes */}
                  {(item.what_went_well || item.mistakes_to_fix || item.writing_prompt) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12.5px" }}>
                      {item.what_went_well && (
                        <div style={{ background: "rgba(34, 197, 94, 0.06)", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: "8px", padding: "8px 12px" }}>
                          <span style={{ color: "#4ADE80", fontWeight: "700" }}>🌟 What Went Well: </span>
                          <span style={{ color: "#E2E8F0" }}>{item.what_went_well}</span>
                        </div>
                      )}

                      {item.mistakes_to_fix && (
                        <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "8px 12px" }}>
                          <span style={{ color: "#F87171", fontWeight: "700" }}>⚠️ Focus for Tomorrow: </span>
                          <span style={{ color: "#E2E8F0" }}>{item.mistakes_to_fix}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className={styles.historyActionsRow}>
                    <span>Log #{item.id}</span>
                    <div className={styles.historyBtnGroup}>
                      <button className={styles.btnSm} onClick={() => handleEdit(item)}>
                        ✏️ Edit Record
                      </button>
                      <button className={`${styles.btnSm} ${styles.btnSmDanger}`} onClick={() => handleDelete(item.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                  No logs found matching your query.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            TAB 4: Official IELTS Score Converter
           ------------------------------------------------------------ */}
        {activeTab === "converter" && (
          <div className={styles.formCard}>
            <div className={styles.cardSectionTitle}>
              <span>🧮 Official Cambridge Raw-to-Band Converter</span>
            </div>

            <div className={styles.scoreInputsRow} style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>Module</label>
                <select
                  value={convModule}
                  onChange={(e) => setConvModule(e.target.value)}
                  className={styles.textInput}
                >
                  <option value="listening">Listening (/40)</option>
                  <option value="reading">Reading (/40)</option>
                </select>
              </div>

              <div className={styles.inputField}>
                <label className={styles.inputLabel}>Stream</label>
                <select
                  value={convType}
                  onChange={(e) => setConvType(e.target.value)}
                  className={styles.textInput}
                >
                  <option value="Academic">Academic</option>
                  <option value="General">General Training</option>
                </select>
              </div>
            </div>

            <div className={styles.rangeSliderRow} style={{ marginTop: "12px" }}>
              <span className={styles.inputLabel} style={{ minWidth: "140px" }}>Raw Score (0 - 40):</span>
              <input
                type="range"
                min="0"
                max="40"
                value={convRaw}
                onChange={(e) => setConvRaw(e.target.value)}
                className={styles.rangeSlider}
              />
              <span className={styles.sliderValueDisplay}>{convRaw} / 40</span>
            </div>

            <div className={styles.overallBandBanner} style={{ marginTop: "20px" }}>
              <div>
                <span className={styles.overallBandLabel}>Official IELTS Band</span>
                <div className={styles.overallBandBig}>
                  Band {fmtBand(rawToBand(convRaw, convModule, convType))}
                </div>
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                  {convRaw} correct answers out of 40 in {convType} {convModule}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            TAB 5: Targets & Passcode Settings
           ------------------------------------------------------------ */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings}>
            <div className={styles.formCard}>
              <div className={styles.cardSectionTitle}>
                <span>🎯 Target Bands &amp; Exam Countdown</span>
              </div>

              <div className={styles.scoreInputsRow} style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Target Overall</label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="9"
                    value={targetOverall}
                    onChange={(e) => setTargetOverall(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Target Listening</label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="9"
                    value={targetListening}
                    onChange={(e) => setTargetListening(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Target Reading</label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="9"
                    value={targetReading}
                    onChange={(e) => setTargetReading(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Target Writing</label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="9"
                    value={targetWriting}
                    onChange={(e) => setTargetWriting(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Target Speaking</label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="9"
                    value={targetSpeaking}
                    onChange={(e) => setTargetSpeaking(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputField} style={{ marginTop: "12px" }}>
                <label className={styles.inputLabel}>Upcoming IELTS Exam Date (for countdown)</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.cardSectionTitle} style={{ marginTop: "20px" }}>
                <span>🔒 Change Secret Passcode</span>
              </div>

              <div className={styles.inputField}>
                <label className={styles.inputLabel}>New Secret Passcode (leave empty to keep current)</label>
                <input
                  type="password"
                  placeholder="Enter new custom passcode..."
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <button type="submit" className={styles.saveLogBtn} style={{ marginTop: "16px" }}>
                {settingsStatus === "saving" ? "Updating Settings..." : "Save Target Settings ⚙️"}
              </button>

              {settingsStatus === "success" && (
                <div style={{ color: "#4ADE80", fontSize: "13px", textAlign: "center", fontWeight: "600", marginTop: "8px" }}>
                  ✓ Settings and target goals updated successfully!
                </div>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

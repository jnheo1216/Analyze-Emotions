"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EmotionId = "joy" | "sadness" | "anger" | "anxiety" | "surprise" | "disgust" | "calm" | "anticipation" | "loneliness" | "affection" | "frustration";
type SinId = "pride" | "greed" | "lust" | "envy" | "gluttony" | "wrath" | "sloth";
type Id = EmotionId | SinId;
type Mode = "emotion" | "sin";
type Signal = { id: Id; label: string; en: string; color: string; symbol: string };

const THROTTLE_MS = 500;
const EMOTIONS: Signal[] = [
  { id: "joy", label: "기쁨", en: "JOY", color: "#ffb938", symbol: "☀" },
  { id: "sadness", label: "슬픔", en: "SADNESS", color: "#739bd7", symbol: "☂" },
  { id: "anger", label: "분노", en: "ANGER", color: "#f47f6b", symbol: "♨" },
  { id: "anxiety", label: "불안", en: "ANXIETY", color: "#ad93d3", symbol: "〰" },
  { id: "surprise", label: "놀람", en: "SURPRISE", color: "#f2a674", symbol: "✴" },
  { id: "disgust", label: "혐오", en: "DISGUST", color: "#9ab27c", symbol: "◈" },
  { id: "calm", label: "평온", en: "CALM", color: "#80b9ad", symbol: "◡" },
  { id: "anticipation", label: "기대", en: "ANTICIPATION", color: "#d696bb", symbol: "✧" },
  { id: "loneliness", label: "외로움", en: "LONELINESS", color: "#8198ba", symbol: "◌" },
  { id: "affection", label: "애정", en: "AFFECTION", color: "#e78fa3", symbol: "♥" },
  { id: "frustration", label: "좌절", en: "FRUSTRATION", color: "#ce8e67", symbol: "⌁" },
];
const SINS: Signal[] = [
  { id: "pride", label: "교만", en: "PRIDE", color: "#c8a15e", symbol: "♛" },
  { id: "greed", label: "탐욕", en: "GREED", color: "#a6aa69", symbol: "◆" },
  { id: "lust", label: "색욕", en: "LUST", color: "#d9829a", symbol: "♥" },
  { id: "envy", label: "질투", en: "ENVY", color: "#87a27b", symbol: "◈" },
  { id: "gluttony", label: "폭식", en: "GLUTTONY", color: "#d69a6c", symbol: "◕" },
  { id: "wrath", label: "분노", en: "WRATH", color: "#ce7068", symbol: "⚡" },
  { id: "sloth", label: "나태", en: "SLOTH", color: "#9698b4", symbol: "◡" },
];
const MOUTHS: Record<EmotionId, string[]> = {
  joy: ["...######...", "..#......#..", "...#....#...", "....####...."],
  sadness: ["....####....", "...#....#...", "..#......#..", "............"],
  anger: ["............", "..########..", "..#......#..", "............"],
  anxiety: ["...######...", "..#.#.#.#...", "...######...", "............"],
  surprise: ["....####....", "...#....#...", "...#....#...", "....####...."],
  disgust: ["............", "..###..#####.", ".....##.....", "............"],
  calm: ["............", "...######...", "............", "............"],
  anticipation: ["............", "...#....#...", "....####....", "............"],
  loneliness: ["............", "....####....", "...#....#...", "............"],
  affection: ["............", "..#......#..", "...#....#...", "....####...."],
  frustration: ["............", "...######...", "...#.#.#....", "...######..."],
};
const FACE_SHAPE = [
  "....########....", "..############..", ".##############.", "################",
  "################", "################", "################", "################",
  "################", "################", "################", "################",
  "################", ".##############.", "..############..", "....########....",
];

function pixels(mood: EmotionId) {
  const rows = Array.from({ length: 16 }, () => Array(16).fill("."));
  const draw = (row: number, column: number, pattern: string, value: string) =>
    [...pattern].forEach((part, index) => { if (part === "#") rows[row][column + index] = value; });
  FACE_SHAPE.forEach((pattern, row) => draw(row, 0, pattern, "s"));
  if (mood === "affection") {
    draw(4, 3, "#.#....#.#", "h");
    draw(5, 3, "###....###", "h");
    draw(6, 3, ".#......#.", "h");
  } else if (mood === "loneliness") {
    draw(5, 3, "..#....#..", "d");
    draw(6, 3, "..#....#..", "d");
  } else {
    if (mood === "frustration") draw(4, 3, "..##....##", "d");
    draw(5, 3, mood === "anger" || mood === "disgust" || mood === "frustration" ? "###....###" : ".##....##.", "d");
    if (mood !== "calm") draw(6, 3, ".##....##.", "d");
  }
  MOUTHS[mood].forEach((pattern, index) => draw(9 + index, 2, pattern, "d"));
  if (mood === "sadness") { rows[7][4] = "t"; rows[8][4] = "t"; }
  if (mood === "loneliness") { rows[7][5] = "t"; rows[7][10] = "t"; rows[8][5] = "t"; rows[8][10] = "t"; }
  if (mood === "joy" || mood === "anticipation") { rows[8][2] = "b"; rows[8][13] = "b"; }
  return rows.flat();
}

function sinPixels(mood: SinId) {
  const rows = Array.from({ length: 20 }, () => Array<string>(20).fill("."));
  const paint = (row: number, column: number, pattern: string, pixel: string) =>
    [...pattern].forEach((mark, index) => {
      const x = column + index;
      if (mark === "#" && row >= 0 && row < 20 && x >= 0 && x < 20) rows[row][x] = pixel;
    });
  FACE_SHAPE.forEach((pattern, row) => paint(row + 3, 2, pattern, "s"));

  switch (mood) {
    case "pride":
      paint(0, 5, "#...#...#", "g");
      paint(1, 5, "##.###.##", "g");
      paint(2, 5, "#########", "g");
      paint(3, 5, "#########", "g");
      paint(6, 12, "###", "d");
      paint(7, 5, "###", "d");
      paint(8, 5, "##", "d");
      paint(8, 12, "##", "d");
      paint(13, 7, "######", "d");
      paint(14, 12, "#", "d");
      paint(15, 8, "####", "d");
      break;
    case "greed":
      paint(7, 5, "##", "g");
      paint(8, 4, "####", "g");
      paint(9, 5, "##", "g");
      paint(7, 13, "##", "g");
      paint(8, 12, "####", "g");
      paint(9, 13, "##", "g");
      rows[8][6] = "d";
      rows[8][14] = "d";
      paint(12, 7, "######", "d");
      paint(13, 6, "########", "d");
      paint(14, 7, "######", "w");
      paint(15, 6, "########", "d");
      paint(5, 18, "#", "g");
      paint(6, 17, "###", "g");
      paint(7, 18, "#", "g");
      break;
    case "lust":
      paint(0, 14, "##.##", "h");
      paint(1, 14, "#####", "h");
      paint(2, 14, ".###.", "h");
      paint(3, 14, "..#..", "h");
      paint(7, 4, "##.##", "h");
      paint(8, 4, "#####", "h");
      paint(9, 4, ".###.", "h");
      paint(10, 4, "..#..", "h");
      paint(7, 11, "##.##", "h");
      paint(8, 11, "#####", "h");
      paint(9, 11, ".###.", "h");
      paint(10, 11, "..#..", "h");
      paint(11, 4, "##", "b");
      paint(11, 14, "##", "b");
      paint(13, 6, "#......#", "d");
      paint(14, 7, "#....#", "d");
      paint(15, 8, "####", "d");
      break;
    case "envy":
      paint(5, 18, "#", "g");
      paint(6, 17, "###", "g");
      paint(7, 18, "#", "g");
      paint(6, 5, "..##", "d");
      paint(6, 11, "##..", "d");
      paint(8, 5, "####", "w");
      paint(8, 11, "####", "w");
      rows[8][8] = "d";
      rows[8][14] = "d";
      paint(9, 5, "####", "d");
      paint(9, 11, "####", "d");
      paint(11, 13, "###", "a");
      paint(14, 7, "######", "d");
      paint(15, 7, "#", "d");
      break;
    case "gluttony":
      paint(7, 5, "##", "d");
      paint(7, 13, "##", "d");
      paint(8, 5, "##", "d");
      paint(8, 13, "##", "d");
      paint(11, 3, "###", "b");
      paint(11, 14, "###", "b");
      paint(12, 8, "####", "d");
      paint(13, 7, "######", "d");
      paint(14, 6, "########", "d");
      paint(15, 7, "######", "d");
      paint(16, 8, "####", "d");
      paint(13, 8, "####", "w");
      paint(15, 9, "##", "h");
      paint(10, 18, "#", "g");
      paint(11, 17, "##", "g");
      break;
    case "wrath":
      paint(0, 4, "##...##...##", "f");
      paint(1, 4, "###.####.###", "f");
      paint(2, 4, "############", "f");
      paint(3, 5, "##########", "f");
      paint(1, 6, "#", "g");
      paint(1, 10, "#", "g");
      paint(1, 14, "#", "g");
      paint(7, 4, "#####", "d");
      paint(7, 11, "#####", "d");
      paint(8, 5, "###", "d");
      paint(8, 12, "###", "d");
      paint(11, 2, "##", "f");
      paint(11, 16, "##", "f");
      paint(13, 6, "########", "d");
      paint(14, 7, "######", "w");
      paint(15, 6, "########", "d");
      break;
    case "sloth":
      paint(0, 15, "####", "z");
      paint(1, 17, "#", "z");
      paint(2, 16, "#", "z");
      paint(3, 15, "####", "z");
      paint(8, 4, "####", "d");
      paint(8, 12, "####", "d");
      paint(14, 8, "####", "d");
      paint(16, 3, "##############", "z");
      paint(17, 4, "############", "z");
      paint(18, 6, "########", "z");
      rows[15][12] = "t";
      rows[16][12] = "t";
      break;
  }
  return rows.flat();
}

function isSin(mood: Id): mood is SinId {
  return SINS.some((sin) => sin.id === mood);
}

function Face({ mood, color, label }: { mood: Id; color: string; label: string }) {
  const dots = useMemo(() => isSin(mood) ? sinPixels(mood) : pixels(mood), [mood]);
  return (
    <div className={isSin(mood) ? "pixel-face sin-face" : "pixel-face"} style={{ "--face": color } as React.CSSProperties} role="img" aria-label={label + " 표정의 픽셀 얼굴"}>
      {dots.map((dot, index) => <span key={index} className={"pixel pixel-" + dot} />)}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("emotion");
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<{ mode: Mode; scores: number[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastRequestAt = useRef(0);
  const requestId = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const signals = mode === "emotion" ? EMOTIONS : SINS;
  const scores = analysis?.mode === mode ? analysis.scores : null;

  const changeMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setAnalysis(null);
    setError("");
    setMode(nextMode);
  };

  useEffect(() => {
    const value = text.trim();
    const activeSignals = mode === "emotion" ? EMOTIONS : SINS;
    const currentId = ++requestId.current;
    activeRequest.current?.abort();

    if (!value) {
      setAnalysis(null);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    const delay = Math.max(0, THROTTLE_MS - (Date.now() - lastRequestAt.current));
    const timer = window.setTimeout(async () => {
      const controller = new AbortController();
      activeRequest.current = controller;
      lastRequestAt.current = Date.now();
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: value, mode }),
          signal: controller.signal,
        });
        const data = await response.json() as { error?: string; scores?: Record<Id, number> };
        if (!response.ok) throw new Error(data.error || "분석 중 문제가 생겼습니다.");
        if (!data.scores) throw new Error("분석 결과를 읽을 수 없습니다.");
        if (currentId === requestId.current) {
          setAnalysis({ mode, scores: activeSignals.map((signal) => Math.round((data.scores?.[signal.id] ?? 0) * 100)) });
        }
      } catch (cause) {
        if (!controller.signal.aborted && currentId === requestId.current) {
          setError(cause instanceof Error ? cause.message : "분석 중 문제가 생겼습니다.");
        }
      } finally {
        if (currentId === requestId.current) setLoading(false);
      }
    }, delay);
    return () => { window.clearTimeout(timer); activeRequest.current?.abort(); };
  }, [text, mode]);

  const ranked = signals.map((signal, index) => ({ ...signal, score: scores?.[index] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const dominant = scores ? ranked[0] : mode === "sin" ? { ...EMOTIONS[6], color: "#aaa6a3", label: "분석 전" } : EMOTIONS[6];
  const status = !text.trim() ? "문장을 입력하면 자동으로 분석돼요" : loading ? "Jev가 문장을 분석하는 중..." : error ? "분석 연결을 확인해 주세요" : "최신 문장 분석 완료";

  return (
    <main className={mode === "sin" ? "app-shell sin-mode" : "app-shell"}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Analyze Emotions 홈">
          <span className="brand-icon"><i /><i /><i /><i /></span>
          <span>Analyze Emotions</span>
        </a>
        <div className="top-right">
          <div className="mode-toggle" role="group" aria-label="분석 모드">
            <button type="button" className={mode === "emotion" ? "mode-option active" : "mode-option"} aria-pressed={mode === "emotion"} onClick={() => changeMode("emotion")}>감정 분석</button>
            <button type="button" className={mode === "sin" ? "mode-option active" : "mode-option"} aria-pressed={mode === "sin"} onClick={() => changeMode("sin")}>7대 죄악</button>
          </div>
          <a href="https://api.typesafe.ai/redoc" target="_blank" rel="noreferrer">Jev API ↗</a>
        </div>
      </header>

      <div className="page" id="top">
        <div className="intro">
          <h1>Analyze your <span>{mode === "emotion" ? "Emotions" : "Seven Sins"}</span></h1>
        </div>

        <div className="dashboard-grid">
          <section className="face-card" aria-label={mode === "emotion" ? "현재 감정 픽셀 얼굴" : "현재 7대 죄악 픽셀 얼굴"}>
            <div className="face-top"><span><span className="live-dot" /> 01 · {mode === "emotion" ? "EMOTION VIEW" : "SIN VIEW"}</span><span>8-BIT EDITION</span></div>
            <div className="face-stage">
              <div className="face-orbit orbit-one" /><div className="face-orbit orbit-two" />
              <span className="stage-star star-one">✳</span><span className="stage-star star-two">✦</span>
              <div className="face-image-wrap"><Face mood={dominant.id} color={dominant.color} label={dominant.label} /></div>
            </div>
          </section>

          <section className="results" aria-label={mode === "emotion" ? `${EMOTIONS.length}가지 감정 분석 결과` : "7대 죄악 분석 결과"}>
            <div className="results-header">
              <div className="section-kicker">02 <span /> {mode === "emotion" ? "EMOTION MAP" : "SEVEN SINS MAP"}</div>
              <div className="result-state">{loading ? "ANALYZING" : scores ? "JEV ANALYSIS" : "AWAITING INPUT"}<span className={scores ? "state-dot ready" : "state-dot"} /></div>
            </div>
            <div className="emotion-grid">
              {signals.map((signal, index) => (
                <article className={scores && signal.id === dominant.id ? "emotion-tile dominant" : "emotion-tile"} key={signal.id} style={{ "--accent": signal.color } as React.CSSProperties}>
                  <div className="tile-top"><span className="tile-index">{String(index + 1).padStart(2, "0")}</span><span className="tile-symbol">{signal.symbol}</span></div>
                  <div className="tile-title"><h3>{signal.label}</h3><span>{signal.en}</span></div>
                  <div className="tile-score">{scores ? scores[index] : "—"}<small>{scores ? "%" : ""}</small></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: String(scores?.[index] ?? 0) + "%" }} /></div>
                </article>
              ))}
            </div>
            <div className="results-footer"><span><b>✦</b> {mode === "emotion" ? "감정은 한 가지로만 설명되지 않아요." : "문장의 신호를 보여주는 수치예요."}</span><span>{scores ? "Powered by Jev · TypeSafe AI" : "입력하면 자동으로 분석됩니다"}</span></div>
          </section>
        </div>

      </div>
      <footer className="site-footer"><span>마음의 픽셀 © 2026</span><span>YOUR FEELINGS, IN LITTLE SQUARES.</span></footer>
      <div className="floating-input" aria-busy={loading}>
        <label className="sr-only" htmlFor="emotion-text">분석할 텍스트</label>
        <textarea id="emotion-text" rows={2} maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} placeholder={mode === "emotion" ? "지금 마음을 적어보세요..." : "판별할 문장을 적어보세요..."} />
        <span className={loading ? "floating-indicator busy" : "floating-indicator"} aria-hidden="true" />
        <span className="sr-only" aria-live="polite">{status}</span>
        {error && <p className="floating-error" role="alert">{error}</p>}
      </div>
    </main>
  );
}

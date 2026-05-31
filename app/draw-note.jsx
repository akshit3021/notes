import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  DotsThreeOutlineVertical,
  Eraser,
  PaintBrush,
  PushPin,
  Trash,
} from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import db, { getNoteById, insertNote, updateNote } from "../db/db";

// ─── Brush sizes ──────────────────────────────────────────────────────────────
const BRUSH_SIZES = [3, 6, 12, 20];

// ─── Palette colors ───────────────────────────────────────────────────────────
const PALETTE = [
  "#f1f5f9", // white-ish (good on dark)
  "#0f172a", // near-black
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#64748b", // slate
];

// ─── Canvas HTML (injected into WebView) ─────────────────────────────────────
const buildCanvasHTML = (bgColor) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: ${bgColor}; overflow: hidden; touch-action: none; }
    canvas { display: block; touch-action: none; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    let drawing = false;
    let mode = 'pen';       // 'pen' | 'eraser'
    let color = '#f1f5f9';
    let size  = 6;
    let paths = [];          // for undo
    let currentPath = null;

    function resize() {
      // Save snapshot, resize, restore
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.putImageData(img, 0, 0);
    }
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // ── drawing helpers ──────────────────────────────────────────────────────
    function getPos(e) {
      const t = e.touches ? e.touches[0] : e;
      const r = canvas.getBoundingClientRect();
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }

    function startDraw(e) {
      e.preventDefault();
      drawing = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      currentPath = [p];
      ctx.strokeStyle = mode === 'eraser' ? '${bgColor}' : color;
      ctx.lineWidth   = mode === 'eraser' ? size * 3 : size;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
    }

    function draw(e) {
      if (!drawing) return;
      e.preventDefault();
      const p = getPos(e);
      currentPath.push(p);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    function endDraw(e) {
      if (!drawing) return;
      drawing = false;
      if (currentPath && currentPath.length > 1) {
        paths.push({ color: mode === 'eraser' ? '${bgColor}' : color, size: mode === 'eraser' ? size * 3 : size, pts: currentPath });
      }
      ctx.beginPath();
      // Send updated data URL back to RN
      window.ReactNativeWebView.postMessage(canvas.toDataURL('image/png'));
    }

    canvas.addEventListener('touchstart',  startDraw, { passive: false });
    canvas.addEventListener('touchmove',   draw,      { passive: false });
    canvas.addEventListener('touchend',    endDraw,   { passive: false });
    canvas.addEventListener('mousedown',   startDraw);
    canvas.addEventListener('mousemove',   draw);
    canvas.addEventListener('mouseup',     endDraw);

    // ── commands from RN ────────────────────────────────────────────────────
    function handleCommand(cmd) {
      if (cmd.type === 'SET_COLOR') { color = cmd.value; }
      if (cmd.type === 'SET_SIZE')  { size  = cmd.value; }
      if (cmd.type === 'SET_MODE')  { mode  = cmd.value; }
      if (cmd.type === 'CLEAR') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths = [];
        window.ReactNativeWebView.postMessage(canvas.toDataURL('image/png'));
      }
      if (cmd.type === 'UNDO') {
        paths.pop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths.forEach(p => {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth   = p.size;
          ctx.lineCap     = 'round';
          ctx.lineJoin    = 'round';
          p.pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        });
        window.ReactNativeWebView.postMessage(canvas.toDataURL('image/png'));
      }
      if (cmd.type === 'LOAD') {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = cmd.value;
      }
    }

    window.addEventListener('message', e => {
      try { handleCommand(JSON.parse(e.data)); } catch(_) {}
    });
    document.addEventListener('message', e => {
      try { handleCommand(JSON.parse(e.data)); } catch(_) {}
    });
  </script>
</body>
</html>
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DrawNote() {
  const { id, lastTheme } = useLocalSearchParams();
  const noteId = id;
  const router = useRouter();

  const webRef = useRef(null);

  const [title, setTitle] = useState("");
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState("");

  // drawing state (mirrored in WebView via postMessage)
  const [brushColor, setBrushColor] = useState("#f1f5f9");
  const [brushSize, setBrushSize] = useState(6);
  const [mode, setMode] = useState("pen"); // 'pen' | 'eraser'

  const [showPalette, setShowPalette] = useState(false);

  // last data URL from canvas — used for save
  const canvasDataRef = useRef(null);

  const isDark = lastTheme === "true";

  const theme = {
    bg: isDark ? "bg-slate-950" : "bg-slate-100",
    headerBg: isDark ? "bg-slate-900" : "bg-white",
    headerText: isDark ? "text-slate-100" : "text-slate-900",
    border: isDark ? "border-slate-700" : "border-slate-200",
    noteBg: isDark ? "bg-slate-900" : "bg-white",
    noteBorder: isDark ? "border-slate-800" : "border-slate-200",
    title: isDark ? "text-white" : "text-slate-900",
    placeholder: isDark ? "#94a3b8" : "#64748b",
    fabBg: isDark ? "bg-indigo-500" : "bg-blue-500",
    toolbarBg: isDark ? "bg-slate-800" : "bg-slate-50",
    toolbarBorder: isDark ? "border-slate-700" : "border-slate-200",
    iconColor: isDark ? "#f1f5f9" : "#0f172a",
    canvasBg: isDark ? "#0f172a" : "#ffffff",
  };

  // ── Load existing note ──────────────────────────────────────────────────────
  useEffect(() => {
    if (noteId) {
      const note = getNoteById(noteId);
      if (note) {
        setTitle(note.title);
        setPinned(note.pinned === 1);
        setColor(note.color);
        // note.content stores the data URL for draw notes
        if (note.content) {
          canvasDataRef.current = note.content;
        }
      }
    }
  }, [noteId]);

  // Send load command after WebView is ready (small delay)
  const handleWebViewLoad = () => {
    if (canvasDataRef.current) {
      setTimeout(() => {
        sendCmd({ type: "LOAD", value: canvasDataRef.current });
      }, 200);
    }
  };

  // ── WebView messaging ───────────────────────────────────────────────────────
  const sendCmd = (cmd) => {
    webRef.current?.injectJavaScript(
      `handleCommand(${JSON.stringify(cmd)}); true;`,
    );
  };

  const handleMessage = (e) => {
    // WebView sends back the data URL after each stroke
    canvasDataRef.current = e.nativeEvent.data;
  };

  // ── Brush / tool controls ───────────────────────────────────────────────────
  const pickColor = (c) => {
    setBrushColor(c);
    setMode("pen");
    sendCmd({ type: "SET_COLOR", value: c });
    sendCmd({ type: "SET_MODE", value: "pen" });
    setShowPalette(false);
  };

  const pickSize = (s) => {
    setBrushSize(s);
    sendCmd({ type: "SET_SIZE", value: s });
  };

  const toggleEraser = () => {
    const next = mode === "eraser" ? "pen" : "eraser";
    setMode(next);
    sendCmd({ type: "SET_MODE", value: next });
  };

  const clearCanvas = () => {
    sendCmd({ type: "CLEAR" });
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const saveNote = () => {
    if (!title && !canvasDataRef.current) return;

    const now = new Date().toISOString();

    try {
      if (noteId) {
        updateNote({
          id: noteId,
          title,
          content: canvasDataRef.current ?? "",
          updatedAt: now,
          color,
          pinned,
        });
      } else {
        insertNote({
          id: Date.now().toString(),
          title,
          content: canvasDataRef.current ?? "",
          createdAt: now,
          updatedAt: now,
          color,
          pinned,
        });
      }

      const allNotes = db.getAllSync("SELECT * FROM notes");
      console.log("📦 All Notes:", allNotes);

      router.back();
    } catch (e) {
      console.log("❌ Error", e);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0f172a" : "#ffffff"}
      />

      {/* ── Header ── */}
      <View
        className={`mb-3 flex-row items-center justify-between border-b px-5 pb-4 pt-3 ${theme.headerBg} ${theme.border}`}
        style={{ elevation: 1 }}
      >
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={26} color={theme.iconColor} />
        </Pressable>

        {/* Title input */}
        <TextInput
          placeholder="Drawing title…"
          placeholderTextColor={theme.placeholder}
          value={title}
          onChangeText={setTitle}
          className={`mx-4 flex-1 text-[17px] font-semibold ${theme.title}`}
        />

        <View className="flex-row items-center gap-5">
          <Pressable onPress={() => setPinned(!pinned)}>
            <PushPin
              size={22}
              color={pinned ? "#facc15" : theme.iconColor}
              weight={pinned ? "fill" : "regular"}
            />
          </Pressable>
          <Pressable>
            <DotsThreeOutlineVertical
              size={22}
              color={theme.iconColor}
              weight="duotone"
            />
          </Pressable>
        </View>
      </View>

      {/* ── Canvas ── */}
      <View
        className={`mx-5 flex-1 overflow-hidden rounded-2xl border ${theme.noteBg} ${theme.noteBorder}`}
        style={{ elevation: 0.9 }}
      >
        <WebView
          ref={webRef}
          source={{ html: buildCanvasHTML(theme.canvasBg) }}
          style={{ flex: 1, backgroundColor: "transparent" }}
          scrollEnabled={false}
          onMessage={handleMessage}
          onLoad={handleWebViewLoad}
          originWhitelist={["*"]}
          javaScriptEnabled
        />
      </View>

      {/* ── Toolbar ── */}
      <View
        className={`mx-5 mt-3 flex-row items-center justify-between rounded-2xl border px-4 py-2.5 ${theme.toolbarBg} ${theme.toolbarBorder}`}
      >
        {/* Brush sizes */}
        <View className="flex-row items-center gap-3">
          {BRUSH_SIZES.map((s) => (
            <Pressable
              key={s}
              onPress={() => pickSize(s)}
              className="items-center justify-center"
            >
              <View
                style={{
                  width: s + 6,
                  height: s + 6,
                  borderRadius: (s + 6) / 2,
                  backgroundColor:
                    brushSize === s
                      ? brushColor
                      : isDark
                        ? "#334155"
                        : "#cbd5e1",
                  borderWidth: brushSize === s ? 2 : 0,
                  borderColor: isDark ? "#94a3b8" : "#64748b",
                }}
              />
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View
          className={`mx-2 h-6 w-px ${isDark ? "bg-slate-600" : "bg-slate-300"}`}
        />

        {/* Color swatch + palette toggle */}
        <Pressable
          onPress={() => setShowPalette(true)}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: brushColor,
            borderWidth: 2,
            borderColor: isDark ? "#94a3b8" : "#64748b",
          }}
        />

        {/* Pen / Eraser toggle */}
        <Pressable
          onPress={toggleEraser}
          className={`mx-1 rounded-xl p-2 ${
            mode === "eraser"
              ? isDark
                ? "bg-indigo-500"
                : "bg-blue-500"
              : "bg-transparent"
          }`}
        >
          {mode === "eraser" ? (
            <Eraser size={20} color="#ffffff" weight="fill" />
          ) : (
            <PaintBrush size={20} color={theme.iconColor} weight="duotone" />
          )}
        </Pressable>

        {/* Clear */}
        <Pressable onPress={clearCanvas} className="rounded-xl p-2">
          <Trash
            size={20}
            color={isDark ? "#f87171" : "#ef4444"}
            weight="duotone"
          />
        </Pressable>
      </View>

      {/* ── Save button ── */}
      <Pressable
        onPress={saveNote}
        className={`mx-5 mb-6 mt-3 items-center rounded-2xl ${theme.fabBg} py-3`}
      >
        <Text className="text-base font-semibold text-white">
          {noteId ? "Update Drawing" : "Save Drawing"}
        </Text>
      </Pressable>

      {/* ── Palette Modal ── */}
      <Modal
        visible={showPalette}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPalette(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => setShowPalette(false)}
        >
          <View
            className={`rounded-2xl p-5 ${isDark ? "bg-slate-800" : "bg-white"}`}
            style={{ elevation: 8 }}
          >
            <Text
              className={`mb-4 text-center text-sm font-semibold ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Pick a color
            </Text>
            <View className="flex-row flex-wrap justify-center gap-3">
              {PALETTE.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => pickColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: c,
                    borderWidth: brushColor === c ? 3 : 1.5,
                    borderColor:
                      brushColor === c
                        ? isDark
                          ? "#818cf8"
                          : "#3b82f6"
                        : isDark
                          ? "#475569"
                          : "#cbd5e1",
                  }}
                />
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

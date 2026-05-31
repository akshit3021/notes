import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  DotsThreeOutlineVerticalIcon,
  PushPin,
} from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db, { getNoteById, insertNote, updateNote } from "../db/db";

export default function TextNote() {
  const { id, lastTheme } = useLocalSearchParams();
  const noteId = id;

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState(""); // default

  useEffect(() => {
    if (noteId) {
      const note = getNoteById(noteId);

      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setPinned(note.pinned === 1);
        setColor(note.color);
      }
    }
  }, [noteId]);

  const saveNote = () => {
    if (!title && !content) return;

    const now = new Date().toISOString();

    try {
      if (noteId) {
        // ✏️ UPDATE
        const updatedNote = {
          id,
          title,
          content,
          updatedAt: now,
          color,
          pinned,
        };

        updateNote(updatedNote);
        console.log("✏️ Updated Note:", updatedNote);
      } else {
        // ➕ CREATE
        const newNote = {
          id: Date.now().toString(),
          title,
          content,
          createdAt: now,
          updatedAt: now,
          color,
          pinned,
        };

        insertNote(newNote);
        console.log("✅ Inserted Note:", newNote);
      }

      const allNotes = db.getAllSync("SELECT * FROM notes");
      console.log("📦 All Notes:", allNotes);

      router.back();
    } catch (e) {
      console.log("❌ Error", e);
    }
  };

  const isDark = lastTheme === "true";

  const theme = {
    bg: isDark ? "bg-slate-950" : "bg-slate-100",

    headerBg: isDark ? "bg-slate-900" : "bg-white",
    headerText: isDark ? "text-slate-100" : "text-slate-900",
    border: isDark ? "border-slate-700" : "border-slate-200",

    noteBg: isDark ? "bg-slate-900" : "bg-white",
    noteBorder: isDark ? "border-slate-800" : "border-slate-200",
    title: isDark ? "text-white" : "text-slate-900",
    content: isDark ? "text-slate-300" : "text-slate-600",

    placeholder: isDark ? "#94a3b8" : "#64748b",

    fabBg: isDark ? "bg-indigo-500" : "bg-blue-500",
    fabBorder: isDark ? "border-indigo-400" : "border-blue-400",
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0f172a" : "#ffffff"}
      />
      {/* Header */}
      <View
        className={`mb-5 flex-row items-center justify-between border-b px-5 pb-4 pt-3 ${theme.headerBg} ${theme.border}`}
        style={{ elevation: 1 }}
      >
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={26} color={isDark ? "#f1f5f9" : "#0f172a"} />
        </Pressable>

        <View className="flex-row items-center gap-5">
          {/* Pin toggle */}
          <Pressable onPress={() => setPinned(!pinned)}>
            <PushPin
              size={22}
              color={pinned ? "#facc15" : isDark ? "#f1f5f9" : "#0f172a"}
              weight={pinned ? "fill" : "regular"}
            />
          </Pressable>

          {/* Dummy options */}
          <Pressable>
            <DotsThreeOutlineVerticalIcon
              size={22}
              color={isDark ? "#f1f5f9" : "#0f172a"}
              weight="duotone"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className={`mx-5 flex-1 rounded-2xl border px-4 py-3 ${theme.noteBg} ${theme.noteBorder}`}
        style={{ elevation: 0.9 }}
      >
        {/* Title */}
        <TextInput
          placeholder="Title"
          placeholderTextColor={theme.placeholder}
          value={title}
          onChangeText={setTitle}
          className={`pb-2 pt-2 text-[21px] font-semibold ${theme.title}`}
        />

        {/* Content */}
        <TextInput
          placeholder="Write your note..."
          placeholderTextColor={theme.placeholder}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          className={`flex-1 text-[17.5px] ${theme.content}`}
        />
      </ScrollView>

      {/* Save */}
      <Pressable
        onPress={saveNote}
        className={`mx-5 mb-6 mt-4 items-center rounded-2xl ${theme.fabBg} py-3`}
        // style={{ elevation: 1 }}
      >
        <Text className="text-base font-semibold text-white">
          {noteId ? "Update Note" : "Save Note"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

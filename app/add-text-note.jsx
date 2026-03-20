import { useRouter } from "expo-router";
import {
  ArrowLeft,
  DotsThreeOutlineVerticalIcon,
  PushPin,
} from "phosphor-react-native";
import { useState } from "react";
import { Pressable, StatusBar, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db, { insertNote } from "../db/db";

export default function AddTextNote() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState(""); // default

  const saveNote = () => {
    if (!title && !content) return;

    const now = new Date().toISOString();

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      color,
      pinned,
    };

    try {
      insertNote(newNote);

      console.log("✅ Inserted Note:", newNote);

      // fetch all notes to verify
      const allNotes = db.getAllSync("SELECT * FROM notes");
      console.log("📦 All Notes:", allNotes);

      router.back();
    } catch (e) {
      console.log("❌ Insert error", e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between border-b border-slate-700 bg-slate-900 px-5 pb-4 pt-3 shadow-xl">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={26} color="white" />
        </Pressable>

        <View className="flex-row items-center gap-5">
          {/* Pin toggle */}
          <Pressable onPress={() => setPinned(!pinned)}>
            <PushPin
              size={22}
              color={pinned ? "#facc15" : "white"}
              weight={pinned ? "fill" : "regular"}
            />
          </Pressable>

          {/* Dummy options */}
          <Pressable>
            <DotsThreeOutlineVerticalIcon
              size={22}
              color="white"
              weight="duotone"
            />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 px-5">
        {/* Title */}
        <TextInput
          placeholder="Title"
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
          className="mb-3 text-xl font-semibold text-white"
        />

        {/* Content */}
        <TextInput
          placeholder="Write your note..."
          placeholderTextColor="#64748b"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          className="flex-1 text-base text-slate-200"
        />
      </View>

      {/* Save */}
      <Pressable
        onPress={saveNote}
        className="mx-5 mb-6 mt-4 items-center rounded-2xl border border-indigo-400 bg-indigo-500 py-3 shadow-xl active:opacity-80"
      >
        <Text className="text-base font-semibold text-white">Save Note</Text>
      </Pressable>
    </SafeAreaView>
  );
}

import MasonryList from "@react-native-seoul/masonry-list";
import { useRouter } from "expo-router";
import {
  MoonIcon,
  NotePencil,
  PencilSimpleLine,
  Plus,
  SunIcon,
  TextT,
} from "phosphor-react-native";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function Index() {
  const [isDark, setIsDark] = useState(true);

  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const notes = [
    { id: "1", title: "Grocery", content: "Milk\nEggs\nBread\nButter\nCheese" },
    { id: "2", title: "Ideas", content: "Wallpaper app\nAI notes\nTracker" },
    {
      id: "3",
      title: "Books",
      content: "Atomic Habits\nDeep Work\nPsychology of Money\nMore reading...",
    },
    {
      id: "4",
      title: "Workout",
      content: "Push\nPull\nLegs\nRepeat\nCardio\nStretch\nHydrate",
    },
    {
      id: "5",
      title: "Weekend",
      content: "Gym\nCode\nRelax\nMovie\nSleep\nFriends",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between border-b border-slate-700 bg-slate-900 px-5 pb-4 pt-3 shadow-xl">
        <View className="flex-row items-center gap-3">
          <NotePencil size={26} color="#f1f5f9" weight="duotone" />
          <Text className="text-2xl font-semibold text-slate-100">Notes</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsDark(!isDark)}
          className={`rounded-full border p-2 shadow-xl active:scale-95 ${
            isDark
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-white"
          }`}
        >
          {isDark ? (
            <SunIcon size={21} color="#facc15" weight="fill" />
          ) : (
            <MoonIcon size={21} color="#0f172a" weight="fill" />
          )}
        </TouchableOpacity>
      </View>

      {/* Masonry List */}
      <MasonryList
        data={notes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingBottom: 120,
        }}
        renderItem={({ item }) => (
          <View style={{ alignItems: "center" }}>
            <View
              style={{ width: width / 2 - 20 }}
              className="mb-3 max-h-96 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl"
            >
              <Text className="mb-1 font-semibold text-white">
                {item.title}
              </Text>

              <Text className="text-sm text-slate-300">{item.content}</Text>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <Pressable
        onPress={() => setVisible(true)}
        className="absolute bottom-60 right-6 h-16 w-16 items-center justify-center rounded-full border border-indigo-400 bg-indigo-500 shadow-xl active:bg-indigo-600"
      >
        <Plus size={30} color="white" weight="bold" />
      </Pressable>

      {/* Modal (Google Keep style) */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          onPress={() => setVisible(false)}
          // className="flex-1 justify-end bg-black/30"
          className="flex-1 justify-end"
        >
          <View className="rounded-t-2xl border-x border-t border-slate-700 bg-slate-900 px-5 py-6 shadow-xl">
            <Text className="mb-6 text-lg font-semibold text-slate-100">
              Create Note
            </Text>

            <View className="flex-row justify-around">
              {/* Text Note */}
              <Pressable
                onPress={() => {
                  setVisible(false);
                  router.push("/add-text-note");
                }}
                className="items-center gap-2"
              >
                <View className="rounded-2xl border border-indigo-400 bg-indigo-500 p-4 shadow-xl">
                  <TextT size={28} color="white" weight="duotone" />
                </View>

                <Text className="text-neutral-500">Text</Text>
              </Pressable>

              {/* Drawing */}
              <Pressable
                onPress={() => {
                  setVisible(false);
                  router.push("/add-drawing");
                }}
                className="items-center gap-2"
              >
                <View className="rounded-2xl border border-indigo-400 bg-indigo-500 p-4 shadow-xl">
                  <PencilSimpleLine size={28} color="white" weight="duotone" />
                </View>

                <Text className="text-neutral-500">Drawing</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

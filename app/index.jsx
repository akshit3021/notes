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

  const theme = {
    bg: isDark ? "bg-slate-950" : "bg-slate-100",

    headerBg: isDark ? "bg-slate-900" : "bg-white",
    headerText: isDark ? "text-slate-100" : "text-slate-900",
    border: isDark ? "border-slate-700" : "border-slate-200",

    noteBg: isDark ? "bg-slate-900" : "bg-white",
    noteBorder: isDark ? "border-slate-800" : "border-slate-200",
    title: isDark ? "text-white" : "text-slate-900",
    content: isDark ? "text-slate-300" : "text-slate-600",

    fabBg: isDark ? "bg-indigo-500" : "bg-blue-500",
    fabBorder: isDark ? "border-indigo-400" : "border-blue-400",
  };

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
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0f172a" : "#ffffff"}
      />
      // bg-slate-900" or white
      {/* Header */}
      <View
        className={`mb-5 flex-row items-center justify-between border-b px-5 pb-4 pt-3 shadow-xl ${theme.headerBg} ${theme.border}`}
      >
        <View className="flex-row items-center gap-3">
          <NotePencil
            size={26}
            color={isDark ? "#f1f5f9" : "#0f172a"}
            weight="duotone"
          />
          <Text className={`text-2xl font-semibold ${theme.headerText}`}>
            Notes
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsDark(!isDark)}
          className={`rounded-full border p-2 shadow-xl active:scale-95 ${
            isDark
              ? "border-slate-700 bg-slate-800 "
              : "border-slate-200 bg-white "
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
              className={`mb-3 max-h-96 rounded-2xl border p-4 shadow-xl ${theme.noteBg} ${theme.noteBorder}`}
            >
              <Text className={`mb-1 font-semibold ${theme.title}`}>
                {item.title}
              </Text>

              <Text className={`text-sm ${theme.content}`}>{item.content}</Text>
            </View>
          </View>
        )}
      />
      {/* FAB */}
      <Pressable
        onPress={() => setVisible(true)}
        className={`absolute bottom-60 right-6 h-16 w-16 items-center justify-center rounded-full border shadow-xl active:opacity-80 ${theme.fabBg} ${theme.fabBorder}`}
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
          <View
            className={`rounded-t-2xl border-x border-t px-5 py-6 shadow-xl ${theme.headerBg} ${theme.border}`}
          >
            <Text className={`mb-6 text-lg font-semibold ${theme.headerText}`}>
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
                <View
                  className={`rounded-2xl border p-4 shadow-xl ${theme.fabBg} ${theme.fabBorder}`}
                >
                  <TextT size={28} color="white" weight="duotone" />
                </View>

                <Text className={`${theme.headerText}`}>Text</Text>
              </Pressable>

              {/* Drawing */}
              <Pressable
                onPress={() => {
                  setVisible(false);
                  router.push("/add-drawing");
                }}
                className="items-center gap-2"
              >
                <View
                  className={`rounded-2xl border p-4 shadow-xl ${theme.fabBg} ${theme.fabBorder}`}
                >
                  <PencilSimpleLine size={28} color="white" weight="duotone" />
                </View>

                <Text className={`${theme.headerText}`}>Drawing</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

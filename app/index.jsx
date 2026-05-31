import MasonryList from "@react-native-seoul/masonry-list";
import { useFocusEffect, useRouter } from "expo-router";
import {
  MoonIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  PencilSimpleLineIcon,
  PushPinIcon,
  SunIcon,
  TextTIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getNotes, initDB } from "../db/db";

const { width } = Dimensions.get("window");

export default function Index() {
  useEffect(() => {
    initDB();
  }, []);

  const [notes, setNotes] = useState([]);

  // as the screen comes up in focus
  useFocusEffect(
    useCallback(() => {
      const data = getNotes();
      console.log("📦 Loaded Notes:", data);
      setNotes(data);
    }, []),
  );

  const pinnedNotes = notes.filter((n) => n.pinned === 1);
  const otherNotes = notes.filter((n) => n.pinned === 0);

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

  // for modal
  const [visible, setVisible] = useState(false);

  // const notes = [
  //   { id: "1", title: "Grocery", content: "Milk\nEggs\nBread\nButter\nCheese" },
  //   { id: "2", title: "Ideas", content: "Wallpaper app\nAI notes\nTracker" },
  //   {
  //     id: "3",
  //     title: "Books",
  //     content: "Atomic Habits\nDeep Work\nPsychology of Money\nMore reading...",
  //   },
  //   {
  //     id: "4",
  //     title: "Workout",
  //     content: "Push\nPull\nLegs\nRepeat\nCardio\nStretch\nHydrate",
  //   },
  //   {
  //     id: "5",
  //     title: "Weekend",
  //     content: "Gym\nCode\nRelax\nMovie\nSleep\nFriends",
  //   },
  // ];

  return (
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      {/* bg: isDark ? "bg-slate-950" : "bg-slate-100" */}
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0f172a" : "#ffffff"}
      />
      {/* bg-slate-900" or white */}

      {/* Header */}
      <View
        className={`mb-5 flex-row items-center justify-between border-b px-5 pb-4 pt-3 ${theme.headerBg} ${theme.border}`}
        style={{ elevation: 1 }}
      >
        {/*
          headerBg: isDark ? "bg-slate-900" : "bg-white",
          border: isDark ? "border-slate-700" : "border-slate-200",
          headerText: isDark ? "text-slate-100" : "text-slate-900",
        */}

        <View className="flex-row items-center gap-3">
          <NotePencilIcon
            size={26}
            color={isDark ? "#f1f5f9" : "#0f172a"}
            weight="duotone"
          />
          <Text className={`text-2xl font-semibold ${theme.headerText}`}>
            Notes
          </Text>
          {/* headerText: isDark ? "text-slate-100" : "text-slate-900", */}
        </View>

        <TouchableOpacity
          onPress={() => setIsDark(!isDark)}
          className={`rounded-full border p-2 ${
            isDark
              ? "border-slate-700 bg-slate-800 "
              : "border-slate-200 bg-white "
          }`}
          style={{ elevation: 0.5 }}
        >
          {isDark ? (
            <SunIcon size={21} color="#facc15" weight="fill" />
          ) : (
            <MoonIcon size={21} weight="duotone" />
          )}
        </TouchableOpacity>
      </View>

      {/* Masonry List */}
      <MasonryList
        // data={notes}
        data={[...pinnedNotes, ...otherNotes]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingBottom: 120,
        }}
        renderItem={({ item }) => {
          const isDrawNote = item.content?.startsWith("data:image");

          return (
            <View style={{ alignItems: "center" }}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: isDrawNote ? "/draw-note" : "/text-note",
                    params: { id: item.id, lastTheme: isDark },
                  })
                }
              >
                <View
                  style={{ width: width / 2 - 20, elevation: 0.9 }}
                  className={`relative mb-3 rounded-2xl border ${theme.noteBg} ${theme.noteBorder} overflow-hidden`}
                >
                  {/* noteBg: isDark ? "bg-slate-900" : "bg-white",
                    noteBorder: isDark ? "border-slate-800" : "border-slate-200",
                    title: isDark ? "text-white" : "text-slate-900",
                    content: isDark ? "text-slate-300" : "text-slate-600", */}
                  {item.pinned === 1 && (
                    // <View
                    //   className={`z-10 absolute right-0 top-0 flex-row items-center gap-1 rounded-2xl border px-2 py-1 ${
                    //     isDark
                    //       ? "border-yellow-400/20 bg-yellow-400/10"
                    //       : "border-yellow-300 bg-yellow-100"
                    //   }`}
                    // >
                    <View
                      className={`absolute right-0 top-0 z-10 flex-row items-center gap-1 rounded-bl-2xl rounded-tr-2xl border px-2 py-1 ${
                        isDark
                          ? "border-yellow-400/20 bg-yellow-400/10"
                          : "border-yellow-300 bg-yellow-100"
                      }`}
                    >
                      <PushPinIcon
                        size={11}
                        color={isDark ? "#fde047" : "#eab308"} // dark vs light
                        weight="fill"
                      />
                      <Text
                        className={`text-[9px] font-medium ${
                          isDark ? "text-yellow-300" : "text-yellow-500"
                        }`}
                      >
                        Pinned
                      </Text>
                    </View>
                  )}

                  {/* <Text className={`mb-1 font-semibold ${theme.title}`}>
                    {item.title.trim()}
                  </Text>

                  <Text className={`text-sm ${theme.content}`}>
                    {item.content.trim()}
                  </Text> */}
                  {isDrawNote ? (
                    // ── Draw note card ──────────────────────────────
                    <>
                      {/* Canvas thumbnail */}
                      <Image
                        source={{ uri: item.content }}
                        style={{ width: "100%", height: 350 }}
                        resizeMode="cover"
                      />
                      {/* Title strip */}
                      {item.title?.trim() ? (
                        <View
                          className={`border-t px-3 py-2 ${theme.noteBorder}`}
                        >
                          <Text
                            className={`text-[13px] font-semibold ${theme.title}`}
                            numberOfLines={1}
                          >
                            {item.title.trim()}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  ) : (
                    // ── Text note card ──────────────────────────────
                    <View className="p-4">
                      <Text className={`mb-1 font-semibold ${theme.title}`}>
                        {item.title.trim()}
                      </Text>
                      <Text
                        className={`text-sm ${theme.content}`}
                        numberOfLines={10}
                      >
                        {item.content.trim()}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          );
        }}
      />

      {/* FAB */}
      <Pressable
        onPress={() => setVisible(true)}
        className={`absolute bottom-20 right-6 items-center justify-center rounded-2xl p-4 ${theme.fabBg}`}
        // style={{ elevation: 1 }}
      >
        <PencilSimpleIcon size={28} color="white" />
      </Pressable>

      {/* Modal */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          onPress={() => setVisible(false)}
          // className="flex-1 justify-end bg-black/30"
          className="flex-1 justify-end"
        >
          <View
            className={`px-5 pb-6 pt-4 ${theme.headerBg} border-t ${theme.border}`}
            style={{ elevation: 1 }}
          >
            <Text className={`mb-6 text-lg font-semibold ${theme.headerText} `}>
              New Note
            </Text>

            <View className="flex-row justify-around">
              {/* Text Note */}
              <Pressable
                onPress={() => {
                  setVisible(false);
                  router.push({
                    pathname: "/text-note",
                    params: { id: "", lastTheme: isDark },
                  });
                }}
                className="items-center gap-2"
              >
                <View className={`rounded-2xl p-4 ${theme.fabBg}`}>
                  <TextTIcon size={28} color="white" />
                </View>

                <Text className={`${theme.headerText}`}>Text</Text>
              </Pressable>

              {/* Drawing */}
              <Pressable
                onPress={() => {
                  setVisible(false);
                  router.push({
                    pathname: "/draw-note",
                    params: { id: "", lastTheme: isDark },
                  });
                }}
                className="items-center gap-2"
              >
                <View className={`rounded-2xl p-4 ${theme.fabBg}`}>
                  <PencilSimpleLineIcon
                    size={26}
                    color="white"
                    weight="duotone"
                  />
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

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            animation: "slide_from_left",
          }}
        />

        <Stack.Screen
          name="text-note"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="draw-note"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

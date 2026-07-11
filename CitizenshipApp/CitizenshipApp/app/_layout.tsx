import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tip-jar"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack>
    </AppProvider>
  );
}

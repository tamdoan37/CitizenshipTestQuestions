import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

/**
 * Inner navigator: lives inside AppProvider so it can wait for persisted state
 * to hydrate before dismissing the splash. Hiding on font-load alone left a
 * blank frame because AsyncStorage hydration is slower than the empty font map.
 */
function RootNavigator() {
  const { hydrated } = useApp();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      <Stack.Screen name="history" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="mock-interview" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="oral-practice" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="listen" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="read-write" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="review" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="vocab" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="weak-spots" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="updates" options={{ animation: "slide_from_right" }} />
      <Stack.Screen
        name="tip-jar"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({});

  // Keep the splash up (preventAutoHideAsync above) until fonts are ready.
  if (!loaded) return null;

  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

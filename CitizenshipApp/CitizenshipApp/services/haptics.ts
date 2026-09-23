import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Web-safe haptics wrapper. expo-haptics is a native-only module — calling it on
 * web throws ("not available on web"). These helpers no-op on web and never
 * reject, so UI handlers can call them unconditionally.
 */
export const haptics = {
  ImpactFeedbackStyle: Haptics.ImpactFeedbackStyle,
  NotificationFeedbackType: Haptics.NotificationFeedbackType,

  selection(): void {
    if (Platform.OS === "web") return;
    Haptics.selectionAsync().catch(() => {});
  },

  impact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light): void {
    if (Platform.OS === "web") return;
    Haptics.impactAsync(style).catch(() => {});
  },

  notify(type: Haptics.NotificationFeedbackType): void {
    if (Platform.OS === "web") return;
    Haptics.notificationAsync(type).catch(() => {});
  },
};

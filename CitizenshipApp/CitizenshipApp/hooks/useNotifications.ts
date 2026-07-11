import { useCallback, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { QUESTIONS } from "@/data/questions";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status !== "granted") Notifications.requestPermissionsAsync();
    });
  }, []);

  const scheduleDaily = useCallback(
    async (hourStr: string, minuteStr: string) => {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🇺🇸 Flashcard of the Day",
          body: q.text,
          data: { questionId: q.id },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        } as Notifications.DailyTriggerInput,
      });
    },
    []
  );

  const cancelAll = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  return { scheduleDaily, cancelAll };
}

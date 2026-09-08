/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/flashcards` | `/(tabs)/quiz` | `/(tabs)/settings` | `/_sitemap` | `/flashcards` | `/quiz` | `/settings` | `/tip-jar`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}

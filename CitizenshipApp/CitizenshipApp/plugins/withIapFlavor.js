const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * react-native-iap publishes two Android product flavors ("play" and
 * "amazon"). Without a choice, Gradle fails with a variant-ambiguity error:
 *   "cannot choose between amazonReleaseApiElements / playReleaseApiElements".
 *
 * This Expo config plugin injects `missingDimensionStrategy 'store', 'play'`
 * into the app's defaultConfig so the Google Play flavor is selected during
 * the (managed) EAS prebuild + Gradle build.
 */
module.exports = function withIapFlavor(config) {
  return withAppBuildGradle(config, (cfg) => {
    const contents = cfg.modResults.contents;
    if (contents.includes("missingDimensionStrategy")) {
      return cfg; // already present — don't duplicate
    }
    cfg.modResults.contents = contents.replace(
      /defaultConfig\s*\{/,
      "defaultConfig {\n        missingDimensionStrategy 'store', 'play'"
    );
    return cfg;
  });
};

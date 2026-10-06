import { describe, expect, it } from "vitest";
import { shouldShowInstallHint, type BrowserEnv } from "./installHint";

const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1",
  iphoneFirefox:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/141.0 Mobile/15E148 Safari/605.1.15",
  iphoneInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 Instagram 389.0.0.0",
  iphoneGoogleApp:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/380.0.0 Mobile/15E148 Safari/604.1",
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
};

const env = (userAgent: string, extra: Partial<BrowserEnv> = {}): BrowserEnv => ({ userAgent, standalone: false, ...extra });

describe("shouldShowInstallHint", () => {
  it("shows on iPhone Safari", () => {
    expect(shouldShowInstallHint(env(UA.iphoneSafari), false)).toBe(true);
  });

  it("shows on iPad Safari, which identifies as a Mac with a touch screen", () => {
    expect(shouldShowInstallHint(env(UA.macSafari, { platform: "MacIntel", maxTouchPoints: 5 }), false)).toBe(true);
  });

  it.each([
    ["Chrome on iPhone", env(UA.iphoneChrome)],
    ["Firefox on iPhone", env(UA.iphoneFirefox)],
    ["Instagram's in-app browser", env(UA.iphoneInstagram)],
    ["the Google app", env(UA.iphoneGoogleApp)],
    ["desktop Safari", env(UA.macSafari, { platform: "MacIntel", maxTouchPoints: 0 })],
    ["Android Chrome", env(UA.androidChrome)],
  ])("hides on %s", (_, e) => {
    expect(shouldShowInstallHint(e, false)).toBe(false);
  });

  it("hides once installed or dismissed", () => {
    expect(shouldShowInstallHint(env(UA.iphoneSafari, { standalone: true }), false)).toBe(false);
    expect(shouldShowInstallHint(env(UA.iphoneSafari), true)).toBe(false);
  });
});

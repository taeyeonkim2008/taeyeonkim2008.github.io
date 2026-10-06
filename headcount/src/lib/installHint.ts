// Decides whether to show the "Add to Home Screen" hint. iOS has no install
// prompt, so Safari users have to be told about Share → Add to Home Screen.

export interface BrowserEnv {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
  /** navigator.standalone (iOS) or display-mode: standalone — already installed. */
  standalone: boolean;
}

// Other iOS browsers and in-app webviews also say "Safari" in their user agent.
const NOT_SAFARI = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|GSA\/|YaBrowser|FBAN|FBAV|Instagram|Snapchat|LinkedInApp|Twitter|Line\//;

export function isIOS({ userAgent, platform, maxTouchPoints = 0 }: BrowserEnv): boolean {
  // iPadOS Safari reports itself as a Mac, but Macs have no touch screen.
  return /iPhone|iPad|iPod/.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
}

export function isSafari(userAgent: string): boolean {
  return /Safari\//.test(userAgent) && /Version\//.test(userAgent) && !NOT_SAFARI.test(userAgent);
}

export function shouldShowInstallHint(env: BrowserEnv, dismissed: boolean): boolean {
  return !dismissed && !env.standalone && isIOS(env) && isSafari(env.userAgent);
}

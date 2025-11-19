// Share utility functions for watch parties

export interface ShareOptions {
  userName: string;
  shareCode: string;
  roomName?: string;
  gameName: string; // e.g., "Patriots @ Chiefs"
  sport: string; // e.g., "NFL"
}

export function generateShareMessage(options: ShareOptions): string {
  const { userName, shareCode, roomName, gameName, sport } = options;
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const joinUrl = siteUrl ? `${siteUrl}/rooms/join?code=${shareCode}` : `/rooms/join?code=${shareCode}`;

  const partyName = roomName || gameName;

  return `${userName} has invited you to a Watch Party! 🎉

Party: ${partyName}
Sport: ${sport.toUpperCase()}
Share Code: ${shareCode}

Join now and watch together with spoiler protection - everyone can chat while watching at their own pace!

Click here to join: ${joinUrl}

Powered by Caught Up Yet`;
}

export function generateEmailShare(options: ShareOptions): string {
  const message = generateShareMessage(options);
  const subject = `Join my ${options.sport.toUpperCase()} Watch Party!`;

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export function generateSMSShare(options: ShareOptions): string {
  const message = generateShareMessage(options);

  // Standard SMS format works across all platforms
  return `sms:?body=${encodeURIComponent(message)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

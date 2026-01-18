// Share utility functions for watch parties

export interface ShareOptions {
  userName: string;
  shareCode: string;
  roomName?: string;
  gameName: string; // e.g., "Patriots @ Chiefs"
  sport: string; // e.g., "NFL"
}

// Generate the clean shareable URL
export function getShareUrl(shareCode: string): string {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  return siteUrl ? `${siteUrl}/join/${shareCode}` : `/join/${shareCode}`;
}

// Short text message for SMS/iMessage (under 160 chars ideal)
export function generateTextMessage(options: ShareOptions): string {
  const { userName, shareCode, gameName } = options;
  const joinUrl = getShareUrl(shareCode);
  return `${userName}: Watching ${gameName}? Join my watch party - no spoilers! ${joinUrl}`;
}

// Full share message with more details
export function generateShareMessage(options: ShareOptions): string {
  const { userName, shareCode, roomName, gameName, sport } = options;
  const joinUrl = getShareUrl(shareCode);
  const partyName = roomName || gameName;

  return `${userName} invited you to a Watch Party!

${partyName} (${sport.toUpperCase()})

Watch together without spoilers - messages only appear when you reach that moment in the game.

Join here: ${joinUrl}

Code: ${shareCode}`;
}

export function generateEmailShare(options: ShareOptions): string {
  const message = generateShareMessage(options);
  const subject = `Join my ${options.sport.toUpperCase()} Watch Party!`;

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export function generateSMSShare(options: ShareOptions): string {
  // Use the shorter text message for SMS
  const message = generateTextMessage(options);
  return `sms:?body=${encodeURIComponent(message)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

// Check if Web Share API is available
export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

// Use native share sheet (mobile)
export async function nativeShare(options: ShareOptions): Promise<boolean> {
  if (!canUseNativeShare()) return false;

  const shareUrl = getShareUrl(options.shareCode);
  const title = `Watch ${options.gameName} together`;
  const text = generateTextMessage(options);

  try {
    await navigator.share({
      title,
      text,
      url: shareUrl,
    });
    return true;
  } catch (err) {
    // User cancelled or share failed
    if (err instanceof Error && err.name !== "AbortError") {
      console.error("Share failed:", err);
    }
    return false;
  }
}

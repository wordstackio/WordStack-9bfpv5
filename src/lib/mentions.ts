import { mockPoets } from "./mockData";

/**
 * Extract mentions from text (e.g., "@username")
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

/**
 * Resolve a mentioned username to a user ID
 * Returns the user ID if found, otherwise returns the mention name
 */
export function resolveMentionToUserId(mentionName: string): string {
  const poet = mockPoets.find(p => 
    p.name.toLowerCase().replace(/\s+/g, '') === mentionName.toLowerCase()
  );
  return poet ? poet.id : mentionName;
}

/**
 * Get all mentioned user IDs from text content
 */
export function getMentionedUserIds(content: string): string[] {
  const mentions = extractMentions(content);
  return mentions.map(resolveMentionToUserId);
}

/**
 * Format text with styled mentions
 * Returns an array of JSX elements
 */
export function formatMentions(content: string, renderMention: (username: string, key: string) => React.ReactNode, renderText: (text: string, key: string) => React.ReactNode) {
  const mentionRegex = /(@\w+)/g;
  const parts = content.split(mentionRegex);
  
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1); // Remove @
      return renderMention(username, `mention-${index}`);
    }
    return renderText(part, `text-${index}`);
  });
}

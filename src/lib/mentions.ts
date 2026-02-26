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
 * Returns the user ID if found, otherwise returns null
 */
export function resolveMentionToUserId(mentionName: string): string | null {
  // First try exact match (case-insensitive, spaces removed)
  const normalizedMention = mentionName.toLowerCase();
  
  let poet = mockPoets.find(p => 
    p.name.toLowerCase().replace(/\s+/g, '') === normalizedMention
  );
  
  if (poet) return poet.id;
  
  // Try matching first name or last name
  poet = mockPoets.find(p => {
    const nameParts = p.name.toLowerCase().split(/\s+/);
    return nameParts.some(part => part === normalizedMention);
  });
  
  if (poet) return poet.id;
  
  // Try partial match
  poet = mockPoets.find(p => 
    p.name.toLowerCase().includes(normalizedMention)
  );
  
  return poet ? poet.id : null;
}

/**
 * Get all mentioned user IDs from text content
 */
export function getMentionedUserIds(content: string): string[] {
  const mentions = extractMentions(content);
  return mentions
    .map(resolveMentionToUserId)
    .filter((id): id is string => id !== null);
}

/**
 * Format text with styled mentions
 * Returns an array of JSX elements
 */
export function formatMentions(content: string, renderMention: (username: string, key: string) => React.ReactNode, renderText: (text: string, key: string) => React.ReactNode) {
  const mentionRegex = /(@\w+)/g;
  const parts = content.split(mentionRegex);
  
  return parts.map((part, index) => {
    if (!part) return null; // Skip empty strings
    if (part.startsWith('@')) {
      const username = part.slice(1); // Remove @
      return renderMention(username, `mention-${index}`);
    }
    return renderText(part, `text-${index}`);
  }).filter(Boolean); // Filter out null values
}

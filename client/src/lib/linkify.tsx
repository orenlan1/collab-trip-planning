import React from "react";

const URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

export function linkify(text: string, isCurrentUser: boolean): React.ReactNode {
  const matches = Array.from(text.matchAll(URL_REGEX));

  if (matches.length === 0) {
    return text;
  }

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const url = match[0];
    const startIndex = match.index!;

    // Add text before the URL
    if (startIndex > lastIndex) {
      result.push(text.substring(lastIndex, startIndex));
    }

    // Add the URL as a link
    result.push(
      <a
        key={`link-${index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={isCurrentUser ? "underline hover:opacity-80" : "text-blue-600 underline hover:text-blue-800"}
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );

    lastIndex = startIndex + url.length;
  });

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
}

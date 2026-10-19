// Strips Markdown and emoji so text can be spoken or placed in a PDF.
export function stripMarkdown(text = "") {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>~]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
import { jsPDF } from "jspdf";
import { stripMarkdown } from "./text";

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const label = (m) => (m.role === "user" ? "You" : "MediAssist");
const stamp = (m) => new Date(m.time).toLocaleString();

export function exportChatAsText(messages) {
  const body = messages
    .map((m) => `[${stamp(m)}] ${label(m)}:\n${stripMarkdown(m.content)}`)
    .join("\n\n");
  download("hospital-ai-chat.txt", body, "text/plain");
}

export function exportChatAsJSON(messages) {
  const data = messages.map(({ role, content, time, medicines }) => ({
    role,
    content,
    time: new Date(time).toISOString(),
    medicines: medicines || [],
  }));
  download("hospital-ai-chat.json", JSON.stringify(data, null, 2), "application/json");
}

export function downloadChatAsPDF(messages) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const width = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (needed = 14) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MediAssist - Chat Transcript", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 26;

  messages.forEach((m) => {
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${label(m)}  -  ${new Date(m.time).toLocaleTimeString()}`, margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    // jsPDF's built-in fonts only support Latin characters
    const clean = stripMarkdown(m.content).replace(/[^\x20-\x7E\n]/g, "");
    doc.splitTextToSize(clean, width).forEach((line) => {
      ensureSpace(14);
      doc.text(line, margin, y);
      y += 14;
    });
    y += 12;
  });

  doc.save("hospital-ai-chat.pdf");
}
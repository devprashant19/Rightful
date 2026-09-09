import { DocumentInput } from "@/lib/types";
import { extractText } from "unpdf";

export async function processUploadedFile(file: File, index: number): Promise<DocumentInput> {
  const docId = `D${index + 1}`;
  const fileName = file.name.toLowerCase();
  let text = "";
  let type: DocumentInput["type"] = "text";

  if (fileName.endsWith(".txt") || fileName.endsWith(".text")) {
    text = await file.text();
    type = "text";
  } else if (fileName.endsWith(".eml")) {
    const rawEml = await file.text();
    text = parseEml(rawEml);
    type = "eml";
  } else if (fileName.endsWith(".pdf")) {
    const buffer = await file.arrayBuffer();
    const pdfData = await extractText(new Uint8Array(buffer));
    text = Array.isArray(pdfData.text) ? pdfData.text.join("\n") : String(pdfData.text);
    type = "pdf";
  } else if (fileName.match(/\.(png|jpe?g|webp)$/)) {
    type = "image";
    text = "[Image receipt attached. Note: For optimal accuracy, please paste the receipt text directly.]";
  } else {
    text = await file.text();
    type = "text";
  }

  // Truncate to 12,000 chars to protect LLM context windows
  const cleanContent = text.trim().slice(0, 12000);

  return {
    id: docId,
    name: file.name,
    type,
    content: cleanContent,
    sizeBytes: file.size,
  };
}

/**
 * Strips headers and HTML from .eml files, retaining essential purchase metadata
 */
export function parseEml(raw: string): string {
  const lines = raw.split("\n");
  const headers: Record<string, string> = {};
  let bodyStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      bodyStartIndex = i + 1;
      break;
    }
    const match = line.match(/^([A-Za-z0-9-]+):\s*(.*)$/);
    if (match) {
      headers[match[1].toLowerCase()] = match[2].trim();
    }
  }

  const rawBody = lines.slice(bodyStartIndex).join("\n");
  // Simple HTML tag strip
  const cleanBody = rawBody.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");

  return `From: ${headers["from"] || "Unknown"}\nDate: ${headers["date"] || "Unknown"}\nSubject: ${headers["subject"] || "Unknown"}\n\n${cleanBody}`;
}


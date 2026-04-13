import { RawRecord } from "./types";

const SHEET_ID = "1ObLjD_uGsxtntx3u3TAxRoMtTSTV-oDxflf76dhBOLg";
const SHEET_NAME = "Página1";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export async function fetchSheetData(): Promise<RawRecord[]> {
  const response = await fetch(CSV_URL);
  if (!response.ok) throw new Error("Falha ao carregar dados da planilha");
  const text = await response.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = (values[i] || "").replace(/^"|"$/g, "");
    });
    return record as unknown as RawRecord;
  });
}

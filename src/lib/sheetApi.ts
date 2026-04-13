const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxxCTFRs1ycDLYqkheob94Heuem-ZvxOZWeT8f3urSSscKVjnt0tQ6vwGfYZlGzJw2/exec";

export interface SheetRow {
  PACIENTE: string;
  "DATA DE ENTRADA": string;
  "DATA DE SAÍDA": string;
  CIDADE: string;
  "OUTRAS CIDADES": string;
  "TEMPO DE PERMANÊNCIA": string;
  "TIPO DE INTERNAÇÃO": string;
  "TIPO DE ALTA": string;
  CIDs: string;
  "PACIENTE MENOR DE IDADE?": string;
  _row?: number;
}

export async function apiAddRow(data: Partial<SheetRow>): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=add`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateRow(rowNumber: number, data: Partial<SheetRow>): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=update&row=${rowNumber}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteRow(rowNumber: number): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=delete&row=${rowNumber}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return res.json();
}

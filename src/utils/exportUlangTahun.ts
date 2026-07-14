export interface ExportEntry {
  nama: string;
  tanggal: string; // YYYY-MM-DD (tanggal lahir / tanggal perkawinan asli)
  ke: number; // ulang tahun ke- / usia pernikahan ke-
}

function formatTanggalDMY(tgl: string): string {
  const [y, m, d] = tgl.split("-");
  return `${d}-${m}-${y}`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildUlangTahunText(entries: ExportEntry[]): string {
  return entries
    .map((e) => `${e.nama}, ${formatTanggalDMY(e.tanggal)} (Ulang Tahun Ke-${e.ke})`)
    .join("\n");
}

export function buildAnniversaryText(entries: ExportEntry[]): string {
  return entries
    .map((e) => `Bpk. ${e.nama}, ${formatTanggalDMY(e.tanggal)} (Yang Ke-${e.ke})`)
    .join("\n");
}

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function monthYearFilename(prefix: string): string {
  const now = new Date();
  return `${prefix}_${MONTH_NAMES_ID[now.getMonth()]}_${now.getFullYear()}.txt`;
}

// Draws every scene of the upper-limb videos. Pure functions: scene data in, SVG text out.
export type ULLayout = "title" | "bullets" | "compare" | "steps" | "letters" | "table" | "sh" | "deform";

export type ULStage = {
  label: string;
  narration: string;
  layout: ULLayout;
  sub?: string;
  items?: string[];
  left?: { title: string; lines: string[] };
  right?: { title: string; lines: string[] };
  letters?: { l: string; w: string; d?: string }[];
  rows?: [string, string][];
  note?: string;
};

const NAVY = "#0B1F3A", CARD = "#14294D", LINE = "#2A3E5C", GOLD = "#D4AF37", CREAM = "#F4F1EA";
const MUTED = "#9AA6B8", RED = "#E5584F", GREEN = "#5BBF8A", BONE = "#EDE6D3", BONE_EDGE = "#B9AE92";
const FONT = "Helvetica, Arial, sans-serif";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type TO = { size?: number; fill?: string; anchor?: "start" | "middle" | "end"; weight?: number };
function t(x: number, y: number, s: string, o: TO = {}): string {
  const { size = 15, fill = CREAM, anchor = "middle", weight = 400 } = o;
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}" font-family="${FONT}">${esc(s)}</text>`;
}

function wrap(text: string, max: number): string[] {
  // long hyphenated words (for example "Fracture-dislocation") may break after the hyphen
  const words: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (w.length > max && w.includes("-")) {
      const parts = w.split("-");
      parts.forEach((p, i) => words.push(i < parts.length - 1 ? p + "-" : p));
    } else words.push(w);
  }
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const glue = cur.endsWith("-") ? "" : " ";
    const next = cur ? cur + glue + w : w;
    if (next.length <= max || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

const charsFor = (width: number, size: number, bold = false) => Math.max(8, Math.floor(width / (size * (bold ? 0.62 : 0.55))));

function frame(title: string, inner: string): string {
  const ts = title.length > 24 ? 17 : title.length > 20 ? 19 : 22;
  return (
    `<svg width="380" height="460" viewBox="0 0 380 460" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="380" height="460" fill="${NAVY}"/>` +
    t(190, 48, title, { size: ts, fill: GOLD, weight: 700 }) +
    `<line x1="60" y1="64" x2="320" y2="64" stroke="${LINE}" stroke-width="1.5"/>` +
    inner +
    t(190, 442, "Faith and Focus Academy", { size: 11, fill: MUTED }) +
    `</svg>`
  );
}

function noteBox(note: string, y: number): { svg: string; bottom: number } {
  const lines = wrap(note, 40);
  const h = lines.length * 18 + 16;
  let out = `<rect x="24" y="${y}" width="332" height="${h}" rx="10" fill="${CARD}" stroke="${GOLD}" stroke-width="1.5"/>`;
  lines.forEach((l, i) => (out += t(190, y + 23 + i * 18, l, { size: 13, fill: GOLD, weight: 700 })));
  return { svg: out, bottom: y + h };
}

function bullets(s: ULStage, size: number, numbered: boolean): { svg: string; bottom: number } {
  const lh = Math.round(size * 1.38);
  const maxc = charsFor(numbered ? 290 : 296, size);
  let y = 104;
  let out = "";
  (s.items || []).forEach((it, i) => {
    const ls = wrap(it, maxc);
    if (numbered) {
      out += `<circle cx="38" cy="${y - 5}" r="13" fill="${i === (s.items!.length - 1) && false ? GOLD : CARD}" stroke="${GOLD}" stroke-width="1.5"/>`;
      out += t(38, y, String(i + 1), { size: 14, fill: GOLD, weight: 700 });
    } else {
      out += `<circle cx="36" cy="${y - 5}" r="4" fill="${GOLD}"/>`;
    }
    ls.forEach((l, j) => (out += t(60 - (numbered ? 0 : 6), y + j * lh, l, { size, anchor: "start" })));
    y += ls.length * lh + 11;
  });
  let bottom = y;
  if (s.note) {
    const nb = noteBox(s.note, y + 4);
    out += nb.svg;
    bottom = nb.bottom;
  }
  return { svg: out, bottom };
}

function letters(s: ULStage, size: number): { svg: string; bottom: number } {
  let y = 100;
  let out = "";
  (s.letters || []).forEach((r) => {
    const dl = r.d ? wrap(r.d, charsFor(280, size - 3)) : [];
    out += `<circle cx="38" cy="${y + 6}" r="17" fill="${GOLD}"/>`;
    out += t(38, y + 12, r.l, { size: 18, fill: NAVY, weight: 700 });
    out += t(68, y + 4, r.w, { size: size + 1, weight: 700, anchor: "start" });
    dl.forEach((l, i) => (out += t(68, y + 22 + i * (size), l, { size: size - 3, fill: MUTED, anchor: "start" })));
    y += Math.max(46, 30 + dl.length * size);
  });
  let bottom = y;
  if (s.note) {
    const nb = noteBox(s.note, y + 2);
    out += nb.svg;
    bottom = nb.bottom;
  }
  return { svg: out, bottom };
}

function table(s: ULStage, size: number): { svg: string; bottom: number } {
  const lc = charsFor(122, size, true);
  const rc = charsFor(200, size);
  let y = 96;
  let out = "";
  (s.rows || []).forEach(([a, b], i) => {
    const la = wrap(a, lc);
    const lb = wrap(b, rc);
    const n = Math.max(la.length, lb.length);
    la.forEach((l, j) => (out += t(20, y + 14 + j * (size + 4), l, { size, fill: GOLD, weight: 700, anchor: "start" })));
    lb.forEach((l, j) => (out += t(150, y + 14 + j * (size + 4), l, { size, anchor: "start" })));
    const h = n * (size + 4) + 14;
    y += h;
    out += `<line x1="20" y1="${y - 3}" x2="360" y2="${y - 3}" stroke="${LINE}" stroke-width="1"/>`;
  });
  let bottom = y;
  if (s.note) {
    const nb = noteBox(s.note, y + 8);
    out += nb.svg;
    bottom = nb.bottom;
  }
  return { svg: out, bottom };
}

function compare(s: ULStage, size: number): { svg: string; bottom: number } {
  const cc = charsFor(146, size);
  const tc = charsFor(146, size + 2, true);
  const L = s.left!, R = s.right!;
  const prep = (c: { title: string; lines: string[] }) => ({
    tl: wrap(c.title, tc),
    ls: c.lines.map((x) => wrap(x, cc)),
  });
  const pl = prep(L), pr = prep(R);
  const height = (p: ReturnType<typeof prep>) => 24 + p.tl.length * (size + 5) + 8 + p.ls.reduce((n, x) => n + x.length * (size + 4) + 7, 0) + 6;
  const h = Math.max(height(pl), height(pr));
  let out = "";
  [[pl, 15], [pr, 195]].forEach(([p, x]) => {
    const pp = p as ReturnType<typeof prep>;
    const xx = x as number;
    out += `<rect x="${xx}" y="84" width="170" height="${h}" rx="14" fill="${CARD}" stroke="${LINE}" stroke-width="1.5"/>`;
    let y = 108;
    pp.tl.forEach((l) => {
      out += t(xx + 85, y, l, { size: size + 2, fill: GOLD, weight: 700 });
      y += size + 5;
    });
    y += 8;
    pp.ls.forEach((ls) => {
      ls.forEach((l, j) => (out += t(xx + 85, y + j * (size + 4), l, { size })));
      y += ls.length * (size + 4) + 7;
    });
  });
  let bottom = 84 + h;
  if (s.note) {
    const nb = noteBox(s.note, bottom + 12);
    out += nb.svg;
    bottom = nb.bottom;
  }
  return { svg: out, bottom };
}

function titleScene(s: ULStage): string {
  const ls = wrap(s.label, 19);
  let out = `<rect x="150" y="104" width="80" height="4" rx="2" fill="${GOLD}"/>`;
  ls.forEach((l, i) => (out += t(190, 166 + i * 34, l, { size: 26, fill: CREAM, weight: 700 })));
  const y2 = 166 + ls.length * 34 + 14;
  wrap(s.sub || "", 34).forEach((l, i) => (out += t(190, y2 + i * 22, l, { size: 15, fill: GOLD })));
  out += t(190, 400, "Teaching video", { size: 12, fill: MUTED });
  return frame("Upper limb trauma", out);
}

function shScene(s: ULStage): string {
  const names: string[][] = [["Straight", "across"], ["Above"], ["Lower"], ["Through"], ["cRush"]];
  const roman = ["I", "II", "III", "IV", "V"];
  let out = t(190, 92, "Gold band = the growth plate (physis)", { size: 12, fill: MUTED });
  for (let i = 0; i < 5; i++) {
    const x = 55 + i * 67.5;
    out += `<rect x="${x - 11}" y="104" width="22" height="86" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="1.5"/>`;
    out += `<polygon points="${x - 11},190 ${x + 11},190 ${x + 21},222 ${x - 21},222" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="1.5"/>`;
    out += `<rect x="${x - 21}" y="222" width="42" height="8" fill="${GOLD}"/>`;
    out += `<rect x="${x - 23}" y="230" width="46" height="44" rx="14" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="1.5"/>`;
    const red = (pts: string) => `<polyline points="${pts}" fill="none" stroke="${RED}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (i === 0) out += red(`${x - 26},226 ${x + 26},226`);
    if (i === 1) out += red(`${x - 26},226 ${x + 6},226 ${x + 10},194`);
    if (i === 2) out += red(`${x - 26},226 ${x - 2},226 ${x - 2},276`);
    if (i === 3) out += red(`${x + 2},192 ${x + 2},276`);
    if (i === 4) {
      out += red(`${x - 20},226 ${x - 10},221 ${x},231 ${x + 10},221 ${x + 20},226`);
      out += `<line x1="${x - 12}" y1="190" x2="${x - 12}" y2="214" stroke="${RED}" stroke-width="3"/><polygon points="${x - 12},218 ${x - 17},209 ${x - 7},209" fill="${RED}"/>`;
      out += `<line x1="${x + 12}" y1="190" x2="${x + 12}" y2="214" stroke="${RED}" stroke-width="3"/><polygon points="${x + 12},218 ${x + 7},209 ${x + 17},209" fill="${RED}"/>`;
    }
    out += t(x, 304, roman[i], { size: 16, fill: GOLD, weight: 700 });
    names[i].forEach((n, j) => (out += t(x, 322 + j * 14, n, { size: 11 })));
  }
  out += `<line x1="50" y1="352" x2="330" y2="352" stroke="${LINE}" stroke-width="1.5"/>`;
  out += t(190, 382, "S - A - L - T - R", { size: 20, fill: GOLD, weight: 700 });
  out += t(190, 406, "Type V: worst prognosis, risk of growth arrest", { size: 12, fill: RED });
  return frame(s.label, out);
}

function deformScene(s: ULStage): string {
  let out = "";
  const cards: [number, string, string[], number][] = [
    [15, "Colles", ["Dorsal displacement", "Dinner-fork deformity", "Fall on outstretched hand, wrist extended"], -1],
    [195, "Smith", ["Volar displacement", "Garden-spade deformity", "Fall onto a flexed wrist"], 1],
  ];
  cards.forEach(([x, name, lines, dir]) => {
    out += `<rect x="${x}" y="84" width="170" height="300" rx="14" fill="${CARD}" stroke="${LINE}" stroke-width="1.5"/>`;
    out += t(x + 85, 110, name, { size: 17, fill: GOLD, weight: 700 });
    out += t(x + 85, 134, "Dorsal (back)", { size: 11, fill: MUTED });
    out += t(x + 85, 250, "Volar (palm)", { size: 11, fill: MUTED });
    // forearm shaft and displaced distal fragment, side view
    out += `<rect x="${x + 14}" y="186" width="74" height="16" rx="4" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="1.5"/>`;
    const dy = dir === -1 ? -16 : 16;
    const rot = dir === -1 ? -14 : 14;
    out += `<g transform="rotate(${rot} ${x + 118} ${194 + dy})"><rect x="${x + 92}" y="${186 + dy}" width="54" height="16" rx="4" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="1.5"/></g>`;
    out += `<line x1="${x + 90}" y1="178" x2="${x + 90}" y2="210" stroke="${RED}" stroke-width="2.5" stroke-dasharray="4 3"/>`;
    const ay1 = dir === -1 ? 176 : 212, ay2 = dir === -1 ? 152 : 236;
    out += `<line x1="${x + 130}" y1="${ay1}" x2="${x + 130}" y2="${ay2}" stroke="${RED}" stroke-width="3"/>`;
    out += `<polygon points="${x + 130},${ay2} ${x + 125},${ay2 + (dir === -1 ? 9 : -9)} ${x + 135},${ay2 + (dir === -1 ? 9 : -9)}" fill="${RED}"/>`;
    lines.forEach((l, i) => wrap(l, 22).forEach((ln, j) => (out += t(x + 85, 284 + i * 34 + j * 15, ln, { size: 12.5, fill: i === 1 ? GOLD : CREAM, weight: i === 1 ? 700 : 400 }))));
  });
  out += t(190, 410, "Colles = dorsal.  Smith = volar.", { size: 13, fill: GOLD, weight: 700 });
  return frame(s.label, out);
}

export function buildSvg(s: ULStage): string {
  if (s.layout === "title") return titleScene(s);
  if (s.layout === "sh") return shScene(s);
  if (s.layout === "deform") return deformScene(s);
  const sizes = [15, 14, 13, 12, 11];
  let inner = "";
  for (const size of sizes) {
    let r: { svg: string; bottom: number };
    if (s.layout === "bullets") r = bullets(s, size, false);
    else if (s.layout === "steps") r = bullets(s, size, true);
    else if (s.layout === "letters") r = letters(s, size);
    else if (s.layout === "table") r = table(s, size);
    else r = compare(s, size);
    inner = r.svg;
    if (r.bottom <= 424) break;
  }
  return frame(s.label, inner);
}

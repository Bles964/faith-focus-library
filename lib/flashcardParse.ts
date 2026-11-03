// Save as: lib/flashcardParse.ts
// Free, no AI: turns text into flashcards.

export type NewCard = { question: string; answer: string };

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

// 1) Text you paste. Accepts:
//    Q: question          or      question | answer      (one per line)
//    A: answer
export function parsePasted(text: string): NewCard[] {
  const out: NewCard[] = [];
  const t = text.replace(/\r/g, "").trim();
  if (!t) return out;

  const re =
    /(?:^|\n)\s*(?:Q\d*|Question\s*\d*)\s*[:.)\-]\s*([\s\S]*?)\n\s*(?:A\d*|Answer)\s*[:.)\-]\s*([\s\S]*?)(?=\n\s*(?:Q\d*|Question\s*\d*)\s*[:.)\-]|\s*$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    const q = m[1].trim();
    const a = m[2].trim();
    if (q && a) out.push({ question: q, answer: a });
  }
  if (out.length > 0) return out;

  // Fallback: "question | answer" on each line
  for (const line of t.split("\n")) {
    const i = line.indexOf("|");
    if (i > 0) {
      const q = line.slice(0, i).trim();
      const a = line.slice(i + 1).trim();
      if (q && a) out.push({ question: q, answer: a });
    }
  }
  return out;
}

// 2) MCQs found inside PDF text: numbered questions, options A-E, and a marked answer
//    such as "Answer: B", "Ans: B" or "Correct answer: B".
export function parseMcqs(raw: string): NewCard[] {
  const text = clean(raw);
  if (!text) return [];

  // Find "1." "2." "3." ... but only accept them in counting order, so ordinary numbers are ignored.
  const marks: { n: number; index: number; len: number }[] = [];
  const re = /(?:^|\s)(\d{1,3})\s*[.)]\s+(?=\S)/g;
  let m: RegExpExecArray | null;
  let expected = 1;
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    if (n === expected) {
      marks.push({ n, index: m.index, len: m[0].length });
      expected++;
    }
  }

  const cards: NewCard[] = [];
  for (let i = 0; i < marks.length; i++) {
    const block = text.slice(marks[i].index + marks[i].len, i + 1 < marks.length ? marks[i + 1].index : undefined).trim();

    // Answer marker
    const ansMatch = block.match(/(?:correct\s+answer|answer|ans)\s*[:\-=]?\s*\(?([A-E])\b\)?/i);
    if (!ansMatch) continue;
    const letter = ansMatch[1].toUpperCase();

    const body = block.slice(0, ansMatch.index).trim();
    const after = block.slice((ansMatch.index ?? 0) + ansMatch[0].length).trim();

    // Options: A. ... B. ... (in order)
    const optRe = /(?:^|\s)\(?([A-E])[.)]\s+/g;
    const opts: { letter: string; index: number; len: number }[] = [];
    let nextLetter = "A";
    let om: RegExpExecArray | null;
    while ((om = optRe.exec(body)) !== null) {
      if (om[1].toUpperCase() === nextLetter) {
        opts.push({ letter: nextLetter, index: om.index, len: om[0].length });
        nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
      }
    }
    if (opts.length < 2) continue;

    const question = body.slice(0, opts[0].index).trim();
    if (!question) continue;
    const optionTexts = opts.map((o, k) =>
      body.slice(o.index + o.len, k + 1 < opts.length ? opts[k + 1].index : undefined).trim()
    );
    const correctIdx = opts.findIndex((o) => o.letter === letter);
    if (correctIdx < 0) continue;

    const front = question + "\n\n" + opts.map((o, k) => `${o.letter}. ${optionTexts[k]}`).join("\n");

    let back = `${letter}. ${optionTexts[correctIdx]}`;
    const expl = after.replace(/^[\s.:\-]*(?:explanation|rationale)?\s*[:\-]?\s*/i, "").trim();
    if (expl) back += "\n\n" + expl.slice(0, 400);

    cards.push({ question: front, answer: back });
  }
  return cards;
}

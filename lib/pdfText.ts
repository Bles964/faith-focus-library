// Save as: lib/pdfText.ts   (replace the old one)
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// A page with fewer real letters than this is treated as a picture (photo or scan)
const MIN_LETTERS = 40;
// Reading pictures is slow, so stop after this many picture-pages in one document
const MAX_OCR_PAGES = 30;

let tessPromise: Promise<any> | null = null;

// Loads the free text-reading tool (Tesseract) only when a picture-page needs it
function loadTesseract(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"));
  if ((window as any).Tesseract) return Promise.resolve((window as any).Tesseract);
  if (!tessPromise) {
    tessPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
      s.onload = () => resolve((window as any).Tesseract);
      s.onerror = () => {
        tessPromise = null;
        reject(new Error("Could not load the text-reading tool"));
      };
      document.head.appendChild(s);
    });
  }
  return tessPromise;
}

const letterCount = (t: string) => (t.match(/[A-Za-z]/g) || []).length;

export async function extractPdfText(url: string, onProgress?: (message: string) => void): Promise<string> {
  const pdf = await pdfjsLib.getDocument(url).promise;
  let fullText = "";
  let worker: any = null;
  let ocrDone = 0;
  let ocrBroken = false;

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let pageText = content.items.map((item: any) => item.str).join(" ");

      // No real text on this page: it is a photo or a scan, so read the picture instead
      if (letterCount(pageText) < MIN_LETTERS && !ocrBroken && ocrDone < MAX_OCR_PAGES) {
        try {
          onProgress?.(`Reading the picture on page ${i} of ${pdf.numPages}...`);
          if (!worker) {
            const T = await loadTesseract();
            worker = await T.createWorker("eng");
          }
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No canvas");
          await page.render({ canvasContext: ctx, viewport }).promise;
          const result = await worker.recognize(canvas);
          const ocrText: string = (result?.data?.text || "").replace(/\s+/g, " ").trim();
          if (letterCount(ocrText) > letterCount(pageText)) pageText = ocrText;
          ocrDone++;
        } catch {
          // Offline or the tool failed: carry on with normal text for the rest of the document
          ocrBroken = true;
        }
      }

      fullText += pageText + "\n";
    }
  } finally {
    try {
      await worker?.terminate();
    } catch {}
  }

  return fullText;
}

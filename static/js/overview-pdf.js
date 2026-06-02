const PDFJS_VERSION = "4.10.38";
const PDF_JS_SRC = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;
const PDF_WORKER_SRC = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  const mod = await import(PDF_JS_SRC);
  mod.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  window.pdfjsLib = mod;
  return mod;
}

async function renderPdfToCanvas(canvas) {
  const pdfjsLib = await loadPdfJs();
  const url = canvas.dataset.pdf;
  const pdf = await pdfjsLib.getDocument(url).promise;
  const page = await pdf.getPage(1);

  const parentWidth = canvas.parentElement.clientWidth;
  const viewport = page.getViewport({ scale: 1 });
  const scale = parentWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(scaledViewport.width * dpr);
  canvas.height = Math.floor(scaledViewport.height * dpr);
  canvas.style.width = `${scaledViewport.width}px`;
  canvas.style.height = `${scaledViewport.height}px`;

  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;
}

async function renderAll() {
  const canvases = document.querySelectorAll(".overview-pdf-canvas");
  for (const canvas of canvases) {
    try {
      await renderPdfToCanvas(canvas);
    } catch (err) {
      console.error("Failed to render PDF", canvas.dataset.pdf, err);
      canvas.outerHTML = `<div class="overview-pdf-fallback"><a href="${canvas.dataset.pdf}">Open PDF</a></div>`;
    }
  }
}

window.addEventListener("load", renderAll);

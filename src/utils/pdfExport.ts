import { domToJpeg } from 'modern-screenshot';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  paperSize?: 'A4' | 'F4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  marginSize?: 'none' | 'narrow' | 'normal' | 'wide';
  quality?: 'standard' | 'high' | 'ultra';
  singlePageFit?: boolean;
}

function getPaperDimensionsMm(
  paperSize: 'A4' | 'F4' | 'Letter' | 'Legal',
  orientation: 'portrait' | 'landscape'
): { widthMm: number; heightMm: number; cssPageSize: string } {
  const map: Record<'A4' | 'F4' | 'Letter' | 'Legal', [number, number]> = {
    A4: [210, 297],
    F4: [215, 330],
    Letter: [216, 279],
    Legal: [216, 356],
  };
  const [w, h] = map[paperSize] || map.A4;
  if (orientation === 'landscape') {
    return { widthMm: h, heightMm: w, cssPageSize: `${h}mm ${w}mm` };
  }
  return { widthMm: w, heightMm: h, cssPageSize: `${w}mm ${h}mm` };
}

function getMarginsMm(marginSize: 'none' | 'narrow' | 'normal' | 'wide'): {
  marginX: number;
  marginY: number;
} {
  switch (marginSize) {
    case 'none':
      return { marginX: 0.5, marginY: 0.5 };
    case 'normal':
      return { marginX: 9, marginY: 4 };
    case 'wide':
      return { marginX: 14, marginY: 7 };
    case 'narrow':
    default:
      return { marginX: 5.5, marginY: 1.5 };
  }
}

/**
 * Exports one or more HTML elements (`.printable-sheet`) into a crisp, multi-page PDF file
 * and triggers a direct browser download. Works reliably inside sandboxed iframes without window.open.
 */
export async function exportElementsToPdf(
  elements: HTMLElement[],
  filename: string,
  paperSizeOrOptions: 'A4' | 'F4' | 'Letter' | 'Legal' | PdfExportOptions = 'A4'
): Promise<boolean> {
  if (!elements || elements.length === 0) return false;

  const opts: Required<PdfExportOptions> =
    typeof paperSizeOrOptions === 'string'
      ? {
          paperSize: paperSizeOrOptions,
          orientation: 'portrait',
          marginSize: 'narrow',
          quality: 'high',
          singlePageFit: true,
        }
      : {
          paperSize: paperSizeOrOptions.paperSize || 'A4',
          orientation: paperSizeOrOptions.orientation || 'portrait',
          marginSize: paperSizeOrOptions.marginSize || 'narrow',
          quality: paperSizeOrOptions.quality || 'high',
          singlePageFit: paperSizeOrOptions.singlePageFit !== false,
        };

  const { widthMm: pageWidthMm, heightMm: pageHeightMm } = getPaperDimensionsMm(
    opts.paperSize,
    opts.orientation
  );
  const { marginX, marginY } = getMarginsMm(opts.marginSize);

  const usableWidthMm = pageWidthMm - marginX * 2;
  const usableHeightMm = pageHeightMm - marginY * 2;

  const captureWidthPx = opts.orientation === 'landscape' ? 1080 : 794;
  const targetFullHeightPx = Math.round(captureWidthPx * (usableHeightMm / usableWidthMm));

  const renderScale =
    opts.quality === 'ultra' ? 3.0 : opts.quality === 'standard' ? 1.8 : 2.5;
  const jpegQuality =
    opts.quality === 'ultra' ? 0.99 : opts.quality === 'standard' ? 0.92 : 0.98;

  const pdf = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: [pageWidthMm, pageHeightMm],
    compress: true,
  });

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    // Save original inline styles so we can enforce exact geometry during capture
    const prevWidth = el.style.width;
    const prevMinWidth = el.style.minWidth;
    const prevMaxWidth = el.style.maxWidth;
    const prevMinHeight = el.style.minHeight;
    const prevDisplay = el.style.display;
    const prevFlexDirection = el.style.flexDirection;
    const prevJustifyContent = el.style.justifyContent;
    const prevPadding = el.style.padding;
    const prevMargin = el.style.margin;
    const prevBoxShadow = el.style.boxShadow;
    const prevBorderRadius = el.style.borderRadius;

    el.style.width = `${captureWidthPx}px`;
    el.style.minWidth = `${captureWidthPx}px`;
    el.style.maxWidth = `${captureWidthPx}px`;
    el.style.minHeight = `${targetFullHeightPx}px`;
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.justifyContent = 'flex-start';
    el.style.padding = '10px 18px 28px 18px';
    el.style.margin = '0';
    el.style.boxShadow = 'none';
    el.style.borderRadius = '0';

    try {
      const dataUrl = await domToJpeg(el, {
        quality: jpegQuality,
        scale: renderScale,
        backgroundColor: '#ffffff',
      });

      const imgProps = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({
            width: img.naturalWidth || captureWidthPx,
            height: img.naturalHeight || targetFullHeightPx,
          });
        img.onerror = (e) => reject(e);
        img.src = dataUrl;
      });

      if (i > 0) {
        pdf.addPage([pageWidthMm, pageHeightMm], opts.orientation);
      }

      const renderedHeightMm = (imgProps.height * usableWidthMm) / imgProps.width;

      if (!opts.singlePageFit || renderedHeightMm <= usableHeightMm + 1) {
        pdf.addImage(
          dataUrl,
          'JPEG',
          marginX,
          marginY,
          usableWidthMm,
          Math.min(renderedHeightMm, usableHeightMm),
          undefined,
          'FAST'
        );
      } else {
        const scaleFactor = usableHeightMm / renderedHeightMm;
        const scaledWidthMm = Math.max(usableWidthMm * 0.94, usableWidthMm * scaleFactor);
        const offsetX = (pageWidthMm - scaledWidthMm) / 2;
        pdf.addImage(
          dataUrl,
          'JPEG',
          offsetX,
          marginY,
          scaledWidthMm,
          usableHeightMm,
          undefined,
          'FAST'
        );
      }
    } finally {
      el.style.width = prevWidth;
      el.style.minWidth = prevMinWidth;
      el.style.maxWidth = prevMaxWidth;
      el.style.minHeight = prevMinHeight;
      el.style.display = prevDisplay;
      el.style.flexDirection = prevFlexDirection;
      el.style.justifyContent = prevJustifyContent;
      el.style.padding = prevPadding;
      el.style.margin = prevMargin;
      el.style.boxShadow = prevBoxShadow;
      el.style.borderRadius = prevBorderRadius;
    }
  }

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(safeFilename);
  return true;
}

/**
 * Prints one or more HTML elements inside an isolated hidden same-origin iframe
 * so modal backdrops, navigation bars, and background content never interfere with the print layout.
 */
export async function printElementsInIsolatedFrame(
  elements: HTMLElement[],
  documentTitle: string,
  paperSizeOrOptions: 'A4' | 'F4' | 'Letter' | 'Legal' | PdfExportOptions = 'A4'
): Promise<void> {
  if (!elements || elements.length === 0) return;

  const opts: Required<PdfExportOptions> =
    typeof paperSizeOrOptions === 'string'
      ? {
          paperSize: paperSizeOrOptions,
          orientation: 'portrait',
          marginSize: 'narrow',
          quality: 'high',
          singlePageFit: true,
        }
      : {
          paperSize: paperSizeOrOptions.paperSize || 'A4',
          orientation: paperSizeOrOptions.orientation || 'portrait',
          marginSize: paperSizeOrOptions.marginSize || 'narrow',
          quality: paperSizeOrOptions.quality || 'high',
          singlePageFit: paperSizeOrOptions.singlePageFit !== false,
        };

  const { widthMm, heightMm, cssPageSize } = getPaperDimensionsMm(
    opts.paperSize,
    opts.orientation
  );
  const { marginX, marginY } = getMarginsMm(opts.marginSize);

  const existingFrame = document.getElementById('isolated-print-iframe');
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'isolated-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = `${widthMm}mm`;
  iframe.style.height = `${heightMm}mm`;
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  const rootCssText = document.documentElement.style.cssText;
  const minSheetHeightMm = Math.max(180, Math.round(heightMm - marginY * 2 - 2));

  const sheetsHtml = elements
    .map((el, idx) => {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.maxWidth = '100%';
      clone.style.minHeight = `${minSheetHeightMm}mm`;
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';
      clone.style.justifyContent = 'flex-start';
      clone.style.padding = '3mm 4mm 8mm 4mm';
      clone.style.margin = '0 auto';
      clone.style.boxShadow = 'none';
      clone.style.pageBreakInside = 'avoid';
      clone.style.breakInside = 'avoid';
      if (idx < elements.length - 1) {
        clone.style.pageBreakAfter = 'always';
        clone.style.breakAfter = 'page';
      }
      return clone.outerHTML;
    })
    .join('\n');

  doc.open();
  doc.write(`<!doctype html>
<html lang="id" style="${rootCssText}">
  <head>
    <meta charset="UTF-8" />
    <title>${documentTitle}</title>
    ${styleNodes}
    <style>
      @page {
        size: ${cssPageSize};
        margin: ${marginY}mm ${marginX}mm;
      }
      html, body {
        background: #ffffff !important;
        color: #0f172a !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .printable-sheet {
        box-shadow: none !important;
        padding: 3mm 4mm !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: ${minSheetHeightMm}mm !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    </style>
  </head>
  <body>
    ${sheetsHtml}
  </body>
</html>`);
  doc.close();

  await new Promise((resolve) => setTimeout(resolve, 450));

  try {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  } catch (err) {
    window.print();
  }
}

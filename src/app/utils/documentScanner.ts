import imageCompression from 'browser-image-compression';
import { jsPDF } from 'jspdf';

export interface DocumentScanOptions {
  compressImages?: boolean;
  convertToPDF?: boolean;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

const DEFAULT_OPTIONS: DocumentScanOptions = {
  compressImages: true,
  convertToPDF: false,
  maxSizeMB: 0.5, // 500KB max per image
  maxWidthOrHeight: 1920, // Max dimension
};

/**
 * Load an image file and return HTMLImageElement
 */
const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

/**
 * Read file as data URL
 */
const readFileAsDataURL = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compress an image file
 */
export async function compressImage(file: File, options: DocumentScanOptions = {}): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB!,
      maxWidthOrHeight: opts.maxWidthOrHeight!,
      useWebWorker: true,
      fileType: 'image/jpeg', // JPEG compresses better than PNG for documents
    });

    return compressed;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original if compression fails
  }
}

/**
 * Convert multiple images to a single PDF
 */
export async function convertImagesToPDF(files: File[]): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let isFirstPage = true;

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      continue;
    }

    const imageData = await readFileAsDataURL(file);
    const img = await loadImage(imageData);

    // Calculate dimensions to fit A4 page while maintaining aspect ratio
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);

    const imgRatio = img.width / img.height;
    const pageRatio = maxWidth / maxHeight;

    let finalWidth: number;
    let finalHeight: number;

    if (imgRatio > pageRatio) {
      // Image is wider than page ratio
      finalWidth = maxWidth;
      finalHeight = maxWidth / imgRatio;
    } else {
      // Image is taller than page ratio
      finalHeight = maxHeight;
      finalWidth = maxHeight * imgRatio;
    }

    // Center the image on the page
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    if (!isFirstPage) {
      pdf.addPage();
    }

    pdf.addImage(imageData, 'JPEG', x, y, finalWidth, finalHeight);
    isFirstPage = false;
  }

  return pdf.output('blob');
}

/**
 * Process document scan - compress images and optionally convert to PDF
 */
export async function processDocumentScan(
  files: File[],
  options: DocumentScanOptions = {}
): Promise<File[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const processedFiles: File[] = [];

  // Separate images and other files
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  const otherFiles = files.filter(f => !f.type.startsWith('image/'));

  // Process images
  if (imageFiles.length > 0) {
    if (opts.convertToPDF) {
      // Compress images first
      const compressedImages = opts.compressImages
        ? await Promise.all(imageFiles.map(f => compressImage(f, opts)))
        : imageFiles;

      // Convert all images to a single PDF
      const pdfBlob = await convertImagesToPDF(compressedImages);
      const pdfFile = new File(
        [pdfBlob],
        `scanned-document-${Date.now()}.pdf`,
        { type: 'application/pdf' }
      );
      processedFiles.push(pdfFile);
    } else if (opts.compressImages) {
      // Just compress images
      const compressed = await Promise.all(
        imageFiles.map(f => compressImage(f, opts))
      );
      processedFiles.push(...compressed);
    } else {
      // Use images as-is
      processedFiles.push(...imageFiles);
    }
  }

  // Add other files as-is
  processedFiles.push(...otherFiles);

  return processedFiles;
}

/**
 * Process a single file (for simple use cases)
 */
export async function processSingleDocument(
  file: File,
  options: DocumentScanOptions = {}
): Promise<File> {
  const processed = await processDocumentScan([file], options);
  return processed[0] || file;
}

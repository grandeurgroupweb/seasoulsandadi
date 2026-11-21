export type ResizedImage = { blob: Blob; width: number; height: number; extension: "webp" | "jpg" };

function encode(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Decodes, applies EXIF rotation, scales to maxEdge and re-encodes in the browser.
 * Re-encoding drops all metadata (EXIF, GPS). Safari can't encode WebP, so it falls back to JPEG.
 */
export async function resizeImage(file: Blob, maxEdge = 2000, quality = 0.82): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser can't process images. Try Chrome or Edge.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    const webp = await encode(canvas, "image/webp", quality);
    if (webp && webp.type === "image/webp") return { blob: webp, width, height, extension: "webp" };

    const jpeg = await encode(canvas, "image/jpeg", 0.85);
    if (!jpeg) throw new Error("Couldn't convert this photo.");
    return { blob: jpeg, width, height, extension: "jpg" };
  } finally {
    bitmap.close();
  }
}

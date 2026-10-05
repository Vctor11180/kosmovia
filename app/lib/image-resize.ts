'use client';

/**
 * Recorta una imagen al centro en cuadrado y la achica a `size` px en el
 * navegador, como WebP (o JPEG si el navegador no sabe WebP). Baja la calidad
 * hasta que pese menos que `maxBytes`. El servidor vuelve a revisar el tipo
 * por sus bytes y el tamaño (lib/community-image.ts en core).
 */
export async function fileToSquareImage(file: File, size = 256, maxBytes = 60 * 1024): Promise<string> {
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
    throw new Error('Elige una imagen PNG, JPG, WebP o GIF.');
  }
  if (file.size > 8 * 1024 * 1024) throw new Error('La imagen pesa demasiado (máximo 8 MB antes de achicarla).');

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Tu navegador no pudo procesar la imagen.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

    const bytesOf = (dataUrl: string) => Math.floor(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);
    for (const quality of [0.86, 0.75, 0.62, 0.5, 0.4]) {
      let out = canvas.toDataURL('image/webp', quality);
      if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', quality);
      if (bytesOf(out) <= maxBytes) return out;
    }
    throw new Error('No pudimos achicar la imagen lo suficiente. Prueba con otra.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** "Mi Comunidad Ñandú" -> "mi-comunidad-nandu" (lo que acepta core: 3 a 40, minúsculas, números y guiones). */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

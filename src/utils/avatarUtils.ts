/**
 * Avatar Utilities & Client-Side Image Processing
 */

export function isImageUrl(value?: string): boolean {
  if (!value) return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:image/') ||
    value.startsWith('blob:')
  );
}

export const PRESET_AVATARS = [
  '🦁', '🦄', '🐻', '🦊', '🦖', '🐼', '🤖', '🚀',
  '🎨', '📚', '👑', '🦉', '🎓', '👩‍🏫', '👨‍🏫', '🐬',
  '🐯', '🐝', '🌟', '🎸', '⚽', '🧩', '🚀', '🧙‍♂️'
];

/**
 * Resizes and crops an uploaded image file client-side using HTML5 Canvas
 * to a square aspect ratio (250x250) to minimize storage size & optimize rendering.
 */
export function processImageFileToAvatar(file: File, targetSize = 250): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Center cover crop calculation
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
        
        // Output JPEG Base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to process avatar image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

import sharp from 'sharp';

export async function convertToWebp(base64Image: string | null | undefined): Promise<string | null | undefined> {
  if (!base64Image) return base64Image;

  // Only process if it's a data URL
  if (!base64Image.startsWith('data:image/')) {
    return base64Image;
  }

  try {
    const matches = base64Image.match(/^data:(image\/.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Image; // Return original if format is unexpected
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Convert base64 to buffer
    const inputBuffer = Buffer.from(base64Data, 'base64');
    
    // Process with sharp to convert to WebP
    // We do this even for existing webp images to ensure they are optimized
    const outputBuffer = await sharp(inputBuffer)
      .webp({ quality: 80 })
      .toBuffer();
      
    // Convert back to base64 data URL
    return `data:image/webp;base64,${outputBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to WebP:', error);
    // Return the original image if conversion fails
    return base64Image;
  }
}

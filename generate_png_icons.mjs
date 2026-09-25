import fs from 'fs';
import path from 'path';

async function generate() {
  try {
    const sharp = (await import('sharp')).default;
    const svgBuffer = fs.readFileSync(path.resolve('public/icon.svg'));

    await sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png');
    await sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png');
    await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
    await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon-precomposed.png');
    console.log('PWA and Apple touch icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generate();

import html2canvas from 'html2canvas';
import { compress } from 'image-conversion';

export const makeScreenshot = async () => {
  try {
    const imageContainer = document.querySelector('.image-container');

    const originalOverflowStyle = imageContainer.style.overflow;

    imageContainer.style.overflow = 'visible';

    const canvas = await html2canvas(imageContainer, {
      scrollX: -window.scrollX, // Capture content starting from the left edge
      scrollY: -window.scrollY, // Capture content starting from the top edge
      width: imageContainer.scrollWidth, // Use the entire scroll width
      height: imageContainer.scrollHeight, // Use the entire scroll height
    });

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg'),
    );

    const compressedBlob = await compress(blob, {
      quality: 1,
      width: 500,
    });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(compressedBlob);
    downloadLink.download = 'compressed_screenshot.jpg';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);

    // Restore original overflow style
    imageContainer.style.overflow = originalOverflowStyle;
  } catch (error) {
    console.error('Error capturing and saving screenshot:', error);
  }
};

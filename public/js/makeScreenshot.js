import { showAlert } from './alerts';
import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

// export const makeScreenshot = async () => {
//   try {
//     const imageContainer = document.querySelector('.image-container');

//     const originalOverflowStyle = imageContainer.style.overflow;

//     imageContainer.style.overflow = 'visible';

//     const canvas = await html2canvas(imageContainer, {
//       scrollX: -window.scrollX, // Capture content starting from the left edge
//       scrollY: -window.scrollY, // Capture content starting from the top edge
//       width: imageContainer.scrollWidth, // Use the entire scroll width
//       height: imageContainer.scrollHeight, // Use the entire scroll height
//     });

//     const blob = await new Promise((resolve) =>
//       canvas.toBlob(resolve, 'image/jpeg'),
//     );

//     const compressedBlob = await compress(blob, {
//       quality: 1,
//       width: 500,
//     });

//     const downloadLink = document.createElement('a');
//     downloadLink.href = URL.createObjectURL(compressedBlob);
//     downloadLink.download = 'compressed_screenshot.jpg';
//     document.body.appendChild(downloadLink);

//     downloadLink.click();

//     document.body.removeChild(downloadLink);

//     // Restore original overflow style
//     imageContainer.style.overflow = originalOverflowStyle;
//   } catch (error) {
//     console.error('Error capturing and saving screenshot:', error);
//   }
// };

//THIS ONE
// export const makeScreenshot = async () => {
//   try {
//     const base64Images = [];
//     const imageContainers = document.querySelectorAll('.screenshot-container');

//     // const originalOverflowStyle = imageContainer.style.overflow;

//     // imageContainer.style.overflow = 'visible';

//     // const canvas = await html2canvas(imageContainer, {
//     //   scrollX: -window.scrollX, // Capture content starting from the left edge
//     //   scrollY: -window.scrollY, // Capture content starting from the top edge
//     //   width: imageContainer.scrollWidth, // Use the entire scroll width
//     //   height: imageContainer.scrollHeight, // Use the entire scroll height
//     // });
//     imageContainers.forEach(async (container) => {
//       const canvas = await html2canvas(container);
//       const blob = await new Promise((resolve) =>
//         canvas.toBlob(resolve, 'image/jpeg'),
//       );

//       const compressedBlob = await compress(blob, {
//         quality: 1,
//         width: 500,
//       });

//       const reader = new FileReader();
//       reader.readAsDataURL(compressedBlob);
//       reader.onloadend = function () {
//         const base64Data = reader.result.split(',')[1];
//         base64Data.push(base64Images);
//       };
//     });
//     generateTaskPDF(base64Images);
//   } catch (error) {
//     console.error('Error capturing and saving screenshot:', error);
//   }
// };

// // Restore original overflow style
// // imageContainer.style.overflow = originalOverflowStyle;

// export const generateTaskPDF = async (images) => {
//   const docDefinition = {
//     content: [{ text: `this is text` }],
//   };
//   try {
//     images.forEach((dataURI) => {
//       docDefinition.content.push({
//         image: `data:image/png;base64,${dataURI}`,
//         width: 500, // Adjust the width as needed
//       });
//     });

//     // Create and download the PDF
//     pdfMake.createPdf(docDefinition).download();
//   } catch (err) {
//     console.log(err);
//     showAlert('error', 'Error making the report');
//   }
// };

//LAST IN USE

// const convertImagesToBase64 = async () => {
//   try {
//     const base64Images = [];

//     const imageContainers = Array.from(
//       document.querySelectorAll('.screenshot-container'),
//     );
//     const taskHeaderContainer = document.querySelector('.task-header');
//     if (taskHeaderContainer) {
//       const canvas = await html2canvas(taskHeaderContainer);
//       const blob = await new Promise((resolve) =>
//         canvas.toBlob(resolve, 'image/png'),
//       );

//       const compressedBlob = await compress(blob, {
//         quality: 1,
//         width: 500,
//       });

//       const base64Data = await new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.readAsDataURL(compressedBlob);
//         reader.onloadend = function () {
//           resolve(reader.result.split(',')[1]);
//         };
//         reader.onerror = reject;
//       });

//       base64Images.push(base64Data);
//     }

//     await Promise.all(
//       imageContainers.map(async (container) => {
//         const canvas = await html2canvas(container);
//         const blob = await new Promise((resolve) =>
//           canvas.toBlob(resolve, 'image/png'),
//         );

//         const compressedBlob = await compress(blob, {
//           quality: 1,
//           width: 500,
//         });

//         const base64Data = await new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.readAsDataURL(compressedBlob);
//           reader.onloadend = function () {
//             resolve(reader.result.split(',')[1]);
//           };
//           reader.onerror = reject;
//         });

//         base64Images.push(base64Data);
//       }),
//     );

//     return base64Images;
//   } catch (error) {
//     console.error('Error converting screenshots to Base64:', error);
//     return [];
//   }
// };

// export const generateTaskPDF = async () => {
//   const downloadTaskBtn = document.querySelector('.download-task-report');

//   downloadTaskBtn.textContent = 'Downloading...';
//   try {
//     const images = await convertImagesToBase64();

//     // const taskSummary = await convertImagesToBase64('.task-header');
//     const docDefinition = {
//       content: [],
//     };
//     docDefinition.content.push({
//       image: `data:image/png;base64,${images[0]}`,
//       width: 300,
//       alignment: 'center',
//       margin: [0, 10],
//     });

//     images.slice(1).forEach((dataURI, index) => {
//       if (index < images.length - 1) {
//         docDefinition.content.push({ text: '\n\n', fontSize: 1 });
//       }
//       docDefinition.content.push({
//         image: `data:image/png;base64,${dataURI}`,
//         width: 500,
//       });
//     });
//     pdfMake.createPdf(docDefinition).download();
//     document.querySelectorAll('.screenshot-container').forEach((container) => {
//       container.remove();
//     });
//     downloadTaskBtn.textContent = 'Download Task';
//   } catch (error) {
//     console.error('Error capturing and saving screenshot:', error);
//     showAlert('error', 'Error generating report');
//   }
// };

const A4_LANDSCAPE_CONTENT_WIDTH = 769.89;
const A4_LANDSCAPE_CONTENT_HEIGHT = 523.28;

const normalizeText = (value = '') => value.replace(/\s+/g, ' ').trim();

const getControlValue = (control) => {
  if (!control) return '';

  if (control.tagName === 'SELECT') {
    return normalizeText(control.options[control.selectedIndex]?.text || '');
  }

  return normalizeText(control.value || control.placeholder || '');
};

const splitLabelValue = (line) => {
  const separatorIndex = line.indexOf(':');

  if (separatorIndex === -1) {
    return { label: '', value: line };
  }

  return {
    label: normalizeText(line.slice(0, separatorIndex)),
    value: normalizeText(line.slice(separatorIndex + 1)),
  };
};

const extractTaskHeaderContent = () => {
  const taskHeader = document.querySelector('.task-header');

  if (!taskHeader) {
    return [];
  }

  const fields = [];

  Array.from(taskHeader.children).forEach((child) => {
    if (child.tagName === 'P') {
      const text = normalizeText(child.textContent);
      if (text) {
        const { label, value } = splitLabelValue(text);
        fields.push({ label, value });
      }
      return;
    }

    const label = normalizeText(
      child.querySelector('p')?.textContent.replace(/:\s*$/, '') || '',
    );
    const value = getControlValue(child.querySelector('input, select, textarea'));

    if (label && value) {
      fields.push({ label, value });
    }
  });

  return [
    {
      stack: [
        { text: 'Task report', style: 'reportTitle' },
        {
          text: 'Generated task overview',
          style: 'reportSubtitle',
          margin: [0, 2, 0, 18],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: A4_LANDSCAPE_CONTENT_WIDTH,
              y2: 0,
              lineWidth: 1,
              lineColor: '#d7dde6',
            },
          ],
          margin: [0, 0, 0, 18],
        },
        {
          table: {
            widths: [190, '*'],
            body: fields.map(({ label, value }) => [
              { text: label || 'Details', style: 'fieldLabel' },
              { text: value, style: 'fieldValue' },
            ]),
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 18,
            paddingTop: () => 8,
            paddingBottom: () => 8,
          },
        },
      ],
      margin: [0, 0, 0, 0],
    },
  ];
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
};

const toPixelNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const drawMarker = (ctx, marker, options) => {
  const { offsetX, offsetY, scaleX, scaleY } = options;
  const style = window.getComputedStyle(marker);
  const left = (toPixelNumber(style.left) - offsetX) * scaleX;
  const top = (toPixelNumber(style.top) - offsetY) * scaleY;
  const width = toPixelNumber(style.width, 0) * scaleX;
  const height = toPixelNumber(style.height, 0) * scaleY;
  const borderWidth =
    toPixelNumber(style.borderTopWidth, 2) * Math.max(scaleX, scaleY);

  if (width <= 0 || height <= 0) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = style.borderTopColor || 'rgba(255, 16, 240, 1)';
  ctx.lineWidth = borderWidth;

  if (style.borderTopStyle === 'dotted') {
    ctx.setLineDash([borderWidth, borderWidth * 1.8]);
    ctx.lineCap = 'round';
  }

  ctx.beginPath();
  ctx.ellipse(
    left + width / 2,
    top + height / 2,
    width / 2,
    height / 2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.restore();
};

const rotateCanvasClockwise = (sourceCanvas) => {
  if (sourceCanvas.width >= sourceCanvas.height) {
    return sourceCanvas;
  }

  const rotatedCanvas = document.createElement('canvas');
  rotatedCanvas.width = sourceCanvas.height;
  rotatedCanvas.height = sourceCanvas.width;

  const ctx = rotatedCanvas.getContext('2d');
  ctx.translate(rotatedCanvas.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(sourceCanvas, 0, 0);

  return rotatedCanvas;
};

const renderScreenshotContainer = async (container) => {
  const imageElement = container.querySelector('img');

  if (!imageElement) {
    throw new Error('Task image element was not found.');
  }

  const sourceImage = await loadImage(imageElement.currentSrc || imageElement.src);
  const canvas = document.createElement('canvas');
  const width = sourceImage.naturalWidth || sourceImage.width;
  const height = sourceImage.naturalHeight || sourceImage.height;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceImage, 0, 0, width, height);

  const containerRect = container.getBoundingClientRect();
  const imageRect = imageElement.getBoundingClientRect();
  const offsetX = imageRect.left - containerRect.left;
  const offsetY = imageRect.top - containerRect.top;
  const scaleX = width / (imageRect.width || width);
  const scaleY = height / (imageRect.height || height);

  container.querySelectorAll('.marker').forEach((marker) => {
    drawMarker(ctx, marker, { offsetX, offsetY, scaleX, scaleY });
  });

  const finalCanvas = rotateCanvasClockwise(canvas);

  return {
    dataURL: finalCanvas.toDataURL('image/png'),
    width: finalCanvas.width,
    height: finalCanvas.height,
  };
};

const convertImagesToDataURLs = async () => {
  try {
    const imageContainers = Array.from(
      document.querySelectorAll('.screenshot-container'),
    );

    return Promise.all(imageContainers.map(renderScreenshotContainer));
  } catch (error) {
    console.error('Error converting images to data URLs:', error);
    throw error;
  }
};

const generatePDF = async (headerContent, images) => {
  if (images.length > 0 && headerContent.length > 0) {
    headerContent[headerContent.length - 1].pageBreak = 'after';
  }

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [36, 36, 36, 36],
    info: {
      title: 'Task report',
    },
    content: [...headerContent],
    defaultStyle: {
      fontSize: 12,
      lineHeight: 1.25,
      color: '#111827',
    },
    styles: {
      reportTitle: {
        fontSize: 30,
        bold: true,
        color: '#101827',
      },
      reportSubtitle: {
        fontSize: 11,
        color: '#697386',
      },
      fieldLabel: {
        fontSize: 10,
        bold: true,
        color: '#667085',
        characterSpacing: 0.4,
      },
      fieldValue: {
        fontSize: 15,
        color: '#101827',
      },
    },
  };

  images.forEach((image, index) => {
    docDefinition.content.push({
      image: image.dataURL,
      fit: [A4_LANDSCAPE_CONTENT_WIDTH, A4_LANDSCAPE_CONTENT_HEIGHT],
      alignment: 'center',
      margin: [0, 0, 0, 0],
      pageBreak: index < images.length - 1 ? 'after' : undefined,
    });
  });

  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBlob(
      (pdfBlob) => {
        resolve(pdfBlob);
      },
      (error) => {
        reject(error);
      },
    );
  });
};

export const generateTaskPDF = async () => {
  const downloadTaskBtn = document.querySelector('.download-task-report');
  downloadTaskBtn.textContent = t('generatingPdf');
  downloadTaskBtn.disabled = true;

  try {
    const headerContent = extractTaskHeaderContent();
    const dataURLs = await convertImagesToDataURLs();
    const pdfBlob = await generatePDF(headerContent, dataURLs);

    // Create a download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task_report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
    document.querySelectorAll('.screenshot-container').forEach((container) => {
      container.remove();
    });

    downloadTaskBtn.textContent = t('downloadTask');
    downloadTaskBtn.disabled = false;
  } catch (error) {
    console.error('Error generating PDF:', error);
    showAlert('error', t('pdfGenerateFailed'));
    downloadTaskBtn.textContent = t('downloadTask');
    downloadTaskBtn.disabled = false;
  }
};

// export const createScreenshotContainer = (images) => {
//   let screenshotsHTML = '';
//   images.forEach((fileName) => {
//     screenshotsHTML += `
//       <div class="screenshot-container" data-filename="${fileName}">
//         <img src="/pics/tasks/${fileName}"/>
//       </div>`;
//   });

//   return screenshotsHTML;
// };

export const createScreenshotContainer = (images) => {
  return images
    .map(
      (fileName) => `
    <div class="screenshot-container" data-filename="${fileName}">
      <img src="/pics/tasks/${fileName}"/>
    </div>
  `,
    )
    .join('');
};

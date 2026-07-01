import html2canvas from 'html2canvas';
import { compress } from 'image-conversion';
import { showAlert } from './alerts';

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

const compressImage = (imgElement, quality = 1, maxWidth = 500) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const aspectRatio = imgElement.width / imgElement.height;
    const newWidth = Math.min(maxWidth, imgElement.width);
    const newHeight = newWidth / aspectRatio;

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(imgElement, 0, 0, newWidth, newHeight);
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
};

const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const normalizeText = (value = '') => value.replace(/\s+/g, ' ').trim();

const getControlValue = (control) => {
  if (!control) return '';

  if (control.tagName === 'SELECT') {
    return normalizeText(control.options[control.selectedIndex]?.text || '');
  }

  return normalizeText(control.value || control.placeholder || '');
};

const extractTaskHeaderContent = () => {
  const taskHeader = document.querySelector('.task-header');

  if (!taskHeader) {
    return [];
  }

  const content = [
    {
      text: 'Task report',
      style: 'reportTitle',
    },
  ];

  Array.from(taskHeader.children).forEach((child) => {
    if (child.tagName === 'P') {
      const text = normalizeText(child.textContent);
      if (text) {
        content.push({ text, style: 'taskDetail' });
      }
      return;
    }

    const label = normalizeText(child.querySelector('p')?.textContent || '');
    const value = getControlValue(child.querySelector('input, select, textarea'));

    if (label && value) {
      content.push({
        text: `${label} ${value}`,
        style: 'taskDetail',
      });
    }
  });

  content.push({ text: '', margin: [0, 6, 0, 16] });

  return content;
};

const convertImagesToDataURLs = async () => {
  try {
    const dataURLs = [];

    const imageContainers = Array.from(
      document.querySelectorAll('.screenshot-container'),
    );

    await Promise.all(
      imageContainers.map(async (container) => {
        const canvas = await html2canvas(container);
        const imgElement = new Image();
        imgElement.src = canvas.toDataURL();

        await new Promise((resolve) => {
          imgElement.onload = resolve;
        });

        const compressedBlob = await compressImage(imgElement);
        const dataURL = await blobToDataURL(compressedBlob);
        dataURLs.push(dataURL);
      }),
    );

    return dataURLs;
  } catch (error) {
    console.error('Error converting images to data URLs:', error);
    throw error;
  }
};

const generatePDF = async (headerContent, dataURLs, maxImagesPerPage = 5) => {
  const docDefinition = {
    content: [...headerContent],
    defaultStyle: {
      fontSize: 13,
      lineHeight: 1.3,
    },
    styles: {
      reportTitle: {
        fontSize: 20,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      taskDetail: {
        fontSize: 13,
        margin: [0, 0, 0, 5],
      },
    },
    pageBreakBefore: (currentNode, followingNodesOnPage) => {
      return (
        followingNodesOnPage.length === maxImagesPerPage &&
        currentNode.headlineLevel !== 1
      );
    },
  };

  dataURLs.forEach((dataURL, index) => {
    docDefinition.content.push({
      image: dataURL,
      width: 500,
      alignment: 'left',
      margin: [0, 0, 0, 0],
    });

    if (index < dataURLs.length - 1) {
      docDefinition.content.push({ text: '\n\n', fontSize: 1 });
    }
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
  downloadTaskBtn.textContent = 'Generating PDF...';
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

    downloadTaskBtn.textContent = 'Download Task';
    downloadTaskBtn.disabled = false;
  } catch (error) {
    console.error('Error generating PDF:', error);
    showAlert('error', 'Error generating the PDF. Please try again.');
    downloadTaskBtn.textContent = 'Download Task';
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

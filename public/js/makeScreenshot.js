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

const convertImagesToBase64 = async () => {
  try {
    const base64Images = [];

    const imageContainers = Array.from(
      document.querySelectorAll('.screenshot-container'),
    );
    const taskHeaderContainer = document.querySelector('.task-header');
    if (taskHeaderContainer) {
      imageContainers.unshift(taskHeaderContainer);
    }

    await Promise.all(
      imageContainers.map(async (container) => {
        const canvas = await html2canvas(container);
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/png'),
        );

        const compressedBlob = await compress(blob, {
          quality: 1,
          width: 500,
        });

        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedBlob);
          reader.onloadend = function () {
            resolve(reader.result.split(',')[1]);
          };
          reader.onerror = reject;
        });

        base64Images.push(base64Data);
      }),
    );

    return base64Images;
  } catch (error) {
    console.error('Error converting screenshots to Base64:', error);
    return [];
  }
};

export const generateTaskPDF = async () => {
  const downloadTaskBtn = document.querySelector('.download-task-report');

  downloadTaskBtn.textContent = 'Downloading...';
  try {
    const images = await convertImagesToBase64();
    // const taskSummary = await convertImagesToBase64('.task-header');
    const docDefinition = {
      content: [],
    };
    docDefinition.content.push({
      image: `data:image/png;base64,${images[0]}`,
      width: 300,
      alignment: 'center',
      margin: [0, 10],
    });

    images.slice(1).forEach((dataURI, index) => {
      if (index < images.length - 1) {
        docDefinition.content.push({ text: '\n\n', fontSize: 1 });
      }
      docDefinition.content.push({
        image: `data:image/png;base64,${dataURI}`,
        width: 500, // Adjust the width as needed
      });
    });

    pdfMake.createPdf(docDefinition).download();
    document.querySelectorAll('.screenshot-container').forEach((container) => {
      container.remove();
    });
    downloadTaskBtn.textContent = 'Download Task';
  } catch (error) {
    console.error('Error capturing and saving screenshot:', error);
    showAlert('error', 'Error generating report');
  }
};
export const createShortcutContainer = (images) => {
  let screenshotsHTML = '';
  images.forEach((fileName) => {
    screenshotsHTML += `
      <div class="screenshot-container" data-filename=${fileName}>
        <img src="/pics/tasks/${fileName}"/>
      </div>  
    `;
  });

  return screenshotsHTML;
};

function wait(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

function setInputLikeHuman(element) {
   const event = new Event("change", { bubbles: true });
   element.dispatchEvent(event);
}

function shuffleArray(array) {
   for (let i = array.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
       [array[i], array[j]] = [array[j], array[i]];   // swap elements
   }
   return array;
}


function getQuadraticBezierXY(t, start, control, end) {
   const x =
      Math.pow(1 - t, 2) * start.x +
      2 * (1 - t) * t * control.x +
      Math.pow(t, 2) * end.x;
   const y =
      Math.pow(1 - t, 2) * start.y +
      2 * (1 - t) * t * control.y +
      Math.pow(t, 2) * end.y;
   return { x, y };
}

// Simulate smooth Bezier-based drag
function simulateBezierDrag(canvas, steps = 20, delay = 1, stepDelay = 1) {
   return new Promise(async (resolve) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const deltaW = width / 5;
      const deltaH = height / 5;

      const startX = width / 2 + Math.random() * deltaW;
      const startY = height / 2 + Math.random() * deltaH;

      const endX = startX + (Math.random() * (deltaW / 2) + 30);
      const endY = startY + (Math.random() * (deltaH / 2) + 30);

      const toClient = (x, y) => ({
         x: rect.left + x,
         y: rect.top + y,
      });

      const start = toClient(startX, startY);
      const end = toClient(endX, endY);

      const control = {
         x: (start.x + end.x) / 2 + (Math.random() * 30 - 15),
         y: (start.y + end.y) / 2 - 40,
      };

      // Helper to fire mouse events
      function fire(type, x, y, buttons = 1) {
         const event = new MouseEvent(type, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            buttons: buttons,
            button: type === "mouseup" ? 0 : 0,
            relatedTarget: null,
            screenX: x,
            screenY: y,
         });
         return canvas.dispatchEvent(event);
      }

      fire("mousedown", start.x, start.y);
      await wait(stepDelay);

      // Move along the curve
      for (let i = 1; i <= steps; i++) {
         const t = i / steps;
         const { x, y } = getQuadraticBezierXY(t, start, control, end);
         fire("mousemove", x, y);
         await wait(delay);
      }

      await wait(stepDelay);
      fire("mouseup", end.x, end.y, 0);

      await wait(stepDelay);
      fire("click", end.x, end.y, 0);
      resolve();
   });
}

// document.querySelector(`input[name="pageNumber"] ~ label`).innerText -----> pdf size
// document.querySelector("button[name='nextPage']") -----> pdf next page button

async function setFitToPage(element, max = 9) {
   if (!element.title.includes("Fit to page") && max > 0) {
      element.click();
      await wait(10);
      setFitToPage(element, max - 1);
   }
}

/**
 * Fast text recognition from canvas using Tesseract.js with optimizations
 * @param {HTMLCanvasElement} canvas - The canvas element containing handwritten text
 * @param {Object} options - Optional configuration options
 * @param {string} options.lang - Language for recognition (default: 'eng')
 * @param {string} options.whitelist - Character whitelist (default: alphanumeric + common punctuation)
 * @param {boolean} options.preprocess - Whether to preprocess the image (default: true)
 * @returns {Promise<string>} - Promise that resolves to the recognized text
 */
function fastRecognizeCanvasText(canvas, options = {}) {
   // Default options
   const defaultOptions = {
      lang: "eng",
      whitelist:
         "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,?!-",
      preprocess: true,
   };

   // Merge options
   const config = { ...defaultOptions, ...options };

   // Load Tesseract.js if not already loaded
   if (!window.Tesseract) {
      return new Promise((resolve, reject) => {
         const script = document.createElement("script");
         script.src =
            "https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
         script.onload = () => {
            // Once loaded, perform recognition
            performFastRecognition(canvas, config).then(resolve).catch(reject);
         };
         script.onerror = () =>
            reject(new Error("Failed to load Tesseract.js"));
         document.head.appendChild(script);
      });
   }

   // If Tesseract is already loaded, perform recognition directly
   return performFastRecognition(canvas, config);
}

/**
 * Helper function to perform optimized text recognition
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} config - Recognition configuration
 * @returns {Promise<string>} - Promise that resolves to the recognized text
 */
function performFastRecognition(canvas, config) {
   // Create a preprocessed version of the canvas if needed
   const imageData = config.preprocess ? preprocessImage(canvas) : canvas;

   // Tesseract configuration for faster processing
   const recognitionConfig = {
      logger: (m) => console.log(m),
      tessedit_char_whitelist: config.whitelist,
      // Performance optimizations
      tessjs_create_hocr: "0",
      tessjs_create_tsv: "0",
      tessjs_create_box: "0",
      tessjs_create_unlv: "0",
      tessjs_create_osd: "0",
      // Image processing settings
      tessedit_pageseg_mode: "6", // Assume a single uniform block of text
      tessedit_ocr_engine_mode: "2", // Use LSTM neural network only
      preserve_interword_spaces: "1",
      textord_heavy_nr: "1", // More aggressive noise removal
      textord_min_linesize: "2.5", // Helps with handwritten text
   };

   return Tesseract.recognize(imageData, config.lang, recognitionConfig).then(
      ({ data: { text } }) => {
         return text.trim();
      }
   );
}

/**
 * Preprocesses the canvas image to improve OCR accuracy and speed
 * @param {HTMLCanvasElement} sourceCanvas - The source canvas element
 * @returns {HTMLCanvasElement} - A new canvas with the preprocessed image
 */
function preprocessImage(sourceCanvas) {
   // Create a new canvas for preprocessing
   const canvas = document.createElement("canvas");
   canvas.width = sourceCanvas.width;
   canvas.height = sourceCanvas.height;
   const ctx = canvas.getContext("2d");

   // Draw the original canvas content
   ctx.drawImage(sourceCanvas, 0, 0);

   // Get image data for processing
   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   const data = imageData.data;

   // Increase contrast and convert to black and white
   const threshold = 128;
   for (let i = 0; i < data.length; i += 4) {
      // Calculate grayscale using luminance method
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

      // Apply threshold to create high contrast black and white
      const value = gray > threshold ? 255 : 0;

      // Set RGB channels to the same value (black or white)
      data[i] = data[i + 1] = data[i + 2] = value;
   }

   // Put the processed image data back on the canvas
   ctx.putImageData(imageData, 0, 0);

   return canvas;
}

// Example usage:
// fastRecognizeCanvasText(document.getElementById('myCanvas'))
//   .then(text => console.log('Recognized text:', text))
//   .catch(error => console.error('Recognition error:', error));

(async () => {
   const pdfSize = +document.querySelector(`input[name="pageNumber"] ~ label`)
      .innerText;
   const pageMode = document.querySelector(`button[name="fitMode"]`);
   const tickButton = document.querySelector(`button[title="Tick"]`);
   const nextPageBtn = document.querySelector("button[name='nextPage']");
   const canvas = document.querySelector("canvas");

   const pageMinCharSize = 150;
   let validPage = 0;

   await setFitToPage(pageMode);
   tickButton.click();
   for (let i = 0; i < pdfSize; i++) {
      const pageChar = await fastRecognizeCanvasText(canvas);
      if (pageChar.length >= pageMinCharSize) validPage++;
      await simulateBezierDrag(canvas);
      await wait(300);
      nextPageBtn.click();
   }

   let marks = 0;

   if (validPage <= 1) {
      marks = 0;
   } else if (validPage <= 3) {
      marks = 15;
   } else if (validPage >= 4) {
      marks = 22 + Math.floor(Math.random() * 4);
   }

   const marksRows = document.querySelectorAll("table tbody tr");
   const marksDev = {};

   const max1Num = 5;
   const max5Num = 4;
   let marksGiven = 0;

   marksRows.forEach((row) => {
      const TD = row.querySelectorAll("td");
      const [_, __, ___, totalTD] = TD;
      const total = totalTD.innerText.replace("/", "").trim();
      if (!marksDev[total]) {
         marksDev[total] = {
            elements: [TD],
            value: 1,
         };
      } else {
         marksDev[total].value++;
         marksDev[total].elements.push(TD);
      }
   });

   if (marksDev["1"]) {
      const tds = marksDev["1"].elements;
      const shuffledTds = shuffleArray([...tds]);

      shuffledTds.forEach((tds) => {
         if (marksGiven < max1Num && marks > marksGiven) {
            marksGiven++;
            const markInput = tds[1].querySelector(`input[type="text"]`);
            markInput.value = 1;
            setInputLikeHuman(markInput);
         } else {
            const markInput = tds[2].querySelector(`input`);
            markInput.checked = true;
            setInputLikeHuman(markInput);
         }
      });
   }

   if (marksDev["5"]) {
      const tds = marksDev["5"].elements;
      const shuffledTds = shuffleArray([...tds]);

      const num5 = validPage > 3 ? max5Num : validPage > 2 ? 3 : 2;
      let neededMarks = marks - marksGiven;
      let dt = neededMarks / num5;
      let dev = new Array(num5).fill(Math.floor(dt));
      const sum = dev.reduce((a, b) => a + b, 0);

      neededMarks = marks - (marksGiven + sum);
      dev = dev.map((e, i) => {
         if (i < neededMarks) return e + 1;
         return e;
      });

      console.log(neededMarks);
      console.log(dev);

      shuffledTds.forEach((tds, i) => {
         if (dev[i]) {
            marksGiven += dev[i];
            const markInput = tds[1].querySelector(`input[type="text"]`);
            markInput.value = dev[i];
         } else {
            const markInput = tds[2].querySelector(`input`);
            markInput.checked = true;
            setInputLikeHuman(markInput);
         }
      });
   }
})();

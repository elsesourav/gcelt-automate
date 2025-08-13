"use strict";

const KEYS = {
   STORAGE_PDF: "GCELT-elsesourav-pdf",
   STORAGE_POPUP_SETTINGS: "GCELT-elsesourav-popup-settings",
};

const URLS = {};

/* ----  local storage set and get ---- */
function setDataFromLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataFromLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function reloadLocation() {
   window.location.reload();
}

// create element
function CE(first, ...children) {
   let element;

   if (first instanceof Node) {
      element = document.createElement("div");
      element.appendChild(first);
   } else if (typeof first === "object" && first !== null) {
      const tag = first.tag || "div";
      element = document.createElement(tag);

      for (const [attr, value] of Object.entries(first)) {
         if (attr !== "tag") {
            element.setAttribute(attr, value);
         }
      }
   } else if (typeof first === "string" || typeof first === "number") {
      element = document.createElement("div");
      element.innerText = first;
   }

   children.forEach((child) => {
      if (typeof child === "string" || typeof child === "number") {
         element.innerText = child;
      } else if (child instanceof Node) {
         element.appendChild(child);
      }
   });

   element.parent = (parent) => {
      if (parent) {
         parent.appendChild(element);
         return element;
      }
   };

   return element;
}

const N = (string) => Number(string);

/* 
   ---Example 1: Create a simple <div> element and append it to the body
   const div = CE({});
   document.body.appendChild(div);

   ---Example 2: Create a <p> element with text content and append it to the body
   const p = CE({ tag: 'p' }, 'Hello, world!');
   document.body.appendChild(p); 

   ---Example 3: Create an <img> element with attributes and append it to the body
   const img = CE({ tag: 'img', src: 'image.jpg', alt: 'Image' });
   document.body.appendChild(img);

   ---Example 4: Create a <div> with a <span> child element and append it to the body
   const span = document.createElement('span');
   span.textContent = 'Child Element';
   const divWithChild = CE({ tag: 'div' }, span);
   document.body.appendChild(divWithChild); 
*/

function map(os, oe, ns, ne, t, isRound = true) {
   const r = (ne - ns) / (oe - os);
   let v = r * (t - os) + ns;
   v = Math.min(ne, Math.max(ns, v));
   return isRound ? Math.round(v) : v;
}

function setDataToLocalStorage(key, object) {
   var data = JSON.stringify(object);
   localStorage.setItem(key, data);
}
function getDataToLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function OBJECTtoJSON(data) {
   return JSON.stringify(data);
}
function JSONtoOBJECT(data) {
   return JSON.parse(data);
}

/* ----------- extension utils ----------- */
function getActiveTab() {
   return new Promise((resolve) => {
      chrome.tabs.query(
         {
            currentWindow: true,
            active: true,
         },
         (tabs) => {
            console.log(tabs);
            resolve(tabs[0]);
         }
      );
   });
}

function getFormatTime(t) {
   const date = new Date(0);
   date.setSeconds(t);
   return date.toISOString().substr(11, 8);
}

function runtimeSendMessage(type, message, callback) {
   if (typeof message === "function") {
      chrome.runtime.sendMessage({ type }, (response) => {
         message && message(response);
      });
   } else {
      chrome.runtime.sendMessage({ ...message, type }, (response) => {
         callback && callback(response);
      });
   }
}

function tabSendMessage(tabId, type, message, callback) {
   // if third parameter is not pass. in message parameter pass callback function
   if (typeof message === "function") {
      chrome.tabs.sendMessage(tabId, { type }, (response) => {
         message && message(response);
      });
   } else {
      chrome.tabs.sendMessage(tabId, { ...message, type }, (response) => {
         callback && callback(response);
      });
   }
}

function runtimeOnMessage(type, callback) {
   chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (type === message.type) {
         callback(message, sender, response);
      }
      return true;
   });
}

const debounce = (func, delayFn) => {
   let debounceTimer;
   return function (...args) {
      const context = this;
      const delay = delayFn();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
   };
};

/**
 * @param {number} ms
 **/
function wait(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

function chromeStorageSet(key, value, callback) {
   return new Promise((resolve) => {
      let items = {};
      items[key] = value;
      chrome.storage.sync.set(items, function () {
         if (chrome.runtime.lastError) {
            console.error("Error setting item:", chrome.runtime.lastError);
         } else if (callback) {
            callback();
         }
         resolve();
      });
   });
}
// Example usage:
// chromeStorageSet("myKey", "myValue", function () {
//    console.log("Item set");
// });

function chromeStorageGet(key, callback = () => {}) {
   return new Promise((resolve) => {
      chrome.storage.sync.get([key], function (result) {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
         } else if (callback) {
            callback(result[key]);
            resolve(result[key]);
         }
      });
   });
}

function setInputLikeHuman(element) {
   const event = new Event("change", { bubbles: true });
   element.dispatchEvent(event);
}

function shuffleArray(array) {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
   }
   return array;
}

function chromeStorageSetLocal(key, value, callback) {
   const obj = JSON.stringify(value);

   chrome.storage.local.set({ [key]: obj }).then(() => {
      if (chrome.runtime.lastError) {
         console.error("Error setting item:", chrome.runtime.lastError);
      } else if (callback) {
         callback(true);
      } else {
         return true;
      }
   });
}

function chromeStorageGetLocal(key, callback) {
   return new Promise((resolve) => {
      chrome.storage.local.get([key]).then((result) => {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
         } else {
            const OBJ =
               typeof result[key] === "string" ? JSON.parse(result[key]) : null;
            callback && callback(OBJ);
            resolve(OBJ);
         }
      });
   });
}

function chromeStorageRemoveLocal(key) {
   chrome.storage.local.remove(key).then(() => {
      if (chrome.runtime.lastError) {
         console.log("Error removing item:", chrome.runtime.lastError);
      }
   });
}

function DATE() {
   const date = new Date();
   const yy = date.getFullYear();
   const mm = date.getMonth() + 1;
   const dd = date.getDate();
   const hh = date.getHours();
   const ss = date.getMinutes();
   const ms = date.getSeconds();
   return { yy, mm, dd, hh, ss, ms };
}

/* -------------- marks given function ------------------ */

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

// Alternative Method 1: Using atob() for base64 decoding
const dataURLToPDFBlobAtob = (dataURL) => {
   const base64Data = dataURL.split(",")[1]; // Remove "data:application/pdf;base64," prefix
   const binaryData = atob(base64Data); // Decode base64
   const bytes = new Uint8Array(binaryData.length);

   for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
   }

   return new Blob([bytes], { type: "application/pdf" });
};
// const pdfBlob2 = dataURLToPDFBlobAtob(pdfDataURL);

// Convert Blob (e.g. PDF) to Base64 Data URL
const blobToDataURL = async (blob) => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject("Failed to read the blob as Data URL");
      reader.readAsDataURL(blob);
   });
};

const extractRollAndName = (string) => {
   let match = string.match(/^\s*(\d+)\s*(?:-\s*)?(.*)$/);

   if (match) {
      return { roll: match[1], name: match[2] };
   }
   return null;
};

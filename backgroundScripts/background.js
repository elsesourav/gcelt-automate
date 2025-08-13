importScripts("./../utils.js", "./bgUtils.js");

// Handle post-upload script injection
runtimeOnMessage(
   "c_b_inject_read_pdf_and_marks_given",
   async (_, sender, sendResponse) => {
      try {
         const tabId = sender.tab.id;
         console.log(tabId);

         const result = await injectScriptInContentPage(tabId, () => {
            (async () => {
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
                     [array[i], array[j]] = [array[j], array[i]]; // swap elements
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
               function simulateBezierDrag(
                  canvas,
                  steps = 20,
                  delay = 1,
                  stepDelay = 1
               ) {
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
                        const { x, y } = getQuadraticBezierXY(
                           t,
                           start,
                           control,
                           end
                        );
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

               async function setFitToPage(element, max = 9) {
                  if (!element.title.includes("Fit to page") && max > 0) {
                     element.click();
                     await wait(10);
                     setFitToPage(element, max - 1);
                  }
               }

               function fastRecognizeCanvasText(canvas, options = {}) {
                  // Default options
                  const defaultOptions = {
                     lang: "eng",
                     whitelist:
                        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,?!-",
                     preprocess: true,
                  };

                  const config = { ...defaultOptions, ...options };

                  if (!window.Tesseract) {
                     return new Promise((resolve, reject) => {
                        const script = document.createElement("script");
                        script.src =
                           "https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
                        script.onload = () => {
                           performFastRecognition(canvas, config)
                              .then(resolve)
                              .catch(reject);
                        };
                        script.onerror = () =>
                           reject(new Error("Failed to load Tesseract.js"));
                        document.head.appendChild(script);
                     });
                  }

                  return performFastRecognition(canvas, config);
               }

               function performFastRecognition(canvas, config) {
                  const imageData = config.preprocess
                     ? preprocessImage(canvas)
                     : canvas;

                  const recognitionConfig = {
                     logger: (m) => console.log(m),
                     tessedit_char_whitelist: config.whitelist,
                     tessjs_create_hocr: "0",
                     tessjs_create_tsv: "0",
                     tessjs_create_box: "0",
                     tessjs_create_unlv: "0",
                     tessjs_create_osd: "0",
                     tessedit_pageseg_mode: "6",
                     tessedit_ocr_engine_mode: "2",
                     preserve_interword_spaces: "1",
                     textord_heavy_nr: "1",
                     textord_min_linesize: "2.5",
                  };

                  return Tesseract.recognize(
                     imageData,
                     config.lang,
                     recognitionConfig
                  ).then(({ data: { text } }) => {
                     return text.trim();
                  });
               }

               function preprocessImage(sourceCanvas) {
                  const canvas = document.createElement("canvas");
                  canvas.width = sourceCanvas.width;
                  canvas.height = sourceCanvas.height;
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(sourceCanvas, 0, 0);
                  const imageData = ctx.getImageData(
                     0,
                     0,
                     canvas.width,
                     canvas.height
                  );
                  const data = imageData.data;

                  const threshold = 128;
                  for (let i = 0; i < data.length; i += 4) {
                     const gray =
                        0.299 * data[i] +
                        0.587 * data[i + 1] +
                        0.114 * data[i + 2];
                     const value = gray > threshold ? 255 : 0;
                     data[i] = data[i + 1] = data[i + 2] = value;
                  }
                  ctx.putImageData(imageData, 0, 0);

                  return canvas;
               }

               const pdfSize = +document.querySelector(
                  `input[name="pageNumber"] ~ label`
               ).innerText;
               const pageMode = document.querySelector(
                  `button[name="fitMode"]`
               );
               const tickButton =
                  document.querySelector(`button[title="Tick"]`);
               const nextPageBtn = document.querySelector(
                  "button[name='nextPage']"
               );
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
                        const markInput =
                           tds[1].querySelector(`input[type="text"]`);
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
                        const markInput =
                           tds[1].querySelector(`input[type="text"]`);
                        markInput.value = dev[i];
                     } else {
                        const markInput = tds[2].querySelector(`input`);
                        markInput.checked = true;
                        setInputLikeHuman(markInput);
                     }
                  });
               }
            })();

            return true;
         });

         if (!result || !result[0]?.result) {
            throw new Error("Script execution failed");
         }
         sendResponse({ success: true });
      } catch (error) {
         console.log("Script injection failed:", error);
         sendResponse({ success: false, error: error.message });
      }
   }
);

runtimeOnMessage(
   "C_B_INJECT_CA1_PDF_SUBMISSION",
   async (_, sender, sendResponse) => {
      try {
         const tabId = sender.tab.id;

         const result = await injectScriptInContentPage(tabId, () => {
            const trElements =
               document.querySelectorAll(
                  "#marksEntrySectionCA .well.with-header table tbody tr"
               ) || [];

            for (let tr of trElements) {
               const fileInput = tr.querySelector(
                  `input[data-action="submit"]`
               );
               const aTag = tr.querySelector("a");

               if (aTag && fileInput) {
                  aTag.dispatchEvent(new Event("change", { bubbles: true }));
                  aTag.click();
               }
            }
            return true;
         });

         if (!result || !result[0]?.result) {
            throw new Error("Script execution failed");
         }
         sendResponse({ success: true });
      } catch (error) {
         console.log("Script injection failed:", error);
         sendResponse({ success: false, error: error.message });
      }
   }
);

runtimeOnMessage(
   "C_B_INJECT_CA3_PDF_SUBMISSION",
   async (_, sender, sendResponse) => {
      try {
         const tabId = sender.tab.id;

         const result = await injectScriptInContentPage(tabId, () => {
            const trElements =
               document.querySelectorAll("#sv-table tbody tr") || [];

            for (let tr of trElements) {
               const fileInput = tr.querySelector(
                  `input[data-action="submit"]`
               );
               const aTag = tr.querySelector("a");

               if (aTag && fileInput) {
                  aTag.dispatchEvent(new Event("change", { bubbles: true }));
                  aTag.click();
               }
            }
            return true;
         });

         if (!result || !result[0]?.result) {
            throw new Error("Script execution failed");
         }
         sendResponse({ success: true });
      } catch (error) {
         console.log("Script injection failed:", error);
         sendResponse({ success: false, error: error.message });
      }
   }
);

runtimeOnMessage("c_b_pdf_data_request", async (message, _, sendResponse) => {
   try {
      const { startIndex = 0, endIndex } = message;
      const PDF_DATA = await chromeStorageGetLocal(KEYS.STORAGE_PDF);
      const SETTING_DATA = await chromeStorageGetLocal(
         KEYS.STORAGE_POPUP_SETTINGS
      );

      // If PDF_DATA is an object, convert it to array for pagination
      const pdfEntries = PDF_DATA ? Object.entries(PDF_DATA) : [];
      const totalEntries = pdfEntries.length;
      const paginatedEntries = pdfEntries.slice(
         startIndex,
         endIndex || totalEntries
      );

      // Convert back to object format
      const paginatedPdfData = Object.fromEntries(paginatedEntries);

      sendResponse({
         PDFS: paginatedPdfData,
         SETTINGS: SETTING_DATA,
         totalEntries,
         hasMore: endIndex ? endIndex < totalEntries : false,
      });
   } catch (error) {
      console.log(error);
   } finally {
      const SETTING_DATA = await chromeStorageGetLocal(
         KEYS.STORAGE_POPUP_SETTINGS
      );
      sendResponse({
         PDFS: {},
         SETTINGS: SETTING_DATA,
      });
   }
});

runtimeOnMessage("c_b_success_upload_pdf", async (message, _, sendResponse) => {
   try {
      const { UPLOADED_PDF_KEYS } = message;
      const PDF_DATA = await chromeStorageGetLocal(KEYS.STORAGE_PDF);

      UPLOADED_PDF_KEYS.forEach((key) => {
         if (PDF_DATA[key]) {
            PDF_DATA[key].submitted = true;
         }
      });
      await chromeStorageSetLocal(KEYS.STORAGE_PDF, PDF_DATA);
   } catch (error) {
      console.log(error);
   }
});

setTimeout(async () => {
   // const result = await GET_RUBRICS_PDF();
   // console.log(result);
}, 3000);

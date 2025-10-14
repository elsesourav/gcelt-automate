// runtimeOnMessage(
// 	"C_B_INJECT_READ_PDF_AND_PUT_MARKS",
// 	async (_, sender, sendResponse) => {
// 		try {
// 			const tabId = sender.tab.id;
// 			console.log(tabId);

// 			const result = await injectScriptInContentPage(tabId, () => {
// 				(async () => {
// 					function wait(ms) {
// 						return new Promise((resolve) => setTimeout(resolve, ms));
// 					}

// 					function setInputLikeHuman(element) {
// 						const event = new Event("change", { bubbles: true });
// 						element.dispatchEvent(event);
// 					}

// 					function shuffleArray(array) {
// 						for (let i = array.length - 1; i > 0; i--) {
// 							const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
// 							[array[i], array[j]] = [array[j], array[i]]; // swap elements
// 						}
// 						return array;
// 					}

// 					function getQuadraticBezierXY(t, start, control, end) {
// 						const x =
// 							Math.pow(1 - t, 2) * start.x +
// 							2 * (1 - t) * t * control.x +
// 							Math.pow(t, 2) * end.x;
// 						const y =
// 							Math.pow(1 - t, 2) * start.y +
// 							2 * (1 - t) * t * control.y +
// 							Math.pow(t, 2) * end.y;
// 						return { x, y };
// 					}

// 					// Simulate smooth Bezier-based drag
// 					function simulateBezierDrag(
// 						canvas,
// 						steps = 20,
// 						delay = 1,
// 						stepDelay = 1
// 					) {
// 						return new Promise(async (resolve) => {
// 							const rect = canvas.getBoundingClientRect();
// 							const width = rect.width;
// 							const height = rect.height;

// 							const deltaW = width / 5;
// 							const deltaH = height / 5;

// 							const startX = width / 2 + Math.random() * deltaW;
// 							const startY = height / 2 + Math.random() * deltaH;

// 							const endX = startX + (Math.random() * (deltaW / 2) + 30);
// 							const endY = startY + (Math.random() * (deltaH / 2) + 30);

// 							const toClient = (x, y) => ({
// 								x: rect.left + x,
// 								y: rect.top + y,
// 							});

// 							const start = toClient(startX, startY);
// 							const end = toClient(endX, endY);

// 							const control = {
// 								x: (start.x + end.x) / 2 + (Math.random() * 30 - 15),
// 								y: (start.y + end.y) / 2 - 40,
// 							};

// 							// Helper to fire mouse events
// 							function fire(type, x, y, buttons = 1) {
// 								const event = new MouseEvent(type, {
// 									view: window,
// 									bubbles: true,
// 									cancelable: true,
// 									clientX: x,
// 									clientY: y,
// 									buttons: buttons,
// 									button: type === "mouseup" ? 0 : 0,
// 									relatedTarget: null,
// 									screenX: x,
// 									screenY: y,
// 								});
// 								return canvas.dispatchEvent(event);
// 							}

// 							fire("mousedown", start.x, start.y);
// 							await wait(stepDelay);

// 							// Move along the curve
// 							for (let i = 1; i <= steps; i++) {
// 								const t = i / steps;
// 								const { x, y } = getQuadraticBezierXY(
// 									t,
// 									start,
// 									control,
// 									end
// 								);
// 								fire("mousemove", x, y);
// 								await wait(delay);
// 							}

// 							await wait(stepDelay);
// 							fire("mouseup", end.x, end.y, 0);

// 							await wait(stepDelay);
// 							fire("click", end.x, end.y, 0);
// 							resolve();
// 						});
// 					}

// 					async function setFitToPage(element, max = 9) {
// 						if (!element.title.includes("Fit to page") && max > 0) {
// 							element.click();
// 							await wait(10);
// 							setFitToPage(element, max - 1);
// 						}
// 					}

// 					function fastRecognizeCanvasText(canvas, options = {}) {
// 						// Default options
// 						const defaultOptions = {
// 							lang: "eng",
// 							whitelist:
// 								"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,?!-",
// 							preprocess: true,
// 						};

// 						const config = { ...defaultOptions, ...options };

// 						if (!window.Tesseract) {
// 							return new Promise((resolve, reject) => {
// 								const script = document.createElement("script");
// 								script.src =
// 									"https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
// 								script.onload = () => {
// 									performFastRecognition(canvas, config)
// 										.then(resolve)
// 										.catch(reject);
// 								};
// 								script.onerror = () =>
// 									reject(new Error("Failed to load Tesseract.js"));
// 								document.head.appendChild(script);
// 							});
// 						}

// 						return performFastRecognition(canvas, config);
// 					}

// 					function performFastRecognition(canvas, config) {
// 						const imageData = config.preprocess
// 							? preprocessImage(canvas)
// 							: canvas;

// 						const recognitionConfig = {
// 							logger: (m) => console.log(m),
// 							tessedit_char_whitelist: config.whitelist,
// 							tessjs_create_hocr: "0",
// 							tessjs_create_tsv: "0",
// 							tessjs_create_box: "0",
// 							tessjs_create_unlv: "0",
// 							tessjs_create_osd: "0",
// 							tessedit_pageseg_mode: "6",
// 							tessedit_ocr_engine_mode: "2",
// 							preserve_interword_spaces: "1",
// 							textord_heavy_nr: "1",
// 							textord_min_linesize: "2.5",
// 						};

// 						return Tesseract.recognize(
// 							imageData,
// 							config.lang,
// 							recognitionConfig
// 						).then(({ data: { text } }) => {
// 							return text.trim();
// 						});
// 					}

// 					function preprocessImage(sourceCanvas) {
// 						const canvas = document.createElement("canvas");
// 						canvas.width = sourceCanvas.width;
// 						canvas.height = sourceCanvas.height;
// 						const ctx = canvas.getContext("2d");
// 						ctx.drawImage(sourceCanvas, 0, 0);
// 						const imageData = ctx.getImageData(
// 							0,
// 							0,
// 							canvas.width,
// 							canvas.height
// 						);
// 						const data = imageData.data;

// 						const threshold = 128;
// 						for (let i = 0; i < data.length; i += 4) {
// 							const gray =
// 								0.299 * data[i] +
// 								0.587 * data[i + 1] +
// 								0.114 * data[i + 2];
// 							const value = gray > threshold ? 255 : 0;
// 							data[i] = data[i + 1] = data[i + 2] = value;
// 						}
// 						ctx.putImageData(imageData, 0, 0);

// 						return canvas;
// 					}

// 					const pdfSize = +document.querySelector(
// 						`input[name="pageNumber"] ~ label`
// 					).innerText;
// 					const pageMode = document.querySelector(
// 						`button[name="fitMode"]`
// 					);
// 					const tickButton =
// 						document.querySelector(`button[title="Tick"]`);
// 					const nextPageBtn = document.querySelector(
// 						"button[name='nextPage']"
// 					);
// 					const canvas = document.querySelector("canvas");

// 					const pageMinCharSize = 150;
// 					let validPage = 0;

// 					await setFitToPage(pageMode);
// 					tickButton.click();
// 					for (let i = 0; i < pdfSize; i++) {
//                   const pageChar = await fastRecognizeCanvasText(canvas);
//                   console.log(pageChar);
                  
// 						if (pageChar.length >= pageMinCharSize) validPage++;
// 						await simulateBezierDrag(canvas);
// 						await wait(300);
// 						nextPageBtn.click();
// 					}

// 					let marks = 0;

// 					if (validPage <= 1) {
// 						marks = 0;
// 					} else if (validPage <= 3) {
// 						marks = 15;
// 					} else if (validPage >= 4) {
// 						marks = 22 + Math.floor(Math.random() * 4);
// 					}

// 					const marksRows = document.querySelectorAll("table tbody tr");
// 					const marksDev = {};

// 					const max1Num = 5;
// 					const max5Num = 4;
// 					let marksGiven = 0;

// 					marksRows.forEach((row) => {
// 						const TD = row.querySelectorAll("td");
// 						const [_, __, ___, totalTD] = TD;
// 						const total = totalTD.innerText.replace("/", "").trim();
// 						if (!marksDev[total]) {
// 							marksDev[total] = {
// 								elements: [TD],
// 								value: 1,
// 							};
// 						} else {
// 							marksDev[total].value++;
// 							marksDev[total].elements.push(TD);
// 						}
// 					});

// 					if (marksDev["1"]) {
// 						const tds = marksDev["1"].elements;
// 						const shuffledTds = shuffleArray([...tds]);

// 						shuffledTds.forEach((tds) => {
// 							if (marksGiven < max1Num && marks > marksGiven) {
// 								marksGiven++;
// 								const markInput =
// 									tds[1].querySelector(`input[type="text"]`);
// 								markInput.value = 1;
// 								setInputLikeHuman(markInput);
// 							} else {
// 								const markInput = tds[2].querySelector(`input`);
// 								markInput.checked = true;
// 								setInputLikeHuman(markInput);
// 							}
// 						});
// 					}

// 					if (marksDev["5"]) {
// 						const tds = marksDev["5"].elements;
// 						const shuffledTds = shuffleArray([...tds]);

// 						const num5 = validPage > 3 ? max5Num : validPage > 2 ? 3 : 2;
// 						let neededMarks = marks - marksGiven;
// 						let dt = neededMarks / num5;
// 						let dev = new Array(num5).fill(Math.floor(dt));
// 						const sum = dev.reduce((a, b) => a + b, 0);

// 						neededMarks = marks - (marksGiven + sum);
// 						dev = dev.map((e, i) => {
// 							if (i < neededMarks) return e + 1;
// 							return e;
// 						});

// 						console.log(neededMarks);
// 						console.log(dev);

// 						shuffledTds.forEach((tds, i) => {
// 							if (dev[i]) {
// 								marksGiven += dev[i];
// 								const markInput =
// 									tds[1].querySelector(`input[type="text"]`);
// 								markInput.value = dev[i];
// 							} else {
// 								const markInput = tds[2].querySelector(`input`);
// 								markInput.checked = true;
// 								setInputLikeHuman(markInput);
// 							}
// 						});
// 					}
// 				})();

// 				return true;
// 			});

// 			if (!result || !result[0]?.result) {
// 				throw new Error("Script execution failed");
// 			}
// 			sendResponse({ success: true });
// 		} catch (error) {
// 			console.log("Script injection failed:", error);
// 			sendResponse({ success: false, error: error.message });
// 		}
// 	}
// );





// Handle post-upload script injection


runtimeOnMessage(
	"C_B_INJECT_READ_PDF_AND_PUT_MARKS",
	async (_, sender, sendResponse) => {
		try {
			const tabId = sender.tab.id;
			console.log(tabId);

			const result = await injectScriptInContentPage(tabId, () => {
				return (async () => {
					const wait = (ms) =>
						new Promise((resolve) => setTimeout(resolve, ms));

					// Simple straight line drag (much faster)
					const simulateStraightDrag = async (canvas) => {
						const rect = canvas.getBoundingClientRect();
						const { width, height } = rect;

						const moveW = Math.random() * 10 + 60; // Random 60-70
						const moveH = Math.random() * 20 + 40; // Random 40-60

						const startX = Math.floor(
							width / 2 + Math.random() * 100 + moveW
						);
						const startY = Math.floor(
							height / 3 + Math.random() * 200 + moveH
						);
						const endX = Math.floor(startX + moveW);
						const endY = Math.floor(startY + moveH);

						const toClient = (x, y) => ({
							x: rect.left + x,
							y: rect.top + y,
						});

						const start = toClient(startX, startY);
						const end = toClient(endX, endY);

						const fire = (type, x, y, buttons = 1) => {
							canvas.dispatchEvent(
								new MouseEvent(type, {
									view: window,
									bubbles: true,
									cancelable: true,
									clientX: x,
									clientY: y,
									buttons,
									button: type === "mouseup" ? 0 : 0,
									relatedTarget: null,
									screenX: x,
									screenY: y,
								})
							);
						};

						// Fire events: mousedown -> mousemove -> mouseup -> click
						fire("mousedown", start.x, start.y);
						await wait(10);
						fire("mousemove", end.x, end.y);
						await wait(10);
						fire("mouseup", end.x, end.y, 0);
						await wait(10);
						fire("click", end.x, end.y, 0);
					};

					const pdfSize = +document.querySelector(
						`input[name="pageNumber"] ~ label`
					).innerText;
					const tickButton =
						document.querySelector(`button[title="Tick"]`);
					const nextPageBtn = document.querySelector(
						`button[name='nextPage']`
					);
					const canvas = document.querySelector("canvas");

					// Create a temporary canvas to collect all pages
					const tempCanvas = document.createElement("canvas");
					const ctx = tempCanvas.getContext("2d", {
						willReadFrequently: true,
					});

					const pageWidth = canvas.width;
					const pageHeight = canvas.height;
					const spacing = 10; // Spacing between pages

					// Set combined canvas size
					tempCanvas.width = pageWidth;
					tempCanvas.height = (pageHeight + spacing) * pdfSize - spacing;

					// Fill with white background
					ctx.fillStyle = "#ffffff";
					ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

					// Click tick button once at the start
					tickButton.click();
					await wait(100);

					// Collect all page images into one canvas
					for (let i = 0; i < pdfSize; i++) {
						await wait(500);

						// Draw current page onto combined canvas
						const yOffset = i * (pageHeight + spacing);
						ctx.drawImage(canvas, 0, yOffset, pageWidth, pageHeight);

						await simulateStraightDrag(canvas);
						await wait(300);
						nextPageBtn.click();
						await wait(300);
					}

					// Create a smaller canvas (reduce resolution by 50%)
					const scale = 0.5; // Reduce to 50% size
					const smallCanvas = document.createElement("canvas");
					smallCanvas.width = Math.floor(tempCanvas.width * scale);
					smallCanvas.height = Math.floor(tempCanvas.height * scale);
					const smallCtx = smallCanvas.getContext("2d", {
						willReadFrequently: true,
					});

					// Draw scaled down image
					smallCtx.drawImage(
						tempCanvas,
						0,
						0,
						smallCanvas.width,
						smallCanvas.height
					);

					// Get image data for threshold processing
					const imageData = smallCtx.getImageData(
						0,
						0,
						smallCanvas.width,
						smallCanvas.height
					);
					const data = imageData.data;

					// Apply threshold to keep only dark handwriting (binary B&W)
					const threshold = 180; // Adjust: lower = more aggressive (darker text only)

					for (let i = 0; i < data.length; i += 4) {
						// Convert RGB to grayscale using luminance formula
						const gray =
							data[i] * 0.299 +
							data[i + 1] * 0.587 +
							data[i + 2] * 0.114;

						// Apply threshold: pure black or pure white only
						const bw = gray < threshold ? 0 : 255;

						data[i] = bw; // Red
						data[i + 1] = bw; // Green
						data[i + 2] = bw; // Blue
						// data[i + 3] is alpha, keep unchanged
					}

					smallCtx.putImageData(imageData, 0, 0);

					// Convert to PNG (binary B&W with reduced resolution)
					const combinedImageData = smallCanvas.toDataURL("image/png");

					console.log("Combined image created:", {
						originalSize: `${tempCanvas.width}x${tempCanvas.height}`,
						optimizedSize: `${smallCanvas.width}x${smallCanvas.height}`,
						scale: `${scale * 100}%`,
						totalPages: pdfSize,
						dataSize: `${(combinedImageData.length / 1024 / 1024).toFixed(
							2
						)} MB`,
						format: "PNG Binary B&W (Threshold)",
						threshold: threshold,
					});

					return {
						combinedImage: combinedImageData,
						totalPages: pdfSize,
						pageWidth: pageWidth,
						pageHeight: pageHeight,
						combinedWidth: smallCanvas.width,
						combinedHeight: smallCanvas.height,
					};
				})();
			});

			console.log("Injection result:", result);

			console.log("image: ", result?.combinedImage);

			if (!result || !result[0]?.result) {
				throw new Error("Script execution failed");
			}

			const { combinedImage } = result[0].result;

			const ocrResult = await PROCESS_PDF_IMAGES_OCR(combinedImage);
			console.log("OCR Result:", ocrResult);

			sendResponse({ success: true, data: ocrResult });
		} catch (error) {
			console.log("Script injection failed:", error);
			sendResponse({ success: false, error: error.message });
		}
	}
);
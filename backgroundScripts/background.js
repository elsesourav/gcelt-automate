importScripts("./../utils.js", "./bgUtils.js");

runtimeOnMessage(
	"C_B_INJECT_READ_PDF_TEXT",
	async (_, sender, sendResponse) => {
		try {
			const tabId = sender.tab.id;
			console.log(tabId);

			const result = await injectScriptInContentPage(tabId, () => {
				return (async () => {
					const wait = (ms) =>
						new Promise((resolve) => setTimeout(resolve, ms));

					// Improved straight line drag with better accuracy
					const simulateStraightDrag = async (canvas) => {
						const rect = canvas.getBoundingClientRect();
						const { width, height } = rect;

						// More controlled random movement
						const moveW = Math.random() * 30 + 80; // Random 80-110
						const moveH = Math.random() * 30 + 60; // Random 60-90

						// Calculate start and end points within canvas bounds
						const margin = 20; // Keep away from edges
						const startX = Math.floor(
							margin + Math.random() * (width / 3)
						);
						const startY = Math.floor(
							margin + Math.random() * (height / 3)
						);
						const endX = Math.floor(
							Math.min(startX + moveW, width - margin)
						);
						const endY = Math.floor(
							Math.min(startY + moveH, height - margin)
						);

						const toClient = (x, y) => ({
							x: rect.left + x,
							y: rect.top + y,
						});

						const start = toClient(startX, startY);
						const end = toClient(endX, endY);

						const fire = (type, x, y, buttons = 1) => {
							const event = new MouseEvent(type, {
								view: window,
								bubbles: true,
								cancelable: true,
								clientX: x,
								clientY: y,
								buttons,
								button: type === "mouseup" ? 0 : 0,
								relatedTarget: canvas,
								screenX: window.screenX + x,
								screenY: window.screenY + y,
								detail: type === "click" ? 1 : 0,
								pointerType: "mouse",
							});
							canvas.dispatchEvent(event);
							return event;
						};

						// More realistic mouse event sequence
						// 1. Mouse enters canvas
						fire("mouseenter", start.x, start.y, 0);
						await wait(10);

						// 2. Mouse moves to start position
						fire("mousemove", start.x, start.y, 0);
						await wait(20);

						// 3. Mouse down (start drawing)
						fire("mousedown", start.x, start.y, 1);
						await wait(30);

						// 4. Drag with multiple intermediate points for smoother path
						const steps = 8; // More steps for smoother drag
						for (let i = 1; i <= steps; i++) {
							const progress = i / steps;
							const currentX = start.x + (end.x - start.x) * progress;
							const currentY = start.y + (end.y - start.y) * progress;
							fire("mousemove", currentX, currentY, 1);
							await wait(15);
						}

						// 5. Final position
						fire("mousemove", end.x, end.y, 1);
						await wait(30);

						// 6. Mouse up (finish drawing)
						fire("mouseup", end.x, end.y, 0);
						await wait(20);

						// 7. Click to confirm
						fire("click", end.x, end.y, 0);
						await wait(10);

						// 8. Mouse leaves
						fire("mouseleave", end.x, end.y, 0);
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

					tickButton.click();
					await wait(100);

					// Collect all page images into one canvas
					for (let i = 0; i < pdfSize; i++) {
						await wait(2000);

						// Draw current page onto combined canvas
						const yOffset = i * (pageHeight + spacing);
						ctx.drawImage(canvas, 0, yOffset, pageWidth, pageHeight);

						await simulateStraightDrag(canvas);
						await wait(600);
						nextPageBtn.click();
						await wait(600);
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

			if (!result || !result[0]?.result) {
				throw new Error("Script execution failed");
			}

			const { combinedImage } = result[0].result;

			// Start OCR timing
			const ocrStartTime = performance.now();
			console.log("Starting OCR processing...");

			tabSendMessage(tabId, "B_C_START_BIG_LOADING", {});
			const ocrResult = await PROCESS_PDF_IMAGES_OCR(combinedImage);
			tabSendMessage(tabId, "B_C_STOP_BIG_LOADING", {});

			// Calculate OCR duration
			const ocrEndTime = performance.now();
			const ocrDuration = ((ocrEndTime - ocrStartTime) / 1000).toFixed(2);
			console.log(`OCR completed in ${ocrDuration} seconds`);
			console.log("OCR Result:", ocrResult);

			sendResponse({
				success: true,
				text: ocrResult?.result?.text || "",
				pageCount: ocrResult?.result?.pageCount || 0,
			});
		} catch (error) {
			console.log("Script injection failed:", error);
			sendResponse({ success: false, error: error.message });
		}
	}
);

runtimeOnMessage(
	"C_B_INJECT_CA1_AND_CA2_PDF_SUBMISSION",
	async (_, sender, sendResponse) => {
		try {
			const tabId = sender.tab.id;

			const result = await injectScriptInContentPage(tabId, () => {
				const trElements =
					document.querySelectorAll(
						"#marksEntrySectionCA .well.with-header table tbody tr"
					) || [];

				for (let tr of trElements) {
					const submitButton = tr.querySelector(
						`input[data-action="submit"]`
					);
					const fileInput = tr.querySelector("input[type='file']");
					const aTag = tr.querySelector("a");
					const isAlreadyUploaded = fileInput.files.length > 0;

					if (isAlreadyUploaded && aTag && submitButton) {
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

runtimeOnMessage(
	"C_B_INJECT_CA3_ANSWER_SHEET_SUBMISSION",
	async (_, sender, sendResponse) => {
		try {
			const tabId = sender.tab.id;

			const result = await injectScriptInContentPage(tabId, () => {
				function setClickLikeHuman(element) {
					const event = new Event("change", { bubbles: true });
					element?.click();
					element?.dispatchEvent(event);
				}

				setTimeout(() => {
					const saveButton = document.querySelector("a.btn.btn-danger");
					if (saveButton) {
						setClickLikeHuman(saveButton);

						setTimeout(() => {
							// Also click the confirm button in the modal if it appears
							const confirmButton = document.querySelector(
								`button[data-bb-handler="confirm"]`
							);
							if (confirmButton) {
								setClickLikeHuman(confirmButton);
							}
						}, 5000);
						console.log("Save button clicked successfully");
					} else {
						console.warn("Save button not found");
					}
				}, 1000);

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
	"C_B_INJECT_CA3_OPEN_ANSWER_SHEET",
	async (_, sender, sendResponse) => {
		try {
			const tabId = sender.tab.id;

			const result = await injectScriptInContentPage(tabId, () => {
				document.querySelector("table.table-striped tbody td a")?.click();
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

runtimeOnMessage("C_B_CREATE_RUBRICS_PDF", async (message, _, sendResponse) => {
	try {
		const result = await GET_RUBRICS_PDF(message?.options || {});

		if (result) {
			sendResponse({ success: true, data: result });
		} else {
			sendResponse({
				success: false,
				error: "Failed to create rubrics PDF",
			});
		}
	} catch (error) {
		console.log("Error creating rubrics PDF:", error);
		sendResponse({ success: false, error: error.message });
	}
});

// setTimeout(async () => {
// 	// const result = await GET_RUBRICS_PDF();
// 	// console.log(result);
// }, 3000);

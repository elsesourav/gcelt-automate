runtimeOnMessage("C_OF_GET_RUBRICS_PDF", async (data, _, sendResponse) => {
	try {
		const { options } = data;

		const rubrics = new RubricsPDF({
			orientation: "portrait",
			margin: 8,
			rowHeight: 8,
			headerHeight: 18,
			fontSize: {
				mainTitle: 16,
				title: 14,
				subtitle: 12,
				header: 7,
				data: 8,
			},
			colors: {
				headerBg: [52, 152, 219], // blue header
				alternateRow: [241, 248, 255], // Light blue alternating rows
				text: [44, 62, 80], // Dark blue-gray text
				border: [149, 165, 166], // Modern gray borders
			},
			spacing: {
				titleSpacing: 8,
				sectionSpacing: 1,
			},
		});

		const pdfBlob = await rubrics.createPDF(options);
		const dataURL = await blobToDataURL(pdfBlob);

		sendResponse({ success: true, dataURL });
	} catch (error) {
		console.log("Error generating PDF:", error);
		sendResponse({ success: false, error: error.message });
	}
});

//  ╔══════════════════════════════════════════════════════════════════════════════╗
//  ║                          ● Procedure QRC ●                                   ║
//  ║                                                                              ║
//  ║                        • GET IMAGE TO TEXT •                                 ║
//  ╚══════════════════════════════════════════════════════════════════════════════╝

function readyWorker() {
	return new Promise(async (resolve) => {
		if (!worker) {
			try {
				worker = await Tesseract.createWorker("eng", 1, {
					workerBlobURL: false,
					workerPath: "OCR/worker.min.js",
					corePath: "OCR/Tesseract",
					langPath: "OCR/Lang/",
					logger: updateProgress,
				});

				console.log("ready worker");
			} catch (error) {
				console.error("Error creating worker:", error);
			} finally {
				resolve();
			}
		} else {
			resolve();
		}
	});
}

function updateProgress(packet) {
	return;
	// eslint-disable-next-line no-unreachable
	const percent = Math.round(packet.progress * 100);
	const barLength = 20; // total segments in the bar
	const filledLength = Math.round((barLength * percent) / 100);
	const bar = "█".repeat(filledLength) + "-".repeat(barLength - filledLength);

	// Color setup (browser console)
	let color = "color: cyan;";
	if (packet.status === "recognizing text") color = "color: yellow;";
	if (packet.status === "loading tesseract core") color = "color: magenta;";
	if (packet.status === "loading language traineddata")
		color = "color: green;";
	if (packet.status === "initializing api") color = "color: blue;";
	if (packet.status === "initialized api") color = "color: lightgreen;";

	// Clear previous log and print the new progress bar
	// console.clear();
	console.log(`%c[${bar}] ${percent}% - ${packet.status}`, color);
}

function processOCR(answerImage) {
	return new Promise(async (resolve) => {
		try {
			await readyWorker();
			const result = await worker.recognize(answerImage);

			resolve({
				text: result.data.text,
				confidence: result.data.confidence,
			});
		} catch (error) {
			console.error("Error processing OCR:", error);
			resolve(null);
		}
	});
}

// Handle OCR processing for PDF images
runtimeOnMessage("C_OF_PROCESS_OCR", async (data, _, sendResponse) => {
	try {
		const { answerImage } = data;

		if (!answerImage) {
			sendResponse({ success: false, error: "No image data provided" });
			return;
		}

		const result = await processOCR(answerImage);

		if (result) {
			sendResponse({ success: true, result });
		} else {
			sendResponse({ success: false, error: "OCR processing failed" });
		}
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}

	// try {
	// 	const { pageImages, totalPages } = data;

	// 	// Load Tesseract if not already loaded
	// 	if (!window.Tesseract) {
	// 		await new Promise((resolve, reject) => {
	// 			const script = document.createElement("script");
	// 			script.src =
	// 				"https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
	// 			script.onload = resolve;
	// 			script.onerror = () =>
	// 				reject(new Error("Failed to load Tesseract.js"));
	// 			document.head.appendChild(script);
	// 		});
	// 	}

	// 	// Process all images with OCR
	// 	const ocrResults = [];

	// 	for (const pageData of pageImages) {
	// 		try {
	// 			const { pageNumber, imageData, width, height } = pageData;

	// 			// Configure Tesseract for fast recognition
	// 			const recognitionConfig = {
	// 				logger: (m) => console.log(`Page ${pageNumber}:`, m),
	// 				tessedit_char_whitelist:
	// 					"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,?!-",
	// 				tessjs_create_hocr: "0",
	// 				tessjs_create_tsv: "0",
	// 				tessjs_create_box: "0",
	// 				tessjs_create_unlv: "0",
	// 				tessjs_create_osd: "0",
	// 				tessedit_pageseg_mode: "6",
	// 				tessedit_ocr_engine_mode: "2",
	// 				preserve_interword_spaces: "1",
	// 				textord_heavy_nr: "1",
	// 				textord_min_linesize: "2.5",
	// 			};

	// 			// Perform OCR
	// 			const result = await Tesseract.recognize(
	// 				imageData,
	// 				"eng",
	// 				recognitionConfig
	// 			);

	// 			ocrResults.push({
	// 				pageNumber,
	// 				text: result.data.text.trim(),
	// 				confidence: result.data.confidence,
	// 				width,
	// 				height,
	// 			});
	// 		} catch (error) {
	// 			console.error(
	// 				`Error processing page ${pageData.pageNumber}:`,
	// 				error
	// 			);
	// 			ocrResults.push({
	// 				pageNumber: pageData.pageNumber,
	// 				text: "",
	// 				error: error.message,
	// 				width: pageData.width,
	// 				height: pageData.height,
	// 			});
	// 		}
	// 	}

	// 	sendResponse({ success: true, data: ocrResults });
	// } catch (error) {
	// 	console.error("Error in OCR processing:", error);
	// 	sendResponse({ success: false, error: error.message });
	// }
});

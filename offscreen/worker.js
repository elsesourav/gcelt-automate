//  ╔══════════════════════════════════════════════════════════════════════════════╗
//  ║                          ● Procedure QRC ●                                   ║
//  ║                                                                              ║
//  ║                        • GET IMAGE TO TEXT •                                 ║
//  ╚══════════════════════════════════════════════════════════════════════════════╝
let worker;
function readyWorker() {
	return new Promise(async (resolve, reject) => {
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
				resolve();
			} catch (error) {
				reject(
					new Error("Failed to create Tesseract worker: " + error.message)
				);
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
	return new Promise(async (resolve, reject) => {
		try {
			await readyWorker();

			// Optimized configuration for fastest OCR speed
			const recognitionConfig = {
				// Character whitelist - limits OCR to only these characters (HUGE speed boost)
				tessedit_char_whitelist:
					"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,?!-'\"",

				// Disable all extra output formats (only need text)
				tessjs_create_hocr: "0",
				tessjs_create_tsv: "0",
				tessjs_create_box: "0",
				tessjs_create_unlv: "0",
				tessjs_create_osd: "0",

				// Page segmentation mode - 6 is uniform block of text (faster than auto)
				tessedit_pageseg_mode: "6",

				// OCR Engine Mode - 2 is LSTM only (fastest mode)
				tessedit_ocr_engine_mode: "2",

				// Speed optimizations
				preserve_interword_spaces: "1", // Keep spaces between words
				textord_heavy_nr: "1", // Noise removal
				textord_min_linesize: "2.5", // Min line size

				// Additional speed optimizations
				classify_enable_learning: "0", // Disable adaptive learning (faster)
				classify_enable_adaptive_matcher: "0", // Disable adaptive matching (faster)

				// Disable language model (faster for short text)
				tessedit_enable_dict_correction: "0", // No dictionary correction
				load_system_dawg: "0", // Don't load system dictionary
				load_freq_dawg: "0", // Don't load frequency dictionary
				load_punc_dawg: "0", // Don't load punctuation dictionary
				load_number_dawg: "0", // Don't load number dictionary
				load_unambig_dawg: "0", // Don't load unambiguous dictionary
				load_bigram_dawg: "0", // Don't load bigram dictionary
				load_fixed_length_dawgs: "0", // Don't load fixed length dictionaries

				// Quality vs Speed tradeoff (lower = faster but less accurate)
				tessedit_pageseg_mode: "6", // Single uniform block
				textord_noise_normratio: "1", // Noise ratio (higher = more aggressive)
				textord_noise_sizelimit: "0.5", // Noise size limit

				// Edge detection (faster settings)
				edges_max_children_per_outline: "10", // Lower = faster
				edges_children_per_grandchild: "4", // Lower = faster
			};

			const result = await worker.recognize(answerImage, recognitionConfig);

			resolve({
				text: result.data.text,
				confidence: result.data.confidence,
			});
		} catch (error) {
			reject(new Error("OCR processing error: " + JSON.stringify(error)));
		}
	});
}

// Handle OCR processing for PDF images
runtimeOnMessage("C_OF_PROCESS_OCR", async (data, _, sendResponse) => {
	(async () => {
		try {
			const { answerImage } = data;

			if (!answerImage) {
				return sendResponse({
					success: false,
					error: "No image data provided",
				});
			}

			const result = await processOCR(answerImage);

			sendResponse({
				success: true,
				result,
			});
		} catch (error) {
			// Catch ALL errors (from readyWorker, processOCR, etc.)
			sendResponse({
				success: false,
				error: error.message || String(error),
			});
		}
	})();
});

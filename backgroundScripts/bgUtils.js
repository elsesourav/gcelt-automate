function injectScriptInContentPage(tabId, scriptFun = () => {}) {
	return chrome.scripting.executeScript({
		target: { tabId },
		func: scriptFun,
		world: "MAIN",
		injectImmediately: true,
	});
}

function ensureOffscreen() {
	return new Promise(async (resolve) => {
		if (!(await chrome.offscreen.hasDocument())) {
			await chrome.offscreen.createDocument({
				url: "./../offscreen/offscreen.html",
				reasons: ["BLOBS"],
				justification: "Need hidden DOM/canvas",
			});
		}
		resolve();
	});
}

async function GET_RUBRICS_PDF(options) {
	return new Promise(async (resolve) => {
		await ensureOffscreen();
		await wait(100);

		runtimeSendMessage("C_OF_GET_RUBRICS_PDF", { options }, (res) => {
			if (res.success) {
				resolve(res);
			} else {
				console.error("Failed to get rubrics PDF:", res.message);
				resolve(res.message);
			}
		});
	});
}

async function PROCESS_PDF_IMAGES_OCR(answerImage) {
	return new Promise(async (resolve) => {
		try {
			console.log("🔧 PROCESS_PDF_IMAGES_OCR called");
			await ensureOffscreen();
			await wait(100);

			runtimeSendMessage("C_OF_PROCESS_OCR", { answerImage }, (res) => {
				console.log("📨 OCR Response:", res);

				if (res && res.success) {
					resolve(res);
				} else {
					console.error(
						"❌ Failed to process OCR:",
						res?.error || "Unknown error"
					);
					resolve({
						success: false,
						error: res?.error || "Unknown error",
					});
				}
			});
		} catch (error) {
			console.error("❌ Error in PROCESS_PDF_IMAGES_OCR:", error);
			resolve({ success: false, error: error.message });
		}
	});
}

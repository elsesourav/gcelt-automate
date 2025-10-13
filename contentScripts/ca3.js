async function putPdfFilesForCA3(isOverwrite, PDFS) {
	const SUBMIT_PDF_KEYS = [];

	const trElements = document.querySelectorAll("#sv-table tbody tr");
	for (let tr of trElements) {
		const rollNoStr = tr.querySelectorAll("td")?.[1]?.innerText;
		const fileInput = tr.querySelector("input[type='file']");
		const isAlreadyUploaded2 = tr.querySelector("td div a.btn.btn-info");
		const rollNo = extractRoll(rollNoStr);

		const studentPdfFile = PDFS?.[rollNo];

		fileInput.style.border = "";
		fileInput.dataset.action = "";

		const isAlreadyUploaded = fileInput.files.length > 0;
		if (
			!studentPdfFile ||
			((isAlreadyUploaded || isAlreadyUploaded2) && !isOverwrite)
		)
			continue;

		SUBMIT_PDF_KEYS.push(rollNo);

		await putPdfIntoInputFile(fileInput, studentPdfFile);
		fileInput.style.border = "solid 2px #0f0";
		fileInput.dataset.action = "submit";
	}

	uploadPdfConfirmation(SUBMIT_PDF_KEYS);
}

async function readyPutPdfFilesForCA3() {
	try {
		const PDF_FILE_DATA = await getPdfData();
		if (!PDF_FILE_DATA) {
			console.log("No PDF data available");
			return;
		}

		const { PDFS, SETTINGS } = PDF_FILE_DATA;
		const OVERWRITE_PDF_FILES = SETTINGS?.OVERWRITE_PDF_FILES || false;

		showConfirm(
			"Upload Confirmation",
			`Are you sure you want to upload these PDFs?${
				OVERWRITE_PDF_FILES
					? "<br />This will <b>overwrite</b> existing files."
					: ""
			}`,
			() => console.log("Cancelled!"),
			() => putPdfFilesForCA3(OVERWRITE_PDF_FILES, PDFS)
		);
	} catch (error) {
		console.error("PDF upload process failed:", error);
	}
}

function readyForSubmitCA3() {
	showConfirm(
		"Submit Confirmation",
		"Are you sure you want to submit these PDFs?",
		() => console.log("Cancelled!"),
		() => submitCA3PDFsUsingInjectScript()
	);
}

function setupUploadCA3() {
	setStyle();

	/* ------- setup button for upload ------- */
	const tableParent =
		document.querySelector("table").parentElement.parentElement.parentElement;

	let putPdf, submitPdf;
	const buttons = CE(
		{ id: "__script-active__", class: "__fw__" },
		(putPdf = CE({ class: "__btn__ orange" }, "UPLOAD PDFs")),
		(submitPdf = CE({ class: "__btn__" }, "SUBMIT PDFs"))
	);

	let secondChild = tableParent.children[1];
	tableParent.insertBefore(buttons, secondChild);

	putPdf.addEventListener("click", readyPutPdfFilesForCA3);
	submitPdf.addEventListener("click", readyForSubmitCA3);

	window.addEventListener("popstate", () => {
		putPdf.removeEventListener("click", readyPutPdfFilesForCA3);
		submitPdf.removeEventListener("click", readyForSubmitCA3);
	});

	// Expand entries to all (300)
	const entriesSelect = document.querySelector("#sv-table_length select");
	entriesSelect.selectedIndex = entriesSelect.options.length - 1;
	setInputLikeHuman(entriesSelect);
}

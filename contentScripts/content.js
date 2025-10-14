function showConfirm(title, message, onCancel, onConfirm) {
	let confirmBtn, cancelBtn;

	const confirmDialog = CE(
		{ class: "__confirm__" },
		CE(
			{ class: "__dialog__" },
			CE({ class: "__title__" }, title),
			CE({ class: "__message__" }, message),
			CE(
				{ class: "__actions__" },
				(cancelBtn = CE({ class: "__btn__ red" }, "Cancel")),
				(confirmBtn = CE({ class: "__btn__ blue" }, "Confirm"))
			)
		)
	);

	// Event handlers
	confirmBtn.onclick = () => {
		document.body.removeChild(confirmDialog);
		if (onConfirm) onConfirm();
	};

	cancelBtn.onclick = () => {
		document.body.removeChild(confirmDialog);
		if (onCancel) onCancel();
	};

	// Close on backdrop click
	confirmDialog.onclick = (e) => {
		if (e.target === confirmDialog) {
			document.body.removeChild(confirmDialog);
			if (onCancel) onCancel();
		}
	};

	document.body.appendChild(confirmDialog);
	return confirmDialog;
}

// Alert Component
function showAlert(options) {
	const {
		type = "info",
		title = "Alert",
		message = "",
		buttonText = "OK",
		onClose = () => {},
	} = options;

	const icons = {
		success: "✓",
		error: "✕",
		warning: "⚠",
		info: "ℹ",
	};

	let okBtn, messageEl;

	const alertDialog = CE(
		{ class: "__alert__" },
		CE(
			{ class: "__dialog__" },
			CE({ class: `__icon__ ${type}` }, icons[type]),
			CE({ class: "__title__" }, title),
			(messageEl = CE({ class: "__message__" }, message)),
			CE(
				{ class: "__actions__" },
				(okBtn = CE({ class: "__btn__ blue" }, buttonText))
			)
		)
	);

	// Event handlers
	okBtn.onclick = () => {
		if (document.body.contains(alertDialog)) {
			document.body.removeChild(alertDialog);
		}
		onClose();
	};

	// Close on backdrop click
	alertDialog.onclick = (e) => {
		if (e.target === alertDialog) {
			if (document.body.contains(alertDialog)) {
				document.body.removeChild(alertDialog);
			}
			onClose();
		}
	};

	// close function
	alertDialog.close = () => {
		if (document.body.contains(alertDialog)) {
			document.body.removeChild(alertDialog);
			onClose();
		}
	};

	// update message function
	alertDialog.updateMessage = (newMessage) => {
		if (messageEl) {
			messageEl.textContent = newMessage;
		}
	};

	// update title function
	alertDialog.updateTitle = (newTitle) => {
		const titleEl = alertDialog.querySelector(".__title__");
		if (titleEl) {
			titleEl.textContent = newTitle;
		}
	};

	// Close on Escape key
	const handleEscape = (e) => {
		if (e.key === "Escape") {
			if (document.body.contains(alertDialog)) {
				document.body.removeChild(alertDialog);
			}
			document.removeEventListener("keydown", handleEscape);
			onClose();
		}
	};
	document.addEventListener("keydown", handleEscape);

	document.body.appendChild(alertDialog);
	return alertDialog;
}

// PDF Preview Component
function showPDFPreview(options) {
	const {
		title = null,
		pdfContent = "",
		fileName = "document.pdf",
		onClose = () => {},
	} = options;

	// Use filename in title if no custom title provided
	const modalTitle = title || `Preview: ${fileName}`;

	let closeBtn, iframe, loadingDiv, errorDiv, modal;

	const pdfPreview = CE(
		{ class: "__pdf-preview__" },
		(modal = CE(
			{ class: "__modal__" },
			CE(
				{ class: "__header__" },
				CE({ class: "__title__" }, modalTitle),
				(closeBtn = CE({ class: "__close__" }, "×"))
			),
			CE(
				{ class: "__body__" },
				(loadingDiv = CE(
					{ class: "__loading__" },
					CE({ class: "__spinner__" }),
					`Loading ${fileName}...`
				)),
				(errorDiv = CE(
					{ class: "__error__", style: "display: none;" },
					CE({ class: "__icon__" }, "⚠️"),
					"Failed to load PDF. Please try again."
				)),
				(iframe = CE({
					tag: "iframe",
					class: "__iframe__",
					style: "display: none;",
				}))
			)
		))
	);

	// Close handlers
	const closePDF = () => {
		if (document.body.contains(pdfPreview)) {
			document.body.removeChild(pdfPreview);
		}
		document.removeEventListener("keydown", handleEscape);
		onClose();
	};

	closeBtn.onclick = closePDF;

	// Close on backdrop click
	pdfPreview.onclick = (e) => {
		if (e.target === pdfPreview) {
			closePDF();
		}
	};

	// Close on Escape key
	const handleEscape = (e) => {
		if (e.key === "Escape") {
			closePDF();
		}
	};
	document.addEventListener("keydown", handleEscape);

	// Validate PDF content
	function validatePdfContent(content) {
		if (!content || typeof content !== "string") return null;

		if (content.startsWith("data:application/pdf")) {
			return content;
		} else if (content.startsWith("data:")) {
			const base64Data = content.split(",")[1];
			return `data:application/pdf;base64,${base64Data}`;
		} else if (content.match(/^[A-Za-z0-9+/=]+$/)) {
			return `data:application/pdf;base64,${content}`;
		}

		return null;
	}

	// Load PDF in iframe
	function loadPDF() {
		const validPdfContent = validatePdfContent(pdfContent);

		if (validPdfContent) {
			// Hide loading and error, show iframe
			loadingDiv.style.display = "none";
			errorDiv.style.display = "none";
			iframe.style.display = "block";
			iframe.src = validPdfContent;
		} else {
			// Show error
			loadingDiv.style.display = "none";
			iframe.style.display = "none";
			errorDiv.style.display = "flex";
		}
	}

	// Add PDF to DOM and load
	document.body.appendChild(pdfPreview);

	// Start loading after a short delay
	setTimeout(loadPDF, 100);

	return {
		element: pdfPreview,
		close: closePDF,
	};
}

// Big Loading Component
function showBigLoading(options = {}) {
	const {
		title = "Processing...",
		message = "Please wait while we process your request.",
		showProgress = true,
		showDots = true,
	} = options;

	const loadingOverlay = CE(
		{ class: "__big-loading__" },
		CE(
			{ class: "__container__" },
			CE(
				{ class: "__spinner-wrapper__" },
				CE({ class: "__spinner__" }),
				CE({ class: "__spinner__" }),
				CE({ class: "__spinner__" }),
				CE({ class: "__pulse-dot__" })
			),
			CE(
				{ class: "__text__" },
				CE({ class: "__title__" }, title),
				CE({ class: "__message__" }, message)
			),
			showProgress
				? CE({ class: "__progress__" }, CE({ class: "__bar__" }))
				: null,
			showDots
				? CE(
						{ class: "__dots__" },
						CE({ class: "__dot__" }),
						CE({ class: "__dot__" }),
						CE({ class: "__dot__" })
				  )
				: null
		)
	);

	document.body.appendChild(loadingOverlay);

	return {
		element: loadingOverlay,
		close: () => {
			if (document.body.contains(loadingOverlay)) {
				document.body.removeChild(loadingOverlay);
			}
		},
		updateTitle: (newTitle) => {
			const titleEl = loadingOverlay.querySelector(".__title__");
			if (titleEl) titleEl.textContent = newTitle;
		},
		updateMessage: (newMessage) => {
			const messageEl = loadingOverlay.querySelector(".__message__");
			if (messageEl) messageEl.textContent = newMessage;
		},
	};
}

function setupActionButtons() {
	const fwPdf = I("#__script-active__")[0];
	const isFwPdf = fwPdf instanceof Node;

	if (!isFwPdf) {
		if (itIsUploadPageForCA3()) {
			setupUploadCA3();
		} else if (itIsUploadPageForCA1()) {
			setupScriptForCA1();
		} else if (itIsUploadPageForCA2()) {
			setupScriptForCA2();
		} else if (itIsCA3EvaluationForm()) {
			setupEvaluationCustomButton();
		}
	} else if (
		isFwPdf &&
		(itIsUploadPageForCA3() ||
			itIsUploadPageForCA1() ||
			itIsUploadPageForCA2() ||
			itIsCA3EvaluationForm())
	) {
		fwPdf.style.display = "flex";
	} else if (
		isFwPdf &&
		!(
			itIsUploadPageForCA3() ||
			itIsUploadPageForCA1() ||
			itIsUploadPageForCA2() ||
			itIsCA3EvaluationForm()
		)
	) {
		fwPdf.style.display = "none";
	}
}

// create action buttons
onload = async () => {
	if (itIsUploadPageForCA3()) {
		setupUploadCA3();
	} else if (itIsUploadPageForCA1()) {
		setupScriptForCA1();
	} else if (itIsUploadPageForCA2()) {
		setupScriptForCA2();
	} else if (itIsCA3EvaluationForm()) {
		setupEvaluationCustomButton();
	}

	if (itIsCA3EvaluationPage()) {
		async function pdfCanvasLoaded() {
			const canvas = document.querySelector("canvas");
			if (!canvas) {
				return setTimeout(pdfCanvasLoaded, 1000);
			} else {
				await wait(1000);
				setupCA3ScriptEvaluation();
			}
		}
		pdfCanvasLoaded();
	}

	addEventListener("mousedown", async (_) => {
		setupActionButtons();
		await wait(1000);
		setupActionButtons();
		await wait(10000);
		setupActionButtons();
	});

	let loading;
	runtimeOnMessage("B_C_START_BIG_LOADING", (_, __, respond) => {
		// Show loading overlay
		loading = showBigLoading({
			title: "Analyzing PDF Document",
			message: "Extracting text from PDF pages...",
			showProgress: true,
			showDots: true,
		});

		respond({ success: true });
		return true;
	});

	runtimeOnMessage("B_C_STOP_BIG_LOADING", (_, __, respond) => {
		// Remove loading overlay
		if (loading) loading.close();
		respond({ success: true });
		return true;
	});
};

/* 

https://makaut1.ucanapply.com/smartexam/public/evaluator/evaluation-ca/questionwise-mark-entry/NjU5Ng==/VFMwMzM5NDA3LTY1OTYtMTAz/NTIwNDc5NQ==

*/

/* 

function simulateDraw(startX, startY, endX, endY, steps = 10) {
    const canvas = document.querySelector('#drawingCanvas'); // You may need to refine this selector
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }

    const rect = canvas.getBoundingClientRect();

    function fire(type, x, y) {
        const event = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            buttons: 1,
        });
        canvas.dispatchEvent(event);
    }

    // Convert coordinates relative to the canvas
    const fromX = rect.left + startX;
    const fromY = rect.top + startY;
    const toX = rect.left + endX;
    const toY = rect.top + endY;

    fire('mousedown', fromX, fromY);

    for (let i = 1; i <= steps; i++) {
        const x = fromX + ((toX - fromX) * i) / steps;
        const y = fromY + ((toY - fromY) * i) / steps;
        fire('mousemove', x, y);
    }

    fire('mouseup', toX, toY);
}

simulateDraw(10, 10, 200, 200);






*/

/* 

================  Upload Rubrics Button Location  ===================
teacher_document.parentElement

================  Upload and Submit Button Location  ===================
document.querySelector("table").parentElement.parentElement.parentElement



*/

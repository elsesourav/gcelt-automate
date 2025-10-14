const pdfInput = I("#pdfFileInput");
const pdfUploadButton = I("#pdfUploadButton");
const pdfDeleteButton = I("#pdfDeleteButton");
const allFileElementList = I("#allFileElementList");
const toggleSettingInputs = I("input.input-setting");

let SAVED_PDF = {};
let SETTING_DATA = {};

onload = async () => {
	const pdf = await chromeStorageGetLocal(KEYS.STORAGE_PDF);
	if (!pdf) {
		chromeStorageSetLocal(KEYS.STORAGE_PDF, SAVED_PDF);
		return;
	}
	SAVED_PDF = pdf;
	createHtmlFileElement(SAVED_PDF, allFileElementList);

	// Initialize search after loading files
	setTimeout(() => {
		if (typeof initializePDFSearch === "function") {
			initializePDFSearch();
		}
	}, 100);

	chromeStorageGetLocal(KEYS.STORAGE_POPUP_SETTINGS, (val) => {
		if (!val) {
			saveSettingData();
			return;
		}
		SETTING_DATA = val;

		console.log(val);

		toggleSettingInputs.forEach((inp) => {
			if (inp.type === "number") inp.value = val[inp.name] || 0;
			else if (inp.type === "range") inp.value = val[inp.name] || inp.value;
			else if (inp.type === "checkbox") inp.checked = val[inp.name] || false;
			else if (inp.type === "radio") {
				// For radio buttons, check if the value matches
				if (val[inp.name] && inp.value === String(val[inp.name])) {
					inp.checked = true;
				}
			} else if (inp.type === "select-one") inp.value = val[inp.name] || "";
			else if (
				inp.getAttribute("inputmode") === "numeric" &&
				inp.type === "text"
			)
				inp.value = val[inp.name]?.replace(/,/g, "") || 0;
			else inp.value = val[inp.name] || "";
		});

		// Refresh range sliders after loading settings
		setTimeout(() => {
			if (typeof initializeAllRangeSliders === "function") {
				initializeAllRangeSliders();
			}
		}, 50);
	});
};

// Add click handlers for radio button containers
document.addEventListener("DOMContentLoaded", () => {
	const radioOptions = document.querySelectorAll(
		".ca3-radio-group .radio-option"
	);
	radioOptions.forEach((option) => {
		option.addEventListener("click", function () {
			const radio = this.querySelector('input[type="radio"]');
			if (radio) {
				radio.checked = true;
				// Trigger change event to save the setting
				radio.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});
	});
});

toggleSettingInputs.on("change", saveSettingData);
pdfUploadButton.click(() => pdfInput[0].click());

pdfInput.on("change", async (e) => {
	const files = e.target.files;
	const regex = /\d{11,}/g; // Find continuous digit sequences of 11 or more

	if (files.length > 0) {
		const readFile = (file) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (event) => {
					const matches = file.name.match(regex);

					// Check if we found any continuous digit sequence of 11+ digits
					let rollNumber = null;
					let bad = true;

					if (matches && matches.length > 0) {
						// Take the first valid sequence found
						rollNumber = matches[0];
						bad = false;
					}

					return resolve({
						bad,
						rollNumber,
						name: file.name,
						submitted: false,
						content: event.target.result,
					});
				};
				reader.onerror = (error) => reject(error);
				reader.readAsDataURL(file);
			});
		};

		try {
			const filePromises = Array.from(files).map((file) => readFile(file));
			const results = await Promise.all(filePromises);

			// Store PDF files with their names
			let OLD_PDF = (await chromeStorageGetLocal(KEYS.STORAGE_PDF)) || {};

			for (const KEY in results) {
				const file = results[KEY];

				if (file.bad) {
					OLD_PDF[file.name] = file;
				} else {
					OLD_PDF[file.rollNumber] = file;
				}
			}

			chromeStorageSetLocal(KEYS.STORAGE_PDF, OLD_PDF);
			createHtmlFileElement(OLD_PDF, allFileElementList);

			// Initialize search after upload
			setTimeout(() => {
				if (typeof initializePDFSearch === "function") {
					initializePDFSearch();
				}
			}, 100);
		} catch (error) {
			console.log("Error reading files:", error);
		}
	}
});

// delete pdf
pdfDeleteButton.click(() => {
	const alert = new AlertHTML({
		title: "Confirmation",
		titleColor: "red",
		titleIcon: "sbi-notification",
		message: "Are you sure you want to delete all PDF files?",
		btnNm1: "No",
		btnNm2: "Yes",
	});
	alert.show();
	alert.clickBtn1(() => {
		alert.hide();
	});
	alert.clickBtn2(() => {
		alert.hide();
		chromeStorageRemoveLocal(KEYS.STORAGE_PDF);
		createHtmlFileElement({}, allFileElementList);

		// Initialize search after delete
		setTimeout(() => {
			if (typeof initializePDFSearch === "function") {
				initializePDFSearch();
			}
		}, 100);
	});
});

// save setting data
function saveSettingData() {
	chromeStorageGetLocal(KEYS.STORAGE_POPUP_SETTINGS, (val) => {
		if (!val) val = {};

		// Handle range sliders first to ensure proper min/max order
		const rangeSliders = document.querySelectorAll(
			'input[type="range"].input-setting'
		);
		const rangeGroups = {};

		// Group range sliders by their naming pattern
		rangeSliders.forEach((inp) => {
			const name = inp.name;
			if (name.includes("MIN_") || name.includes("MAX_")) {
				const baseName = name.replace(/^(MIN_|MAX_)/, "");
				if (!rangeGroups[baseName]) rangeGroups[baseName] = {};
				rangeGroups[baseName][name.startsWith("MIN_") ? "min" : "max"] = {
					input: inp,
					value: parseInt(inp.value),
				};
			}
		});

		// Process range groups to ensure logical min/max order
		Object.keys(rangeGroups).forEach((baseName) => {
			const group = rangeGroups[baseName];
			if (group.min && group.max) {
				const minVal = Math.min(group.min.value, group.max.value);
				const maxVal = Math.max(group.min.value, group.max.value);
				val[`MIN_${baseName}`] = minVal;
				val[`MAX_${baseName}`] = maxVal;
			}
		});

		// Handle all other inputs
		toggleSettingInputs.forEach((inp) => {
			// Skip range inputs as they're already handled above
			if (
				inp.type === "range" &&
				(inp.name.includes("MIN_") || inp.name.includes("MAX_"))
			) {
				return;
			}

			if (inp.type === "number") {
				val[inp.name] = inp.value || 0;
			} else if (inp.type === "range") {
				val[inp.name] = inp.value || 0;
			} else if (inp.type === "checkbox") {
				val[inp.name] = inp.checked;
			} else if (inp.type === "radio") {
				// For radio buttons, only save if checked
				if (inp.checked) {
					val[inp.name] = inp.value;
				}
			} else if (inp.type === "select-one") {
				val[inp.name] = inp.value;
			} else if (
				inp.getAttribute("inputmode") === "numeric" &&
				inp.type === "text"
			) {
				val[inp.name] = inp.value.replace(/,/g, "") || 0;
			} else {
				val[inp.name] = inp.value || "";
			}
		});

		SETTING_DATA = val;
		chromeStorageSetLocal(KEYS.STORAGE_POPUP_SETTINGS, val);
	});
}

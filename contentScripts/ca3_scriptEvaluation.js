function calculateTotalMarksForCA3({
	text,
	pageCount,
	maxMarks = 25,
	minMarks = 18,
	perPageMarks = 1,
	marksIn30Words = 4,
	addRandom = false,
}) {
	// Calculate word count (approximate)
	const wordLength = text.trim().split(/\s+/).length;
	const wordCount = wordLength * 1.8; // Adjusted for accuracy

	// Calculate marks based on different criteria
	const marksFromPages = pageCount * perPageMarks;
	const marksFromWords = Math.floor(wordCount / 30) * marksIn30Words;

	// Calculate total marks and ensure it's within min/max range
	let totalMarks = marksFromPages + marksFromWords;
	totalMarks = Math.max(minMarks, Math.min(maxMarks, totalMarks));

	if (addRandom) {
		if (perPageMarks === 0 && marksIn30Words === 0) {
			totalMarks =
				Math.floor(Math.random() * (maxMarks - minMarks + 1)) + minMarks;
		} else {
			if (totalMarks === maxMarks) totalMarks -= 2;

			const randomVariation = Math.floor(Math.random() * 5) - 2; // Random: -2 to +2
			totalMarks = totalMarks + randomVariation;
			totalMarks = Math.max(minMarks, Math.min(maxMarks, totalMarks));
		}
	}

	return totalMarks;
}

/**
 * Calculate marks distribution between 1-mark and 5-mark questions using randomization
 * @param {number} totalMarks - Total marks to distribute
 * @param {Object} marksDev - Grouped marks data with available questions
 * @returns {Object} Distribution of marks { oneMarkAnswered, fiveMarkDistribution }
 */
function calculateMarksDistribution(totalMarks, marksDev) {
	const available1MarkQuestions = marksDev["1"]?.elements?.length || 0;
	const available5MarkQuestions = marksDev["5"]?.elements?.length || 0;

	// Maximum questions we can answer
	const max1MarkQuestions = Math.min(5, available1MarkQuestions);
	const max5MarkQuestions = Math.min(4, available5MarkQuestions);

	let remainingMarks = totalMarks;

	// Randomly decide how many 1-mark questions to answer (0 to max)
	const num1MarkToAnswer = Math.floor(Math.random() * (max1MarkQuestions + 1));

	// Create array indicating which 1-mark questions to answer
	const oneMarkAnswered = [];
	for (let i = 0; i < available1MarkQuestions; i++) {
		oneMarkAnswered.push(i < num1MarkToAnswer ? 1 : 0);
	}
	// Shuffle to randomize which questions get marks
	shuffleArray(oneMarkAnswered);

	// Subtract 1-mark questions from remaining marks
	remainingMarks -= num1MarkToAnswer;

	// Create random marks distribution for 5-mark questions
	const fiveMarkDistribution = [];

	if (remainingMarks > 0 && available5MarkQuestions > 0) {
		// Try to distribute marks across MORE questions (spread it out)
		// Calculate ideal number of questions to maximize distribution
		const idealQuestions = Math.min(
			max5MarkQuestions,
			Math.max(
				Math.ceil(remainingMarks / 5), // Minimum questions needed
				Math.min(
					Math.ceil(remainingMarks / 3), // Try to use more questions with avg 3 marks
					max5MarkQuestions
				)
			)
		);

		const num5MarkToAnswer = idealQuestions;

		// Distribute marks more evenly across questions
		let marksToDistribute = remainingMarks;
		const baseMarks = Math.floor(marksToDistribute / num5MarkToAnswer);
		const extraMarks = marksToDistribute % num5MarkToAnswer;

		for (let i = 0; i < num5MarkToAnswer; i++) {
			// Give base marks + 1 extra to some questions
			let marks = baseMarks + (i < extraMarks ? 1 : 0);

			// Ensure marks are between 1-5
			marks = Math.max(1, Math.min(5, marks));

			// Add small random variation (±1) for more natural distribution
			const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
			marks = Math.max(1, Math.min(5, marks + variation));

			fiveMarkDistribution.push(marks);
		}

		// Adjust to match exact total if variation caused discrepancy
		const currentTotal = fiveMarkDistribution.reduce((sum, m) => sum + m, 0);
		const diff = marksToDistribute - currentTotal;

		if (diff !== 0) {
			// Adjust the last question to match exact total
			const lastIndex = fiveMarkDistribution.length - 1;
			fiveMarkDistribution[lastIndex] = Math.max(
				1,
				Math.min(5, fiveMarkDistribution[lastIndex] + diff)
			);
		}
	}

	// Fill remaining 5-mark questions with 0 (unanswered)
	for (let i = fiveMarkDistribution.length; i < available5MarkQuestions; i++) {
		fiveMarkDistribution.push(0);
	}

	// Shuffle to randomize which 5-mark questions get which marks
	shuffleArray(fiveMarkDistribution);

	const totalDistributed =
		oneMarkAnswered.filter((m) => m === 1).length +
		fiveMarkDistribution.reduce((sum, mark) => sum + mark, 0);

	return {
		oneMarkAnswered, // Array of 0s and 1s indicating which questions to answer
		fiveMarkDistribution, // Array of marks (0-5) for each 5-mark question
		totalDistributed, // Total marks distributed
		remainingMarks: totalMarks - totalDistributed,
	};
}

/**
 * Helper function to shuffle an array
 */
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

/**
 * Helper function to trigger change event on input elements
 */
function setInputLikeHuman(element) {
	const event = new Event("change", { bubbles: true });
	element.dispatchEvent(event);
}

/**
 * Groups mark rows by their total mark value (1, 5, etc.)
 * @returns {Object} Grouped elements by mark value
 */
function groupMarkRowsByValue() {
	const marksRows = document.querySelectorAll("table tbody tr");
	const marksDev = {};

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

	return marksDev;
}

/**
 * Apply marks to 1-mark question rows
 * @param {Object} marksDev - Grouped marks data
 * @param {Array<number>} oneMarkAnswered - Array of 0s and 1s indicating which questions to answer
 * @returns {number} Marks given
 */
function applyOneMarkQuestions(marksDev, oneMarkAnswered) {
	let marksGiven = 0;

	if (marksDev["1"]) {
		const tds = marksDev["1"].elements;

		tds.forEach((td, index) => {
			if (oneMarkAnswered[index] === 1) {
				marksGiven++;
				const markInput = td[1].querySelector(`input[type="text"]`);
				markInput.value = 1;
			} else {
				const markInput = td[2].querySelector(`input[type="checkbox"]`);
				markInput.checked = true;
				setInputLikeHuman(markInput);
			}
		});
	}

	return marksGiven;
}

/**
 * Apply marks to 5-mark question rows
 * @param {Object} marksDev - Grouped marks data
 * @param {Array<number>} fiveMarkDistribution - Array of marks (0-5) for each 5-mark question
 */
function applyFiveMarkQuestions(marksDev, fiveMarkDistribution) {
	let marksGiven = 0;

	if (marksDev["5"] && fiveMarkDistribution.length > 0) {
		const tds = marksDev["5"].elements;

		tds.forEach((td, index) => {
			const marks = fiveMarkDistribution[index];
			if (marks && marks > 0) {
				marksGiven += marks;
				const markInput = td[1].querySelector(`input[type="text"]`);
				markInput.value = marks;
			} else {
				const markInput = td[2].querySelector(`input[type="checkbox"]`);
				markInput.checked = true;
				setInputLikeHuman(markInput);
			}
		});
	}

	return marksGiven;
}

/**
 * Main function to apply marks to all questions based on distribution
 * @param {number} totalMarks - Total marks to distribute
 */
function applyMarksToQuestions(totalMarks) {
	// Group mark rows by value
	const marksDev = groupMarkRowsByValue();

	// Calculate distribution based on available questions
	const distribution = calculateMarksDistribution(totalMarks, marksDev);

	console.log("Marks Distribution:", distribution);

	const { oneMarkAnswered, fiveMarkDistribution } = distribution;

	// Apply marks to 1-mark questions
	const oneMarksGiven = applyOneMarkQuestions(marksDev, oneMarkAnswered);

	// Apply marks to 5-mark questions
	const fiveMarksGiven = applyFiveMarkQuestions(
		marksDev,
		fiveMarkDistribution
	);

	const totalMarksGiven = oneMarksGiven + fiveMarksGiven;

	console.log("Marks Applied:", {
		oneMarkCount: oneMarksGiven,
		fiveMarkTotal: fiveMarksGiven,
		totalMarksGiven,
	});

	return totalMarksGiven;
}

async function setupCA3ScriptEvaluation() {
	setStyle();
	try {
		const isOpenThroughButton = localStorage.getItem(
			"openThroughTheCustomButton"
		);
		console.log(isOpenThroughButton);

		if (isOpenThroughButton == "false") return;

		localStorage.setItem("openThroughTheCustomButton", "false");

		// Get settings from storage
		const PDF_FILE_DATA = await getPdfData();
		if (!PDF_FILE_DATA) {
			console.log("No PDF data available");
			return;
		}

		const { SETTINGS } = PDF_FILE_DATA;

		// Get CA3 settings from storage (parse as numbers for radio button values)
		const maxMarks = parseInt(SETTINGS?.MAX_MARKS_RANGE_CA3) || 24;
		const minMarks = parseInt(SETTINGS?.MIN_MARKS_RANGE_CA3) || 18;
		const perPageMarks = parseFloat(SETTINGS?.CA3_PER_PAGE_MARKS) || 1;
		const marksIn30Words = parseFloat(SETTINGS?.CA3_MARKS_IN_30_WORDS) || 1.5;
		const addRandom = SETTINGS?.CA3_ADD_RANDOM || true;

		console.log("SETTINGS: ", SETTINGS);

		const pdfPages = await getCA3PdfTextAndDoTickMarks();
		const { text, pageCount } = pdfPages;

		// Calculate total marks based on text and pages
		const totalMarks = calculateTotalMarksForCA3({
			text,
			pageCount,
			maxMarks,
			minMarks,
			perPageMarks,
			marksIn30Words,
			addRandom,
		});

		console.log("Calculated Total Marks:", totalMarks);

		// Apply marks to questions (distribution calculated inside)
		const marksGiven = applyMarksToQuestions(totalMarks);
		console.log("Total Marks Given:", marksGiven);

		// Auto-save if enabled
		const autoSave = SETTINGS?.CA3_AUTO_SAVE || false;
		const waitTime = parseInt(SETTINGS?.CA3_WAIT_TIME) || 30;

		await wait(2000);

		if (autoSave) {
			const waitTimeMs = waitTime * 1000; // Convert to milliseconds
			console.log(
				`Auto-save enabled, waiting ${waitTime} seconds before submitting...`
			);

			// Show countdown with live timer
			let remainingTime = waitTime;
			const alert = showAlert({
				type: "info",
				title: "Auto-Submit Scheduled",
				message: `Form will be automatically submitted in ${remainingTime} seconds`,
				buttonText: "Okay",
			});

			// Update countdown every second
			const countdownInterval = setInterval(() => {
				remainingTime--;
				if (remainingTime > 0) {
					alert.updateMessage(
						`Form will be automatically submitted in ${remainingTime} seconds`
					);
				} else {
					clearInterval(countdownInterval);
				}
			}, 1000);

			// Add click handler to cancel button
			const closeButton = alert.querySelector(".__btn__");
			if (closeButton) {
				closeButton.addEventListener("click", () => {
					clearInterval(countdownInterval);
					console.log("Auto-submit cancelled by user");
				});
			}

			setTimeout(async () => {
				clearInterval(countdownInterval);
				alert.close();
				await wait(500);
				submitCA3AnswerSheetInjectScript();
				console.log("Form submitted successfully");
			}, waitTimeMs);
		}

		return {
			totalMarks,
			marksGiven,
			pageCount,
		};
	} catch (error) {
		// Show error alert
		showAlert({
			type: "error",
			title: "Error Occurred",
			message: `Failed to apply marks: ${error.message}`,
			buttonText: "OK",
		});

		console.error("Error in setupCA3ScriptEvaluation:", error);
		throw error;
	}
}

function setLocalForOpenThroughTheCustomButton() {
	localStorage.setItem("openThroughTheCustomButton", true);
	submitCA3OpenSheetInjectScript();
}

function setupEvaluationCustomButton() {
	setStyle();
	const panelFooter = document.querySelectorAll(".panel-footer");

	if (panelFooter?.[1] && !document.getElementById("__script-active__")) {
		let openForm;
		const buttons = CE(
			{ id: "__script-active__", class: "__fw__" },
			(openForm = CE({ class: "__btn__ orange" }, "Auto Fill Script"))
		);

		panelFooter[1].appendChild(buttons);

		openForm.addEventListener("click", setLocalForOpenThroughTheCustomButton);

		window.addEventListener("popstate", () => {
			openForm.removeEventListener(
				"click",
				setLocalForOpenThroughTheCustomButton
			);
		});
	}
}

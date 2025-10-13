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

// Helper to fire mouse events
function fireMouseEvent(type, x, y, buttons = 1) {
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

// Simulate smooth Bezier-based drag
function simulateBezierDrag(canvas, steps = 20, delay = 1, stepDelay = 1) {
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

		fireMouseEvent("mousedown", start.x, start.y);
		await wait(stepDelay);

		// Move along the curve
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			const { x, y } = getQuadraticBezierXY(t, start, control, end);
			fireMouseEvent("mousemove", x, y);
			await wait(delay);
		}

		await wait(stepDelay);
		fireMouseEvent("mouseup", end.x, end.y, 0);

		await wait(stepDelay);
		fireMouseEvent("click", end.x, end.y, 0);
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

function getPdfImagesAndAddTick() {
   
}

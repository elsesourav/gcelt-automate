async function putPdfFiles() {
   try {
      const PDF_FILE_DATA = await getPdfData();
      if (!PDF_FILE_DATA) {
         console.log("No PDF data available");
         return;
      }

      const { PDFS, SETTINGS } = PDF_FILE_DATA;
      const OVERWRITE_PDF_FILES = SETTINGS?.OVERWRITE_PDF_FILES || false;
      const SUBMIT_PDF_KEYS = [];

      const trElements = document.querySelectorAll("#sv-table tbody tr");
      for (let tr of trElements) {
         const rollNo = tr.querySelectorAll("td")?.[1]?.innerText;

         const studentPdfFile = PDFS?.[rollNo];
         if (!studentPdfFile) continue;

         SUBMIT_PDF_KEYS.push(rollNo);
         const fileInput = tr.querySelector("input");
         // const aTag = tr.querySelector("a");
         const isAlreadyUploaded = tr.querySelector("td div a");

         if (!isAlreadyUploaded || (isAlreadyUploaded && OVERWRITE_PDF_FILES)) {
            await putPdfIntoInputFile(fileInput, studentPdfFile);
            fileInput.style.border = "solid 2px #0f0";
            fileInput.dataset.action = "submit";
         } else {
            fileInput.style.border = "";
            fileInput.dataset.action = "";
         }
      }

      uploadPdfConfirmation(SUBMIT_PDF_KEYS);
   } catch (error) {
      console.error("PDF upload process failed:", error);
   }
}

function setup_put_pdf() {
   let putPdf, submitPdf;
   CE(
      { id: "__fw_pdf__", class: "__fw__" },
      (putPdf = CE(
         {
            class: "__btn__",
            "data-text": "UPLOAD",
            style: "--delay: 0ms",
         },
         "UPLOAD"
      )),
      (submitPdf = CE(
         {
            class: "__btn__",
            "data-text": "SUBMIT",
            style: "--delay: 400ms",
         },
         "SUBMIT"
      ))
   ).parent(document.body);

   putPdf.addEventListener("click", putPdfFiles);
   submitPdf.addEventListener("click", submitPdfsUsingInjectScript);

   window.addEventListener("popstate", () => {
      putPdf.removeEventListener("click", putPdfFiles);
      submitPdf.removeEventListener("click", submitPdfsUsingInjectScript);
   });
}

function setupActionButtons() {
   const fwPdf = I("#__fw_pdf__")[0];
   const isFwPdf = fwPdf instanceof Node;
   const isUploadPage = itIsUploadPage();

   if (isUploadPage && !isFwPdf) {
      setStyle();
      setup_put_pdf();
   } else if (isUploadPage && isFwPdf) {
      fwPdf.style.display = "flex";
   } else if (!isUploadPage && isFwPdf) {
      fwPdf.style.display = "none";
   }
}

// create action buttons
onload = async () => {
   if (itIsUploadPage()) {
      setStyle();
      setup_put_pdf();
   }

   if (itIsCA3EvaluationPage()) {
      async function pdfCanvasLoaded() {
         const canvas = document.querySelector("canvas");
         if (!canvas) {
            return setTimeout(pdfCanvasLoaded, 1000);
         } else {
            await wait(1000);
            readPdfAndMarksGiven();
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

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

   let okBtn;

   const alertDialog = CE(
      { class: "__alert__" },
      CE(
         { class: "__dialog__" },
         CE({ class: `__icon__ ${type}` }, icons[type]),
         CE({ class: "__title__" }, title),
         CE({ class: "__message__" }, message),
         CE(
            { class: "__actions__" },
            (okBtn = CE({ class: "__btn__ blue" }, buttonText))
         )
      )
   );

   // Event handlers
   okBtn.onclick = () => {
      document.body.removeChild(alertDialog);
      onClose();
   };

   // Close on backdrop click
   alertDialog.onclick = (e) => {
      if (e.target === alertDialog) {
         document.body.removeChild(alertDialog);
         onClose();
      }
   };

   // Close on Escape key
   const handleEscape = (e) => {
      if (e.key === "Escape") {
         document.body.removeChild(alertDialog);
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

function setupActionButtons() {
   const fwPdf = I("#__script-active__")[0];
   const isFwPdf = fwPdf instanceof Node;

   if (!isFwPdf) {
      if (itIsUploadPageForCA3()) {
         setupUploadCA3();
      } else if (itIsUploadPageForCA1()) {
         setupScriptForCA1();
      }
   } else if (isFwPdf && (itIsUploadPageForCA3() || itIsUploadPageForCA1())) {
      fwPdf.style.display = "flex";
   } else if (isFwPdf && !(itIsUploadPageForCA3() || itIsUploadPageForCA1())) {
      fwPdf.style.display = "none";
   }
}

// create action buttons
onload = async () => {
   if (itIsUploadPageForCA3()) {
      setupUploadCA3();
   } else if (itIsUploadPageForCA1()) {
      setupScriptForCA1();
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

   // if ()

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

/* 

================  Upload Rubrics Button Location  ===================
teacher_document.parentElement

================  Upload and Submit Button Location  ===================
document.querySelector("table").parentElement.parentElement.parentElement



*/

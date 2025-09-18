function isCA3Page() {
   return document.querySelector("#sv-table tbody tr");
}

function isCA1Page() {
   const is = document.querySelector(
      "#marksEntrySectionCA .well.with-header table"
   );
   const caElement = document.getElementById("Entry_Type");
   const caName = getOutsideParentheses(caElement.selectedOptions[0].innerText);
   return (is && caName && caName?.toLowerCase()?.includes("ca1")) 
}

function isCA2Page() {
   const is = document.querySelector(
      "#marksEntrySectionCA .well.with-header table"
   );
   const caElement = document.getElementById("Entry_Type");
   const caName = getOutsideParentheses(caElement.selectedOptions[0].innerText);
   return (is && caName && caName?.toLowerCase()?.includes("ca2")) 
}

function itIsUploadPageForCA3() {
   const l = window.location.href;
   return (
      l.includes("upload") && l.includes("answerscript-upload") && isCA3Page()
   );
}

function itIsUploadPageForCA1() {
   const l = window.location.href;
   return l.includes("ca-marks-entry") && isCA1Page();
}

function itIsUploadPageForCA2() {
   const l = window.location.href;
   return l.includes("ca-marks-entry") && isCA2Page();
}

function extractRoll(text) {
   return text.replace(/\D/g, "");
}

function itIsCA3EvaluationPage() {
   return (
      window.location.href.includes("makaut1.ucanapply.com") &&
      window.location.href.includes("evaluation-ca") &&
      window.location.href.includes("questionwise-mark-entry")
   );
}

function uploadPdfConfirmation(UPLOADED_PDF_KEYS) {
   return new Promise(async (resolve) => {
      runtimeSendMessage(
         "c_b_success_upload_pdf",
         { UPLOADED_PDF_KEYS },
         (r) => {
            resolve(r);
         }
      );
   });
}

function submitCA1PDFsUsingInjectScript() {
   return new Promise(async (resolve) => {
      runtimeSendMessage("C_B_INJECT_CA1_PDF_SUBMISSION", (r) => {
         resolve(r);
         // console.log("Post-upload script injection successful");
      });
   });
}

function getRubricsForCA(options) {
   return new Promise(async (resolve) => {
      runtimeSendMessage("C_B_CREATE_RUBRICS_PDF", { options }, (r) => {
         resolve(r);
         // console.log("Post-upload script injection successful");
      });
   });
}


function submitCA3PDFsUsingInjectScript() {
   return new Promise(async (resolve) => {
      runtimeSendMessage("C_B_INJECT_CA3_PDF_SUBMISSION", (r) => {
         resolve(r);
         // console.log("Post-upload script injection successful");
      });
   });
}

function readPdfAndMarksGiven() {
   return new Promise(async (resolve) => {
      runtimeSendMessage("c_b_inject_read_pdf_and_marks_given", (r) => {
         resolve(r);
         // console.log("Post-upload script injection successful");
      });
   });
}

function getPdfData() {
   return new Promise(async (resolve) => {
      const CHUNK_SIZE = 15; // Number of entries per chunk
      let startIndex = 0;
      let allPdfs = {};
      let hasMore = true;
      let settings = null;

      while (hasMore) {
         const response = await new Promise((innerResolve) => {
            runtimeSendMessage(
               "c_b_pdf_data_request",
               { startIndex, endIndex: startIndex + CHUNK_SIZE },
               innerResolve
            );
         });

         const { PDFS, SETTINGS, hasMore: moreData } = response;
         Object.assign(allPdfs, PDFS);
         settings = SETTINGS;
         hasMore = moreData;
         startIndex += CHUNK_SIZE;
      }

      resolve({
         PDFS: allPdfs,
         SETTINGS: settings,
      });
   });
}

function clickByHuman(input) {
   try {
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.click();
   } catch (error) {
      console.log(error);
   }
}

function clickEnterKeyOnBootbox() {
   const modal = document.querySelector(".bootbox.modal.fade.bootbox-alert.in");
   if (modal) {
      document.dispatchEvent(
         new KeyboardEvent("keydown", { key: "Enter", code: "Enter" })
      );
   }
}

function putPdfIntoInputFile(fileInputElement, pdfData) {
   return new Promise((resolve) => {
      const base64Response = fetch(pdfData.content);
      base64Response
         .then((res) => res.blob())
         .then((blob) => {
            // Create a File object from the blob
            const pdfFile = new File([blob], pdfData.name, {
               type: "application/pdf",
            });

            // Create DataTransfer and add the file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(pdfFile);
            fileInputElement.files = dataTransfer.files;

            // Dispatch change event
            const event = new Event("change", { bubbles: true });
            fileInputElement.dispatchEvent(event);

            resolve(true);
         })
         .catch((error) => {
            console.error("Error uploading PDF:", error);
            resolve(false);
         });
   });
}

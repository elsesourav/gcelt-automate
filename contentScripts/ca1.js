function getRubricsDataForCA1() {
   const rubricsData = [];
   const trElements = document.querySelectorAll(
      "#marksEntrySectionCA .well.with-header table tbody tr"
   );
   for (let tr of trElements) {
      const slNo = tr.querySelectorAll("td")?.[0]?.innerText;
      const rollNameStr = tr.querySelectorAll("td")?.[1]?.innerText;
      const rollName = extractRollAndName(rollNameStr);
      const marks = tr.querySelector("input[type='text']")?.value || "";

      if (!rollName) {
         showAlert({
            type: "warning",
            title: "Warning",
            message: "Format Not Match Please Contact Developer.",
         });
         return [];
      }

      const { name, roll } = rollName;

      rubricsData.push({ slNo, roll, name, marks });
   }

   return rubricsData;
}

async function purMarksForCA1() {
   const PDF_FILE_DATA = await getPdfData();
   if (!PDF_FILE_DATA) {
      console.log("No PDF data available");
      return;
   }

   const { SETTINGS } = PDF_FILE_DATA;
   const OVERWRITE_CA1_MARKS = SETTINGS?.OVERWRITE_CA1_MARKS || false;
   



}

async function putPdfFilesForCA1() {
   try {
      const PDF_FILE_DATA = await getPdfData();
      if (!PDF_FILE_DATA) {
         console.log("No PDF data available");
         return;
      }

      console.log(PDF_FILE_DATA);

      const { PDFS, SETTINGS } = PDF_FILE_DATA;
      const OVERWRITE_PDF_FILES = SETTINGS?.OVERWRITE_PDF_FILES || false;
      const SUBMIT_PDF_KEYS = [];

      const trElements = document.querySelectorAll(
         "#marksEntrySectionCA .well.with-header table tbody tr"
      );
      for (let tr of trElements) {
         const rollNoStr = tr.querySelectorAll("td")?.[1]?.innerText;
         const rollN0 = extractRoll(rollNoStr);

         const studentPdfFile = PDFS?.[rollN0];
         if (!studentPdfFile) continue;

         SUBMIT_PDF_KEYS.push(rollN0);
         const fileInput = tr.querySelector("input[type='file']");
         const textInput = tr.querySelector("input[type='text']");

         // const aTag = tr.querySelector("a");
         const isAlreadyUploaded = fileInput.files.length > 0;

         console.log(isAlreadyUploaded, isAlreadyUploaded, OVERWRITE_PDF_FILES);
         console.log(studentPdfFile);

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

function submitCA1Action() {
   showConfirm(
      "Upload Confirmation",
      "Are you sure you want to upload these PDFs?",
      () => console.log("Cancelled!"),
      () => submitCA1PDFsUsingInjectScript
   );
}

function setupUploadCA1() {
   const tableParent =
      document.querySelector("table").parentElement.parentElement.parentElement;
   setStyle();

   let purRandomNumber, putPdf, submitPdf;
   const buttons = CE(
      { id: "__fw_pdf__", class: "__fw__" },
      (purRandomNumber = CE({ class: "__btn__" }, "SET MARKS")),
      (putPdf = CE({ class: "__btn__ orange" }, "UPLOAD PDFs")),
      (submitPdf = CE({ class: "__btn__" }, "SUBMIT PDFs"))
   );

   let secondChild = tableParent.children[1];
   tableParent.insertBefore(buttons, secondChild);

   putPdf.addEventListener("click", putPdfFilesForCA1);
   submitPdf.addEventListener("click", submitCA1Action);

   window.addEventListener("popstate", () => {
      putPdf.removeEventListener("click", putPdfFilesForCA1);
      submitPdf.removeEventListener("click", submitCA1Action);
   });
}

async function putPdfFilesForCA3() {
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

function setupUploadCA3() {
   setStyle();

   let putPdf, submitPdf;
   CE(
      { id: "__fw_pdf__", class: "__fw__" },
      (putPdf = CE(
         {
            class: "__btn__",
            "data-text": "UPLOAD PDFs",
            style: "--delay: 0ms",
         },
         "UPLOAD"
      )),
      (submitPdf = CE(
         {
            class: "__btn__",
            "data-text": "SUBMIT PDFs",
            style: "--delay: 400ms",
         },
         "SUBMIT"
      ))
   ).parent(document.body);

   putPdf.addEventListener("click", putPdfFilesForCA3);
   submitPdf.addEventListener("click", submitCA3PDFsUsingInjectScript);

   window.addEventListener("popstate", () => {
      putPdf.removeEventListener("click", putPdfFilesForCA3);
      submitPdf.removeEventListener("click", submitCA3PDFsUsingInjectScript);
   });
}

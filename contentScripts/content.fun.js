function itIsUploadPage() {
   const l = window.location.href;
   const isExistsAnyStudentInfo =
      document.querySelectorAll("#sv-table tbody tr").length > 0;
   return (
      l.includes("upload") && l.includes("makaut1") && isExistsAnyStudentInfo
   );
}

function getPdfData() {
   return new Promise(async (resolve) => {
      const CHUNK_SIZE = 15; // Number of entries per chunk
      let startIndex = 0;
      let allPdfs = {};
      let hasMore = true;
      let settings = null;

      while (hasMore) {
         const response = await new Promise(innerResolve => {
            runtimeSendMessage("c_b_pdf_data_request", 
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
         SETTINGS: settings
      });
   });
}

function clickByHuman(input) {
   const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
      detail: 1,
      screenX: 100,
      screenY: 100,
   });
   if (input) input.dispatchEvent(event);
}

function putPdfIntoInputFile(fileInputElement, pdfData) {
   // Convert base64 to blob
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
      });
}

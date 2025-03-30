importScripts("./../utils.js", "./bgUtils.js");

// Handle post-upload script injection
runtimeOnMessage(
   "c_b_inject_pdf_submission",
   async (_, sender, sendResponse) => {
      try {
         const tabId = sender.tab.id;
         const result = await injectScriptInContentPage(tabId, () => {
            const trElements = document.querySelectorAll("#sv-table tbody tr") || [];

            for (let tr of trElements) {
               const fileInput = tr.querySelector(`input[data-action="submit"]`);
               const aTag = tr.querySelector("a");

               if (aTag && fileInput) {
                  aTag.dispatchEvent(new Event("change", { bubbles: true }));
                  aTag.click();
               }
            }
            return true;
         });

         if (!result || !result[0]?.result) {
            throw new Error("Script execution failed");
         }
         sendResponse({ success: true });
      } catch (error) {
         console.log("Script injection failed:", error);
         sendResponse({ success: false, error: error.message });
      }
   }
);

runtimeOnMessage("c_b_pdf_data_request", async (message, _, sendResponse) => {
   try {
      const { startIndex = 0, endIndex } = message;
      const PDF_DATA = await chromeStorageGetLocal(KEYS.STORAGE_PDF);
      const SETTING_DATA = await chromeStorageGetLocal(
         KEYS.STORAGE_POPUP_SETTINGS
      );

      // If PDF_DATA is an object, convert it to array for pagination
      const pdfEntries = PDF_DATA ? Object.entries(PDF_DATA) : [];
      const totalEntries = pdfEntries.length;
      const paginatedEntries = pdfEntries.slice(
         startIndex,
         endIndex || totalEntries
      );

      // Convert back to object format
      const paginatedPdfData = Object.fromEntries(paginatedEntries);

      sendResponse({
         PDFS: paginatedPdfData,
         SETTINGS: SETTING_DATA,
         totalEntries,
         hasMore: endIndex ? endIndex < totalEntries : false,
      });
   } catch (error) {
      console.log(error);
   } finally {
      const SETTING_DATA = await chromeStorageGetLocal(
         KEYS.STORAGE_POPUP_SETTINGS
      );
      sendResponse({
         PDFS: {},
         SETTINGS: SETTING_DATA,
      });
   }
});

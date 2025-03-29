importScripts("./../utils.js", "./bgUtils.js");

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
      const paginatedEntries = pdfEntries.slice(startIndex, endIndex || totalEntries);
      
      // Convert back to object format
      const paginatedPdfData = Object.fromEntries(paginatedEntries);
      
      sendResponse({
         PDFS: paginatedPdfData,
         SETTINGS: SETTING_DATA,
         totalEntries,
         hasMore: endIndex ? endIndex < totalEntries : false
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

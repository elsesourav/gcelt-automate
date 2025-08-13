runtimeOnMessage("C_OF_GET_RUBRICS_PDF", async (data, _, sendResponse) => {
try {
      const { options } = data;
   
      const rubrics = new RubricsPDF({
         orientation: "portrait",
         margin: 8,
         rowHeight: 8,
         headerHeight: 12,
         fontSize: {
            mainTitle: 16,
            title: 14,
            subtitle: 12,
            header: 7,
            data: 8,
         },
         colors: {
            headerBg: [52, 152, 219], // Beautiful blue header
            alternateRow: [241, 248, 255], // Light blue alternating rows
            text: [44, 62, 80], // Dark blue-gray text
            border: [149, 165, 166], // Modern gray borders
         },
         spacing: {
            titleSpacing: 8,
            sectionSpacing: 1,
         },
      });
   
      const pdfBlob = rubrics.createPDF(options);
      const dataURL = blobToDataURL(pdfBlob);
      
      sendResponse({ success: true, dataURL });
} catch (error) {
   console.log("Error generating PDF:", error);
   sendResponse({ success: false, error: error.message });
}
});

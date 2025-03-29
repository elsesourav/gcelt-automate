async function putPdfFiles() {
   try {
      const PDF_FILE_DATA = await getPdfData();
      if (!PDF_FILE_DATA) {
         console.error('No PDF data available');
         return;
      }
   
      const { PDFS, SETTINGS } = PDF_FILE_DATA;
      const { OVERWRITE_PDF_FILES } = SETTINGS;
      const trElements = document.querySelectorAll("#sv-table tbody tr");
      
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      for (let tr of trElements) {
         try {
            const rollNo = tr.querySelectorAll("td")?.[1]?.innerText;
            if (!rollNo) continue;

            const studentPdfFile = PDFS?.[rollNo];
            if (!studentPdfFile) {
               tr.style.backgroundColor = '#fff3f3';
               continue;
            }
   
            const fileInput = tr.querySelector("input");
            const aTag = tr.querySelector("a");
            const isAlreadyUploaded = tr.querySelector("td div a");
   
            if (!isAlreadyUploaded || (isAlreadyUploaded && OVERWRITE_PDF_FILES)) {
               tr.style.backgroundColor = '#fff9e6';
               
               await new Promise((resolve, reject) => {
                  const timeoutId = setTimeout(() => {
                     reject(new Error('File upload timeout'));
                  }, 10000);

                  putPdfIntoInputFile(fileInput, studentPdfFile);
                  fileInput.addEventListener('change', () => {
                     clearTimeout(timeoutId);
                     resolve();
                  }, { once: true });
               });

               await delay(500); // Small delay between upload and submit
               clickByHuman(aTag);
               
               tr.style.backgroundColor = '#f0fff0';
               fileInput.style.border = "solid 2px #0f0";
            } else {
               tr.style.backgroundColor = '#f5f5f5';
               fileInput.style.border = "";
            }

            await delay(1000); // Delay between each student's upload
         } catch (err) {
            console.error(`Error processing roll number: ${rollNo}`, err);
            tr.style.backgroundColor = '#ffebeb';
            continue;
         }
      }
   } catch (error) {
      console.error('PDF upload process failed:', error);
   }
}

function setup_put_pdf() {
   let putPdf;
   CE(
      { id: "__fw_pdf__", class: "__fw__" },
      (putPdf = CE(
         { class: "__btn__", "data-text": "UPLOAD & SUBMIT PDF", style: "--delay: 0ms" },
         "UPLOAD & SUBMIT PDF"
      ))
   ).parent(document.body);

   putPdf.addEventListener("click", putPdfFiles);

   window.addEventListener("popstate", () => {
      putPdf.removeEventListener("click", putPdfFiles);
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

   addEventListener("mousedown", async (_) => {
      setupActionButtons();
      await wait(1000);
      setupActionButtons();
      await wait(10000);
      setupActionButtons();
   });
};

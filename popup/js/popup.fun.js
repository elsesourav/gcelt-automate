function createHtmlFileElement(FILES, PARENT) {
   let html = "";
   let index = 1;
   let badFiles = [];
   let nonSubmittedFiles = [];
   let otherFiles = [];

   for (const [_, file] of Object.entries(FILES)) {
      if (file.bad) {
         badFiles.push(file);
      } else if (!file.submitted) {
         nonSubmittedFiles.push(file);
      } else {
         otherFiles.push(file);
      }
   }

   for (const file of [...badFiles, ...nonSubmittedFiles, ...otherFiles]) {
      const { name, bad } = file;
      const isSubmitted = file?.submitted || false;

      html += `
         <div class="file">
            <div class="file-no">
               <span>${index++}</span>
            </div>
            <div class="file-name ${bad ? "bad" : ""}">
               <span>${name}</span>
            </div>
            <div class="file-status ${isSubmitted ? "active" : ""}">
               <i class="sbi-check-circle"></i>
            </div>
         </div>`;
   }

   PARENT[0].innerHTML = html;
}

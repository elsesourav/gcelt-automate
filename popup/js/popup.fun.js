function createHtmlFileElement(FILES, PARENT) {
   let html = "", index = 1;

   for (const KEY in FILES) {
      const { name, bad } = FILES[KEY];

      html += `
         <div class="file">
            <div class="file-no">
               <span>${index++}</span>
            </div>
            <div class="file-name ${bad ? "bad" : ""}">
               <span>${name}</span>
            </div>
         </div>`;
   }

   PARENT[0].innerHTML = html;
}


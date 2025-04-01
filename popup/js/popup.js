const pdfInput = I("#pdfFileInput");
const pdfUploadButton = I("#pdfUploadButton");
const pdfDeleteButton = I("#pdfDeleteButton");
const allFileElementList = I("#allFileElementList");
const toggleSettingInputs = I("input.input-setting");

let SAVED_PDF = {};
let SETTING_DATA = {};

onload = async () => {
   const pdf = await chromeStorageGetLocal(KEYS.STORAGE_PDF);
   if (!pdf) {
      chromeStorageSetLocal(KEYS.STORAGE_PDF, SAVED_PDF);
      return;
   }
   SAVED_PDF = pdf;
   createHtmlFileElement(SAVED_PDF, allFileElementList);


   chromeStorageGetLocal(KEYS.STORAGE_POPUP_SETTINGS, (val) => {
      if (!val) {
         saveSettingData();
         return;
      }
      SETTING_DATA = val;

      toggleSettingInputs.forEach((inp) => {
         if (inp.type === "number") inp.value = val[inp.name] || 0;
         else if (inp.type === "checkbox") inp.checked = val[inp.name] || false;
         else if (inp.type === "select-one") inp.value = val[inp.name] || "";
         else if (
            inp.getAttribute("inputmode") === "numeric" &&
            inp.type === "text"
         )
         inp.value = val[inp.name]?.replace(/,/g, "") || 0;
         else inp.value = val[inp.name] || "";
      });
   });
};

toggleSettingInputs.on("change", saveSettingData);
pdfUploadButton.click(() => pdfInput[0].click());

pdfInput.on("change", async (e) => {
   const files = e.target.files;
   const regex = /\d{11}/;

   if (files.length > 0) {
      const readFile = (file) => {
         return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
               const match = file.name.match(regex);

               const bad = !match;
               const rollNumber = bad ? null : match[0];
               
               return resolve({
                  bad,
                  rollNumber,
                  name: file.name,
                  submitted: false,
                  content: event.target.result,
               });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
         });
      };

      try {
         const filePromises = Array.from(files).map((file) => readFile(file));
         const results = await Promise.all(filePromises);

         console.log(results);

         // Store PDF files with their names
         let OLD_PDF = (await chromeStorageGetLocal(KEYS.STORAGE_PDF)) || {};

         for (const KEY in results) {
            const file = results[KEY];

            if (file.bad) {
               OLD_PDF[file.name] = file;
            } else {
               OLD_PDF[file.rollNumber] = file;
            }
         }

         chromeStorageSetLocal(KEYS.STORAGE_PDF, OLD_PDF);
         createHtmlFileElement(OLD_PDF, allFileElementList);

         console.log("Stored PDF files:", OLD_PDF);
      } catch (error) {
         console.log("Error reading files:", error);
      }
   }
});

// delete pdf
pdfDeleteButton.click(() => {
   const alert = new AlertHTML({
      title: "Confirmation",
      titleColor: "red",
      titleIcon: "sbi-notification",
      message: "Are you sure you want to delete all PDF files?",
      btnNm1: "No",
      btnNm2: "Yes",
   });
   alert.show();
   alert.clickBtn1(() => {
      alert.hide();
   });
   alert.clickBtn2(() => {
      alert.hide();
      chromeStorageRemoveLocal(KEYS.STORAGE_PDF);
      createHtmlFileElement({}, allFileElementList);
   });
});



// save setting data
function saveSettingData() {
   chromeStorageGetLocal(KEYS.STORAGE_POPUP_SETTINGS, (val) => {
      if (!val) val = {};

      toggleSettingInputs.forEach((inp) => {
         if (inp.type === "number") val[inp.name] = inp.value || 0;
         else if (inp.type === "checkbox") val[inp.name] = inp.checked;
         else if (inp.type === "select-one") val[inp.name] = inp.value;
         else if (
            inp.getAttribute("inputmode") === "numeric" &&
            inp.type === "text"
         )
            val[inp.name] = inp.value.replace(/,/g, "") || 0;
         else val[inp.name] = inp.value || "";
      });

      SETTING_DATA = val;
      chromeStorageSetLocal(KEYS.STORAGE_POPUP_SETTINGS, val);
   });
}

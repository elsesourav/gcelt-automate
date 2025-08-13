function injectScriptInContentPage(tabId, scriptFun = () => {}) {
   return chrome.scripting.executeScript({
      target: { tabId },
      func: scriptFun,
      world: "MAIN",
      injectImmediately: true
   });
}


function ensureOffscreen() {
   return new Promise(async (resolve) => {
      if (!(await chrome.offscreen.hasDocument())) {
         await chrome.offscreen.createDocument({
            url: "./../offscreen/offscreen.html",
            reasons: ["BLOBS"],
            justification: "Need hidden DOM/canvas",
         });
      }
      resolve();
   });
}

async function GET_RUBRICS_PDF(data) {
   return new Promise(async (resolve) => {
      await ensureOffscreen();
      await wait(100);

      runtimeSendMessage("C_OF_GET_RUBRICS_PDF", data, (res) => {
         if (res.success) {
            resolve(res.data);
         } else {
            console.error("Failed to get rubrics PDF:", res.message);
            resolve(null);
         }
      });
   });
}

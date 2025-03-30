function injectScriptInContentPage(tabId, scriptFun = () => {}) {
   return chrome.scripting.executeScript({
      target: { tabId },
      func: scriptFun,
      world: "MAIN",
      injectImmediately: true
   });
}
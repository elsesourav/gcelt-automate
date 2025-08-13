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

   const totalFiles =
      badFiles.length + nonSubmittedFiles.length + otherFiles.length;

   // Hide/show search section based on file count
   const searchWrapper = document.querySelector(".pdf-search-wrapper");
   if (searchWrapper) {
      if (totalFiles === 0) {
         searchWrapper.style.display = "none";
      } else {
         searchWrapper.style.display = "block";
      }
   }

   for (const file of [...badFiles, ...nonSubmittedFiles, ...otherFiles]) {
      const { name, bad, rollNumber } = file;
      const isSubmitted = file?.submitted || false;
      const fileKey = bad ? name : rollNumber; // Use name for bad files, rollNumber for good files

      html += `
         <div class="file" data-file-key="${fileKey}">
            <div class="file-no">
               <span>${index++}</span>
            </div>
            <div class="file-name ${bad ? "bad" : ""}">
               <span class="file-name-text">${name}</span>
               <input type="text" class="file-name-input" value="${name}" style="display: none;">
            </div>
            <div class="file-actions">
               <button class="edit-file-btn" title="Edit filename">
               <i class="sbi-pencil1"></i>
               </button>
               <button class="delete-file-btn" title="Delete file">
               <i class="sbi-trash"></i>
               </button>
            </div>
            <div class="file-status ${isSubmitted ? "active" : ""}">
               <i class="sbi-check-circle"></i>
            </div>
         </div>`;
   }

   PARENT[0].innerHTML = html;

   // Initialize file action handlers
   initializeFileActions();

   // Initialize PDF search after creating file elements with a simple approach
   setTimeout(() => {
      initializePDFSearch();
   }, 300);
}

/**
 * Initialize edit and delete functionality for individual PDF files
 */
function initializeFileActions() {
   const fileElements = document.querySelectorAll(".file");

   fileElements.forEach((fileElement) => {
      const editBtn = fileElement.querySelector(".edit-file-btn");
      const deleteBtn = fileElement.querySelector(".delete-file-btn");
      const fileNameText = fileElement.querySelector(".file-name-text");
      const fileNameInput = fileElement.querySelector(".file-name-input");
      const fileKey = fileElement.getAttribute("data-file-key");

      // Edit functionality
      if (editBtn && fileNameText && fileNameInput) {
         editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            startEditMode(fileElement, fileNameText, fileNameInput);
         });

         // Save on Enter, cancel on Escape
         fileNameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
               saveFileName(fileElement, fileNameText, fileNameInput, fileKey);
            } else if (e.key === "Escape") {
               cancelEdit(fileNameText, fileNameInput);
            }
         });

         // Save on blur
         fileNameInput.addEventListener("blur", () => {
            saveFileName(fileElement, fileNameText, fileNameInput, fileKey);
         });
      }

      // Delete functionality
      if (deleteBtn) {
         deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteFile(fileKey, fileElement);
         });
      }
   });
}

function startEditMode(fileElement, fileNameText, fileNameInput) {
   fileNameText.style.display = "none";
   fileNameInput.style.display = "block";
   fileNameInput.focus();
   fileNameInput.select();
   fileElement.classList.add("editing");
}

function cancelEdit(fileNameText, fileNameInput) {
   fileNameText.style.display = "block";
   fileNameInput.style.display = "none";
   fileNameInput.value = fileNameText.textContent;
}

async function saveFileName(fileElement, fileNameText, fileNameInput, fileKey) {
   const newName = fileNameInput.value.trim();
   const oldName = fileNameText.textContent;

   if (fileElement.dataset.saving === "true") {
      return;
   }

   if (!newName || newName === oldName) {
      fileNameText.style.display = "block";
      fileNameInput.style.display = "none";
      fileElement.classList.remove("editing");
      return;
   }

   fileElement.dataset.saving = "true";

   try {
      const stored = (await chromeStorageGetLocal(KEYS.STORAGE_PDF)) || {};
      const regex = /\d{11,}/g;
      const newMatches = newName.match(regex);
      const newRollNumber =
         newMatches && newMatches.length > 0 ? newMatches[0] : null;
      const newKey = newRollNumber || newName;

      if (stored.hasOwnProperty(newKey) && newKey !== fileKey) {
         fileNameInput.value = oldName;

         const alert = new AlertHTML({
            title: "Duplicate Roll Number",
            titleColor: "#ff4444",
            titleIcon: "sbi-warning",
            message: `A file with this roll number already exists!`,
            btnNm1: "OK",
            oneBtn: true,
         });
         alert.show();
         alert.clickBtn1(() => {
            alert.hide();
            setTimeout(() => {
               fileNameInput.focus();
               fileNameInput.select();
            }, 100);
         });
         fileElement.dataset.saving = "false";
         return;
      }

      let fileData = stored[fileKey];

      if (!fileData) {
         fileData = stored[oldName];
         if (fileData) {
            fileKey = oldName;
         }
      }

      if (!fileData) {
         for (const [key, data] of Object.entries(stored)) {
            if (data.name === oldName) {
               fileData = data;
               fileKey = key;
               break;
            }
         }
      }

      if (fileData) {
         const oldMatches = oldName.match(regex);
         const oldRollNumber =
            oldMatches && oldMatches.length > 0 ? oldMatches[0] : null;

         fileData.name = newName;

         if (newRollNumber) {
            fileData.rollNumber = newRollNumber;
            fileData.bad = false;
         } else {
            fileData.rollNumber = null;
            fileData.bad = true;
         }

         if (oldRollNumber !== newRollNumber) {
            delete stored[fileKey];
            stored[newKey] = fileData;
            fileElement.setAttribute("data-file-key", newKey);
         } else {
            stored[fileKey] = fileData;
         }

         chromeStorageSetLocal(KEYS.STORAGE_PDF, stored, (success) => {
            if (success) {
               fileNameText.textContent = newName;
               setTimeout(() => {
                  createHtmlFileElement(stored, allFileElementList);
               }, 100);
            } else {
               fileNameInput.value = oldName;
            }
            fileElement.dataset.saving = "false";
         });
      } else {
         fileElement.dataset.saving = "false";
      }
   } catch (error) {
      console.error("Error updating filename:", error);
      fileNameInput.value = oldName;

      const alert = new AlertHTML({
         title: "Error",
         titleColor: "#ff4444",
         titleIcon: "sbi-warning",
         message: "Error updating name. Try again.",
         btnNm1: "OK",
         oneBtn: true,
      });
      alert.show();
      alert.clickBtn1(() => alert.hide());
      fileElement.dataset.saving = "false";
   }

   fileNameText.style.display = "block";
   fileNameInput.style.display = "none";
   fileElement.classList.remove("editing");
}

function deleteFile(fileKey, fileElement) {
   const alert = new AlertHTML({
      title: "Delete File",
      titleColor: "red",
      titleIcon: "sbi-trash",
      message: `Are you sure you want to delete this PDF file?`,
      btnNm1: "Cancel",
      btnNm2: "Delete",
   });

   alert.show();

   alert.clickBtn1(() => {
      alert.hide();
   });

   alert.clickBtn2(async () => {
      alert.hide();

      try {
         // Remove from storage
         const stored = (await chromeStorageGetLocal(KEYS.STORAGE_PDF)) || {};
         delete stored[fileKey];
         await chromeStorageSetLocal(KEYS.STORAGE_PDF, stored);

         // Remove from DOM with animation
         fileElement.classList.add("search-hidden");
         setTimeout(() => {
            fileElement.remove();
         }, 300);

         // Show success message
         if (typeof AlertHTML !== "undefined") {
            const successAlert = new AlertHTML({
               title: "Success",
               titleColor: "#4caf50",
               titleIcon: "sbi-check-circle",
               message: "File deleted successfully",
               btnNm1: "OK",
               oneBtn: true,
            });
            successAlert.show();
            successAlert.clickBtn1(() => successAlert.hide());
         }
      } catch (error) {
         console.error("Error deleting file:", error);
         if (typeof AlertHTML !== "undefined") {
            const errorAlert = new AlertHTML({
               title: "Error",
               titleColor: "#ff4444",
               titleIcon: "sbi-warning",
               message: "Error deleting file",
               btnNm1: "OK",
               oneBtn: true,
            });
            errorAlert.show();
            errorAlert.clickBtn1(() => errorAlert.hide());
         }
      }
   });
}

/**
 * Automatically initializes all range sliders found in the document
 * Scans for elements with class 'dual-range-slider' or 'single-range-slider'
 * and applies the appropriate logic automatically
 */
function initializeAllRangeSliders() {
   // Initialize dual range sliders
   const dualSliders = document.querySelectorAll(".dual-range-slider");
   dualSliders.forEach((slider) => {
      const minInput = slider.querySelector(
         'input[type="range"]:first-of-type'
      );
      const maxInput = slider.querySelector('input[type="range"]:last-of-type');
      const display = slider.parentElement.querySelector(".range-values span");
      const progress = slider.querySelector(".slider-progress");

      if (minInput && maxInput && progress) {
         setupDualRangeSlider(minInput, maxInput, display, progress);
      }
   });

   // Initialize single range sliders
   const singleSliders = document.querySelectorAll(".single-range-slider");
   singleSliders.forEach((slider) => {
      const input = slider.querySelector('input[type="range"]');
      const display = slider.parentElement.querySelector(".range-values span");
      const progress = slider.querySelector(".slider-progress");

      if (input && progress) {
         setupSingleRangeSlider(input, display, progress);
      }
   });
}

/**
 * Sets up dual range slider logic for given elements
 */
function setupDualRangeSlider(minInput, maxInput, display, progress) {
   const min = parseInt(minInput.min);
   const max = parseInt(maxInput.max);

   function updateSlider() {
      let minVal = parseInt(minInput.value);
      let maxVal = parseInt(maxInput.value);

      // Ensure both values are positive
      minVal = Math.max(0, minVal);
      maxVal = Math.max(0, maxVal);

      minInput.value = minVal;
      maxInput.value = maxVal;

      // For display, show smaller value first regardless of which input it comes from
      const displayMin = Math.min(minVal, maxVal);
      const displayMax = Math.max(minVal, maxVal);

      // Update display
      if (display) {
         display.textContent = `${displayMin} - ${displayMax}`;
      }

      // Update progress bar using actual display values
      const percentMin = ((displayMin - min) / (max - min)) * 100;
      const percentMax = ((displayMax - min) / (max - min)) * 100;

      progress.style.left = `${percentMin}%`;
      progress.style.width = `${percentMax - percentMin}%`;

      // Dispatch custom event for external listeners
      const event = new CustomEvent("rangeChanged", {
         detail: {
            min: displayMin,
            max: displayMax,
            range: displayMax - displayMin,
         },
      });
      minInput.dispatchEvent(event);
   }

   // Add event listeners
   minInput.addEventListener("input", updateSlider);
   maxInput.addEventListener("input", updateSlider);
   minInput.addEventListener("change", () => {
      updateSlider();
      // Trigger save if the input has the setting class
      if (
         minInput.classList.contains("input-setting") &&
         typeof saveSettingData === "function"
      ) {
         saveSettingData();
      }
   });
   maxInput.addEventListener("change", () => {
      updateSlider();
      // Trigger save if the input has the setting class
      if (
         maxInput.classList.contains("input-setting") &&
         typeof saveSettingData === "function"
      ) {
         saveSettingData();
      }
   });

   // Initial update
   updateSlider();
}
/**
 * Sets up single range slider logic for given elements
 */
function setupSingleRangeSlider(input, display, progress) {
   const min = parseInt(input.min);
   const max = parseInt(input.max);

   function updateSlider() {
      const val = parseInt(input.value);

      // Update display
      if (display) {
         display.textContent = val;
      }

      // Update progress bar
      const percent = ((val - min) / (max - min)) * 100;
      progress.style.width = `${percent}%`;

      // Dispatch custom event for external listeners
      const event = new CustomEvent("valueChanged", {
         detail: { value: val, percent: percent },
      });
      input.dispatchEvent(event);
   }

   input.addEventListener("input", updateSlider);
   input.addEventListener("change", updateSlider);

   // Initial update
   updateSlider();
}

/**
 * Initialize range sliders when DOM is ready
 */
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initializeAllRangeSliders);
} else {
   initializeAllRangeSliders();
}

/**
 * Observer to automatically initialize new range sliders added to the DOM
 */
const rangeSliderObserver = new MutationObserver((mutations) => {
   mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
         if (node.nodeType === 1) {
            // Element node
            // Check if the added node itself is a range slider
            if (
               node.classList &&
               (node.classList.contains("dual-range-slider") ||
                  node.classList.contains("single-range-slider"))
            ) {
               setTimeout(() => initializeAllRangeSliders(), 10);
            }
            // Check if the added node contains range sliders
            else if (
               node.querySelector &&
               (node.querySelector(".dual-range-slider") ||
                  node.querySelector(".single-range-slider"))
            ) {
               setTimeout(() => initializeAllRangeSliders(), 10);
            }
         }
      });
   });
});

// Start observing
rangeSliderObserver.observe(document.body, {
   childList: true,
   subtree: true,
});

/**
 * Tab Navigation System
 * Handles switching between different content sections with smooth transitions
 */
function initializeTabNavigation() {
   const navTabs = document.querySelectorAll(".nav-tab");
   const tabContents = document.querySelectorAll(".tab-content");

   if (navTabs.length === 0 || tabContents.length === 0) {
      return; // Exit if elements not found
   }

   function switchTab(targetTab) {
      // Remove active class from all tabs and contents
      navTabs.forEach((tab) => tab.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      const clickedTab = document.querySelector(`[data-tab="${targetTab}"]`);
      const targetContent = document.getElementById(`${targetTab}-content`);

      if (clickedTab && targetContent) {
         clickedTab.classList.add("active");

         // Small delay for smooth transition
         setTimeout(() => {
            targetContent.classList.add("active");
         }, 50);
      }
   }

   // Add click event listeners to navigation tabs
   navTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
         e.preventDefault();
         const tabTarget = tab.getAttribute("data-tab");
         switchTab(tabTarget);
      });
   });

   // Make tabs focusable
   navTabs.forEach((tab, index) => {
      tab.setAttribute("tabindex", index === 0 ? "0" : "-1");
      tab.setAttribute("role", "tab");
   });

   // Set ARIA attributes for accessibility
   tabContents.forEach((content, index) => {
      content.setAttribute("role", "tabpanel");
      content.setAttribute("aria-labelledby", navTabs[index]?.id || "");
   });
}

/**
 * Initialize tab navigation when DOM is ready
 */
if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initializeTabNavigation);
} else {
   initializeTabNavigation();
}

/**
 * Observer to automatically initialize tab navigation when new tabs are added
 */
const tabObserver = new MutationObserver((mutations) => {
   mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
         if (node.nodeType === 1) {
            if (
               (node.classList && node.classList.contains("tab-navigation")) ||
               (node.querySelector && node.querySelector(".tab-navigation"))
            ) {
               setTimeout(() => initializeTabNavigation(), 10);
            }
         }
      });
   });
});

// Start observing for tab navigation
tabObserver.observe(document.body, {
   childList: true,
   subtree: true,
});

/**
 * PDF Search System
 * Provides real-time search functionality for PDF files
 */
function initializePDFSearch() {
   const searchInput = document.getElementById("pdfSearchInput");
   const clearButton = document.getElementById("clearSearchBtn");
   const filesList = document.getElementById("allFileElementList");

   if (!searchInput || !clearButton || !filesList) {
      console.log("PDF search elements not found - skipping initialization");
      return;
   }

   // Remove any existing event listeners to prevent duplicates
   const newSearchInput = searchInput.cloneNode(true);
   const newClearButton = clearButton.cloneNode(true);
   searchInput.parentNode.replaceChild(newSearchInput, searchInput);
   clearButton.parentNode.replaceChild(newClearButton, clearButton);

   // Get fresh references
   const freshSearchInput = document.getElementById("pdfSearchInput");
   const freshClearButton = document.getElementById("clearSearchBtn");

   let searchTimeout;

   function performSearch(searchTerm) {
      const files = filesList.querySelectorAll(".file");
      const term = searchTerm.toLowerCase().trim();
      let visibleCount = 0;

      // Remove existing no-results message
      const existingMessage = filesList.querySelector(".no-results-message");
      if (existingMessage) {
         existingMessage.remove();
      }

      files.forEach((file) => {
         const fileName = file.querySelector(".file-name-text");
         if (fileName) {
            const name = fileName.textContent.toLowerCase();
            const matches = name.includes(term);

            if (term === "" || matches) {
               file.classList.remove("search-hidden");
               visibleCount++;
            } else {
               file.classList.add("search-hidden");
            }
         }
      });

      // Show no results message if needed
      if (term !== "" && visibleCount === 0) {
         const noResultsMessage = document.createElement("div");
         noResultsMessage.className = "no-results-message";
         noResultsMessage.innerHTML = `
            <i class="sbi-search"></i>
            <p>No PDF files found matching "${searchTerm}"</p>
         `;
         filesList.appendChild(noResultsMessage);
      }

      // Update clear button visibility
      if (term !== "") {
         freshClearButton.style.opacity = "1";
         freshClearButton.style.visibility = "visible";
         freshClearButton.style.transform = "scale(1)";
      } else {
         freshClearButton.style.opacity = "0";
         freshClearButton.style.visibility = "hidden";
         freshClearButton.style.transform = "scale(0.8)";
      }
   }

   // Search input event listener with debouncing
   freshSearchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
         performSearch(e.target.value);
      }, 200);
   });

   // Clear button functionality
   freshClearButton.addEventListener("click", (e) => {
      e.preventDefault();
      freshSearchInput.value = "";
      performSearch("");
      freshSearchInput.focus();
   });

   // Clear on Escape key
   freshSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
         e.preventDefault();
         freshSearchInput.value = "";
         performSearch("");
      }
   });

   // Enhanced search with Enter key
   freshSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
         e.preventDefault();
         performSearch(freshSearchInput.value);
      }
   });
}

/**
 * Initialize PDF search when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
   setTimeout(() => {
      initializePDFSearch();
   }, 500);
});

// Also try to initialize when the window loads
window.addEventListener("load", () => {
   setTimeout(() => {
      initializePDFSearch();
   }, 500);
});

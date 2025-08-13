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

      // Prevent overlapping
      if (maxVal <= minVal) {
         if (document.activeElement === minInput) {
            minInput.value = maxVal - 1;
            minVal = maxVal - 1;
         } else {
            maxInput.value = minVal + 1;
            maxVal = minVal + 1;
         }
      }

      // Update display
      if (display) {
         display.textContent = `${minVal} - ${maxVal}`;
      }

      // Update progress bar
      const percentMin = ((minVal - min) / (max - min)) * 100;
      const percentMax = ((maxVal - min) / (max - min)) * 100;

      progress.style.left = `${percentMin}%`;
      progress.style.width = `${percentMax - percentMin}%`;

      // Dispatch custom event for external listeners
      const event = new CustomEvent("rangeChanged", {
         detail: { min: minVal, max: maxVal, range: maxVal - minVal },
      });
      minInput.dispatchEvent(event);
   }

   // Add event listeners
   minInput.addEventListener("input", updateSlider);
   maxInput.addEventListener("input", updateSlider);
   minInput.addEventListener("change", updateSlider);
   maxInput.addEventListener("change", updateSlider);

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

   // Keyboard navigation support
   navTabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (e) => {
         let targetIndex = index;

         switch (e.key) {
            case "ArrowLeft":
               targetIndex = index > 0 ? index - 1 : navTabs.length - 1;
               break;
            case "ArrowRight":
               targetIndex = index < navTabs.length - 1 ? index + 1 : 0;
               break;
            case "Home":
               targetIndex = 0;
               break;
            case "End":
               targetIndex = navTabs.length - 1;
               break;
            default:
               return; // Exit if other key
         }

         e.preventDefault();
         navTabs[targetIndex].focus();
         const tabTarget = navTabs[targetIndex].getAttribute("data-tab");
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

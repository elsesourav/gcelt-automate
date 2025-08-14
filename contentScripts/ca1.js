function getRubricsDataForCA1() {
   const rubricsData = [];
   const trElements = document.querySelectorAll(
      "#marksEntrySectionCA .well.with-header table tbody tr"
   );
   for (let tr of trElements) {
      const slNo = tr.querySelectorAll("td")?.[0]?.innerText;
      const rollNameStr = tr.querySelectorAll("td")?.[1]?.innerText;
      const rollName = extractRollAndName(rollNameStr);
      const marks = tr.querySelector("input[type='text']")?.value || "";

      if (!rollName) {
         showAlert({
            type: "warning",
            title: "Warning",
            message: "Format Not Match Please Contact Developer.",
         });
         return null;
      }

      const { name, roll } = rollName;

      rubricsData.push({ slNo, roll, name, marks });
   }

   return rubricsData;
}

function getRowsDataArrayForCA1(rubricsData) {
   if (rubricsData && typeof rubricsData === "object") {
      // convert object to array
      let data = Object.entries(rubricsData).map(([key, value]) => ({
         id: key,
         ...value,
      }));
      data = data.map((item) => {
         return [
            item.slNo,
            item.roll,
            item.name,
            ...distributeMarks(item.marks || 0),
            item.marks || "A",
         ];
      });

      return data;
   }
   return [];
}

function getRubricsOptionsForCA1({
   title = "",
   subtitle = "",
   rowsdata = [],
   filename = "GCELT_CA1_Assessment_Rubrics.pdf",
}) {
   return {
      title,
      subtitle,

      tableData: [
         [
            { text: "SL.NO", width: 6, align: "center", fontSize: 6 },
            { text: "ROLL NO.", width: 12, align: "center", fontSize: 7 },
            { text: "STUDENT NAME", width: 24, align: "left", fontSize: 7 },
            {
               text: "BACKGROUND\n(05)",
               width: 11,
               align: "center",
               fontSize: 6,
            },
            {
               text: "CONTENT\nACCURACY (05)",
               width: 11,
               align: "center",
               fontSize: 6,
            },
            {
               text: "SPELLING AND\nGRAMMAR (05)",
               width: 11,
               align: "center",
               fontSize: 6,
            },
            {
               text: "EFFECTIVENESS\n(05)",
               width: 11,
               align: "center",
               fontSize: 6,
            },
            {
               text: "PRESENTATION\n(05)",
               width: 11,
               align: "center",
               fontSize: 6,
            },
            { text: "TOTAL", width: 11, align: "center", fontSize: 7 },
         ],
         ...rowsdata,
      ],
      filename,
   };
}

function getPdfDetailsForCA1() {
   const filterElements = document.querySelectorAll(".filter-option.pull-left");
   const semesterElement = document.getElementById("semester");
   const caElement = document.getElementById("Entry_Type");

   const collageName = getInsideParentheses(filterElements[0].innerText);

   const subjectName = getSubjectName(filterElements[2].innerText);
   const semesterName = semesterElement.selectedOptions[0].innerText?.trim();
   const caName = getOutsideParentheses(caElement.selectedOptions[0].innerText);
   const courseName = getOutsideParentheses(filterElements[1].innerText);

   const subtitle = `${courseName}\n${semesterName},     ${subjectName},      ${caName},      ${new Date().getFullYear()}`;
   const fileName = `${subjectName}-${semesterName}-${caName}-${new Date().getFullYear()}.pdf`;

   return {
      title: collageName,
      subtitle,
      filename: fileName,
   };
}

async function getRubricsPDFBlobForCA1(needDataURL = false) {
   const rubricsData = getRubricsDataForCA1();
   const rowsData = getRowsDataArrayForCA1(rubricsData);

   const { title, subtitle, filename } = getPdfDetailsForCA1();

   const rubricsOptions = getRubricsOptionsForCA1({
      rowsdata: rowsData,
      title,
      subtitle,
      filename,
   });

   if (rubricsOptions) {
      try {
         const { data } = await getRubricsForCA1(rubricsOptions);
         return needDataURL
            ? data?.dataURL
            : dataURLToPDFBlobAtob(data?.dataURL);
      } catch (error) {
         console.log("Error fetching rubrics:", error);
         showAlert({
            type: "error",
            title: "Error",
            message: "Failed to fetch rubrics. Please try again later.",
         });
         return null;
      }
   }
}

function purMarksForCA1(isOverwrite, minMarks, maxMarks) {
   const trElements = document.querySelectorAll(
      "#marksEntrySectionCA .well.with-header table tbody tr"
   );

   for (let tr of trElements) {
      const marksInput = tr.querySelector("input[type='text']");
      const fileInput = tr.querySelector("input[type='file']");
      const isAlreadyUploaded2 = tr.querySelector("td div a.btn.btn-info");

      const isAlreadyUploaded = fileInput.files.length > 0;
      const isAlreadyPut = marksInput.value !== "";
      marksInput.style.border = "";

      if (
         (isAlreadyUploaded || isAlreadyUploaded2) &&
         (!isAlreadyPut || isOverwrite)
      ) {
         marksInput.value = getRandomMarks(minMarks, maxMarks);
         marksInput.style.border = "solid 2px #0f0";
      }
   }
}

async function putPdfFilesForCA1(isOverwrite, PDFS) {
   const SUBMIT_PDF_KEYS = [];

   const trElements = document.querySelectorAll(
      "#marksEntrySectionCA .well.with-header table tbody tr"
   );
   for (let tr of trElements) {
      const rollNoStr = tr.querySelectorAll("td")?.[1]?.innerText;
      const fileInput = tr.querySelector("input[type='file']");
      const isAlreadyUploaded2 = tr.querySelector("td div a.btn.btn-info");
      const rollNo = extractRoll(rollNoStr);
      const studentPdfFile = PDFS?.[rollNo];

      fileInput.style.border = "";
      fileInput.dataset.action = "";

      const isAlreadyUploaded = fileInput.files.length > 0;
      if (!studentPdfFile || ((isAlreadyUploaded || isAlreadyUploaded2) && !isOverwrite)) continue;

      SUBMIT_PDF_KEYS.push(rollNo);

      await putPdfIntoInputFile(fileInput, studentPdfFile);
      fileInput.style.border = "solid 2px #0f0";
      fileInput.dataset.action = "submit";
   }

   uploadPdfConfirmation(SUBMIT_PDF_KEYS);
}

async function readyPurMarksForCA1() {
   const PDF_FILE_DATA = await getPdfData();
   if (!PDF_FILE_DATA) {
      console.log("No PDF data available");
      return;
   }

   const { SETTINGS } = PDF_FILE_DATA;
   const OVERWRITE_CA1_AND_CA2_MARKS =
      SETTINGS?.OVERWRITE_CA1_AND_CA2_MARKS || false;
   const minimumMarks = SETTINGS?.MIN_PAGE_RANGE_CA1_AND_CA2 || 0;
   const maximumMarks = SETTINGS?.MAX_PAGE_RANGE_CA1_AND_CA2 || 0;

   if (minimumMarks === 0 && maximumMarks === 0) {
      showAlert({
         type: "warning",
         title: "Warning",
         message: "Please first set the minimum and maximum marks.",
      });
      return;
   }

   // first confirm user
   showConfirm(
      "Upload Confirmation",
      `Are you sure you want to put marks?<br /> number range: <b>${minimumMarks} - ${maximumMarks}</b>${
         OVERWRITE_CA1_AND_CA2_MARKS
            ? "<br />This will <b>overwrite</b> existing marks."
            : ""
      }`,

      () => console.log("Cancelled!"),
      () =>
         purMarksForCA1(OVERWRITE_CA1_AND_CA2_MARKS, minimumMarks, maximumMarks)
   );
}

async function readyPutPdfFilesForCA1() {
   try {
      const PDF_FILE_DATA = await getPdfData();
      if (!PDF_FILE_DATA) {
         console.log("No PDF data available");
         return;
      }

      const { PDFS, SETTINGS } = PDF_FILE_DATA;
      const OVERWRITE_PDF_FILES = SETTINGS?.OVERWRITE_PDF_FILES || false;

      showConfirm(
         "Upload Confirmation",
         `Are you sure you want to upload these PDFs?${
            OVERWRITE_PDF_FILES
               ? "<br />This will <b>overwrite</b> existing files."
               : ""
         }`,
         () => console.log("Cancelled!"),
         () => putPdfFilesForCA1(OVERWRITE_PDF_FILES, PDFS)
      );
   } catch (error) {
      console.error("PDF upload process failed:", error);
   }
}

function readyForSubmitCA1() {
   showConfirm(
      "Submit Confirmation",
      "Are you sure you want to submit these PDFs?",
      () => console.log("Cancelled!"),
      () => submitCA1PDFsUsingInjectScript()
   );
}

async function readyUploadRubrics() {
   const fileInput = document.getElementById("teacher_document");
   const isAlreadyUploaded = fileInput.files.length > 0;
   const ca1PDFDataURL = await getRubricsPDFBlobForCA1(true);

   const data = {
      content: ca1PDFDataURL,
      name: "GCELT CA1 Rubrics.pdf",
   };

   if (isAlreadyUploaded) {
      // custom confirmation dialog
      showConfirm(
         "Upload Confirmation",
         "Rubrics PDF is already uploaded. Do you want to re-upload?",
         () => console.log("Cancelled!"),
         () => {
            fileInput.value = "";
            putPdfIntoInputFile(fileInput, data);
         }
      );
   } else {
      putPdfIntoInputFile(fileInput, data);
   }
}

async function readyDownloadRubrics() {
   const ca1PdfBlob = await getRubricsPDFBlobForCA1();
   const { filename } = getPdfDetailsForCA1();
   if (ca1PdfBlob) {
      downloadBlobPDF(ca1PdfBlob, filename);
   }
}

async function readyViewRubrics() {
   const ca1PdfBlob = await getRubricsPDFBlobForCA1(true);
   const { filename } = getPdfDetailsForCA1();

   if (ca1PdfBlob) {
      showPDFPreview({
         title: "Rubrics Preview",
         pdfContent: ca1PdfBlob,
         fileName: filename,
         onClose: () => console.log("PDF preview closed"),
      });
   }
}

function setupScriptForCA1() {
   setStyle();
   /* ------- setup button for rubrics ------- */
   const rubricsContainer =
      document.getElementById("teacher_document")?.parentElement;
   let uploadRubrics, downloadRubrics, viewRubrics;
   const rubricsButton = CE(
      { id: "__script-active__", class: "__fw__" },
      (uploadRubrics = CE({ class: "__btn__" }, "UPLOAD RUBRICS")),
      (downloadRubrics = CE({ class: "__btn__ orange" }, "DOWNLOAD RUBRICS")),
      (viewRubrics = CE({ class: "__btn__" }, "VIEW RUBRICS"))
   );
   rubricsContainer.insertBefore(rubricsButton, rubricsContainer.firstChild);

   uploadRubrics.addEventListener("click", readyUploadRubrics);
   downloadRubrics.addEventListener("click", readyDownloadRubrics);
   viewRubrics.addEventListener("click", readyViewRubrics);

   window.addEventListener("popstate", () => {
      uploadRubrics.removeEventListener("click", readyUploadRubrics);
      downloadRubrics.removeEventListener("click", readyDownloadRubrics);
      viewRubrics.removeEventListener("click", readyViewRubrics);
   });

   /* ------- setup button for upload ------- */
   const tableParent =
      document.querySelector("table").parentElement.parentElement.parentElement;

   let purRandomNumber, putPdf, submitPdf;
   const buttons = CE(
      { id: "__script-active__", class: "__fw__" },
      (purRandomNumber = CE({ class: "__btn__" }, "SET MARKS")),
      (putPdf = CE({ class: "__btn__ orange" }, "UPLOAD PDFs")),
      (submitPdf = CE({ class: "__btn__" }, "SUBMIT PDFs"))
   );

   let secondChild = tableParent.children[1];
   tableParent.insertBefore(buttons, secondChild);

   purRandomNumber.addEventListener("click", readyPurMarksForCA1);
   putPdf.addEventListener("click", readyPutPdfFilesForCA1);
   submitPdf.addEventListener("click", readyForSubmitCA1);

   window.addEventListener("popstate", () => {
      purRandomNumber.removeEventListener("click", readyPurMarksForCA1);
      putPdf.removeEventListener("click", readyPutPdfFilesForCA1);
      submitPdf.removeEventListener("click", readyForSubmitCA1);
   });
}

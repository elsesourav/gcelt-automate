class RubricsPDF {
   constructor(options = {}) {
      this.doc = new window.jspdf.jsPDF(options.orientation || "portrait");
      this.config = {
         margin: options.margin || 8,
         rowHeight: options.rowHeight || 10,
         headerHeight: options.headerHeight || 14,
         fontSize: {
            title: options.fontSize?.title || 16,
            subtitle: options.fontSize?.subtitle || 10,
            header: options.fontSize?.header || 7,
            data: options.fontSize?.data || 6,
         },
         colors: {
            headerBg: options.colors?.headerBg || [220, 220, 220],
            alternateRow: options.colors?.alternateRow || [248, 248, 248],
            text: options.colors?.text || [0, 0, 0],
            footerText: options.colors?.footerText || [128, 128, 128],
            border: options.colors?.border || [189, 195, 199],
         },
         spacing: {
            titleSpacing: options.spacing?.titleSpacing || 8,
            sectionSpacing: options.spacing?.sectionSpacing || 10,
         },
      };
      this.pageWidth = this.doc.internal.pageSize.getWidth();
      this.pageHeight = this.doc.internal.pageSize.getHeight();
      this.tableWidth = this.pageWidth - this.config.margin * 2;
      this.tableStartX = this.config.margin;
      this.currentY = this.config.margin + 5;
   }

   createPDF(pdfData) {
      this.currentY = this.config.margin + 5;

      if (pdfData.title) {
         this.addTitle(pdfData.title);
      }

      if (pdfData.subtitle) {
         this.addSubtitle(pdfData.subtitle);
      }

      if (pdfData.tableData) {
         this.currentY += this.config.spacing.sectionSpacing;
         this.drawTable(pdfData.tableData);
      }

      return this.getBlob();
   }

   addTitle(title, fontSize, yPosition) {
      if (!title) return;

      this.doc.setFontSize(fontSize || this.config.fontSize.title);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...this.config.colors.text);
      this.doc.text(title, this.pageWidth / 2, yPosition || this.currentY, {
         align: "center",
      });

      if (!yPosition) this.currentY += this.config.spacing.titleSpacing;
   }

   addSubtitle(subtitle, fontSize, yPosition) {
      if (!subtitle) return;

      this.doc.setFontSize(fontSize || this.config.fontSize.subtitle);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...this.config.colors.text);
      this.doc.text(subtitle, this.pageWidth / 2, yPosition || this.currentY, {
         align: "center",
      });

      if (!yPosition) this.currentY += this.config.spacing.titleSpacing;
   }

   parseTableConfig(tableData) {
      if (!tableData || !tableData[0]) return null;

      const headers = tableData[0];
      const dataRows = tableData.slice(1);

      let columns = [];
      let totalPercentage = 0;

      headers.forEach((header, index) => {
         let config = {
            text: header,
            width: 100 / headers.length,
            fontSize: this.config.fontSize.header,
            align: "center",
         };

         if (typeof header === "object" && header !== null) {
            config.text = header.text || `Column ${index + 1}`;
            config.width = header.width || config.width;
            config.fontSize = header.fontSize || config.fontSize; // Custom fontSize priority
            config.align = header.align || config.align;
         }

         columns.push(config);
         totalPercentage += config.width;
      });

      // Normalize widths to 100%
      if (totalPercentage !== 100) {
         columns.forEach((col) => {
            col.width = (col.width / totalPercentage) * 100;
         });
      }

      // Convert to pixel widths
      columns.forEach((col) => {
         col.actualWidth = this.tableWidth * (col.width / 100);
      });

      return {
         columns: columns,
         dataRows: dataRows,
      };
   }

   drawTable(tableData, startY) {
      const config = this.parseTableConfig(tableData);
      if (!config) return;

      let currentY = startY || this.currentY;
      let rowsOnCurrentPage = 0;

      currentY = this.drawHeaders(config.columns, currentY);

      config.dataRows.forEach((row, rowIndex) => {
         // Page break check
         if (
            currentY > this.pageHeight - 30 &&
            rowIndex < config.dataRows.length - 1
         ) {
            this.doc.addPage(this.doc.internal.pageSize.orientation);
            currentY = 20;
            rowsOnCurrentPage = 0;
            currentY = this.drawHeaders(config.columns, currentY);
         }

         currentY = this.drawDataRow(row, config.columns, currentY, rowIndex);
         rowsOnCurrentPage++;
      });

      this.currentY = currentY;
   }

   drawHeaders(columns, startY) {
      let currentX = this.tableStartX;
      let currentY = startY;

      this.doc.setFillColor(...this.config.colors.headerBg);
      this.doc.rect(
         this.tableStartX,
         currentY,
         this.tableWidth,
         this.config.headerHeight,
         "F"
      );

      this.doc.setFont("helvetica", "bold");

      columns.forEach((col) => {
         this.doc.setDrawColor(...this.config.colors.border);
         this.doc.setLineWidth(0.5);
         this.doc.rect(
            currentX,
            currentY,
            col.actualWidth,
            this.config.headerHeight
         );

         this.doc.setFontSize(col.fontSize);
         this.doc.setTextColor(255, 255, 255);

         const headerLines = col.text.split("\n");

         if (headerLines.length > 1) {
            // Multi-line header with tight spacing
            const lineHeight = col.fontSize * 0.5;
            const totalTextHeight = headerLines.length * lineHeight;
            const startY =
               currentY +
               (this.config.headerHeight - totalTextHeight) / 2 +
               lineHeight * 0.7;

            headerLines.forEach((line, lineIndex) => {
               const lineY = startY + lineIndex * lineHeight;
               this.doc.text(line, currentX + col.actualWidth / 2, lineY, {
                  align: "center",
               });
            });
         } else {
            this.doc.text(
               col.text,
               currentX + col.actualWidth / 2,
               currentY + this.config.headerHeight / 2 + 2,
               { align: "center" }
            );
         }

         currentX += col.actualWidth;
      });

      return currentY + this.config.headerHeight;
   }

   drawDataRow(row, columns, startY, rowIndex) {
      let currentX = this.tableStartX;
      let currentY = startY;

      if (rowIndex % 2 === 1) {
         this.doc.setFillColor(...this.config.colors.alternateRow);
         this.doc.rect(
            this.tableStartX,
            currentY,
            this.tableWidth,
            this.config.rowHeight,
            "F"
         );
      }

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(this.config.fontSize.data);

      columns.forEach((col, colIndex) => {
         this.doc.setDrawColor(...this.config.colors.border);
         this.doc.setLineWidth(0.3);
         this.doc.rect(
            currentX,
            currentY,
            col.actualWidth,
            this.config.rowHeight
         );

         this.doc.setTextColor(...this.config.colors.text);

         const cellData = row[colIndex] || "";
         const textAlign = col.align || "center";

         let textX = currentX + col.actualWidth / 2;
         if (textAlign === "left") textX = currentX + 2;
         else if (textAlign === "right") textX = currentX + col.actualWidth - 2;

         this.doc.text(
            String(cellData),
            textX,
            currentY + this.config.rowHeight / 2 + 1.5,
            {
               align: textAlign,
            }
         );

         currentX += col.actualWidth;
      });

      return currentY + this.config.rowHeight;
   }

   getBlob() {
      return this.doc.output("blob");
   }

   save(filename) {
      this.doc.save(filename || "rubrics_document.pdf");
   }

   downloadPDF(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "rubrics_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   }
}

/*
====================================================================================================
                                    HOW TO USE RubricsPDF CLASS
====================================================================================================

1. BASIC USAGE:
   const rubricsPDF = new RubricsPDF(options);
   const pdfBlob = rubricsPDF.createPDF(pdfData);  // Returns blob
   rubricsPDF.downloadPDF(pdfBlob, "filename.pdf"); // Download manually

2. CONFIGURATION OPTIONS:
   const rubricsPDF = new RubricsPDF({
      orientation: "portrait",        // "portrait" or "landscape"
      margin: 8,                     // Page margins in mm
      rowHeight: 8,                  // Height of data rows
      headerHeight: 16,              // Height of header row
      fontSize: {
         title: 14,                  // Main title font size
         subtitle: 12,               // Subtitle font size
         header: 7,                  // Default header font size
         data: 6                     // Data cell font size
      },
      colors: {
         headerBg: [52, 152, 219],   // Header background color [R, G, B]
         alternateRow: [241, 248, 255], // Alternate row background [R, G, B]
         text: [44, 62, 80],         // Text color [R, G, B]
         border: [149, 165, 166]     // Border color [R, G, B]
      },
      spacing: {
         titleSpacing: 8,            // Space after titles
         sectionSpacing: 1           // Space between sections
      }
   });

3. PDF DATA STRUCTURE:
   const pdfData = {
      title: "Main Title",           // PDF main title
      subtitle: "Subtitle Text",     // PDF subtitle
      filename: "output.pdf",        // Output filename
      
      tableData: [
         // HEADER ROW (first array) - with column configuration
         [
            { text: "Column 1", width: 10, align: "center", fontSize: 7 },
            { text: "Column 2\nLine 2", width: 15, align: "left", fontSize: 6 },
            { text: "Column 3", width: 20, align: "right" }  // fontSize optional
         ],
         // DATA ROWS (remaining arrays) - simple string arrays
         ["Data 1", "Data 2", "Data 3"],
         ["Row 2 Data 1", "Row 2 Data 2", "Row 2 Data 3"]
      ]
   };

4. HEADER COLUMN CONFIGURATION:
   {
      text: "Header Text",          // Column header text (use \n for line breaks)
      width: 15,                    // Column width as percentage (total should be 100)
      align: "center",              // Text alignment: "left", "center", "right"
      fontSize: 6                   // Custom font size (OPTIONAL - overrides default)
   }

5. EXAMPLE USAGE:
   // Create instance
   const pdf = new RubricsPDF({
      orientation: "portrait",
      colors: { headerBg: [255, 0, 0] }  // Red header
   });
   
   // Create PDF data
   const data = {
      title: "My Report",
      subtitle: "Generated Report",
      tableData: [
         [
            { text: "ID", width: 10, align: "center", fontSize: 8 },
            { text: "Name", width: 30, align: "left" },
            { text: "Score\n(Max 100)", width: 20, align: "center", fontSize: 6 }
         ],
         ["1", "John Doe", "95"],
         ["2", "Jane Smith", "87"]
      ],
      filename: "my_report.pdf"
   };
   
   // Generate PDF blob
   const pdfBlob = pdf.createPDF(data);
   
   // Option 1: Download immediately
   pdf.downloadPDF(pdfBlob, data.filename);
   
   // Option 2: Use blob for other purposes (upload, preview, etc.)
   // const formData = new FormData();
   // formData.append('pdf', pdfBlob, data.filename);

====================================================================================================
*/




// window.onload = function () {
//    // Define complete PDF data structure
//    const pdfData = {
//       title: "Government College of Engineering and Leather Technology",
//       subtitle:
//          "CSE,     6th Semester,     Numerical Methods (OEC-IT601A),     CA1",

//       // Table data with column configuration
//       tableData: [
//          // Headers with configuration (first row)
//          [
//             { text: "SL.NO", width: 6, align: "center", fontSize: 6 },
//             { text: "ROLL NO.", width: 12, align: "center", fontSize: 7 },
//             { text: "STUDENT NAME", width: 24, align: "left", fontSize: 7 },
//             {
//                text: "BACKGROUND\n(05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "CONTENT\nACCURACY (05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "SPELLING AND\nGRAMMAR (05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "EFFECTIVENESS\n(05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "PRESENTATION\n(05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             { text: "TOTAL", width: 11, align: "center", fontSize: 7 },
//          ],
//          // Data rows
//          ["1", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["2", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["3", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["4", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["5", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//       ],

//       // Output filename
//       filename: "GCELT_CA1_Assessment_Rubrics.pdf",
//    };

//    // Create RubricsPDF instance with configuration
//    const rubricsPDF = new RubricsPDF({
//       orientation: "portrait",
//       margin: 8,
//       rowHeight: 8,
//       headerHeight: 12,
//       fontSize: {
//          mainTitle: 16,
//          title: 14,
//          subtitle: 12,
//          header: 7,
//          data: 8,
//       },
//       colors: {
//          headerBg: [52, 152, 219], // Beautiful blue header
//          alternateRow: [241, 248, 255], // Light blue alternating rows
//          text: [44, 62, 80], // Dark blue-gray text
//          border: [149, 165, 166], // Modern gray borders
//       },
//       spacing: {
//          titleSpacing: 8,
//          sectionSpacing: 1,
//       },
//    });

//    // Generate the complete PDF
//    rubricsPDF.createPDF(pdfData);
// };

// window.onload = async function () {
//    // Define complete PDF data structure
//    const pdfData = {
//       title: "Government College of Engineering and Leather Technology",
//       subtitle:
//          "CSE,     6th Semester,     Numerical Methods (OEC-IT601A),     CA1",

//       // Table data with column configuration
//       tableData: [
//          // Headers with configuration (first row)
//          [
//             { text: "SL.NO", width: 6, align: "center", fontSize: 6 },
//             { text: "ROLL NO.", width: 12, align: "center", fontSize: 7 },
//             { text: "STUDENT NAME", width: 24, align: "left", fontSize: 7 },
//             {
//                text: "BACKGROUND\n(05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "CONTENT\nACCURACY (05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "SPELLING AND\nGRAMMAR (05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "EFFECTIVENESS\n(05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             {
//                text: "PRESENTATION\n(05)",
//                width: 11,
//                align: "center",
//                fontSize: 6,
//             },
//             { text: "TOTAL", width: 11, align: "center", fontSize: 7 },
//          ],
//          // Data rows
//          ["1", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["2", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["3", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["4", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//          ["5", "11200123069", "Sourav Barui", "", "", "", "", "", ""],
//       ],

//       // Output filename
//       filename: "GCELT_CA1_Assessment_Rubrics.pdf",
//    };

//    // Create RubricsPDF instance with configuration
//    const rubricsPDF = new RubricsPDF({
//       orientation: "portrait",
//       margin: 8,
//       rowHeight: 8,
//       headerHeight: 12,
//       fontSize: {
//          mainTitle: 16,
//          title: 14,
//          subtitle: 12,
//          header: 7,
//          data: 8,
//       },
//       colors: {
//          headerBg: [52, 152, 219], // Beautiful blue header
//          alternateRow: [241, 248, 255], // Light blue alternating rows
//          text: [44, 62, 80], // Dark blue-gray text
//          border: [149, 165, 166], // Modern gray borders
//       },
//       spacing: {
//          titleSpacing: 8,
//          sectionSpacing: 1,
//       },
//    });

//    // Generate the complete PDF and get blob
//    const pdfBlob = rubricsPDF.createPDF(pdfData);
//    const pdfDataURL = await blobToDataURL(pdfBlob);

//    // make blob for passing pdf through message
//    const blob = dataURLToPDFBlobAtob(pdfDataURL);

//    // Download the PDF using the blob
//    rubricsPDF.downloadPDF(blob, pdfData.filename);
// };

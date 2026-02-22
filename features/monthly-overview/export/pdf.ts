import PDFDocument from "pdfkit";
import type { MonthlyOverviewResponse } from "../types";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatNumber(value: string | number): string {
  return Number(value).toLocaleString("en-US");
}

const MIN_ROW_HEIGHT = 20;
const ROW_PADDING = 10; // 5px top + 5px bottom

export async function generateMonthlyPdf(
  data: MonthlyOverviewResponse,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: "portrait",
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100;
    const pageBottom = doc.page.height - 50; // bottom margin
    const monthName = MONTH_NAMES[data.month] ?? `Month ${data.month}`;

    // Title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(`Monthly Donation Overview — ${monthName} ${data.year}`, {
        align: "center",
      });

    doc.moveDown(0.3);

    // Generated date
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor("#666666")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        { align: "center" },
      );

    doc.fillColor("#000000").moveDown(0.5);

    // Exchange Rate
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Exchange Rate: 1 JPY = ${data.exchangeRate} MMK`, {
        align: "center",
      });

    doc.moveDown(1);

    // KPI Summary (4 columns)
    const kpiY = doc.y;
    const kpiColWidth = pageWidth / 4;

    doc.fontSize(9).font("Helvetica").fillColor("#666666");
    doc.text("Carry Over", 50, kpiY, { width: kpiColWidth, align: "center" });
    doc.text("Total Collected", 50 + kpiColWidth, kpiY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text("Total Donated", 50 + kpiColWidth * 2, kpiY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text("Remaining Balance", 50 + kpiColWidth * 3, kpiY, {
      width: kpiColWidth,
      align: "center",
    });

    doc.fontSize(13).font("Helvetica-Bold").fillColor("#000000");
    const valY = kpiY + 14;
    doc.text(formatNumber(data.carryOver), 50, valY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text(formatNumber(data.totalCollected), 50 + kpiColWidth, valY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text(formatNumber(data.totalDonated), 50 + kpiColWidth * 2, valY, {
      width: kpiColWidth,
      align: "center",
    });

    const remaining = Number(data.remainingBalance);
    doc.fillColor(remaining >= 0 ? "#16A34A" : "#DC2626");
    doc.text(formatNumber(data.remainingBalance), 50 + kpiColWidth * 3, valY, {
      width: kpiColWidth,
      align: "center",
    });

    doc.fillColor("#000000").moveDown(2.5);

    // Helper: calculate row height based on text content
    function calcRowHeight(texts: { text: string; width: number }[]): number {
      let maxHeight = MIN_ROW_HEIGHT;
      doc.fontSize(9).font("Helvetica");
      for (const { text, width } of texts) {
        if (!text) continue;
        const textHeight = doc.heightOfString(text, {
          width: width - 12,
        });
        maxHeight = Math.max(maxHeight, textHeight + ROW_PADDING);
      }
      return maxHeight;
    }

    // Helper: check if we need a page break, and if so add one and return new Y
    function checkPageBreak(currentY: number, neededHeight: number): number {
      if (currentY + neededHeight > pageBottom) {
        doc.addPage();
        return 50; // top margin
      }
      return currentY;
    }

    // Supporters Table
    doc.fontSize(12).font("Helvetica-Bold").text("Donations from Supporters");
    doc.moveDown(0.5);

    const sColWidths = [
      pageWidth * 0.35,
      pageWidth * 0.2,
      pageWidth * 0.15,
      pageWidth * 0.3,
    ];
    const sColStarts = [
      50,
      50 + sColWidths[0],
      50 + sColWidths[0] + sColWidths[1],
      50 + sColWidths[0] + sColWidths[1] + sColWidths[2],
    ];

    // Helper: draw supporters header
    function drawSupportersHeader(y: number): number {
      doc.rect(50, y, pageWidth, MIN_ROW_HEIGHT).fill("#1F2937");
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#FFFFFF");
      const headerY = y + 5;
      doc.text("Name", sColStarts[0] + 6, headerY, {
        width: sColWidths[0] - 12,
      });
      doc.text("Amount", sColStarts[1] + 6, headerY, {
        width: sColWidths[1] - 12,
        align: "right",
      });
      doc.text("Currency", sColStarts[2] + 6, headerY, {
        width: sColWidths[2] - 12,
        align: "center",
      });
      doc.text("Kyats (MMK)", sColStarts[3] + 6, headerY, {
        width: sColWidths[3] - 12,
        align: "right",
      });
      doc.fillColor("#000000");
      return y + MIN_ROW_HEIGHT;
    }

    let tableY = drawSupportersHeader(doc.y);

    // Supporters Rows
    if (data.supporters.length === 0) {
      doc.rect(50, tableY, pageWidth, MIN_ROW_HEIGHT).fill("#F9FAFB");
      doc.fillColor("#999999").fontSize(9).font("Helvetica");
      doc.text("No supporter donations", sColStarts[0] + 6, tableY + 5, {
        width: pageWidth - 12,
      });
      doc.fillColor("#000000");
      tableY += MIN_ROW_HEIGHT;
    } else {
      for (let i = 0; i < data.supporters.length; i++) {
        const s = data.supporters[i];
        const rowH = calcRowHeight([
          { text: s.name, width: sColWidths[0] },
        ]);

        tableY = checkPageBreak(tableY, rowH);
        if (tableY === 50) {
          tableY = drawSupportersHeader(tableY);
        }

        if (i % 2 === 0) {
          doc.rect(50, tableY, pageWidth, rowH).fill("#F9FAFB");
          doc.fillColor("#000000");
        }
        const cellY = tableY + 5;
        doc.fontSize(9).font("Helvetica");
        doc.text(s.name, sColStarts[0] + 6, cellY, {
          width: sColWidths[0] - 12,
        });
        doc.text(formatNumber(s.amount), sColStarts[1] + 6, cellY, {
          width: sColWidths[1] - 12,
          align: "right",
        });
        doc.text(s.currency, sColStarts[2] + 6, cellY, {
          width: sColWidths[2] - 12,
          align: "center",
        });
        doc.text(formatNumber(s.kyatAmount), sColStarts[3] + 6, cellY, {
          width: sColWidths[3] - 12,
          align: "right",
        });
        tableY += rowH;
      }
    }

    // Supporters Total
    tableY = checkPageBreak(tableY, MIN_ROW_HEIGHT);
    doc.rect(50, tableY, pageWidth, MIN_ROW_HEIGHT).fill("#E5E7EB");
    doc.fillColor("#000000").fontSize(9).font("Helvetica-Bold");
    doc.text("Total", sColStarts[0] + 6, tableY + 5, {
      width: sColWidths[0] - 12,
    });
    doc.text(formatNumber(data.totalCollected), sColStarts[3] + 6, tableY + 5, {
      width: sColWidths[3] - 12,
      align: "right",
    });

    tableY += MIN_ROW_HEIGHT;
    doc.y = tableY + 20;

    // Distribution Table
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000");
    doc.text("Donation Distribution");
    doc.moveDown(0.5);

    const dColWidths = [pageWidth * 0.3, pageWidth * 0.25, pageWidth * 0.45];
    const dColStarts = [
      50,
      50 + dColWidths[0],
      50 + dColWidths[0] + dColWidths[1],
    ];

    // Helper: draw distribution header
    function drawDistributionHeader(y: number): number {
      doc.rect(50, y, pageWidth, MIN_ROW_HEIGHT).fill("#1F2937");
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#FFFFFF");
      const headerY = y + 5;
      doc.text("Place", dColStarts[0] + 6, headerY, {
        width: dColWidths[0] - 12,
      });
      doc.text("Amount (MMK)", dColStarts[1] + 6, headerY, {
        width: dColWidths[1] - 12,
        align: "right",
      });
      doc.text("Remarks", dColStarts[2] + 6, headerY, {
        width: dColWidths[2] - 12,
      });
      doc.fillColor("#000000");
      return y + MIN_ROW_HEIGHT;
    }

    // Distribution Header
    tableY = checkPageBreak(doc.y, MIN_ROW_HEIGHT * 2);
    tableY = drawDistributionHeader(tableY);

    // Distribution Rows
    if (data.distributions.length === 0) {
      doc.rect(50, tableY, pageWidth, MIN_ROW_HEIGHT).fill("#F9FAFB");
      doc.fillColor("#999999").fontSize(9).font("Helvetica");
      doc.text("No distribution records", dColStarts[0] + 6, tableY + 5, {
        width: pageWidth - 12,
      });
      doc.fillColor("#000000");
      tableY += MIN_ROW_HEIGHT;
    } else {
      for (let i = 0; i < data.distributions.length; i++) {
        const d = data.distributions[i];
        const remarkText = d.remarks ?? "";
        const rowH = calcRowHeight([
          { text: d.recipient, width: dColWidths[0] },
          { text: remarkText, width: dColWidths[2] },
        ]);

        tableY = checkPageBreak(tableY, rowH);
        if (tableY === 50) {
          tableY = drawDistributionHeader(tableY);
        }

        if (i % 2 === 0) {
          doc.rect(50, tableY, pageWidth, rowH).fill("#F9FAFB");
          doc.fillColor("#000000");
        }
        const cellY = tableY + 5;
        doc.fontSize(9).font("Helvetica");
        doc.text(d.recipient, dColStarts[0] + 6, cellY, {
          width: dColWidths[0] - 12,
        });
        doc.text(formatNumber(d.amountMMK), dColStarts[1] + 6, cellY, {
          width: dColWidths[1] - 12,
          align: "right",
        });
        doc.text(remarkText, dColStarts[2] + 6, cellY, {
          width: dColWidths[2] - 12,
        });
        tableY += rowH;
      }
    }

    // Distribution Total
    tableY = checkPageBreak(tableY, MIN_ROW_HEIGHT);
    doc.rect(50, tableY, pageWidth, MIN_ROW_HEIGHT).fill("#E5E7EB");
    doc.fillColor("#000000").fontSize(9).font("Helvetica-Bold");
    doc.text("Total", dColStarts[0] + 6, tableY + 5, {
      width: dColWidths[0] - 12,
    });
    doc.text(formatNumber(data.totalDonated), dColStarts[1] + 6, tableY + 5, {
      width: dColWidths[1] - 12,
      align: "right",
    });

    doc.end();
  });
}

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
    const rowHeight = 20;

    // Supporters Header
    let tableY = doc.y;
    doc.rect(50, tableY, pageWidth, rowHeight).fill("#1F2937");
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#FFFFFF");
    const sHeaderY = tableY + 5;
    doc.text("Name", sColStarts[0] + 6, sHeaderY, {
      width: sColWidths[0] - 12,
    });
    doc.text("Amount", sColStarts[1] + 6, sHeaderY, {
      width: sColWidths[1] - 12,
      align: "right",
    });
    doc.text("Currency", sColStarts[2] + 6, sHeaderY, {
      width: sColWidths[2] - 12,
      align: "center",
    });
    doc.text("Kyats (MMK)", sColStarts[3] + 6, sHeaderY, {
      width: sColWidths[3] - 12,
      align: "right",
    });

    tableY += rowHeight;
    doc.fillColor("#000000");

    // Supporters Rows
    if (data.supporters.length === 0) {
      doc.rect(50, tableY, pageWidth, rowHeight).fill("#F9FAFB");
      doc.fillColor("#999999").fontSize(9).font("Helvetica");
      doc.text("No supporter donations", sColStarts[0] + 6, tableY + 5, {
        width: pageWidth - 12,
      });
      doc.fillColor("#000000");
      tableY += rowHeight;
    } else {
      for (let i = 0; i < data.supporters.length; i++) {
        const s = data.supporters[i];
        if (i % 2 === 0) {
          doc.rect(50, tableY, pageWidth, rowHeight).fill("#F9FAFB");
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
        tableY += rowHeight;
      }
    }

    // Supporters Total
    doc.rect(50, tableY, pageWidth, rowHeight).fill("#E5E7EB");
    doc.fillColor("#000000").fontSize(9).font("Helvetica-Bold");
    doc.text("Total", sColStarts[0] + 6, tableY + 5, {
      width: sColWidths[0] - 12,
    });
    doc.text(formatNumber(data.totalCollected), sColStarts[3] + 6, tableY + 5, {
      width: sColWidths[3] - 12,
      align: "right",
    });

    tableY += rowHeight;
    doc.y = tableY + 20;

    // Distribution Table
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000");
    doc.text("Donation Distribution");
    doc.moveDown(0.5);

    const dColWidths = [pageWidth * 0.35, pageWidth * 0.3, pageWidth * 0.35];
    const dColStarts = [
      50,
      50 + dColWidths[0],
      50 + dColWidths[0] + dColWidths[1],
    ];

    // Distribution Header
    tableY = doc.y;
    doc.rect(50, tableY, pageWidth, rowHeight).fill("#1F2937");
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#FFFFFF");
    const dHeaderY = tableY + 5;
    doc.text("Place", dColStarts[0] + 6, dHeaderY, {
      width: dColWidths[0] - 12,
    });
    doc.text("Amount (MMK)", dColStarts[1] + 6, dHeaderY, {
      width: dColWidths[1] - 12,
      align: "right",
    });
    doc.text("Remarks", dColStarts[2] + 6, dHeaderY, {
      width: dColWidths[2] - 12,
    });

    tableY += rowHeight;
    doc.fillColor("#000000");

    // Distribution Rows
    if (data.distributions.length === 0) {
      doc.rect(50, tableY, pageWidth, rowHeight).fill("#F9FAFB");
      doc.fillColor("#999999").fontSize(9).font("Helvetica");
      doc.text("No distribution records", dColStarts[0] + 6, tableY + 5, {
        width: pageWidth - 12,
      });
      doc.fillColor("#000000");
      tableY += rowHeight;
    } else {
      for (let i = 0; i < data.distributions.length; i++) {
        const d = data.distributions[i];
        if (i % 2 === 0) {
          doc.rect(50, tableY, pageWidth, rowHeight).fill("#F9FAFB");
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
        doc.text(d.remarks ?? "", dColStarts[2] + 6, cellY, {
          width: dColWidths[2] - 12,
        });
        tableY += rowHeight;
      }
    }

    // Distribution Total
    doc.rect(50, tableY, pageWidth, rowHeight).fill("#E5E7EB");
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

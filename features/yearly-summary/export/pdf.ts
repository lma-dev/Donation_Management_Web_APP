import PDFDocument from "pdfkit";
import type { YearlySummaryResponse } from "../types";

function formatNumber(value: string | number): string {
  return Number(value).toLocaleString("en-US");
}

export async function generatePdf(
  data: YearlySummaryResponse,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100; // minus margins

    // Title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(`Yearly Donation Summary — FY ${data.fiscalYear}`, {
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

    doc.fillColor("#000000").moveDown(1);

    // KPI Summary
    const kpiY = doc.y;
    const kpiColWidth = pageWidth / 3;

    doc.fontSize(10).font("Helvetica");
    doc.text("Total Collected", 50, kpiY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text("Total Donated", 50 + kpiColWidth, kpiY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text("Remaining Balance", 50 + kpiColWidth * 2, kpiY, {
      width: kpiColWidth,
      align: "center",
    });

    doc.fontSize(14).font("Helvetica-Bold");
    const valY = kpiY + 16;
    doc.text(formatNumber(data.totalCollected), 50, valY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text(formatNumber(data.totalDonated), 50 + kpiColWidth, valY, {
      width: kpiColWidth,
      align: "center",
    });
    doc.text(
      formatNumber(data.remainingBalance),
      50 + kpiColWidth * 2,
      valY,
      { width: kpiColWidth, align: "center" },
    );

    doc.moveDown(2);

    // Table
    const colWidths = [pageWidth * 0.3, pageWidth * 0.23, pageWidth * 0.23, pageWidth * 0.24];
    const colStarts = [50, 50 + colWidths[0], 50 + colWidths[0] + colWidths[1], 50 + colWidths[0] + colWidths[1] + colWidths[2]];
    const rowHeight = 22;

    // Table header
    let tableY = doc.y + 10;

    doc
      .rect(50, tableY, pageWidth, rowHeight)
      .fill("#1F2937");

    doc.fontSize(10).font("Helvetica-Bold").fillColor("#FFFFFF");
    const headerY = tableY + 6;
    doc.text("Month", colStarts[0] + 8, headerY, { width: colWidths[0] - 16 });
    doc.text("Collected", colStarts[1] + 8, headerY, {
      width: colWidths[1] - 16,
      align: "right",
    });
    doc.text("Donated", colStarts[2] + 8, headerY, {
      width: colWidths[2] - 16,
      align: "right",
    });
    doc.text("Balance", colStarts[3] + 8, headerY, {
      width: colWidths[3] - 16,
      align: "right",
    });

    tableY += rowHeight;
    doc.fillColor("#000000");

    // Table rows
    for (let i = 0; i < data.monthlyRecords.length; i++) {
      const record = data.monthlyRecords[i];
      const collected = Number(record.collectedAmount);
      const donated = Number(record.donatedAmount);
      const balance = collected - donated;

      if (i % 2 === 0) {
        doc.rect(50, tableY, pageWidth, rowHeight).fill("#F9FAFB");
        doc.fillColor("#000000");
      }

      const cellY = tableY + 6;
      doc.fontSize(9).font("Helvetica");
      doc.text(record.month, colStarts[0] + 8, cellY, {
        width: colWidths[0] - 16,
      });
      doc.text(formatNumber(collected), colStarts[1] + 8, cellY, {
        width: colWidths[1] - 16,
        align: "right",
      });
      doc.text(formatNumber(donated), colStarts[2] + 8, cellY, {
        width: colWidths[2] - 16,
        align: "right",
      });
      doc.text(formatNumber(balance), colStarts[3] + 8, cellY, {
        width: colWidths[3] - 16,
        align: "right",
      });

      tableY += rowHeight;
    }

    // Totals row
    doc.rect(50, tableY, pageWidth, rowHeight).fill("#E5E7EB");
    doc.fillColor("#000000");

    const totalY = tableY + 6;
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Annual Total", colStarts[0] + 8, totalY, {
      width: colWidths[0] - 16,
    });
    doc.text(formatNumber(data.totalCollected), colStarts[1] + 8, totalY, {
      width: colWidths[1] - 16,
      align: "right",
    });
    doc.text(formatNumber(data.totalDonated), colStarts[2] + 8, totalY, {
      width: colWidths[2] - 16,
      align: "right",
    });
    doc.text(
      formatNumber(data.remainingBalance),
      colStarts[3] + 8,
      totalY,
      { width: colWidths[3] - 16, align: "right" },
    );

    doc.end();
  });
}

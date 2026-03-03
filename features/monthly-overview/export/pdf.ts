import path from "path";
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
const ROW_PADDING = 10;

export async function generateMonthlyPdf(
  data: MonthlyOverviewResponse,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 60, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100;
    const pageBottom = doc.page.height - 50;
    const monthName = MONTH_NAMES[data.month] ?? `Month ${data.month}`;
    const logoPath = path.join(process.cwd(), "public/logo_slr.png");

    // ==================================================
    // LOGO (Top Right - Seal Style)
    // ==================================================
    doc.image(logoPath, doc.page.width - 130, 40, {
      width: 80,
      height: 80,
    });

    // ==================================================
    // HEADER SECTION
    // ==================================================

    // App Title (Centered)
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text("SPRING LIBERATION ROSE", 50, 60, {
        align: "center",
        width: pageWidth,
      });

    // Report Title
    doc
      .moveDown(0.4)
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#374151")
      .text(`Monthly Donation Overview — ${monthName} ${data.year}`, {
        align: "center",
      });

    // Generated Date
    doc
      .moveDown(0.3)
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor("#6B7280")
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" },
      );

    // Exchange Rate
    doc
      .moveDown(0.3)
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#000000")
      .text(`Exchange Rate: 1 JPY = ${data.exchangeRate} MMK`, {
        align: "center",
      });

    doc.moveDown(1.5);

    // ==================================================
    // KPI SECTION
    // ==================================================

    const kpiY = doc.y;
    const colWidth = pageWidth / 4;

    doc.fontSize(9).font("Helvetica").fillColor("#6B7280");

    const labels = [
      "Carry Over",
      "Total Collected",
      "Total Donated",
      "Remaining Balance",
    ];

    labels.forEach((label, i) => {
      doc.text(label, 50 + colWidth * i, kpiY, {
        width: colWidth,
        align: "center",
      });
    });

    const valY = kpiY + 14;
    doc.fontSize(13).font("Helvetica-Bold");

    doc.fillColor("#000000").text(formatNumber(data.carryOver), 50, valY, {
      width: colWidth,
      align: "center",
    });

    doc
      .fillColor("#16A34A")
      .text(formatNumber(data.totalCollected), 50 + colWidth, valY, {
        width: colWidth,
        align: "center",
      });

    doc
      .fillColor("#DC2626")
      .text(formatNumber(data.totalDonated), 50 + colWidth * 2, valY, {
        width: colWidth,
        align: "center",
      });

    const remaining = Number(data.remainingBalance);
    doc
      .fillColor(remaining >= 0 ? "#16A34A" : "#DC2626")
      .text(formatNumber(data.remainingBalance), 50 + colWidth * 3, valY, {
        width: colWidth,
        align: "center",
      });

    doc.fillColor("#000000").moveDown(2);

    // ==================================================
    // TABLE HELPERS
    // ==================================================

    function calcRowHeight(text: string, width: number) {
      doc.fontSize(9).font("Helvetica");
      const h = doc.heightOfString(text || "", { width: width - 12 });
      return Math.max(MIN_ROW_HEIGHT, h + ROW_PADDING);
    }

    function checkPageBreak(y: number, needed: number): number {
      if (y + needed > pageBottom) {
        doc.addPage();
        return 60;
      }
      return y;
    }

    // ==================================================
    // SUPPORTERS TABLE
    // ==================================================

    doc.fontSize(12).font("Helvetica-Bold").text("Donations from Supporters");
    doc.moveDown(0.5);

    const sWidths = [
      pageWidth * 0.35,
      pageWidth * 0.2,
      pageWidth * 0.15,
      pageWidth * 0.3,
    ];
    const sStarts = [
      50,
      50 + sWidths[0],
      50 + sWidths[0] + sWidths[1],
      50 + sWidths[0] + sWidths[1] + sWidths[2],
    ];

    let y = doc.y;

    // Header
    doc.rect(50, y, pageWidth, MIN_ROW_HEIGHT).fill("#374151");
    doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");

    ["Name", "Amount", "Currency", "Kyats (MMK)"].forEach((h, i) => {
      doc.text(h, sStarts[i] + 6, y + 5, {
        width: sWidths[i] - 12,
        align: i === 1 || i === 3 ? "right" : i === 2 ? "center" : "left",
      });
    });

    doc.fillColor("#000000");
    y += MIN_ROW_HEIGHT;

    // Rows
    for (let i = 0; i < data.supporters.length; i++) {
      const s = data.supporters[i];
      const rowH = calcRowHeight(s.name, sWidths[0]);

      y = checkPageBreak(y, rowH);

      if (i % 2 === 0) {
        doc.rect(50, y, pageWidth, rowH).fill("#F9FAFB");
        doc.fillColor("#000000");
      }

      const cellY = y + 5;

      doc.fontSize(9).font("Helvetica");
      doc.text(s.name, sStarts[0] + 6, cellY, { width: sWidths[0] - 12 });
      doc
        .fillColor("#16A34A")
        .text(formatNumber(s.amount), sStarts[1] + 6, cellY, {
          width: sWidths[1] - 12,
          align: "right",
        });
      doc.fillColor("#000000").text(s.currency, sStarts[2] + 6, cellY, {
        width: sWidths[2] - 12,
        align: "center",
      });
      doc
        .fillColor("#16A34A")
        .text(formatNumber(s.kyatAmount), sStarts[3] + 6, cellY, {
          width: sWidths[3] - 12,
          align: "right",
        });

      y += rowH;
    }

    // Total Row
    y = checkPageBreak(y, MIN_ROW_HEIGHT);
    doc.rect(50, y, pageWidth, MIN_ROW_HEIGHT).fill("#E5E7EB");
    doc.fillColor("#000000").font("Helvetica-Bold");
    doc.text("Total", sStarts[0] + 6, y + 5, {
      width: sWidths[0] - 12,
    });
    doc
      .fillColor("#16A34A")
      .text(formatNumber(data.totalCollected), sStarts[3] + 6, y + 5, {
        width: sWidths[3] - 12,
        align: "right",
      });

    doc.end();
  });
}

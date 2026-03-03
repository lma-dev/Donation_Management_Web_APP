import path from "path";
import PDFDocument from "pdfkit";
import type { YearlySummaryResponse } from "../types";

function safeNumber(value: string | number | undefined | null): number {
  return Number(value || 0);
}

function formatNumber(value: string | number | undefined | null): string {
  return safeNumber(value).toLocaleString("en-US");
}

// --------------------------------------------------
// Colors
// --------------------------------------------------
const COLORS = {
  primary: "#1F2937",
  subtitle: "#4B5563",
  muted: "#6B7280",
  green: "#059669",
  red: "#DC2626",
  lightGray: "#F9FAFB",
  mediumGray: "#F3F4F6",
  darkGray: "#E5E7EB",
  headerBg: "#1F2937",
  headerText: "#FFFFFF",
  accent: "#3B82F6",
  kpiGreenBg: "#F0FDF4",
  kpiRedBg: "#FEF2F2",
  kpiBlueBg: "#EFF6FF",
  kpiGreenBorder: "#BBF7D0",
  kpiRedBorder: "#FECACA",
  kpiBlueBorder: "#BFDBFE",
};

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

    const pageWidth = doc.page.width - 100;
    const leftMargin = 50;
    const logoPath = path.join(process.cwd(), "public/logo_slr.png");

    // Safe totals
    const totalCollected = safeNumber(data.totalCollected);
    const totalDonated = safeNumber(data.totalDonated);
    const remainingBalance = totalCollected - totalDonated;

    // --------------------------------------------------
    // Logo (Top Right - Seal Style)
    // --------------------------------------------------
    try {
      doc.image(logoPath, doc.page.width - 130, 30, {
        width: 80,
        height: 80,
      });
    } catch {
      // If logo missing, don't crash PDF generation
    }

    // --------------------------------------------------
    // Header Section
    // --------------------------------------------------
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text("SPRING LIBERATION ROSE", leftMargin, 50, {
        align: "center",
        width: pageWidth,
      });

    doc
      .moveDown(0.3)
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor(COLORS.subtitle)
      .text(`Yearly Donation Summary — FY ${data.fiscalYear}`, {
        align: "center",
        width: pageWidth,
      });

    doc.moveDown(0.2);

    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor(COLORS.muted)
      .text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" },
      );

    // --------------------------------------------------
    // Accent line
    // --------------------------------------------------
    doc.moveDown(0.6);
    const lineY = doc.y;
    doc
      .moveTo(leftMargin, lineY)
      .lineTo(leftMargin + pageWidth, lineY)
      .strokeColor(COLORS.accent)
      .lineWidth(2)
      .stroke();

    doc.moveDown(1);

    // --------------------------------------------------
    // KPI Cards Section
    // --------------------------------------------------
    const kpiCardWidth = (pageWidth - 30) / 3;
    const kpiCardHeight = 52;
    const kpiStartY = doc.y;

    const kpiData = [
      {
        label: "Total Collected",
        value: formatNumber(totalCollected),
        bg: COLORS.kpiGreenBg,
        border: COLORS.kpiGreenBorder,
        color: COLORS.green,
      },
      {
        label: "Total Donated",
        value: formatNumber(totalDonated),
        bg: COLORS.kpiRedBg,
        border: COLORS.kpiRedBorder,
        color: COLORS.red,
      },
      {
        label: "Remaining Balance",
        value: formatNumber(remainingBalance),
        bg: remainingBalance >= 0 ? COLORS.kpiBlueBg : COLORS.kpiRedBg,
        border: remainingBalance >= 0 ? COLORS.kpiBlueBorder : COLORS.kpiRedBorder,
        color: remainingBalance >= 0 ? COLORS.accent : COLORS.red,
      },
    ];

    kpiData.forEach((kpi, i) => {
      const x = leftMargin + i * (kpiCardWidth + 15);
      const y = kpiStartY;

      // Card background with rounded corners
      doc.save();
      doc.roundedRect(x, y, kpiCardWidth, kpiCardHeight, 6).fill(kpi.bg);
      doc.restore();

      // Card border
      doc.save();
      doc
        .roundedRect(x, y, kpiCardWidth, kpiCardHeight, 6)
        .strokeColor(kpi.border)
        .lineWidth(1)
        .stroke();
      doc.restore();

      // Label
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.muted)
        .text(kpi.label, x + 12, y + 10, {
          width: kpiCardWidth - 24,
          align: "center",
        });

      // Value
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(kpi.color)
        .text(kpi.value, x + 12, y + 26, {
          width: kpiCardWidth - 24,
          align: "center",
        });
    });

    doc.y = kpiStartY + kpiCardHeight + 20;

    // --------------------------------------------------
    // Section Title
    // --------------------------------------------------
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text("Monthly Breakdown", leftMargin, doc.y);

    doc.moveDown(0.5);

    // --------------------------------------------------
    // Table
    // --------------------------------------------------
    const colWidths = [
      pageWidth * 0.3,
      pageWidth * 0.23,
      pageWidth * 0.23,
      pageWidth * 0.24,
    ];

    const colStarts = [
      leftMargin,
      leftMargin + colWidths[0],
      leftMargin + colWidths[0] + colWidths[1],
      leftMargin + colWidths[0] + colWidths[1] + colWidths[2],
    ];

    const rowHeight = 26;
    let tableY = doc.y;

    // Header row
    doc.save();
    doc
      .roundedRect(leftMargin, tableY, pageWidth, rowHeight, 4)
      .fill(COLORS.headerBg);
    doc.restore();

    doc
      .fillColor(COLORS.headerText)
      .fontSize(10)
      .font("Helvetica-Bold");

    const headers = ["Month", "Collected", "Donated", "Balance"];
    const headerY = tableY + 8;

    headers.forEach((h, i) => {
      doc.text(h, colStarts[i] + 10, headerY, {
        width: colWidths[i] - 20,
        align: i === 0 ? "left" : "right",
      });
    });

    tableY += rowHeight;
    doc.fillColor("#000000");

    // --------------------------------------------------
    // Data Rows
    // --------------------------------------------------
    data.monthlyRecords.forEach((record, index) => {
      const collected = safeNumber(record.collectedAmount);
      const donated = safeNumber(record.donatedAmount);
      const balance = collected - donated;

      // Alternating row background
      if (index % 2 === 0) {
        doc.save();
        doc.rect(leftMargin, tableY, pageWidth, rowHeight).fill(COLORS.lightGray);
        doc.restore();
      }

      // Bottom border for each row
      doc.save();
      doc
        .moveTo(leftMargin, tableY + rowHeight)
        .lineTo(leftMargin + pageWidth, tableY + rowHeight)
        .strokeColor(COLORS.darkGray)
        .lineWidth(0.5)
        .stroke();
      doc.restore();

      const rowY = tableY + 8;

      // Month
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.primary)
        .text(record.month, colStarts[0] + 10, rowY, {
          width: colWidths[0] - 20,
        });

      // Collected
      doc
        .fillColor(COLORS.green)
        .text(formatNumber(collected), colStarts[1] + 10, rowY, {
          width: colWidths[1] - 20,
          align: "right",
        });

      // Donated
      doc
        .fillColor(COLORS.red)
        .text(formatNumber(donated), colStarts[2] + 10, rowY, {
          width: colWidths[2] - 20,
          align: "right",
        });

      // Balance
      doc
        .fillColor(balance >= 0 ? COLORS.green : COLORS.red)
        .font("Helvetica-Bold")
        .text(formatNumber(balance), colStarts[3] + 10, rowY, {
          width: colWidths[3] - 20,
          align: "right",
        });

      tableY += rowHeight;
    });

    // --------------------------------------------------
    // Annual Total Row
    // --------------------------------------------------
    doc.save();
    doc
      .rect(leftMargin, tableY, pageWidth, rowHeight + 2)
      .fill(COLORS.mediumGray);
    doc.restore();

    // Top double line
    doc.save();
    doc
      .moveTo(leftMargin, tableY)
      .lineTo(leftMargin + pageWidth, tableY)
      .strokeColor(COLORS.primary)
      .lineWidth(1.5)
      .stroke();
    doc.restore();

    // Bottom line
    doc.save();
    doc
      .moveTo(leftMargin, tableY + rowHeight + 2)
      .lineTo(leftMargin + pageWidth, tableY + rowHeight + 2)
      .strokeColor(COLORS.primary)
      .lineWidth(1)
      .stroke();
    doc.restore();

    const totalY = tableY + 9;

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text("ANNUAL TOTAL", colStarts[0] + 10, totalY, {
        width: colWidths[0] - 20,
      });

    doc
      .fillColor(COLORS.green)
      .text(formatNumber(totalCollected), colStarts[1] + 10, totalY, {
        width: colWidths[1] - 20,
        align: "right",
      });

    doc
      .fillColor(COLORS.red)
      .text(formatNumber(totalDonated), colStarts[2] + 10, totalY, {
        width: colWidths[2] - 20,
        align: "right",
      });

    doc
      .fillColor(remainingBalance >= 0 ? COLORS.green : COLORS.red)
      .text(formatNumber(remainingBalance), colStarts[3] + 10, totalY, {
        width: colWidths[3] - 20,
        align: "right",
      });

    // --------------------------------------------------
    // Footer
    // --------------------------------------------------
    const footerY = doc.page.height - 40;

    // Footer line
    doc.save();
    doc
      .moveTo(leftMargin, footerY - 8)
      .lineTo(leftMargin + pageWidth, footerY - 8)
      .strokeColor(COLORS.darkGray)
      .lineWidth(0.5)
      .stroke();
    doc.restore();

    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor(COLORS.muted)
      .text("Spring Liberation Rose  •  Confidential", leftMargin, footerY, {
        width: pageWidth,
        align: "center",
      });

    doc.end();
  });
}

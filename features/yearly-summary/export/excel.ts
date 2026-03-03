import path from "path";
import ExcelJS from "exceljs";
import type { YearlySummaryResponse } from "../types";

export async function generateExcel(
  data: YearlySummaryResponse,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Spring Liberation Rose";
  workbook.created = new Date();

  // --------------------------------------------------
  // Logo
  // --------------------------------------------------
  const logoPath = path.join(process.cwd(), "public/logo_slr.png");
  const logoId = workbook.addImage({
    filename: logoPath,
    extension: "png",
  });

  // --------------------------------------------------
  // Sheet
  // --------------------------------------------------
  const sheet = workbook.addWorksheet(`FY${data.fiscalYear} Summary`, {
    pageSetup: {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
    },
  });

  sheet.properties.defaultRowHeight = 22;

  // Set column widths upfront
  sheet.columns = [
    { key: "month", width: 22 },
    { key: "collected", width: 24 },
    { key: "donated", width: 24 },
    { key: "balance", width: 24 },
  ];

  // --------------------------------------------------
  // Logo (Top Right - Seal Style)
  // --------------------------------------------------
  sheet.addImage(logoId, {
    tl: { col: 3.2, row: 0.2 },
    ext: { width: 90, height: 90 },
    editAs: "oneCell",
  });

  // --------------------------------------------------
  // Colors
  // --------------------------------------------------
  const COLORS = {
    primary: "FF1F2937",
    primaryBg: "FF1F2937",
    headerText: "FFFFFFFF",
    subtitle: "FF4B5563",
    muted: "FF6B7280",
    green: "FF059669",
    red: "FFDC2626",
    lightGray: "FFF9FAFB",
    mediumGray: "FFF3F4F6",
    border: "FFE5E7EB",
    darkBorder: "FFD1D5DB",
    kpiBg: "FFF0FDF4",
    kpiRedBg: "FFFEF2F2",
    kpiBalanceBg: "FFF0F9FF",
    accentLine: "FF3B82F6",
  };

  // --------------------------------------------------
  // App title (Row 1)
  // --------------------------------------------------
  sheet.mergeCells("A1:D1");
  const appTitleCell = sheet.getCell("A1");
  appTitleCell.value = "SPRING LIBERATION ROSE";
  appTitleCell.font = { size: 18, bold: true, color: { argb: COLORS.primary } };
  appTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;

  // --------------------------------------------------
  // Report title (Row 2)
  // --------------------------------------------------
  sheet.mergeCells("A2:D2");
  const titleCell = sheet.getCell("A2");
  titleCell.value = `Yearly Donation Summary — FY ${data.fiscalYear}`;
  titleCell.font = {
    size: 13,
    bold: true,
    color: { argb: COLORS.subtitle },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(2).height = 22;

  // --------------------------------------------------
  // Generated date (Row 3)
  // --------------------------------------------------
  sheet.mergeCells("A3:D3");
  const dateCell = sheet.getCell("A3");
  dateCell.value = `Generated: ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`;
  dateCell.font = { size: 10, italic: true, color: { argb: COLORS.muted } };
  dateCell.alignment = { horizontal: "center", vertical: "middle" };

  // --------------------------------------------------
  // Accent line (Row 4)
  // --------------------------------------------------
  sheet.getRow(4).height = 4;
  ["A4", "B4", "C4", "D4"].forEach((ref) => {
    const cell = sheet.getCell(ref);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.accentLine },
    };
  });

  // Spacer (Row 5)
  sheet.getRow(5).height = 10;

  // --------------------------------------------------
  // KPI Section (Rows 6-7)
  // --------------------------------------------------
  const totalCollected = Number(data.totalCollected || 0);
  const totalDonated = Number(data.totalDonated || 0);
  const remainingBalance = totalCollected - totalDonated;

  // KPI Labels (Row 6)
  const kpiLabelRow = sheet.getRow(6);
  kpiLabelRow.height = 18;

  const kpiLabels = ["", "Total Collected", "Total Donated", "Remaining Balance"];
  kpiLabels.forEach((label, i) => {
    if (i === 0) return;
    const cell = kpiLabelRow.getCell(i + 1);
    cell.value = label;
    cell.font = { size: 9, color: { argb: COLORS.muted } };
    cell.alignment = { horizontal: "center", vertical: "bottom" };
  });

  // KPI Values (Row 7)
  const kpiValueRow = sheet.getRow(7);
  kpiValueRow.height = 28;

  const kpiValues = [null, totalCollected, totalDonated, remainingBalance];
  const kpiBgs = [null, COLORS.kpiBg, COLORS.kpiRedBg, COLORS.kpiBalanceBg];
  const kpiColors = [
    null,
    COLORS.green,
    COLORS.red,
    remainingBalance >= 0 ? COLORS.green : COLORS.red,
  ];

  kpiValues.forEach((val, i) => {
    if (i === 0) return;
    const cell = kpiValueRow.getCell(i + 1);
    cell.value = val;
    cell.numFmt = "#,##0";
    cell.font = { size: 14, bold: true, color: { argb: kpiColors[i]! } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: kpiBgs[i]! },
    };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.darkBorder } },
      bottom: { style: "thin", color: { argb: COLORS.darkBorder } },
      left: { style: "thin", color: { argb: COLORS.darkBorder } },
      right: { style: "thin", color: { argb: COLORS.darkBorder } },
    };
  });

  // Spacer (Row 8)
  sheet.getRow(8).height = 6;

  // --------------------------------------------------
  // Section Title (Row 9)
  // --------------------------------------------------
  sheet.mergeCells("A9:D9");
  const sectionTitle = sheet.getCell("A9");
  sectionTitle.value = "Monthly Breakdown";
  sectionTitle.font = { size: 12, bold: true, color: { argb: COLORS.primary } };
  sectionTitle.alignment = { vertical: "bottom" };
  sheet.getRow(9).height = 26;

  // --------------------------------------------------
  // Table Header (Row 10)
  // --------------------------------------------------
  const headerValues = ["Month", "Collected Amount", "Donated Amount", "Balance"];
  const headerRow = sheet.getRow(10);
  headerRow.height = 26;

  headerValues.forEach((val, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = val;
    cell.font = { size: 10, bold: true, color: { argb: COLORS.headerText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primaryBg },
    };
    cell.alignment = {
      horizontal: i === 0 ? "left" : "right",
      vertical: "middle",
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };
  });
  // Add left padding to Month header
  headerRow.getCell(1).alignment = {
    horizontal: "left",
    vertical: "middle",
    indent: 1,
  };

  // --------------------------------------------------
  // Data rows
  // --------------------------------------------------
  let currentRow = 11;

  for (let idx = 0; idx < data.monthlyRecords.length; idx++) {
    const record = data.monthlyRecords[idx];
    const collected = Number(record.collectedAmount || 0);
    const donated = Number(record.donatedAmount || 0);
    const balance = collected - donated;
    const isEven = idx % 2 === 0;

    const row = sheet.getRow(currentRow);
    row.height = 24;

    // Month cell
    const monthCell = row.getCell(1);
    monthCell.value = record.month;
    monthCell.font = { size: 10, color: { argb: COLORS.primary } };
    monthCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    // Collected cell
    const collectedCell = row.getCell(2);
    collectedCell.value = collected;
    collectedCell.numFmt = "#,##0";
    collectedCell.font = { size: 10, color: { argb: COLORS.green } };
    collectedCell.alignment = { horizontal: "right", vertical: "middle" };

    // Donated cell
    const donatedCell = row.getCell(3);
    donatedCell.value = donated;
    donatedCell.numFmt = "#,##0";
    donatedCell.font = { size: 10, color: { argb: COLORS.red } };
    donatedCell.alignment = { horizontal: "right", vertical: "middle" };

    // Balance cell
    const balanceCell = row.getCell(4);
    balanceCell.value = balance;
    balanceCell.numFmt = "#,##0";
    balanceCell.font = {
      size: 10,
      bold: true,
      color: { argb: balance >= 0 ? COLORS.green : COLORS.red },
    };
    balanceCell.alignment = { horizontal: "right", vertical: "middle" };

    // Alternating background & borders
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > 4) return;
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.lightGray },
        };
      }
      cell.border = {
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });

    currentRow++;
  }

  // --------------------------------------------------
  // Annual Total Row
  // --------------------------------------------------
  const totalRow = sheet.getRow(currentRow);
  totalRow.height = 28;

  // Month cell
  const totalLabel = totalRow.getCell(1);
  totalLabel.value = "ANNUAL TOTAL";
  totalLabel.font = { size: 11, bold: true, color: { argb: COLORS.primary } };
  totalLabel.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

  // Collected
  const totalCollectedCell = totalRow.getCell(2);
  totalCollectedCell.value = totalCollected;
  totalCollectedCell.numFmt = "#,##0";
  totalCollectedCell.font = { size: 11, bold: true, color: { argb: COLORS.green } };
  totalCollectedCell.alignment = { horizontal: "right", vertical: "middle" };

  // Donated
  const totalDonatedCell = totalRow.getCell(3);
  totalDonatedCell.value = totalDonated;
  totalDonatedCell.numFmt = "#,##0";
  totalDonatedCell.font = { size: 11, bold: true, color: { argb: COLORS.red } };
  totalDonatedCell.alignment = { horizontal: "right", vertical: "middle" };

  // Balance
  const totalBalanceCell = totalRow.getCell(4);
  totalBalanceCell.value = remainingBalance;
  totalBalanceCell.numFmt = "#,##0";
  totalBalanceCell.font = {
    size: 11,
    bold: true,
    color: { argb: remainingBalance >= 0 ? COLORS.green : COLORS.red },
  };
  totalBalanceCell.alignment = { horizontal: "right", vertical: "middle" };

  // Total row styling
  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > 4) return;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.mediumGray },
    };
    cell.border = {
      top: { style: "double", color: { argb: COLORS.primary } },
      bottom: { style: "medium", color: { argb: COLORS.primary } },
      left: { style: "thin", color: { argb: COLORS.darkBorder } },
      right: { style: "thin", color: { argb: COLORS.darkBorder } },
    };
  });

  currentRow += 2;

  // --------------------------------------------------
  // Footer
  // --------------------------------------------------
  sheet.mergeCells(`A${currentRow}:D${currentRow}`);
  const footerCell = sheet.getCell(`A${currentRow}`);
  footerCell.value = "Spring Liberation Rose  •  Confidential";
  footerCell.font = {
    size: 8,
    italic: true,
    color: { argb: COLORS.muted },
  };
  footerCell.alignment = { horizontal: "center", vertical: "middle" };

  // --------------------------------------------------
  // Return Buffer
  // --------------------------------------------------
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

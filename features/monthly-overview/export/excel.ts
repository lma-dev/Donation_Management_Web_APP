import path from "path";
import ExcelJS from "exceljs";
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

export async function generateMonthlyExcel(
  data: MonthlyOverviewResponse,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Spring Liberation Rose";
  workbook.created = new Date();

  const monthName = MONTH_NAMES[data.month] ?? `Month ${data.month}`;

  const sheet = workbook.addWorksheet(`${monthName} ${data.year}`, {
    pageSetup: { orientation: "portrait", paperSize: 9 },
  });

  // Set clean column widths
  sheet.columns = [{ width: 25 }, { width: 20 }, { width: 15 }, { width: 30 }];

  // Load Logo
  const logoPath = path.join(process.cwd(), "public/logo_slr.png");
  const logoId = workbook.addImage({
    filename: logoPath,
    extension: "png",
  });

  // 🔹 Top Right Logo (Seal Style)
  sheet.addImage(logoId, {
    tl: { col: 3.3, row: 0.2 },
    ext: { width: 90, height: 90 },
    editAs: "oneCell",
  });

  // 🔹 OPTIONAL: Watermark (Use transparent PNG)
  /*
  sheet.addImage(logoId, {
    tl: { col: 1.2, row: 4 },
    ext: { width: 300, height: 300 },
    editAs: "oneCell",
  });
  */

  // =============================
  // HEADER SECTION
  // =============================

  // App Title
  sheet.mergeCells("A1:D1");
  const appTitleCell = sheet.getCell("A1");
  appTitleCell.value = "SPRING LIBERATION ROSE";
  appTitleCell.font = {
    size: 16,
    bold: true,
    color: { argb: "FF111827" },
  };
  appTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 26;

  // Report Title
  sheet.mergeCells("A2:D2");
  const titleCell = sheet.getCell("A2");
  titleCell.value = `Monthly Donation Overview — ${monthName} ${data.year}`;
  titleCell.font = {
    size: 13,
    bold: true,
    color: { argb: "FF374151" },
  };
  titleCell.alignment = { horizontal: "center" };

  // Generated Date
  sheet.mergeCells("A3:D3");
  const dateCell = sheet.getCell("A3");
  dateCell.value = `Generated: ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`;
  dateCell.font = { size: 10, italic: true, color: { argb: "FF6B7280" } };
  dateCell.alignment = { horizontal: "center" };

  // Exchange Rate
  sheet.mergeCells("A4:D4");
  const rateCell = sheet.getCell("A4");
  rateCell.value = `Exchange Rate: 1 JPY = ${data.exchangeRate} MMK`;
  rateCell.font = { size: 10 };
  rateCell.alignment = { horizontal: "center" };

  sheet.addRow([]);
  sheet.addRow([]);

  // =============================
  // KPI SECTION
  // =============================

  const kpiLabelRow = sheet.addRow([
    "Carry Over",
    "Total Collected",
    "Total Donated",
    "Remaining Balance",
  ]);

  kpiLabelRow.eachCell((cell) => {
    cell.font = { size: 10, color: { argb: "FF6B7280" } };
    cell.alignment = { horizontal: "center" };
  });

  const carryOverVal = Number(data.carryOver);
  const totalCollectedVal = Number(data.totalCollected);
  const totalDonatedVal = Number(data.totalDonated);
  const remainingBalanceVal = Number(data.remainingBalance);

  const kpiValueRow = sheet.addRow([
    carryOverVal,
    totalCollectedVal,
    totalDonatedVal,
    remainingBalanceVal,
  ]);

  kpiValueRow.eachCell((cell) => {
    cell.font = { size: 13, bold: true };
    cell.alignment = { horizontal: "center" };
    cell.numFmt = "#,##0";
  });

  kpiValueRow.getCell(1).font.color = {
    argb: carryOverVal >= 0 ? "FF16A34A" : "FFDC2626",
  };
  kpiValueRow.getCell(2).font.color = { argb: "FF16A34A" };
  kpiValueRow.getCell(3).font.color = { argb: "FFDC2626" };
  kpiValueRow.getCell(4).font.color = {
    argb: remainingBalanceVal >= 0 ? "FF16A34A" : "FFDC2626",
  };

  sheet.addRow([]);
  sheet.addRow([]);

  // =============================
  // SUPPORTERS TABLE
  // =============================

  const supporterTitleRow = sheet.addRow(["Donations from Supporters"]);
  supporterTitleRow.getCell(1).font = { size: 12, bold: true };

  const sHeaderRow = sheet.addRow([
    "Name",
    "Amount",
    "Currency",
    "Kyats (MMK)",
  ]);

  sHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF374151" },
    };
    cell.alignment = { horizontal: "center" };
  });

  for (const s of data.supporters) {
    const row = sheet.addRow([
      s.name,
      Number(s.amount),
      s.currency,
      Number(s.kyatAmount),
    ]);

    row.getCell(2).numFmt = "#,##0";
    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(2).font = { color: { argb: "FF16A34A" } };

    row.getCell(3).alignment = { horizontal: "center" };

    row.getCell(4).numFmt = "#,##0";
    row.getCell(4).alignment = { horizontal: "right" };
    row.getCell(4).font = { color: { argb: "FF16A34A" } };

    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  }

  const sTotalRow = sheet.addRow(["Total", "", "", totalCollectedVal]);

  sTotalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
  });

  sTotalRow.getCell(4).numFmt = "#,##0";
  sTotalRow.getCell(4).alignment = { horizontal: "right" };
  sTotalRow.getCell(4).font = { bold: true, color: { argb: "FF16A34A" } };

  sheet.addRow([]);
  sheet.addRow([]);

  // =============================
  // DISTRIBUTION TABLE
  // =============================

  const distTitleRow = sheet.addRow(["Donation Distribution"]);
  distTitleRow.getCell(1).font = { size: 12, bold: true };

  const dHeaderRow = sheet.addRow(["Recipient", "Amount (MMK)", "Remarks", ""]);

  dHeaderRow.eachCell((cell, colNumber) => {
    if (colNumber <= 3) {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF374151" },
      };
      cell.alignment = { horizontal: "center" };
    }
  });

  for (const d of data.distributions) {
    const row = sheet.addRow([
      d.recipient,
      Number(d.amountMMK),
      d.remarks ?? "",
    ]);

    row.getCell(2).numFmt = "#,##0";
    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(2).font = { color: { argb: "FFDC2626" } };

    row.getCell(3).alignment = { wrapText: true, vertical: "top" };
    row.getCell(1).alignment = { wrapText: true, vertical: "top" };

    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  }

  const dTotalRow = sheet.addRow(["Total", totalDonatedVal, ""]);

  dTotalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
  });

  dTotalRow.getCell(2).numFmt = "#,##0";
  dTotalRow.getCell(2).alignment = { horizontal: "right" };
  dTotalRow.getCell(2).font = { bold: true, color: { argb: "FFDC2626" } };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

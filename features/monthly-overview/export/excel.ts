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

  // Title
  sheet.mergeCells("A1:D1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Monthly Donation Overview — ${monthName} ${data.year}`;
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // Generated date
  sheet.mergeCells("A2:D2");
  const dateCell = sheet.getCell("A2");
  dateCell.value = `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  dateCell.font = { size: 10, italic: true, color: { argb: "FF666666" } };
  dateCell.alignment = { horizontal: "center" };

  // Exchange Rate
  sheet.mergeCells("A3:D3");
  const rateCell = sheet.getCell("A3");
  rateCell.value = `Exchange Rate: 1 JPY = ${data.exchangeRate} MMK`;
  rateCell.font = { size: 10 };
  rateCell.alignment = { horizontal: "center" };

  // KPI Summary
  sheet.addRow([]);
  const kpiLabelRow = sheet.addRow([
    "Carry Over",
    "Total Collected",
    "Total Donated",
    "Remaining Balance",
  ]);
  kpiLabelRow.eachCell((cell) => {
    cell.font = { size: 9, color: { argb: "FF666666" } };
    cell.alignment = { horizontal: "center" };
  });

  const kpiValueRow = sheet.addRow([
    Number(data.carryOver),
    Number(data.totalCollected),
    Number(data.totalDonated),
    Number(data.remainingBalance),
  ]);
  kpiValueRow.eachCell((cell) => {
    cell.font = { size: 12, bold: true };
    cell.alignment = { horizontal: "center" };
    cell.numFmt = "#,##0";
  });

  sheet.addRow([]);
  sheet.addRow([]);

  // Supporters Table
  const supporterTitleRow = sheet.addRow(["Donations from Supporters"]);
  supporterTitleRow.getCell(1).font = { size: 12, bold: true };

  sheet.columns = [
    { key: "A", width: 25 },
    { key: "B", width: 20 },
    { key: "C", width: 15 },
    { key: "D", width: 22 },
  ];

  const sHeaderRow = sheet.addRow(["Name", "Amount", "Currency", "Kyats (MMK)"]);
  sHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F2937" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };
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
    row.getCell(3).alignment = { horizontal: "center" };
    row.getCell(4).numFmt = "#,##0";
    row.getCell(4).alignment = { horizontal: "right" };
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  }

  const sTotalRow = sheet.addRow([
    "Total",
    "",
    "",
    Number(data.totalCollected),
  ]);
  sTotalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
    cell.border = {
      top: { style: "double", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };
  });
  sTotalRow.getCell(4).numFmt = "#,##0";
  sTotalRow.getCell(4).alignment = { horizontal: "right" };

  sheet.addRow([]);
  sheet.addRow([]);

  // Distribution Table
  const distTitleRow = sheet.addRow(["Donation Distribution"]);
  distTitleRow.getCell(1).font = { size: 12, bold: true };

  const dHeaderRow = sheet.addRow(["Recipient", "Amount (MMK)", "Remarks", ""]);
  dHeaderRow.eachCell((cell, colNumber) => {
    if (colNumber <= 3) {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F2937" },
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF000000" } },
      };
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
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  }

  const dTotalRow = sheet.addRow([
    "Total",
    Number(data.totalDonated),
    "",
  ]);
  dTotalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
    cell.border = {
      top: { style: "double", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };
  });
  dTotalRow.getCell(2).numFmt = "#,##0";
  dTotalRow.getCell(2).alignment = { horizontal: "right" };

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

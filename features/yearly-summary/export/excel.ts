import ExcelJS from "exceljs";
import type { YearlySummaryResponse } from "../types";

export async function generateExcel(
  data: YearlySummaryResponse,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Spring Liberation Rose";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`FY${data.fiscalYear} Summary`, {
    pageSetup: { orientation: "landscape", paperSize: 9 },
  });

  // Title
  sheet.mergeCells("A1:D1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Yearly Donation Summary — FY ${data.fiscalYear}`;
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // Generated date
  sheet.mergeCells("A2:D2");
  const dateCell = sheet.getCell("A2");
  dateCell.value = `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  dateCell.font = { size: 10, italic: true, color: { argb: "FF666666" } };
  dateCell.alignment = { horizontal: "center" };

  // Empty row
  sheet.addRow([]);

  // Column definitions
  sheet.columns = [
    { key: "month", width: 18 },
    { key: "collected", width: 22 },
    { key: "donated", width: 22 },
    { key: "balance", width: 22 },
  ];

  // Headers
  const headerRow = sheet.addRow({
    month: "Month",
    collected: "Collected Amount",
    donated: "Donated Amount",
    balance: "Balance",
  });

  headerRow.eachCell((cell) => {
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

  // Data rows
  for (const record of data.monthlyRecords) {
    const collected = Number(record.collectedAmount);
    const donated = Number(record.donatedAmount);
    const balance = collected - donated;

    const row = sheet.addRow({
      month: record.month,
      collected,
      donated,
      balance,
    });

    row.getCell("collected").numFmt = "#,##0";
    row.getCell("donated").numFmt = "#,##0";
    row.getCell("balance").numFmt = "#,##0";

    row.getCell("collected").alignment = { horizontal: "right" };
    row.getCell("donated").alignment = { horizontal: "right" };
    row.getCell("balance").alignment = { horizontal: "right" };

    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  }

  // Annual totals row
  const totalCollected = Number(data.totalCollected);
  const totalDonated = Number(data.totalDonated);
  const remainingBalance = Number(data.remainingBalance);

  const totalRow = sheet.addRow({
    month: "Annual Total",
    collected: totalCollected,
    donated: totalDonated,
    balance: remainingBalance,
  });

  totalRow.eachCell((cell) => {
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

  totalRow.getCell("collected").numFmt = "#,##0";
  totalRow.getCell("donated").numFmt = "#,##0";
  totalRow.getCell("balance").numFmt = "#,##0";

  totalRow.getCell("collected").alignment = { horizontal: "right" };
  totalRow.getCell("donated").alignment = { horizontal: "right" };
  totalRow.getCell("balance").alignment = { horizontal: "right" };

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

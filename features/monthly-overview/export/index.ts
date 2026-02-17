import { generateMonthlyExcel } from "./excel";
import { generateMonthlyPdf } from "./pdf";
import { generateMonthlyJsonExport } from "./json";
import { monthlyExportSchema } from "../schema";
import { getMonthlyOverview } from "../domain";
import { MonthlyOverviewError } from "../error";

const MONTH_NAMES = [
  "",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

type ExportResult = {
  buffer: Buffer;
  contentType: string;
  filename: string;
};

export async function generateMonthlyExportFile(input: {
  year: unknown;
  month: unknown;
  type: unknown;
}): Promise<ExportResult> {
  const parsed = monthlyExportSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  const data = await getMonthlyOverview({
    year: parsed.data.year,
    month: parsed.data.month,
  });

  const monthName = MONTH_NAMES[parsed.data.month] ?? "month";
  const baseFilename = `monthly-overview-${data.year}-${monthName}`;

  switch (parsed.data.type) {
    case "excel": {
      const buffer = await generateMonthlyExcel(data);
      return {
        buffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: `${baseFilename}.xlsx`,
      };
    }
    case "pdf": {
      const buffer = await generateMonthlyPdf(data);
      return {
        buffer,
        contentType: "application/pdf",
        filename: `${baseFilename}.pdf`,
      };
    }
    case "json": {
      const content = generateMonthlyJsonExport(data);
      return {
        buffer: Buffer.from(content, "utf-8"),
        contentType: "application/json",
        filename: `${baseFilename}.json`,
      };
    }
  }
}

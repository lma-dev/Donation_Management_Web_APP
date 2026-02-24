import { generateExcel } from "./excel";
import { generatePdf } from "./pdf";
import { generateJsonExport } from "./json";
import { exportQuerySchema } from "../schema";
import { getYearlySummary } from "../domain";
import { YearlySummaryError } from "../error";

type ExportResult = {
  buffer: Buffer;
  contentType: string;
  filename: string;
};

export async function generateExportFile(input: {
  year: unknown;
  type: unknown;
}): Promise<ExportResult> {
  const parsed = exportQuerySchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new YearlySummaryError(firstError, "VALIDATION_ERROR");
  }

  const data = await getYearlySummary({ year: parsed.data.year });

  switch (parsed.data.type) {
    case "excel": {
      const buffer = await generateExcel(data);
      return {
        buffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: `yearly-summary-${data.fiscalYear}.xlsx`,
      };
    }
    case "pdf": {
      const buffer = await generatePdf(data);
      return {
        buffer,
        contentType: "application/pdf",
        filename: `yearly-summary-${data.fiscalYear}.pdf`,
      };
    }
    case "json": {
      const content = generateJsonExport(data);
      return {
        buffer: Buffer.from(content, "utf-8"),
        contentType: "application/json",
        filename: `yearly-summary-${data.fiscalYear}.json`,
      };
    }
  }
}

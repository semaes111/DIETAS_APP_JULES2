import { NextRequest, NextResponse } from "next/server"
import { RequirePermission, validateBody } from "@/lib/api-middleware"
import { FoodImportExportService } from "@/lib/import-export-service"
import { z } from "zod"

const importFoodsSchema = z.object({
  csvData: z.string().min(1, "CSV data is required"),
  skipDuplicates: z.boolean().optional().default(true),
  validateOnly: z.boolean().optional().default(false),
  batchSize: z.number().min(1).max(1000).optional().default(100)
})

// POST /api/admin/import/foods-csv - Import foods from CSV
export const POST = RequirePermission.importData(async (req: NextRequest, context) => {
  const body = await validateBody(importFoodsSchema)(req)
  const userId = context.user!.id

  try {
    const result = await FoodImportExportService.importFromCSV(
      body.csvData,
      userId,
      {
        skipDuplicates: body.skipDuplicates,
        validateOnly: body.validateOnly,
        batchSize: body.batchSize
      }
    )

    const statusCode = body.validateOnly ? 200 : (result.success ? 201 : 207) // 207 = Multi-Status

    return NextResponse.json({
      success: result.success,
      data: {
        importResult: result,
        summary: {
          totalProcessed: result.totalProcessed,
          imported: result.successCount,
          failed: result.errorCount,
          skipped: result.skippedCount,
          duplicates: result.duplicateCount
        }
      },
      message: body.validateOnly 
        ? 'Validation completed' 
        : result.success 
          ? 'Import completed successfully'
          : 'Import completed with errors'
    }, { status: statusCode })

  } catch (error) {
    throw error
  }
})
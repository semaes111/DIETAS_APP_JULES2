import { NextRequest, NextResponse } from "next/server"
import { RequirePermission, validateQuery } from "@/lib/api-middleware"
import { FoodImportExportService } from "@/lib/import-export-service"
import { z } from "zod"

const exportFoodsSchema = z.object({
  format: z.enum(['csv']).optional().default('csv'),
  includeUnverified: z.coerce.boolean().optional().default(true),
  categories: z.string().optional().transform(str => str ? str.split(',') : undefined),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional()
}).refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  {
    message: "Start date must be before end date",
    path: ["endDate"],
  }
)

// GET /api/admin/export/foods - Export foods to CSV
export const GET = RequirePermission.exportData(async (req: NextRequest, context) => {
  const url = new URL(req.url)
  
  try {
    const query = validateQuery(exportFoodsSchema, url)

    const csvData = await FoodImportExportService.exportToCSV({
      format: 'csv',
      includeUnverified: query.includeUnverified,
      categories: query.categories,
      ...(query.startDate && query.endDate && {
        dateRange: {
          startDate: query.startDate,
          endDate: query.endDate
        }
      })
    })

    const filename = `foods-export-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    throw error
  }
})
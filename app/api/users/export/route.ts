import { NextRequest, NextResponse } from "next/server"
import { Middleware } from "@/lib/api-middleware"
import { UserDataExportService } from "@/lib/import-export-service"

// GET /api/users/export - Export user's own data (GDPR)
export const GET = Middleware.protected({
})(async (req: NextRequest, context) => {
  const userId = context.user!.id

  try {
    const userData = await UserDataExportService.exportUserData(userId)
    const filename = `user-data-${userId}-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(userData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    throw error
  }
})
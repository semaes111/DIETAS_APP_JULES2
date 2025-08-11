/**
 * Script to make a user an admin
 * Usage: node scripts/make-admin.js <email>
 * Example: node scripts/make-admin.js user@example.com
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function makeUserAdmin(email) {
  try {
    if (!email) {
      console.error('Please provide an email address')
      console.log('Usage: node scripts/make-admin.js <email>')
      process.exit(1)
    }

    console.log(`Looking for user with email: ${email}`)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, isAdmin: true }
    })

    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }

    if (user.isAdmin) {
      console.log(`User ${user.name || user.email} is already an admin`)
      process.exit(0)
    }

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    })

    console.log(`✅ Successfully made ${user.name || user.email} an admin`)
    console.log('The user can now access the admin panel at /admin/import')

  } catch (error) {
    console.error('Error making user admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]
makeUserAdmin(email)
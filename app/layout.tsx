import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import AuthProvider from '@/components/auth-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dietas NutriMed - Tu Compañero Nutricional',
  description: 'Transforma tu alimentación con nuestro sistema inteligente basado en la dieta mediterránea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
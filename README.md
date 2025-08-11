# 🥗 Nutrimed App

**Aplicación completa de gestión nutricional personalizada basada en principios mediterráneos**

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)

## 🌟 Características Principales

- 🔐 **Sistema de autenticación completo** (NextAuth.js con Google OAuth)
- 👤 **Gestión de perfiles personalizados** con cálculo automático de BMR/TDEE
- 📊 **Dashboard nutricional interactivo** con gráficos y estadísticas
- 🍽️ **Planificación de comidas personalizada** basada en objetivos individuales
- 🥘 **Base de datos de alimentos mediterráneos** con información nutricional completa
- 📅 **Calendario semanal de comidas** con generación automática de planes
- 🛒 **Generador de listas de compras** integrado
- 📈 **Seguimiento de progreso** con métricas de peso y composición corporal
- 🧮 **Calculadora nutricional avanzada** con macronutrientes personalizados
- 📱 **Diseño responsive** optimizado para móvil, tablet y desktop

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 14+** con App Router
- **React 18** con hooks avanzados
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Shadcn/ui** componentes modernos
- **Recharts** para visualización de datos

### Backend
- **Next.js API Routes** para el backend
- **Prisma ORM** para gestión de base de datos
- **PostgreSQL** como base de datos principal
- **NextAuth.js** para autenticación

### DevOps & Tools
- **Vercel** para despliegue
- **ESLint & Prettier** para code quality
- **Zod** para validación de schemas

## 📋 Requisitos Previos

- Node.js 18.0.0 o superior
- npm, yarn o pnpm
- PostgreSQL (o SQLite para desarrollo local)
- Cuenta de Google para OAuth (opcional)

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/nutrimed-app.git
cd nutrimed-app
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus configuraciones:
```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/nutrimed_app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"

# OAuth (opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

### 4. Configurar la base de datos
```bash
# Generar el cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 5. Inicializar datos de prueba
```bash
npm run dev
```

Luego visita: `http://localhost:3000/api/foods/seed` para poblar la base de datos con alimentos mediterráneos.

### 6. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
nutrimed-app/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   └── onboarding/        # Configuración inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── dashboard/        # Componentes del dashboard
│   └── auth/             # Componentes de autenticación
├── lib/                  # Utilidades y configuraciones
├── prisma/               # Schema y migraciones
├── types/                # Definiciones de TypeScript
└── public/               # Archivos estáticos
```

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint

# Base de datos
npm run db:push        # Actualizar esquema
npm run db:migrate     # Crear migración
npm run db:generate    # Generar cliente
npm run db:studio      # Abrir Prisma Studio
```

## 🌐 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Asegúrate de que tu base de datos PostgreSQL esté accesible desde Vercel

### Variables de entorno para producción:
```env
DATABASE_URL="tu-postgresql-url-de-produccion"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXTAUTH_SECRET="clave-secreta-fuerte-para-produccion"
```

## 🎯 Funcionalidades Detalladas

### Gestión de Usuarios
- Registro con email/contraseña
- Inicio de sesión con Google OAuth
- Perfil nutricional personalizado
- Cálculo automático de necesidades calóricas

### Planificación Nutricional
- Cálculo de BMR (Basal Metabolic Rate)
- Determinación de TDEE (Total Daily Energy Expenditure)
- Distribución de macronutrientes personalizada
- Adaptación según objetivos (pérdida, mantenimiento, ganancia de peso)

### Base de Datos de Alimentos
- Más de 25 alimentos mediterráneos precargados
- Información nutricional completa por cada 100g
- Categorización por grupos alimentarios
- Sistema de búsqueda y filtrado

### Dashboard Interactivo
- Resumen diario de nutrición
- Gráficos de progreso semanal
- Distribución de macronutrientes
- Seguimiento de objetivos diarios

### Sistema de Comidas
- Planificación por tipo de comida (desayuno, almuerzo, cena, snacks)
- Registro de consumo diario
- Cálculo automático de valores nutricionales
- Historial de comidas consumidas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

¿Necesitas ayuda? Puedes:
- Abrir un issue en GitHub
- Consultar la documentación de las tecnologías utilizadas
- Contactar al equipo de desarrollo

## 🔮 Roadmap

- [ ] Integración con APIs de nutrición externas
- [ ] Sistema de recetas compartidas
- [ ] Aplicación móvil (React Native)
- [ ] Integración con dispositivos wearables
- [ ] Sistema de coaches nutricionales
- [ ] Análisis de fotos de comida con IA

---

**Desarrollado con ❤️ para promover una alimentación saludable basada en la dieta mediterránea**

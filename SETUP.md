# MY STUDY WORLD - Complete Setup Guide

This guide will walk you through setting up MY STUDY WORLD from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Or use a cloud provider like [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)

3. **Git** (optional, for version control)

## Step-by-Step Installation

### 1. Navigate to Project Directory

```bash
cd my-study-world
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Prisma
- Tailwind CSS
- shadcn/ui components
- Zustand (state management)
- Recharts (for analytics)

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. **Create a new database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mystudyworld;

# Exit
\q
```

2. **Update `.env` file:**

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/mystudyworld?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Replace `yourpassword` with your PostgreSQL password.

#### Option B: Using Supabase (Cloud)

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to Project Settings > Database
3. Copy the Connection String (URI format)
4. Update `.env`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Option C: Using Neon (Cloud)

1. Create a new project at [neon.tech](https://neon.tech/)
2. Copy the connection string
3. Update `.env`:

```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database Schema

Push the Prisma schema to your database:

```bash
npm run db:push
```

This command will:
- Create all tables
- Set up relationships
- Configure indexes

You should see output like:
```
✔ Generated Prisma Client
✔ Database synchronization complete
```

### 5. Seed Sample Data

Populate your database with initial sample data:

```bash
npm run db:seed
```

This creates:
- Demo user (Shawon)
- 5 academic subjects (DIP, DC, TE, OFC, SC)
- Complete Tuesday schedule
- Today's tasks
- AI/ML learning roadmap
- Research project
- Goals

Expected output:
```
🌱 Seeding database...
✓ Created user: Shawon
✓ Created user settings
✓ Created subjects
✓ Created schedule blocks
✓ Created today's tasks
✓ Created AI/ML roadmap
✓ Created research project
✓ Created goals
✅ Seeding completed successfully!
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

You should see:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in XXXms
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll be automatically redirected to the dashboard at `/dashboard`.

## Verify Installation

Check that everything is working:

### 1. Dashboard Loads
- ✅ You see "GOOD EVENING, SHAWON" (or appropriate greeting)
- ✅ Current date and time display
- ✅ Live countdown timer

### 2. Data Appears
- ✅ Schedule blocks visible in "Today's Schedule"
- ✅ Progress cards show percentages
- ✅ Current task card displays (if within scheduled time)

### 3. Navigation Works
- ✅ Click "Courses" - see 5 subjects
- ✅ Click "AI/ML" - see roadmap with 8 stages
- ✅ All pages load without errors

## Development Commands

### Database Management

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database
npm run db:push

# Create a migration
npx prisma migrate dev --name migration_name

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Application Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # On macOS
   brew services list
   
   # On Windows (Services app)
   services.msc
   ```

2. Verify connection string in `.env`
3. Test connection:
   ```bash
   psql -U postgres -d mystudyworld
   ```

### Problem: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### Problem: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
# On macOS/Linux
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Problem: Seed script fails

**Solution:**
1. Clear existing data:
   ```bash
   # Connect to database
   psql -U postgres -d mystudyworld
   
   # Drop all tables
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

2. Re-run setup:
   ```bash
   npm run db:push
   npm run db:seed
   ```

## Database Inspection

Use Prisma Studio to visually inspect your database:

```bash
npm run db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can:
- View all tables
- Edit records
- Add new data
- Delete records

## Next Steps

After successful setup:

1. **Explore the Dashboard**
   - Check the live countdown timer
   - View today's schedule
   - See progress indicators

2. **Navigate Through Pages**
   - Courses: View and manage academic subjects
   - AI/ML: Track your learning roadmap
   - Research: Manage research projects (coming soon)

3. **Customize Your Data**
   - Use Prisma Studio to modify schedules
   - Update user settings
   - Add your own subjects and tasks

4. **Build Features**
   - Continue development with remaining tasks
   - Add new components
   - Extend functionality

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Support

If you encounter issues:

1. Check this guide thoroughly
2. Review the README.md
3. Inspect browser console for errors
4. Check terminal/server logs
5. Verify database connection

## Success Checklist

- [ ] Node.js installed (v18+)
- [ ] PostgreSQL running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Sample data seeded (`npm run db:seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Dashboard loads at localhost:3000
- [ ] Real-time countdown working
- [ ] Navigation between pages works
- [ ] Data displays correctly

---

**You're all set! 🎉**

Your MY STUDY WORLD personal command center is now running. Start managing your study routine, track your progress, and achieve your goals!

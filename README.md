# MY STUDY WORLD

**Study. Build. Research. Become.**

A production-ready, real-time personal productivity and study operating system that actively manages your daily study routine, academic courses, AI/ML learning, research, habits, time, focus, progress, and weekly goals.

## Features

### 🎯 Real-Time Command Center
- Live countdown timers for current tasks
- Active task tracking with start/pause/complete functionality
- Smart status indicators (On Track, Slightly Behind, Significantly Behind)
- Time-aware UI that adapts throughout the day
- Automatic task transitions and notifications

### 📅 Intelligent Scheduling
- Fully editable timetable with drag-and-drop support
- Smart rescheduling for missed/delayed tasks
- Conflict detection and resolution
- Fixed vs. Flexible time blocks
- Weekly recurring schedules

### 📊 Progress Tracking
- Daily progress with category breakdown
- Weekly progress and analytics
- Real-time productivity score (0-100)
- Study hours tracking by category
- Habit tracking (sleep, phone usage, study consistency)

### 🎓 Academic Management
- Course tracking with progress indicators
- Topic and chapter completion
- Assignment and lab management
- Multi-course organization

### 🤖 AI/ML Learning System
- Structured learning roadmap
- Stage-based progression
- Topic completion tracking
- Resource management
- Project tracking

### 🔬 Research Lab
- Research project management
- Paper organization and notes
- Literature review tracking
- Experiment and simulation logs
- Research task Kanban board

### 🎯 Goal Management
- Daily, Weekly, Monthly, Long-term goals
- Progress tracking with milestones
- Category-based organization
- Priority levels

### ⚡ Focus Mode
- Distraction-free full-screen interface
- Pomodoro timer support
- Task objectives display
- Session tracking

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: PostgreSQL
- **ORM**: Prisma
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

```bash
cd my-study-world
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mystudyworld?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Replace `username` and `password` with your PostgreSQL credentials.

4. **Set up the database**

```bash
# Push the Prisma schema to the database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Create migration
npx prisma migrate dev --name migration_name
```

## Project Structure

```
my-study-world/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── schedule/         # Schedule management
│   │   └── tasks/            # Task management
│   ├── dashboard/            # Main dashboard page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── countdown-timer.tsx   # Real-time countdown
│   ├── current-task-card.tsx # Active task display
│   ├── daily-timeline.tsx    # Day schedule view
│   ├── progress-card.tsx     # Progress indicators
│   └── status-indicator.tsx  # Status display
├── lib/                      # Utilities and helpers
│   ├── prisma.ts             # Prisma client
│   ├── scheduling-engine.ts  # Core scheduling logic
│   ├── store.ts              # Zustand state management
│   └── utils.ts              # Utility functions
├── prisma/                   # Database
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
└── public/                   # Static assets
```

## Key Features Explained

### Real-Time Scheduling Engine

The app uses a sophisticated scheduling engine that:
- Calculates current, next, and previous activities
- Provides live countdown timers
- Detects schedule conflicts
- Suggests optimal rescheduling slots
- Respects fixed vs. flexible time blocks

### Smart Rescheduling

When you miss a task, the system:
1. Identifies available time slots
2. Respects fixed commitments (sleep, classes, meals)
3. Suggests optimal times based on priority
4. Allows manual slot selection
5. Updates the schedule automatically

### Productivity Scoring

Your daily score (0-100) is calculated from:
- Task completion rate (weighted)
- Focus time achieved (weighted)
- AI/ML consistency (weighted)
- Research consistency (weighted)
- Sleep quality (weighted)
- Phone usage (weighted)

Weights are fully customizable in settings.

### Data-Driven Architecture

Everything is data-driven:
- Schedules are stored in the database
- UI renders dynamically from data
- No hardcoded time blocks
- Fully customizable by the user

## Customization

### User Settings

All major settings are configurable:
- Sleep schedule
- Phone usage limit
- Weekly study hour targets
- Pomodoro timer durations
- Notification preferences
- Productivity score weights
- Theme (light/dark)

### Schedule Editing

- Add/edit/delete time blocks
- Change categories and priorities
- Set fixed vs. flexible blocks
- Add task objectives and notes
- Customize colors and icons

### Dashboard Widgets

- Reorder widgets
- Show/hide sections
- Customize layout
- Add quick notes

## Sample Data

The seed script creates:
- Demo user (Shawon)
- 5 academic subjects (DIP, DC, TE, OFC, SC)
- Complete Tuesday schedule
- Today's tasks with various statuses
- AI/ML learning roadmap (8 stages)
- Research project setup
- Multiple goals (daily, weekly, long-term)

## API Routes

### Schedule Management
- `GET /api/schedule` - Get schedule blocks
- `POST /api/schedule` - Create schedule block
- `PUT /api/schedule` - Update schedule block
- `DELETE /api/schedule` - Delete schedule block

### Task Management
- `GET /api/tasks` - Get tasks (with date filter)
- `POST /api/tasks` - Create task
- `PATCH /api/tasks` - Update task status
- `POST /api/tasks/reschedule` - Reschedule missed task

## Development Roadmap

### Completed ✅
- Project setup and architecture
- Database schema and relationships
- Real-time scheduling engine
- Live dashboard with countdown timers
- Task management system
- Progress tracking
- API routes

### In Progress 🚧
- Focus mode interface
- Drag-and-drop scheduler
- Smart rescheduling UI
- Academic course pages
- AI/ML roadmap interface
- Research lab workspace

### Planned 📋
- Habit tracking interface
- Notification system
- Weekly review automation
- Daily mission generation
- Settings page
- Onboarding wizard
- Mobile responsive design
- Offline support
- Data export/import
- Calendar integration

## Contributing

This is a personal productivity system, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this for your own productivity needs.

---

**Built with ❤️ for students, researchers, and lifelong learners.**

# MY STUDY WORLD - দ্রুত শুরু করার গাইড

## 🚀 দ্রুত ইনস্টলেশন (বাংলায়)

### ১. Dependencies Install করুন

```bash
cd my-study-world
npm install
```

এটি কিছুটা সময় নিতে পারে (৫-১০ মিনিট)। Install হওয়া পর্যন্ত অপেক্ষা করুন।

### ২. Database Setup (SQLite - সহজ উপায়)

আপনার যদি PostgreSQL না থাকে, তাহলে SQLite ব্যবহার করুন:

**`.env` ফাইলে এটি লিখুন:**

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**`prisma/schema.prisma` ফাইলে পরিবর্তন করুন:**

```prisma
datasource db {
  provider = "sqlite"  // "postgresql" এর পরিবর্তে
  url      = env("DATABASE_URL")
}
```

### ৩. Database Initialize করুন

```bash
npm run db:push
```

### ৪. Sample Data Load করুন

```bash
npm run db:seed
```

### ৫. Application Run করুন

```bash
npm run dev
```

Browser এ যান: **http://localhost:3000**

## ✨ যা যা দেখবেন

### 🏠 Dashboard (`/dashboard`)
- **Live countdown timer** - প্রতি সেকেন্ডে আপডেট হয়
- **Current task card** - এখন কি করছেন তা দেখায়
- **Daily timeline** - আজকের পুরো schedule
- **Progress indicators** - আপনার performance
- **Status tracking** - On Track/Behind indicators

### 📚 Courses (`/courses`)
- **5টি subject** (DIP, DC, TE, OFC, SC)
- Progress tracking প্রতিটি course এর জন্য
- Topic completion checkboxes
- Visual progress bars

### 🤖 AI/ML Roadmap (`/ai-roadmap`)
- **8 learning stages** (Python থেকে NLP পর্যন্ত)
- প্রতিটি stage এ topics, projects, resources
- Overall completion percentage
- Stage-by-stage progress

### 🔬 Research (`/research`)
- Research project management
- Paper tracking system
- Research task Kanban board
- Literature review organization

### 🎯 Goals (`/goals`)
- Daily, Weekly, Monthly, Long-term goals
- Progress tracking with percentages
- Priority indicators
- Deadline reminders

### 📊 Progress (`/progress`)
- Weekly activity charts
- Productivity score (0-100)
- Habit tracking (sleep, phone)
- Weekly insights and analytics

### ⚙️ Settings (`/settings`)
- Sleep schedule configuration
- Phone usage limits
- Pomodoro timer settings
- Notification preferences
- Weekly study targets
- Theme switching (Light/Dark)

## 🎮 ব্যবহার করার নিয়ম

### Real-time Countdown
Dashboard এ যান, আপনি দেখবেন:
- **Current task** - এখন যা করা উচিত
- **Live timer** - বাকি সময় (HH:MM:SS)
- **Action buttons** - Start, Pause, Complete, Skip

### Focus Mode
কোন task এ click করুন → **Start Focus** button
- Full-screen distraction-free mode
- Large countdown timer
- Task objectives display
- Pause/Resume controls

### Course Management
Courses page এ:
- যেকোনো course card click করুন
- Topic list দেখুন
- Checkbox click করে complete mark করুন
- Progress automatically update হবে

### Goal Tracking
Goals page এ:
- সব goals type অনুযায়ী organized
- Progress bars সহ
- Update Progress button দিয়ে manually update করুন

## 🎨 Features Highlights

### ✅ কি কি কাজ করছে:

1. ⏱️ **Real-time Timers** - প্রতি সেকেন্ডে update
2. 📅 **Schedule Timeline** - পুরো দিনের plan
3. 📈 **Progress Tracking** - বিভিন্ন category তে
4. 🎯 **Goal Management** - সব ধরনের goals
5. 📚 **Course Tracking** - 5টি subjects
6. 🤖 **AI Roadmap** - 8 stages
7. 🔬 **Research Lab** - paper ও task management
8. ⚙️ **Settings** - সব কিছু customize করা যায়
9. 📱 **Mobile Responsive** - phone এ perfectly কাজ করে
10. 🌓 **Dark/Light Theme** - দুটোই available

### 🚧 কি কি এখনো বাকি:

1. **Drag-and-drop scheduler** - schedule edit করার জন্য
2. **Task rescheduling UI** - missed tasks move করার জন্য
3. **Notification system** - real notifications
4. **Data persistence** - API integration
5. **Authentication** - user login system

## 📱 Mobile এ ব্যবহার

Mobile browser এ খুললে:
- **Bottom navigation** দেখবেন
- **Touch-friendly** buttons
- **Responsive layout** - ছোট screen এর জন্য optimized

## 🎯 Sample Data

Seed script এ আছে:
- **User**: Shawon (demo user)
- **5 Subjects**: DIP, DC, TE, OFC, SC
- **Tuesday Schedule**: সম্পূর্ণ দিনের routine
- **4 Tasks**: বিভিন্ন status সহ
- **AI Roadmap**: 8 stages
- **Research Project**: AI-Integrated Antenna Design
- **Goals**: Daily, Weekly, Long-term

## 🐛 সমস্যা হলে

### Error: "Cannot connect to database"
- `.env` file check করুন
- SQLite ব্যবহার করুন (সহজ)
- অথবা PostgreSQL install করুন

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 busy
```bash
# অন্য port ব্যবহার করুন
npm run dev -- -p 3001
```

### Seed script fails
```bash
# Database reset করুন
rm prisma/dev.db  # SQLite এর জন্য
npm run db:push
npm run db:seed
```

## 📖 আরো তথ্যের জন্য

- **README.md** - সম্পূর্ণ feature list
- **SETUP.md** - বিস্তারিত setup guide
- **prisma/schema.prisma** - database structure

## 🎉 সফলভাবে চালু হলে

Browser এ দেখবেন:
1. **Dashboard** সুন্দর UI সহ
2. **Live countdown** চলছে
3. **Navigation** কাজ করছে
4. **All pages** load হচ্ছে
5. **Real-time updates** working

## 💡 পরবর্তী ধাপ

1. **Explore** - সব pages ঘুরে দেখুন
2. **Customize** - Settings থেকে change করুন
3. **Use** - আপনার real schedule add করুন
4. **Track** - প্রতিদিন progress দেখুন
5. **Improve** - আরো features add করুন

---

**আপনার MY STUDY WORLD এখন ready! 🎊**

Dashboard খুলুন এবং আপনার study journey শুরু করুন! 🚀

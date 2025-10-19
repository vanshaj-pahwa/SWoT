# SWoT - Strength Workout Tracker

A modern, data-driven fitness application designed for serious athletes who want powerful tools to plan workouts, log training sessions, and analyze performance trends.

## Features

- 🏋️ **Comprehensive Workout Logging**: Track sets, reps, weights, and exercise notes
- 📊 **Advanced Analytics**: Progress charts, volume tracking, and 1RM calculations
- 📱 **Offline Support**: Full functionality without internet connection
- 🔄 **Real-time Sync**: Automatic data synchronization across devices
- 🎯 **Custom Routines**: Create and manage personalized workout templates
- 📈 **Performance Insights**: Plateau detection and personal best tracking

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and App Router
- **UI**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (Auth, Database, Realtime)
- **Database**: PostgreSQL with Row Level Security
- **State Management**: Zustand
- **Validation**: Zod
- **Offline Storage**: IndexedDB via Dexie.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd swot-workout-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── workout/        # Workout logging components
│   ├── analytics/      # Analytics and charts
│   ├── routines/       # Routine management
│   ├── shared/         # Shared/common components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
├── services/           # API and business logic
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Database Setup

The application uses Supabase for backend services. You'll need to:

1. Create a new Supabase project
2. Set up the database schema (SQL migrations will be provided)
3. Configure Row Level Security policies
4. Enable real-time subscriptions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

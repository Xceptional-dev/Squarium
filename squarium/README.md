# Squarium - Perplexity for Founders

A conversational search engine that extracts and ranks validated startup problems from Product Hunt discussions using AI.

## Features

- 🚀 **Daily Product Hunt ingestion** - Automated data collection via cron jobs
- 🤖 **AI-powered problem extraction** - Gemini API identifies real startup problems
- 🔍 **Smart search & filtering** - Find problems by category, confidence, and recency
- 📊 **Problem ranking** - Algorithmic scoring based on mentions, confidence, and recency
- 🔐 **Authentication** - Supabase Auth with Google OAuth
- 📱 **Mobile-first design** - Responsive UI built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth
- **AI**: Gemini API
- **Deployment**: Vercel
- **Scheduling**: Vercel Cron Jobs

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Product Hunt API access
- Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/squarium.git
cd squarium
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your API keys and database URLs in `.env.local`.

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `lib/supabase.ts`
   - Enable Row Level Security
   - Configure Google OAuth in Authentication settings

5. Run the development server:
```bash
npm run dev
```

### API Keys Setup

#### Product Hunt API
1. Go to [Product Hunt API](https://api.producthunt.com/v2/docs)
2. Create a developer account
3. Generate an API token
4. Add to `PRODUCT_HUNT_API_KEY` in your `.env.local`

#### Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `GEMINI_API_KEY` in your `.env.local`

#### Supabase
1. Create a new project at [Supabase](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Get your service role key (keep this secret!)
4. Add all three to your `.env.local`

### Deployment

1. Deploy to Vercel:
```bash
vercel deploy
```

2. Set up environment variables in Vercel dashboard

3. Configure the cron job:
   - The `vercel.json` file already includes the cron configuration
   - Set a secure `CRON_SECRET` environment variable
   - The cron job runs daily at 6 AM UTC

## Database Schema

The app uses four main tables:
- `products` - Product Hunt launches
- `comments` - Comments from Product Hunt
- `problems` - AI-extracted problems with embeddings
- `problem_clusters` - Grouped and ranked problems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
```

## 🎉 Complete MVP Ready!

Your Squarium MVP is now complete with:

✅ **Full-stack Next.js 14 app** with TypeScript
✅ **Automated data pipeline** from Product Hunt
✅ **AI problem extraction** using Gemini API  
✅ **Smart clustering and ranking** algorithm
✅ **Search and filtering** capabilities
✅ **Authentication system** with Supabase
✅ **Responsive UI** with Tailwind CSS
✅ **Production deployment** ready for Vercel
✅ **Scheduled data ingestion** with cron jobs
✅ **Complete documentation** and setup instructions

The MVP focuses on the core value proposition: discovering validated startup problems from real founder discussions. You can deploy this immediately and start collecting data!

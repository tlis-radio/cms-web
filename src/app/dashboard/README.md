# Dashboard - Analytics Dashboard

## Overview

This is a client-side only dashboard for viewing analytics and statistics. All data is fetched directly from Directus on the client side using authenticated requests.

## Features

### Authentication
- Login at `/dashboard/login`
- Cookie-based authentication with 1-day TTL
- Protected routes - redirects to login if not authenticated
- All routes under `/dashboard` (except login) require authentication

### Routes

#### `/dashboard`
Main dashboard showing:
- Total shows count
- Total unique listeners count
- Stream listeners count
- Track shares count
- Live stream listeners graph (last 24 hours) - only shown if data exists
- Quick links to all sections

#### `/dashboard/stream-listeners`
Stream listeners analytics with:
- Total listener records count
- Interactive time range selector (1 hour, 24 hours, 7 days, 30 days, all time)
- Line graph showing concurrent listeners over time
- Data aggregated using MAX values per time bucket:
  - 1 hour: sampled each minute
  - 24 hours: max from every 30 minutes
  - 7 days: max from every hour
  - 30 days: max from every 4 hours
  - All time: max from every day
- Recent activity table showing latest 50 records

#### `/dashboard/track-shares`
Track shares analytics with:
- Total shares count
- Unique episodes shared
- Interactive time range selector (24 hours, 7 days, 30 days, all time)
- Line graph showing shares over time
- Top 10 most shared episodes
- Recent shares table with episode details (latest 50)

#### `/dashboard/shows`
Shows listing with:
- Filter by active/archived/digital
- All shows displayed with cover images
- Episode count for each show

#### `/dashboard/shows/[slug]`
Individual show page with:
- Show details and cover image
- List of all episodes
- Click any episode to view analytics

#### `/dashboard/shows/[slug]/[episodeId]`
Episode analytics page with:
- **Summary statistics**: Track views, stream listens, shares, sessions
- **Engagement Over Time chart**: Line graph showing track_views, stream_listens, and track_shares in 3 different colors
- **Listening Sessions chart**: Line graph showing listening sessions and stream sessions in 2 colors
- **Individual listeners list**: All listeners with properly calculated duration based on:
  - MP3 track length
  - 15-second sample rate bitmap
  - Clickable to view user detail

#### `/dashboard/users/[id]`
User listening history showing:
- All episodes listened to by this user
- Duration and retention/completion percentage for each session
- Total listening time
- Average completion rate

## Data Sources

The dashboard fetches from the following Directus collections:
- `Shows` - Show information
- `Episodes` - Episode information
- `track_views` - Episode view events
- `stream_listens` - Stream listening events
- `track_shares` - Episode share events
- `ListeningSessions` - Detailed listening sessions with progress bitmap
- `ListeningSessionsStream` - Stream listening sessions

## Listening Duration Calculation

The system calculates listening duration from a bitmap stored in `ListeningSessions`:
- Each bit represents 15 seconds of audio
- The bitmap tracks which segments were listened to
- Duration = number of listened segments × 15 seconds
- Progress = (listened segments / total segments) × 100%

## Technical Details

### Client-Side Only
- **No server-side rendering** for dashboard routes
- All Directus requests made from browser using cookie authentication
- No API routes for dashboard data

### Authentication Flow
1. User logs in at `/dashboard/login`
2. Credentials sent to Directus authentication endpoint
3. Token stored in cookie with 1-day max age
4. Token automatically included in subsequent Directus requests
5. Protected routes check for cookie before rendering

### SEO
- `robots: noindex, nofollow` on dashboard layout
- No dashboard routes in sitemap
- Dashboard is completely hidden from search engines

## Libraries

### Client Libraries
- `DashboardService` - Main service class for fetching data
  - Shows and episodes
  - Analytics and statistics
  - User sessions
  - Duration calculation from bitmap

### Context
- `DashboardAuthContext` - Authentication state and login/logout functions
- Provides authenticated Directus client to all components

### Components
- `AuthGuard` - Protects routes, redirects to login if not authenticated
- Charts using `recharts` library for data visualization

## Usage

1. Navigate to `/dashboard/login`
2. Enter Directus credentials
3. Browse shows and analytics
4. Click any episode to see detailed analytics
5. Click any listener to see their full listening history

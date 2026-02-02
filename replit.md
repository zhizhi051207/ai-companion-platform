# AI Companion Platform

## Overview
A warm, friendly AI companion web platform where users can register, log in, and have meaningful conversations with an AI assistant. The platform features a beautiful, cozy interface with support for multiple conversations per user and dark/light themes.

## Current State
- Fully functional AI chat application with user authentication
- Supabase PostgreSQL database for user, conversation, and message persistence
- User registration, login, and logout functionality
- Session-based authentication with secure cookie management
- Each user sees only their own conversations (multi-user support)
- Real-time streaming responses using Server-Sent Events (SSE)
- Dark/light theme toggle
- Auto-generated conversation titles based on first message

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS with warm orange/amber color theme
- **State Management**: TanStack Query for server state
- **Routing**: Wouter with protected routes
- **UI Components**: Shadcn/ui

### Backend (Express + TypeScript)
- **Server**: Express.js
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Session Storage**: connect-pg-simple storing sessions in Supabase
- **Password Hashing**: bcryptjs
- **AI Integration**: OpenAI (via Replit AI Integrations)
- **Model**: GPT-5.2 with companion personality system prompt

### Key Files
- `client/src/pages/chat.tsx` - Main chat page with sidebar and message area
- `client/src/pages/auth.tsx` - Login and registration page
- `client/src/hooks/use-auth.ts` - Authentication hook for user state
- `client/src/components/` - React components (ChatSidebar, ChatInput, MessageBubble, etc.)
- `server/auth.ts` - Authentication routes (login, register, logout)
- `server/index.ts` - Express server setup with session configuration
- `server/routes.ts` - API route registration
- `server/replit_integrations/chat/routes.ts` - Chat API routes with auth middleware
- `server/replit_integrations/chat/storage.ts` - Chat data storage operations
- `shared/schema.ts` - Database schema (users, conversations, messages)

### Database Schema
- **users**: id (serial), username, email, password_hash, created_at
- **conversations**: id (serial), title, user_id (references users), created_at
- **messages**: id (serial), conversation_id (references conversations), role, content, created_at

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current authenticated user

#### Conversations (Protected)
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/:id` - Get conversation with messages (ownership verified)
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations/:id` - Delete conversation (ownership verified)
- `POST /api/conversations/:id/messages` - Send message and get streaming AI response

## Security Features
- Password hashing with bcryptjs (10 salt rounds)
- Session-based authentication with secure cookies
- IDOR protection: users can only access their own conversations
- Cookie settings: secure in production, httpOnly, sameSite configured
- Protected routes redirect unauthenticated users to /auth

## Development

### Running the App
```bash
npm run dev
```

### Database
```bash
npm run db:push  # Push schema changes to database
```

### Environment Variables
- `SESSION_SECRET` - Secret for session signing
- `SUPABASE_DATABASE_URL` - Supabase connection pooling URL
- `SUPABASE_DIRECT_URL` - Direct database connection for migrations

## User Preferences
- Warm, cozy color theme (orange/amber tones)
- Modern, clean interface design
- Friendly, conversational AI personality

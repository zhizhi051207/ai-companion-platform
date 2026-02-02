# AI Companion Platform

## Overview
A warm, friendly AI companion web platform where users can have meaningful conversations with an AI assistant. The platform features a beautiful, cozy interface with support for multiple conversations and dark/light themes.

## Current State
- Fully functional AI chat application
- PostgreSQL database for conversation and message persistence
- Real-time streaming responses using Server-Sent Events (SSE)
- Dark/light theme toggle
- Auto-generated conversation titles based on first message

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS with warm orange/amber color theme
- **State Management**: TanStack Query for server state
- **Routing**: Wouter
- **UI Components**: Shadcn/ui

### Backend (Express + TypeScript)
- **Server**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI (via Replit AI Integrations)
- **Model**: GPT-5.2 with companion personality system prompt

### Key Files
- `client/src/pages/chat.tsx` - Main chat page with sidebar and message area
- `client/src/components/` - React components (ChatSidebar, ChatInput, MessageBubble, etc.)
- `server/routes.ts` - API route registration
- `server/replit_integrations/chat/` - Chat API routes and storage
- `shared/schema.ts` - Database schema (conversations, messages)

### API Endpoints
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/:id` - Get conversation with messages
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `POST /api/conversations/:id/messages` - Send message and get streaming AI response

## Development

### Running the App
```bash
npm run dev
```

### Database
```bash
npm run db:push  # Push schema changes to database
```

## User Preferences
- Warm, cozy color theme (orange/amber tones)
- Modern, clean interface design
- Friendly, conversational AI personality

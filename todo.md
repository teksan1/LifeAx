# LifeAx - Project TODO

## Phase 1: Architecture & Planning
- [x] Define database schema (users, conversations, tasks, calendar events, notifications)
- [x] Plan API procedures structure
- [x] Design brutalist UI component system
- [x] Plan notification system architecture

## Phase 2: Database Schema & Models
- [x] Create users table (already exists)
- [x] Create conversations table for chat history
- [x] Create messages table for individual messages
- [x] Create tasks table with priorities and due dates
- [x] Create calendar_events table
- [x] Create notifications table
- [x] Create habits table for tracking and analysis
- [x] Create recommendations table for AI-generated insights
- [x] Run database migrations (pnpm db:push)

## Phase 3: Backend API Procedures
- [x] Create chat procedures (createConversation, addMessage, getConversationHistory)
- [x] Create task procedures (createTask, updateTask, deleteTask, listTasks, completeTask)
- [x] Create calendar procedures (createEvent, updateEvent, deleteEvent, listEvents)
- [x] Create notification procedures (createNotification, listNotifications, markAsRead)
- [x] Create AI recommendation procedures (generateRecommendations, getHabitAnalysis)
- [x] Integrate LLM for chat streaming responses
- [x] Add error handling and validation

## Phase 4: Frontend Design System & Layout
- [x] Configure brutalist design tokens (bold fonts, high contrast colors, raw geometry)
- [x] Update global CSS with brutalist aesthetic (index.css)
- [x] Create DashboardLayout component with sidebar navigation
- [x] Create brutalist button, card, and form components
- [x] Create navigation menu for Chat, Calendar, Tasks
- [x] Implement responsive design for mobile/tablet/desktop
- [x] Set up theme provider with dark/light options

## Phase 5: AI Chat Interface
- [x] Create ChatPage component with message display
- [x] Implement message input with streaming response display
- [x] Add conversation history sidebar
- [x] Create new conversation functionality
- [x] Implement message editing and deletion
- [x] Add markdown rendering for AI responses
- [x] Test streaming responses with LLM

## Phase 6: Calendar & Task Management
- [x] Create CalendarPage with month/week/day views
- [x] Implement event creation and editing modals
- [x] Create TasksPage with list and kanban views
- [x] Implement task creation, editing, and completion
- [x] Add priority levels and due date pickers
- [x] Add task filtering and sorting
- [x] Implement drag-and-drop for task organization

## Phase 7: Notifications & AI Recommendations
- [x] Create notification center component
- [x] Implement real-time notification display
- [x] Set up reminder system for tasks and events
- [x] Create AI recommendation engine
- [x] Generate habit analysis reports
- [x] Create productivity insights dashboard
- [x] Implement notification preferences

## Phase 8: Testing & Optimization
- [x] Write vitest tests for API procedures
- [x] Test responsive design across devices
- [x] Test AI chat streaming functionality
- [ ] Performance optimization
- [ ] Accessibility review
- [ ] Cross-browser testing

## Phase 9: Static Webpage Presentation
- [x] Create interactive demo/showcase webpage
- [x] Add feature highlights and screenshots
- [x] Include analytics visualizations
- [x] Add call-to-action buttons
- [x] Ensure responsive design

## Phase 10: GitHub & Delivery
- [x] Push code to GitHub (teksan1/LifeAx main branch)
- [x] Create comprehensive README
- [ ] Document API procedures
- [ ] Document deployment instructions
- [ ] Final testing and validation


## Phase 11: Enhanced GUI & Full Features
- [x] Enhance Home page with feature showcase and quick access
- [x] Complete Chat with better message formatting and export
- [x] Add Calendar week/day views and event details modal
- [x] Implement Tasks kanban board view and bulk operations
- [x] Build Notifications with filtering and categories
- [x] Create Habits tracker with streak visualization
- [x] Add User Profile and Settings pages
- [x] Implement error boundaries and loading states
- [x] Add toast notifications for user feedback
- [x] Create empty states and onboarding flow
- [x] Optimize performance and responsive design
- [x] Push final updates to GitHub


## Phase 12: AI Chatbot Emotional Intelligence
- [x] Add sentiment analysis to detect stress levels
- [x] Implement risk assessment for user decisions
- [x] Create decision intervention system
- [x] Add conversation context memory
- [x] Build emotional support responses
- [x] Implement warning system for risky decisions
- [x] Add stress level indicators in chat

## Phase 13: Meal Planning Feature
- [x] Create meal planning database schema
- [x] Build meal planning backend procedures
- [x] Create meal planning frontend page
- [x] Implement AI meal plan generation
- [x] Add shopping list generation with pricing
- [x] Integrate Coles/Woolworths pricing data
- [x] Add recipe database with photos
- [x] Implement cooking instructions and ingredients
- [x] Add customization options for dietary preferences
- [x] Implement online shopping integration
- [x] Add click and collect functionality
- [x] Create meal prep calendar view
- [x] Add nutritional information display
- [x] Implement shopping list export/print
- [x] Test all meal planning features
- [x] Push final updates to GitHub


## Phase 14: Meal Preparation Page & Tile
- [x] Create meal prep database schema and helpers
- [x] Build meal prep backend procedures
- [x] Create MealPrep.tsx page component
- [x] Add meal prep tile to Home page
- [x] Implement prep schedule view
- [x] Add ingredient tracking interface
- [x] Create prep progress tracking
- [x] Add timer and notifications for prep sessions
- [x] Implement recipe cards with instructions
- [x] Add photo gallery for completed meals
- [x] Create prep checklist functionality
- [x] Add nutritional summary display
- [x] Test meal prep features
- [x] Update navigation and routes
- [ ] Push updates to GitHub

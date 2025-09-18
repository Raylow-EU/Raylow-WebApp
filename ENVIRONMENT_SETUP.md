# Environment Setup

## Backend Environment Variables

Add these to your `/backend/.env` file:

```bash
# Existing Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NEW: OpenAI Configuration (for LLM assessment analysis)
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Setup Instructions

1. **Get OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Add it to your `.env` file as `OPENAI_API_KEY=sk-...`

2. **Install New Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Update Database Schema:**
   - Run the SQL commands in `database_updates.sql` in your Supabase SQL editor

4. **Test LLM Integration:**
   - Complete an assessment 
   - Check the `initial_assessments` table for new LLM analysis columns
   - Check server logs for LLM processing messages

## Features Enabled

- ✅ LLM analysis of assessment responses
- ✅ Automatic regulation detection and categorization  
- ✅ Personalized homepage recommendations
- ✅ Support status for each regulation (supported vs coming soon)
- ✅ Fallback to rule-based analysis if LLM fails

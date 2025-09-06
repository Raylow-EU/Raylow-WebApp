import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// REAL Supabase onboarding endpoint that stores data in database
app.post('/api/onboarding/basic', async (req, res) => {
  try {
    console.log('=== REAL SUPABASE ONBOARDING ===');
    console.log('Request body:', req.body);
    
    const { userId, fullName, role, companyName, sector, employeesEstimate } = req.body;

    // Basic validation
    if (!userId || !fullName || !companyName) {
      return res.status(400).json({ 
        error: 'User ID, full name, and company name are required' 
      });
    }

    // First, check if the company already exists
    const { data: existingCompany, error: companyCheckError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    let companyId;

    if (companyCheckError && companyCheckError.code !== 'PGRST116') {
      console.error('Error checking company:', companyCheckError);
      return res.status(500).json({ error: 'Failed to check company existence' });
    }

    if (existingCompany) {
      console.log('Company already exists:', existingCompany.id);
      companyId = existingCompany.id;
    } else {
      // Create new company
      console.log('Creating new company...');
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: companyName,
          sector: sector || null,
          employees_estimate: employeesEstimate ? parseInt(employeesEstimate.split('-')[0]) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        return res.status(500).json({ error: 'Failed to create company' });
      }

      console.log('Company created:', newCompany.id);
      companyId = newCompany.id;
    }

    // Get user email from Supabase Auth
    console.log('Getting user email from auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser?.user?.email) {
      console.error('Error getting user from auth:', authError);
      return res.status(500).json({ error: 'Failed to get user information' });
    }

    // Upsert user profile with company info and mark basic onboarding as complete
    console.log('Upserting user profile...');
    const { data: upsertedUser, error: userUpsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: authUser.user.email,
        full_name: fullName,
        company_id: companyId,
        company_role: role || 'owner',
        onboarding_basic_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userUpsertError) {
      console.error('Error upserting user:', userUpsertError);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    console.log('User updated successfully:', upsertedUser.id);

    // Return success response
    const response = {
      message: 'Basic onboarding completed successfully',
      user: {
        id: upsertedUser.id,
        fullName: upsertedUser.full_name,
        companyId: upsertedUser.company_id,
        companyRole: upsertedUser.company_role,
        onboardingBasicCompleted: !!upsertedUser.onboarding_basic_completed_at
      },
      company: {
        id: companyId,
        name: companyName,
        sector: sector,
        employeesEstimate: employeesEstimate
      }
    };

    console.log('SUCCESS: Data stored in database!');
    res.status(200).json(response);

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get onboarding status
app.get('/api/onboarding/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        company_id,
        company_role,
        onboarding_basic_completed_at,
        companies (
          id,
          name,
          sector,
          employees_estimate
        )
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: userData.id,
        fullName: userData.full_name,
        companyId: userData.company_id,
        companyRole: userData.company_role,
        onboardingBasicCompleted: !!userData.onboarding_basic_completed_at
      },
      company: userData.companies ? {
        id: userData.companies.id,
        name: userData.companies.name,
        sector: userData.companies.sector,
        employeesEstimate: userData.companies.employees_estimate
      } : null
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 REAL Supabase server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.SUPABASE_URL}`);
  console.log(`🔗 Onboarding endpoint: http://localhost:${PORT}/api/onboarding/basic`);
  console.log(`✅ Ready to store real data in Supabase!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close();
});
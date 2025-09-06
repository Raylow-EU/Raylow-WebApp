import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Basic onboarding endpoint
router.post('/basic', async (req, res) => {
  try {
    const { userId, fullName, role, companyName, sector, employeesEstimate } = req.body;

    // Basic validation
    if (!userId || !fullName || !companyName) {
      return res.status(400).json({ 
        error: 'User ID, full name, and company name are required' 
      });
    }

    // Start transaction-like operations
    let companyId;

    // First, create or find the company
    const { data: existingCompany, error: companyCheckError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    if (companyCheckError && companyCheckError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to check company existence' });
    }

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      // Create new company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: companyName,
          sector: sector || null,
          employees_estimate: employeesEstimate || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (companyError) {
        return res.status(500).json({ error: 'Failed to create company' });
      }

      companyId = newCompany.id;
    }

    // Update user profile with company info and mark basic onboarding as complete
    const { data: updatedUser, error: userUpdateError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        company_id: companyId,
        company_role: role || 'owner', // Default to owner for company creator
        onboarding_basic_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (userUpdateError) {
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    // Return success response
    res.status(200).json({
      message: 'Basic onboarding completed successfully',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        companyId: updatedUser.company_id,
        companyRole: updatedUser.company_role,
        onboardingBasicCompleted: !!updatedUser.onboarding_basic_completed_at
      },
      company: {
        id: companyId,
        name: companyName,
        sector: sector,
        employeesEstimate: employeesEstimate
      }
    });

  } catch (error) {
    console.error('Basic onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get onboarding status
router.get('/status/:userId', async (req, res) => {
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
    console.error('Onboarding status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
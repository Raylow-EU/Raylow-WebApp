import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user settings with upsert logic (create if doesn't exist)
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
      console.error('Error fetching user settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    // If no settings found, create default settings
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id,
          email_updates: true,
          regulation_alerts: true,
          deadline_reminders: true,
          weekly_digest: false,
          profile_visibility: true,
          data_sharing: false,
          analytics_opt_in: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating default settings:', createError);
        return res.status(500).json({ error: 'Failed to create default settings' });
      }

      return res.json(newSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error in GET /settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const { user_id } = req.query;
    const settingsData = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Remove any fields that shouldn't be updated
    const allowedFields = [
      'first_name',
      'last_name',
      'company_size',
      'industry',
      'email_updates',
      'regulation_alerts',
      'deadline_reminders',
      'weekly_digest',
      'profile_visibility',
      'data_sharing',
      'analytics_opt_in'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (settingsData.hasOwnProperty(field)) {
        updateData[field] = settingsData[field];
      }
    });

    updateData.updated_at = new Date().toISOString();

    // Upsert the settings
    const { data: updatedSettings, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id,
        ...updateData
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error in PUT /settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
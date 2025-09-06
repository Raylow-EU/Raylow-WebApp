import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// More permissive CORS for testing
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Test endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple onboarding endpoint for testing
app.post('/api/onboarding/basic', (req, res) => {
  console.log('=== ONBOARDING REQUEST ===');
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  
  // Mock successful response
  const response = {
    message: 'Basic onboarding completed successfully',
    user: {
      id: req.body.userId,
      fullName: req.body.fullName,
      companyRole: req.body.role,
      onboardingBasicCompleted: true
    }
  };
  
  console.log('Sending response:', response);
  res.json(response);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Onboarding endpoint: http://localhost:${PORT}/api/onboarding/basic`);
});

// Keep the server running
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close();
});
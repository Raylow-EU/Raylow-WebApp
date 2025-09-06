import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { completeBasicOnboarding } from '../../store/thunks/authThunks';
import './BasicOnboardingForm.css';

const BasicOnboardingForm = ({ onComplete }) => {
  const { user, loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    role: 'owner',
    companyName: '',
    sector: '',
    employeesEstimate: ''
  });

  const sectorOptions = [
    { value: '', label: 'Select sector...' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'education', label: 'Education' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'construction', label: 'Construction' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'energy', label: 'Energy' },
    { value: 'other', label: 'Other' }
  ];

  const employeeOptions = [
    { value: '', label: 'Select company size...' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-100', label: '51-100 employees' },
    { value: '101-250', label: '101-250 employees' },
    { value: '251-500', label: '251-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  const roleOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Administrator' },
    { value: 'member', label: 'Team Member' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.companyName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await dispatch(completeBasicOnboarding({
        userId: user.uid,
        fullName: formData.fullName,
        role: formData.role,
        companyName: formData.companyName,
        sector: formData.sector || null,
        employeesEstimate: formData.employeesEstimate || null
      }));

      if (completeBasicOnboarding.fulfilled.match(result)) {
        toast.success('Onboarding completed successfully!');
        
        // Call the completion callback
        if (onComplete) {
          onComplete();
        }
      } else {
        toast.error(result.payload || 'Failed to complete onboarding');
      }

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Welcome to Raylow!</h1>
          <p>Let's get you set up with your account and company information.</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="fullName">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Your Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Company Information</h2>
            
            <div className="form-group">
              <label htmlFor="companyName">
                Company Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sector">Industry Sector</label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
              >
                {sectorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="employeesEstimate">Company Size</label>
              <select
                id="employeesEstimate"
                name="employeesEstimate"
                value={formData.employeesEstimate}
                onChange={handleInputChange}
              >
                {employeeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Setting up your account...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicOnboardingForm;
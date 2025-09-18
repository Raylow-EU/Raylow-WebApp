import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLeaf, FaShieldAlt, FaBrain, FaChartLine, FaDatabase, FaRobot, FaExclamationTriangle } from 'react-icons/fa';
import './RegulationSelector.css';

// Mapping from backend regulation codes to frontend regulation IDs
const REGULATION_CODE_MAPPING = {
  'GDPR': 'gdpr',
  'CSRD': 'csrd', 
  'AI_ACT': 'ai-act',
  'AI Act': 'ai-act',
  'NIS2': 'nis2',
  'DSA': 'dsa',
  'DMA': 'dma',
  'MiCA': 'mica',
  'PSD2': 'psd2',
  'MiFID': 'mifid'
};

const AVAILABLE_REGULATIONS = [
  {
    id: 'csrd',
    name: 'Corporate Sustainability Reporting Directive',
    shortName: 'CSRD',
    description: 'EU directive requiring companies to report on sustainability matters, including environmental, social and governance factors.',
    category: 'environmental',
    complexity: 'High',
    estimatedTime: '4-6 weeks',
    icon: FaLeaf,
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    lightBg: '#f8fffe',
    routes: {
      welcome: '/dashboard/csrd',
      assessment: '/dashboard/csrd/flashcards',
      dashboard: '/dashboard/csrd/dashboard',
    }
  },
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation',
    shortName: 'GDPR',
    description: 'EU regulation on data protection and privacy for individuals within the European Union and European Economic Area.',
    category: 'privacy',
    complexity: 'Medium',
    estimatedTime: '2-4 weeks',
    icon: FaShieldAlt,
    primaryColor: '#0ea5e9',
    secondaryColor: '#0284c7',
    lightBg: '#f0f9ff',
    routes: {
      welcome: '/dashboard/gdpr',
      assessment: '/dashboard/gdpr/flashcards',
      dashboard: '/dashboard/gdpr/dashboard',
    }
  },
  {
    id: 'ai-act',
    name: 'Artificial Intelligence Act',
    shortName: 'AI Act',
    description: 'EU regulation establishing rules for artificial intelligence systems to ensure safety, transparency and fundamental rights.',
    category: 'technology',
    complexity: 'Medium',
    estimatedTime: '3-5 weeks',
    icon: FaBrain,
    primaryColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    lightBg: '#faf5ff',
    routes: {
      welcome: '/dashboard/ai-act',
      assessment: '/dashboard/ai-act/flashcards',
      dashboard: '/dashboard/ai-act/dashboard',
    }
  }
];

const RegulationSelector = ({ mode = 'selection' }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [selectedRegulations, setSelectedRegulations] = useState(() => {
    // Load from localStorage or default to empty
    const saved = localStorage.getItem('user_regulations');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Personalization state
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showAllRegulations, setShowAllRegulations] = useState(false);

  // Fetch personalized recommendations on component mount
  useEffect(() => {
    const fetchPersonalizedRecommendations = async () => {
      if (!user?.uid) return;

      try {
        setLoadingRecommendations(true);
        console.log(`🔍 Fetching recommendations for user: ${user.uid}`);
        
        const response = await fetch(`http://localhost:3001/api/assessments/user/${user.uid}/recommendations`);
        console.log(`🔍 Response status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`❌ API returned status ${response.status}`);
          const errorText = await response.text();
          console.error(`❌ Error response: ${errorText}`);
          return;
        }

        const data = await response.json();
        setPersonalizedRecommendations(data);
        console.log('📊 Personalized recommendations loaded:', data);
      } catch (error) {
        console.error('❌ Error fetching personalized recommendations:', error);
        console.error('❌ This might indicate the backend is not running or the endpoint doesn\'t exist');
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchPersonalizedRecommendations();
  }, [user?.uid]);

  // Get unique categories
  const categories = [...new Set(AVAILABLE_REGULATIONS.map(r => r.category))];

  // Helper function to convert regulation codes to frontend regulation objects
  const getRegulationById = (code) => {
    const frontendId = REGULATION_CODE_MAPPING[code];
    return AVAILABLE_REGULATIONS.find(r => r.id === frontendId);
  };

  // Get personalized regulation recommendations
  const getPersonalizedRegulations = () => {
    if (!personalizedRecommendations?.hasCompletedAssessment) {
      return { supported: [], unsupported: [] };
    }

    const supported = (personalizedRecommendations.supportedRegulations || [])
      .map(getRegulationById)
      .filter(Boolean);

    const unsupported = (personalizedRecommendations.unsupportedRegulations || [])
      .map(code => ({
        code,
        name: code,
        shortName: code,
        description: `${code} regulation - support coming soon`,
        category: 'other',
        complexity: 'TBD',
        estimatedTime: 'TBD',
        icon: FaExclamationTriangle,
        primaryColor: '#94a3b8',
        secondaryColor: '#64748b',
        lightBg: '#f8fafc',
        comingSoon: true
      }));

    return { supported, unsupported };
  };

  const getFilteredRegulations = () => {
    if (selectedCategory === 'all') {
      return AVAILABLE_REGULATIONS;
    }
    return AVAILABLE_REGULATIONS.filter(r => r.category === selectedCategory);
  };

  const handleAddRegulation = async (regulationId) => {
    try {
      setLoading(true);

      // Check if user already has this regulation
      if (selectedRegulations.includes(regulationId)) {
        toast.info('Regulation already added to your workspace');
        return;
      }

      const newSelected = [...selectedRegulations, regulationId];
      setSelectedRegulations(newSelected);
      localStorage.setItem('user_regulations', JSON.stringify(newSelected));

      toast.success('Regulation added successfully!');

      // Navigate to the regulation welcome page
      const regulation = AVAILABLE_REGULATIONS.find(r => r.id === regulationId);
      if (regulation) {
        navigate(regulation.routes.welcome);
      }
    } catch (error) {
      console.error('Error adding regulation:', error);
      toast.error('Failed to add regulation');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRegulation = (regulationId) => {
    const regulation = AVAILABLE_REGULATIONS.find(r => r.id === regulationId);
    if (regulation) {
      navigate(regulation.routes.welcome);
    }
  };

  const handleRemoveRegulation = (regulationId) => {
    const newSelected = selectedRegulations.filter(id => id !== regulationId);
    setSelectedRegulations(newSelected);
    localStorage.setItem('user_regulations', JSON.stringify(newSelected));
    toast.success('Regulation removed from workspace');
  };

  const filteredRegulations = getFilteredRegulations();
  const activeRegulations = AVAILABLE_REGULATIONS.filter(r => selectedRegulations.includes(r.id));
  const availableRegulations = filteredRegulations.filter(r => !selectedRegulations.includes(r.id));
  
  // Get personalized recommendations
  const personalizedRegs = getPersonalizedRegulations();
  const hasPersonalizedRecommendations = personalizedRecommendations?.hasCompletedAssessment;

  // Determine what to show based on personalization
  const showPersonalizedView = hasPersonalizedRecommendations && !showAllRegulations;
  const personalizedSupportedAvailable = personalizedRegs.supported.filter(r => !selectedRegulations.includes(r.id));
  const personalizedUnsupportedAvailable = personalizedRegs.unsupported;

  return (
    <div className="regulation-selector">
      {/* Personalized Assessment Results */}
      {loadingRecommendations && (
        <div className="loading-recommendations">
          <div className="loading-spinner"></div>
          <p>Loading your personalized recommendations...</p>
        </div>
      )}

      {hasPersonalizedRecommendations && (
        <div className="personalized-section">
          <div className="personalized-header">
            <div className="personalized-content">
              <h1>Your Personalized Compliance Dashboard</h1>
              <div className="assessment-summary">
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-number">{personalizedRecommendations.applicableRegulations?.length || 0}</span>
                    <span className="stat-label">Regulations Apply</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{personalizedRegs.supported.length}</span>
                    <span className="stat-label">We Can Help With</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{personalizedRegs.unsupported.length}</span>
                    <span className="stat-label">Coming Soon</span>
                  </div>
                </div>
                {personalizedRecommendations.summary && (
                  <p className="assessment-summary-text">{personalizedRecommendations.summary}</p>
                )}
              </div>
              
              <div className="view-toggle">
                <button
                  className={!showAllRegulations ? 'active' : ''}
                  onClick={() => setShowAllRegulations(false)}
                >
                  Your Regulations
                </button>
                <button
                  className={showAllRegulations ? 'active' : ''}
                  onClick={() => setShowAllRegulations(true)}
                >
                  All Regulations
                </button>
              </div>
            </div>
          </div>

          {showPersonalizedView && (
            <>
              {/* Supported Regulations (We Can Help) */}
              {personalizedSupportedAvailable.length > 0 && (
                <div className="regulations-section personalized">
                  <h3>📋 Regulations You Need to Comply With</h3>
                  <p className="section-description">
                    Based on your assessment, these regulations apply to your business and we can help you comply with them.
                  </p>
                  <div className="regulations-grid">
                    {personalizedSupportedAvailable.map((regulation) => (
                      <div key={regulation.id} className="regulation-card recommended">
                        <div className="recommended-badge">✨ Recommended for You</div>
                        <div className="regulation-header">
                          <div
                            className="regulation-icon"
                            style={{
                              background: `linear-gradient(135deg, ${regulation.primaryColor} 0%, ${regulation.secondaryColor} 100%)`
                            }}
                          >
                            <regulation.icon />
                          </div>
                          <div className="regulation-info">
                            <h4>{regulation.shortName}</h4>
                            <p className="regulation-complexity">{regulation.complexity} • {regulation.estimatedTime}</p>
                          </div>
                        </div>
                        <p className="regulation-description">{regulation.description}</p>

                        <div className="regulation-actions">
                          <button
                            className="action-btn primary"
                            style={{
                              background: `linear-gradient(135deg, ${regulation.primaryColor} 0%, ${regulation.secondaryColor} 100%)`,
                              boxShadow: `0 4px 12px ${regulation.primaryColor}30`
                            }}
                            onClick={() => handleAddRegulation(regulation.id)}
                            disabled={loading}
                          >
                            {loading ? 'Adding...' : 'Add to Workspace'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unsupported Regulations (Coming Soon) */}
              {personalizedUnsupportedAvailable.length > 0 && (
                <div className="regulations-section unsupported">
                  <h3>⏳ Additional Regulations (Coming Soon)</h3>
                  <p className="section-description">
                    These regulations also apply to your business, but we're still building support for them.
                  </p>
                  <div className="regulations-grid">
                    {personalizedUnsupportedAvailable.map((regulation) => (
                      <div key={regulation.code} className="regulation-card coming-soon">
                        <div className="coming-soon-badge">Coming Soon</div>
                        <div className="regulation-header">
                          <div
                            className="regulation-icon"
                            style={{
                              background: `linear-gradient(135deg, ${regulation.primaryColor} 0%, ${regulation.secondaryColor} 100%)`
                            }}
                          >
                            <regulation.icon />
                          </div>
                          <div className="regulation-info">
                            <h4>{regulation.shortName}</h4>
                            <p className="regulation-complexity">{regulation.complexity} • {regulation.estimatedTime}</p>
                          </div>
                        </div>
                        <p className="regulation-description">{regulation.description}</p>

                        <div className="regulation-actions">
                          <button
                            className="action-btn disabled"
                            disabled
                          >
                            Coming Soon
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {personalizedSupportedAvailable.length === 0 && personalizedUnsupportedAvailable.length === 0 && (
                <div className="no-regulations">
                  <p>🎉 You've already added all the regulations that apply to your business!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Welcome Hero Section - Show only if no personalized recommendations or showing all regulations */}
      {(!hasPersonalizedRecommendations || showAllRegulations) && (
        <div className="welcome-hero">
        <div className="welcome-content">
          <h1>Welcome to Raylow</h1>
          <div className="assessment-section">
            <h2>Let's find out what regulations apply to you</h2>
            <p>
              Answer a few quick questions and we'll route you to the exact
              EU regulations that apply to your organisation.
            </p>
            <button className="assessment-cta" onClick={() => navigate('/assessment')}>
              Start Assessment
            </button>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="manual-selection">
            <h3>Choose specific regulations</h3>
            <p>Already know which regulations you need? Select them directly below.</p>
          </div>
        </div>
      </div>

      )}

      {/* Active Regulations Section */}
      {activeRegulations.length > 0 && (
        <div className="regulations-section">
          <h3>Your Active Regulations</h3>
          <div className="regulations-grid">
            {activeRegulations.map((regulation) => (
              <div
                key={regulation.id}
                className="regulation-card active"
                onClick={() => handleSelectRegulation(regulation.id)}
              >
                <div className="regulation-header">
                  <div
                    className="regulation-icon"
                    style={{
                      background: `linear-gradient(135deg, ${regulation.primaryColor} 0%, ${regulation.secondaryColor} 100%)`
                    }}
                  >
                    <regulation.icon />
                  </div>
                  <div className="regulation-info">
                    <h4>{regulation.shortName}</h4>
                    <p className="regulation-complexity">{regulation.complexity} • {regulation.estimatedTime}</p>
                  </div>
                  <div className="regulation-badges">
                    <span className="status-badge status-not-started">
                      ⭕ Ready to Start
                    </span>
                  </div>
                </div>
                <p className="regulation-description">{regulation.description}</p>

                <div className="regulation-actions">
                  <button
                    className="action-btn primary"
                    style={{
                      background: `linear-gradient(135deg, ${regulation.primaryColor} 0%, ${regulation.secondaryColor} 100%)`,
                      boxShadow: `0 4px 12px ${regulation.primaryColor}30`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRegulation(regulation.id);
                    }}
                  >
                    Get Started
                  </button>
                  <button
                    className="action-btn secondary"
                    style={{
                      background: `${regulation.primaryColor}10`,
                      color: regulation.primaryColor,
                      borderColor: `${regulation.primaryColor}20`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRegulation(regulation.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter for Available Regulations - Show only when showing all regulations or no personalized recommendations */}
      {(!hasPersonalizedRecommendations || showAllRegulations) && availableRegulations.length > 0 && (
        <div className="category-filter">
          <h3>Add New Regulations</h3>
          <div className="category-tabs">
            <button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available Regulations - Show only when showing all regulations or no personalized recommendations */}
      {(!hasPersonalizedRecommendations || showAllRegulations) && availableRegulations.length > 0 && (
        <div className="regulations-section">
          <div className="regulations-grid">
            {availableRegulations.map((regulation) => (
              <div key={regulation.id} className="regulation-card available">
                <div className="regulation-header">
                  <div
                    className="regulation-icon"
                    style={{
                      background: `linear-gradient(135deg, ${regulation.primaryColor} 0%, ${regulation.secondaryColor} 100%)`
                    }}
                  >
                    <regulation.icon />
                  </div>
                  <div className="regulation-info">
                    <h4>{regulation.shortName}</h4>
                    <p className="regulation-complexity">{regulation.complexity} • {regulation.estimatedTime}</p>
                  </div>
                </div>
                <p className="regulation-description">{regulation.description}</p>

                <div className="regulation-actions">
                  <button
                    className="action-btn primary"
                    style={{
                      background: `linear-gradient(135deg, ${regulation.primaryColor} 0%, ${regulation.secondaryColor} 100%)`,
                      boxShadow: `0 4px 12px ${regulation.primaryColor}30`
                    }}
                    onClick={() => handleAddRegulation(regulation.id)}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add to Workspace'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Available Regulations - Show only when showing all regulations or no personalized recommendations */}
      {(!hasPersonalizedRecommendations || showAllRegulations) && availableRegulations.length === 0 && activeRegulations.length > 0 && (
        <div className="no-regulations">
          <p>🎉 You've added all available regulations to your workspace!</p>
        </div>
      )}

    </div>
  );
};

export default RegulationSelector;
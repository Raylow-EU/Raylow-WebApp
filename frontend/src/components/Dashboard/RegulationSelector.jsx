import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLeaf, FaShieldAlt, FaBrain, FaChartLine, FaDatabase, FaRobot } from 'react-icons/fa';
import './RegulationSelector.css';

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

  // Get unique categories
  const categories = [...new Set(AVAILABLE_REGULATIONS.map(r => r.category))];

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

  return (
    <div className="regulation-selector">
      <div className="selector-header">
        <h2>Your Compliance Workspace</h2>
        <p>Select and manage the EU regulations that apply to your business.</p>
      </div>

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

      {/* Category Filter for Available Regulations */}
      {availableRegulations.length > 0 && (
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

      {/* Available Regulations */}
      {availableRegulations.length > 0 && (
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

      {/* No Available Regulations */}
      {availableRegulations.length === 0 && activeRegulations.length > 0 && (
        <div className="no-regulations">
          <p>🎉 You've added all available regulations to your workspace!</p>
        </div>
      )}

      {/* First Time Experience */}
      {activeRegulations.length === 0 && (
        <div className="first-time-experience">
          <div className="welcome-message">
            <h3>Welcome to Raylow! 👋</h3>
            <p>To get started, select the EU regulations that apply to your business.
               You can always add or remove regulations later.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationSelector;
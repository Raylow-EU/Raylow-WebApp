/**
 * FrameworkSelector - Component for users to select and manage compliance frameworks
 * Allows switching between different regulations and adding new ones
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getAvailableFrameworks, 
  getFrameworksByCategory 
} from '../../compliance/frameworks/registry';
import { 
  getUserFrameworks, 
  addUserFramework, 
  setUserDefaultFramework,
  getFrameworkStatus
} from '../../compliance/services/complianceService';
import { toast } from 'react-toastify';
import './FrameworkSelector.css';

export default function FrameworkSelector({ 
  onSelect, 
  showModal = false, 
  onClose,
  mode = 'selection' // 'selection' | 'management'
}) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [availableFrameworks, setAvailableFrameworks] = useState([]);
  const [userFrameworks, setUserFrameworks] = useState([]);
  const [frameworkStatuses, setFrameworkStatuses] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadFrameworks();
  }, [user?.uid]);

  const loadFrameworks = async () => {
    try {
      setLoading(true);

      // Get available frameworks
      const available = getAvailableFrameworks();
      setAvailableFrameworks(available);

      // Get user's frameworks
      if (user?.uid) {
        const userFrameworksData = await getUserFrameworks(user.uid);
        setUserFrameworks(userFrameworksData);

        // Get status for each user framework
        const statusPromises = userFrameworksData.map(async (userFramework) => {
          const status = await getFrameworkStatus(user.uid, userFramework.frameworkId);
          return { frameworkId: userFramework.frameworkId, ...status };
        });
        
        const statuses = await Promise.all(statusPromises);
        const statusMap = statuses.reduce((acc, status) => {
          acc[status.frameworkId] = status;
          return acc;
        }, {});
        
        setFrameworkStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error loading frameworks:', error);
      toast.error('Failed to load compliance frameworks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFramework = async (frameworkId) => {
    try {
      setAdding(true);
      
      // Check if user already has this framework
      if (userFrameworks.some(f => f.frameworkId === frameworkId)) {
        toast.info('Framework already added to your account');
        return;
      }

      await addUserFramework(user.uid, frameworkId);
      await loadFrameworks(); // Reload data
      
      toast.success('Framework added successfully!');
      
      // If this is selection mode, navigate to the framework
      if (mode === 'selection' && onSelect) {
        onSelect(frameworkId);
      } else {
        navigate(`/dashboard/compliance/${frameworkId}`);
      }
    } catch (error) {
      console.error('Error adding framework:', error);
      toast.error('Failed to add framework');
    } finally {
      setAdding(false);
    }
  };

  const handleSetDefault = async (frameworkId) => {
    try {
      await setUserDefaultFramework(user.uid, frameworkId);
      await loadFrameworks();
      toast.success('Default framework updated');
    } catch (error) {
      console.error('Error setting default framework:', error);
      toast.error('Failed to update default framework');
    }
  };

  const handleSelectFramework = (frameworkId) => {
    if (onSelect) {
      onSelect(frameworkId);
    } else {
      navigate(`/dashboard/compliance/${frameworkId}`);
    }
    
    if (onClose) {
      onClose();
    }
  };

  // Get frameworks by category
  const getFilteredFrameworks = () => {
    if (selectedCategory === 'all') {
      return availableFrameworks;
    }
    return getFrameworksByCategory(selectedCategory);
  };

  // Get unique categories
  const categories = [...new Set(availableFrameworks.map(f => f.category))];

  const filteredFrameworks = getFilteredFrameworks();
  const userFrameworkIds = userFrameworks.map(f => f.frameworkId);

  if (loading) {
    return (
      <div className="framework-selector-loading">
        <div className="loading-spinner"></div>
        <p>Loading compliance frameworks...</p>
      </div>
    );
  }

  const content = (
    <div className="framework-selector">
      {mode === 'management' && (
        <div className="selector-header">
          <h2>Manage Compliance Frameworks</h2>
          <p>Add new compliance frameworks or switch between your existing ones.</p>
        </div>
      )}

      {/* My Frameworks Section */}
      {userFrameworks.length > 0 && (
        <div className="frameworks-section">
          <h3>Your Active Frameworks</h3>
          <div className="frameworks-grid">
            {userFrameworks.map((userFramework) => {
              const framework = availableFrameworks.find(
                f => f.id === userFramework.frameworkId
              );
              
              if (!framework) return null;
              
              const frameworkStatus = frameworkStatuses[framework.id];
              const statusClass = frameworkStatus?.status || 'not_started';

              return (
                <div 
                  key={framework.id} 
                  className={`framework-card active ${userFramework.isDefault ? 'default' : ''} ${statusClass}`}
                  onClick={() => handleSelectFramework(framework.id)}
                >
                  <div className="framework-header">
                    <div className="framework-icon">{framework.category === 'environmental' ? '🌍' : framework.category === 'privacy' ? '🔒' : '⚖️'}</div>
                    <div className="framework-info">
                      <h4>{framework.name}</h4>
                      <p className="framework-complexity">{framework.complexity} • {framework.estimatedTime}</p>
                    </div>
                    <div className="framework-badges">
                      {userFramework.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                      <span className={`status-badge status-${statusClass}`}>
                        {statusClass === 'completed' ? '✅ Completed' : 
                         statusClass === 'in_progress' ? '🔄 In Progress' : 
                         '⭕ Not Started'}
                      </span>
                    </div>
                  </div>
                  <p className="framework-description">{framework.description}</p>
                  
                  <div className="framework-actions">
                    <button 
                      className="action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFramework(framework.id);
                      }}
                    >
                      {statusClass === 'completed' ? 'View Report' : 
                       statusClass === 'in_progress' ? 'Continue' : 
                       'Start'}
                    </button>
                    {!userFramework.isDefault && (
                      <button 
                        className="action-btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(framework.id);
                        }}
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="category-filter">
          <h3>Add New Frameworks</h3>
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

      {/* Available Frameworks */}
      <div className="frameworks-section">
        <div className="frameworks-grid">
          {filteredFrameworks
            .filter(framework => !userFrameworkIds.includes(framework.id))
            .map((framework) => (
            <div key={framework.id} className="framework-card available">
              <div className="framework-header">
                <div className="framework-icon">{framework.category === 'environmental' ? '🌍' : framework.category === 'privacy' ? '🔒' : '⚖️'}</div>
                <div className="framework-info">
                  <h4>{framework.name}</h4>
                  <p className="framework-complexity">{framework.complexity} • {framework.estimatedTime}</p>
                </div>
              </div>
              <p className="framework-description">{framework.description}</p>
              
              <div className="framework-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => handleAddFramework(framework.id)}
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add Framework'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFrameworks.filter(f => !userFrameworkIds.includes(f.id)).length === 0 && (
          <div className="no-frameworks">
            <p>No additional frameworks available in this category.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Return as modal or inline component
  if (showModal) {
    return (
      <div className="framework-modal-overlay" onClick={onClose}>
        <div className="framework-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Select Compliance Framework</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}
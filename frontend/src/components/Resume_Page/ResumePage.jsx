import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaLeaf, FaShieldAlt, FaBrain, FaDownload, FaEye, FaCalendar, FaFilter, FaSearch } from 'react-icons/fa';
import "./ResumePage.css";

// Mock reports data until Supabase table is created
const mockReports = [
  {
    id: 'rpt_001',
    regulation_id: 'csrd',
    regulation_name: 'Corporate Sustainability Reporting Directive',
    regulation_short_name: 'CSRD',
    title: 'Q3 2024 CSRD Sustainability Report',
    status: 'submitted',
    submitted_at: '2024-09-10T14:30:00Z',
    created_at: '2024-08-15T09:00:00Z',
    file_size: '2.4 MB',
    type: 'pdf',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    icon: FaLeaf
  },
  {
    id: 'rpt_002',
    regulation_id: 'gdpr',
    regulation_name: 'General Data Protection Regulation',
    regulation_short_name: 'GDPR',
    title: 'Annual GDPR Compliance Report 2024',
    status: 'submitted',
    submitted_at: '2024-08-28T16:45:00Z',
    created_at: '2024-08-20T11:30:00Z',
    file_size: '1.8 MB',
    type: 'pdf',
    primaryColor: '#0ea5e9',
    secondaryColor: '#0284c7',
    icon: FaShieldAlt
  },
  {
    id: 'rpt_003',
    regulation_id: 'ai-act',
    regulation_name: 'Artificial Intelligence Act',
    regulation_short_name: 'AI Act',
    title: 'AI Systems Impact Assessment Q2 2024',
    status: 'submitted',
    submitted_at: '2024-07-15T13:20:00Z',
    created_at: '2024-07-01T08:15:00Z',
    file_size: '3.1 MB',
    type: 'pdf',
    primaryColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    icon: FaBrain
  },
  {
    id: 'rpt_004',
    regulation_id: 'csrd',
    regulation_name: 'Corporate Sustainability Reporting Directive',
    regulation_short_name: 'CSRD',
    title: 'Q2 2024 Environmental Impact Report',
    status: 'submitted',
    submitted_at: '2024-06-30T17:00:00Z',
    created_at: '2024-06-10T10:45:00Z',
    file_size: '2.9 MB',
    type: 'pdf',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    icon: FaLeaf
  }
];

const ResumePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegulation, setSelectedRegulation] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Check if this is the reports page
  const isReportsPage = location.pathname.includes('/reports');

  useEffect(() => {
    if (isReportsPage && user) {
      // Simulate API call for reports - replace with actual Supabase integration later
      const fetchReports = async () => {
        setLoading(true);
        try {
          // TODO: Replace with actual Supabase call
          // const { data, error } = await supabase
          //   .from('reports')
          //   .select('*')
          //   .eq('user_id', user.id)
          //   .order('created_at', { ascending: false });

          // For now, use mock data
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
          setReports(mockReports);
        } catch (error) {
          console.error('Error fetching reports:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchReports();
    }
  }, [isReportsPage, user]);

  const handleClick = () => {
    navigate("/assessment");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredAndSortedReports = () => {
    let filtered = reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.regulation_short_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegulation = selectedRegulation === 'all' || report.regulation_id === selectedRegulation;
      return matchesSearch && matchesRegulation;
    });

    // Sort reports
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submitted_at) - new Date(a.submitted_at);
        case 'oldest':
          return new Date(a.submitted_at) - new Date(b.submitted_at);
        case 'regulation':
          return a.regulation_short_name.localeCompare(b.regulation_short_name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleDownloadReport = (reportId) => {
    // TODO: Implement actual download functionality
    console.log('Downloading report:', reportId);
  };

  const handleViewReport = (reportId) => {
    // TODO: Implement report viewing functionality
    console.log('Viewing report:', reportId);
  };

  // Reports Page Content
  if (isReportsPage) {
    const filteredReports = getFilteredAndSortedReports();
    const uniqueRegulations = [...new Set(reports.map(r => r.regulation_id))];

    if (loading) {
      return (
        <div className="reports-container">
          <div className="reports-loading">
            <div className="loading-spinner"></div>
            <p>Loading your reports...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="reports-container">
        {/* Header Section */}
        <div className="reports-header">
          <div className="reports-title-section">
            <h1>Submitted Reports</h1>
            <p>View and manage all your compliance reports</p>
          </div>

          {/* Search and Filter Controls */}
          <div className="reports-controls">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                value={selectedRegulation}
                onChange={(e) => setSelectedRegulation(e.target.value)}
                className="regulation-filter"
              >
                <option value="all">All Regulations</option>
                {uniqueRegulations.map(regId => {
                  const report = reports.find(r => r.regulation_id === regId);
                  return (
                    <option key={regId} value={regId}>
                      {report?.regulation_short_name}
                    </option>
                  );
                })}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-filter"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="regulation">By Regulation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="no-reports">
            <div className="no-reports-content">
              <div className="no-reports-icon">📊</div>
              <h3>No Reports Found</h3>
              <p>
                {searchTerm || selectedRegulation !== 'all'
                  ? 'No reports match your current filters. Try adjusting your search or filter criteria.'
                  : 'You haven\'t submitted any compliance reports yet. Start by completing a regulation assessment.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report) => {
              const IconComponent = report.icon;
              return (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <div
                      className="report-regulation-icon"
                      style={{
                        background: `linear-gradient(135deg, ${report.primaryColor} 0%, ${report.secondaryColor} 100%)`
                      }}
                    >
                      <IconComponent />
                    </div>
                    <div className="report-info">
                      <span className="report-regulation">{report.regulation_short_name}</span>
                      <h3 className="report-title">{report.title}</h3>
                    </div>
                    <div className="report-status">
                      <span className="status-badge status-submitted">
                        ✅ Submitted
                      </span>
                    </div>
                  </div>

                  <div className="report-details">
                    <div className="report-meta">
                      <div className="meta-item">
                        <FaCalendar className="meta-icon" />
                        <span>Submitted: {formatDate(report.submitted_at)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="file-size">{report.file_size}</span>
                        <span className="file-type">{report.type.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="report-actions">
                      <button
                        className="action-btn secondary"
                        onClick={() => handleViewReport(report.id)}
                        title="View Report"
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        className="action-btn primary"
                        onClick={() => handleDownloadReport(report.id)}
                        style={{
                          background: `linear-gradient(135deg, ${report.primaryColor} 0%, ${report.secondaryColor} 100%)`,
                          boxShadow: `0 4px 12px ${report.primaryColor}30`
                        }}
                        title="Download Report"
                      >
                        <FaDownload />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {filteredReports.length > 0 && (
          <div className="reports-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-number">{filteredReports.length}</span>
                <span className="stat-label">Total Reports</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{uniqueRegulations.length}</span>
                <span className="stat-label">Regulations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {filteredReports.reduce((sum, r) => sum + parseFloat(r.file_size), 0).toFixed(1)} MB
                </span>
                <span className="stat-label">Total Size</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Resume Page Content (for /resume route)
  return (
    <div className="resume-wrap">
      <div className="resume-hero">
        <div className="resume-content">
          <h1>Welcome back to Raylow</h1>

          <div className="assessment-section">
            <h2>Let's find out what regulations apply to you</h2>
            <p>
              Answer a few quick questions and we'll route you to the exact
              EU regulations that apply to your organisation.
            </p>
            <button className="resume-cta" onClick={handleClick}>
              Start assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;



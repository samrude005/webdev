import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCampaigns } from '../contexts/CampaignContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, UserCheck, Briefcase, Calendar, Award, Send, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import VolunteerSidebar from '../components/volunteer/VolunteerSidebar';
import VolunteerTopNavbar from '../components/volunteer/VolunteerTopNavbar';
import VolunteerDashboard from './volunteer/VolunteerDashboard';
import VolunteerProfile from './volunteer/VolunteerProfile';
import AssignedTasks from './volunteer/AssignedTasks';
import TaskDetail from './volunteer/TaskDetail';
import VerificationHistory from './volunteer/VerificationHistory';
import RewardsLeaderboard from './volunteer/RewardsLeaderboard';

const VolunteerApplication = () => {
  const { user } = useAuth();
  const { campaigns } = useCampaigns();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('apply');
  const [volunteerType, setVolunteerType] = useState(''); // campaign_manager or donor_volunteer
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    campaignId: '',
    campaignTitle: '',
    skills: '',
    availability: '',
    experience: '',
    motivation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ngoRegistrations, setNgoRegistrations] = useState([
    {
      id: 'ngo-reg-001',
      ngoName: 'Hope Foundation India',
      regNumber: 'NGO-2024-MH-001',
      regDate: '2024-01-15',
      category: 'Education',
      categorySecondary: 'Healthcare',
      address: '123 Service Road, Mumbai, Maharashtra 400001',
      website: 'https://hopefoundation.in',
      contactName: 'Rajesh Kumar',
      contactEmail: 'rajesh@hopefoundation.in',
      contactPhone: '+91 98765 43210',
      bankAccount: '1234567890',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0001234',
      status: 'pending',
      submittedDate: '2024-11-15',
      documents: {
        certificate: 'cert_001.pdf',
        proofOfAddress: 'address_proof_001.pdf'
      }
    },
    {
      id: 'ngo-reg-002',
      ngoName: 'Green Earth Initiative',
      regNumber: 'NGO-2024-DL-045',
      regDate: '2023-08-20',
      category: 'Environment',
      categorySecondary: 'Education',
      address: '456 Eco Park, New Delhi 110001',
      website: 'https://greenearth.in',
      contactName: 'Priya Sharma',
      contactEmail: 'priya@greenearth.in',
      contactPhone: '+91 98765 54321',
      bankAccount: '9876543210',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      status: 'pending',
      submittedDate: '2024-11-14',
      documents: {
        certificate: 'cert_002.pdf',
        proofOfAddress: 'address_proof_002.pdf'
      }
    },
    {
      id: 'ngo-reg-003',
      ngoName: 'Women Empowerment Society',
      regNumber: 'NGO-2024-KA-089',
      regDate: '2024-03-10',
      category: 'Women Empowerment',
      categorySecondary: 'Child Welfare',
      address: '789 Shakti Nagar, Bangalore, Karnataka 560001',
      website: '',
      contactName: 'Anjali Patel',
      contactEmail: 'anjali@wes.in',
      contactPhone: '+91 98765 67890',
      bankAccount: '5555666677',
      bankName: 'ICICI Bank',
      ifscCode: 'ICIC0001234',
      status: 'pending',
      submittedDate: '2024-11-13',
      documents: {
        certificate: 'cert_003.pdf',
        proofOfAddress: 'address_proof_003.pdf'
      }
    }
  ]);
  const [selectedNgo, setSelectedNgo] = useState(null);

  const handleTypeSelection = (type) => {
    setVolunteerType(type);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'campaignId') {
      const selectedCampaign = campaigns.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        campaignTitle: selectedCampaign?.title || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const applicationData = {
        ...formData,
        volunteerType,
        userId: user.id,
        appliedAt: serverTimestamp(),
        status: 'pending',
      };

      await addDoc(collection(db, 'volunteerApplications'), applicationData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNgoAction = (ngoId, action) => {
    setNgoRegistrations(prev => 
      prev.map(ngo => 
        ngo.id === ngoId 
          ? { ...ngo, status: action === 'approve' ? 'approved' : 'rejected' }
          : ngo
      )
    );
    setSelectedNgo(null);
    alert(`NGO registration ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  // Only NGOs cannot access volunteer portal
  if (user.userType === 'ngo') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This is the volunteer portal. NGOs cannot apply as volunteers or review registrations.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Donors can apply as volunteers but cannot review NGO registrations
  // Volunteers go straight to review panel
  const canReviewNGOs = user.userType === 'volunteer' || user.userType === 'platform_admin';
  
  // Set initial tab based on user type - volunteers see TrustBridge dashboard
  React.useEffect(() => {
    if (user.userType === 'volunteer') {
      setActiveTab('dashboard'); // Volunteers see task dashboard
    }
  }, [user]);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your volunteer application has been submitted successfully. 
            The platform admin will review it and get back to you soon.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Render different content based on path for volunteers
  const renderVolunteerContent = () => {
    const path = location.pathname;
    
    if (path.includes('/profile')) {
      return <VolunteerProfile />;
    } else if (path.includes('/assigned-tasks')) {
      return <AssignedTasks />;
    } else if (path.includes('/task-detail')) {
      return <TaskDetail />;
    } else if (path.includes('/map-view')) {
      return <div className="p-8"><h2 className="text-2xl font-bold">Map View - Coming Soon</h2><p className="text-gray-600 mt-2">Interactive map showing task locations will be available here.</p></div>;
    } else if (path.includes('/verification-history')) {
      return <VerificationHistory />;
    } else if (path.includes('/rewards-leaderboard')) {
      return <RewardsLeaderboard />;
    } else if (path.includes('/training-resources')) {
      return <div className="p-8"><h2 className="text-2xl font-bold">Training & Resources - Coming Soon</h2><p className="text-gray-600 mt-2">Training materials and guidelines for volunteers will be available here.</p></div>;
    } else if (path.includes('/support-chat')) {
      return <div className="p-8"><h2 className="text-2xl font-bold">Support / Chat - Coming Soon</h2><p className="text-gray-600 mt-2">Live support chat will be available here.</p></div>;
    } else if (path.includes('/settings')) {
      return <div className="p-8"><h2 className="text-2xl font-bold">Settings - Coming Soon</h2><p className="text-gray-600 mt-2">Account settings and preferences will be available here.</p></div>;
    }
    return <VolunteerDashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TrustBridge Volunteer Dashboard for verified volunteers */}
      {user.userType === 'volunteer' ? (
        <div className="flex h-screen">
          <VolunteerSidebar />
          <div className="flex-1 flex flex-col">
            <VolunteerTopNavbar />
            <div className="flex-1 overflow-auto">
              {renderVolunteerContent()}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {user.userType === 'volunteer' ? 'Volunteer Dashboard' : 'Volunteer Portal'}
          </h1>
          <p className="text-lg text-gray-600">
            {user.userType === 'volunteer' 
              ? 'Review NGO registrations and manage your volunteer activities'
              : 'Apply as a volunteer for campaigns'}
          </p>
        </div>

        {/* Tabs - Only show for donors and platform admins */}
        {user.userType !== 'volunteer' && canReviewNGOs && (
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('apply')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'apply'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <UserCheck className="w-5 h-5 inline-block mr-2" />
                Apply as Volunteer
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'review'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5 inline-block mr-2" />
                Review NGO Registrations
              </button>
            </div>
          </div>
        )}

        {/* Apply Tab Content - Only for Donors */}
        {activeTab === 'apply' && user.userType === 'donor' && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => handleTypeSelection('campaign_manager')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left border-2 border-transparent hover:border-purple-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Campaign Manager</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Oversee offline campaigns, manage field operations, and handle offline money collection.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Coordinate offline events
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Manage cash donations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  Monitor campaign progress
                </li>
              </ul>
            </button>

            <button
              onClick={() => handleTypeSelection('donor_volunteer')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Donor Volunteer</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Share your skills and time - teach, provide healthcare, or offer professional services.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Teaching & Education
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Healthcare & Medical
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Professional Skills
                </li>
              </ul>
            </button>
          </div>
        )}

        {/* Application Form */}
        {volunteerType && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {volunteerType === 'campaign_manager' ? 'Campaign Manager' : 'Donor Volunteer'} Application
              </h2>
              <button
                onClick={() => setVolunteerType('')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Change Type
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Campaign *
                  </label>
                  <select
                    name="campaignId"
                    value={formData.campaignId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a campaign</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Donor Volunteer Specific Fields */}
              {volunteerType === 'donor_volunteer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Skills/Expertise *
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Teaching Math, Medical Doctor, Web Development"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability *
                    </label>
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Weekends, 2 hours daily, 1 month full-time"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relevant Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Tell us about your relevant experience..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you want to volunteer? *
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Share your motivation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  <Send className="w-5 h-5" />
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/campaigns')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Review Tab Content - Only for Volunteers and Platform Admins */}
        {activeTab === 'review' && canReviewNGOs && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending NGO Registrations</h2>
              <p className="text-gray-600 mb-6">Review and approve/reject NGO registration applications</p>

              {/* NGO List */}
              <div className="space-y-4">
                {ngoRegistrations.filter(ngo => ngo.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No pending registrations to review</p>
                  </div>
                ) : (
                  ngoRegistrations.filter(ngo => ngo.status === 'pending').map((ngo) => (
                    <div key={ngo.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{ngo.ngoName}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Registration Number</p>
                              <p className="font-semibold text-gray-900">{ngo.regNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Category</p>
                              <p className="font-semibold text-gray-900">{ngo.category}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Contact Person</p>
                              <p className="font-semibold text-gray-900">{ngo.contactName}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Submitted Date</p>
                              <p className="font-semibold text-gray-900">{new Date(ngo.submittedDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedNgo(ngo)}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Detail Modal */}
            {selectedNgo && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedNgo.ngoName}</h3>
                      <button
                        onClick={() => setSelectedNgo(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">NGO Name</p>
                          <p className="font-medium text-gray-900">{selectedNgo.ngoName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Registration Number</p>
                          <p className="font-medium text-gray-900">{selectedNgo.regNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Registration Date</p>
                          <p className="font-medium text-gray-900">{new Date(selectedNgo.regDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Primary Category</p>
                          <p className="font-medium text-gray-900">{selectedNgo.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Secondary Category</p>
                          <p className="font-medium text-gray-900">{selectedNgo.categorySecondary || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium text-gray-900">{selectedNgo.address}</p>
                        </div>
                        {selectedNgo.website && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Website</p>
                            <a href={selectedNgo.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                              {selectedNgo.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Contact Person</p>
                          <p className="font-medium text-gray-900">{selectedNgo.contactName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{selectedNgo.contactEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{selectedNgo.contactPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Bank Name</p>
                          <p className="font-medium text-gray-900">{selectedNgo.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="font-medium text-gray-900">{selectedNgo.bankAccount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">IFSC Code</p>
                          <p className="font-medium text-gray-900">{selectedNgo.ifscCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium">Registration Certificate</span>
                          </div>
                          <span className="text-sm text-gray-600">{selectedNgo.documents.certificate}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium">Proof of Address</span>
                          </div>
                          <span className="text-sm text-gray-600">{selectedNgo.documents.proofOfAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleNgoAction(selectedNgo.id, 'approve')}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Registration
                      </button>
                      <button
                        onClick={() => handleNgoAction(selectedNgo.id, 'reject')}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Registration
                      </button>
                      <button
                        onClick={() => setSelectedNgo(null)}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerApplication;

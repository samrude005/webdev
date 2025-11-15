import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  UserCheck,
  Calendar,
  Mail,
  Phone,
  Award,
  FileText,
  Building2,
  TrendingUp,
  BarChart3,
  DollarSign,
  Shield,
  AlertTriangle,
  Eye,
  Banknote
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const PlatformAdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('volunteers'); // volunteers, ngos, users, campaigns, financial
  const [applications, setApplications] = useState([]);
  const [ngoRegistrations, setNgoRegistrations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'volunteerApplications'));
      const apps = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          appliedAt: data.appliedAt?.toDate ? data.appliedAt.toDate().toISOString() : data.appliedAt,
        };
      });

      setApplications(apps);
      calculateStats(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    setStats({
      total: apps.length,
      pending: apps.filter(a => a.status === 'pending').length,
      approved: apps.filter(a => a.status === 'approved').length,
      rejected: apps.filter(a => a.status === 'rejected').length
    });
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const ref = doc(db, 'volunteerApplications', applicationId);
      await updateDoc(ref, { status: action });
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (user?.userType !== 'platform_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only Platform Administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Administration</h1>
          <p className="text-gray-600">Manage users, campaigns, NGO registrations, and financial oversight</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <nav className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'volunteers'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              Volunteer Applications
            </button>
            <button
              onClick={() => setActiveTab('ngos')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'ngos'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-5 h-5" />
              NGO Registrations
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              All Users
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'campaigns'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Campaign Moderation
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'financial'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Banknote className="w-5 h-5" />
              Financial Reports
            </button>
          </nav>
        </div>

        {/* Volunteer Applications Tab */}
        {activeTab === 'volunteers' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize ${
                    filter === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {filter !== 'all' ? filter : ''} applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills/Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {application.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.volunteerType === 'campaign_manager'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {application.volunteerType === 'campaign_manager' 
                            ? 'Campaign Manager' 
                            : 'Donor Volunteer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{application.campaignTitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {application.volunteerType === 'donor_volunteer' && application.skills && (
                            <p><strong>Skills:</strong> {application.skills}</p>
                          )}
                          {application.availability && (
                            <p><strong>Availability:</strong> {application.availability}</p>
                          )}
                          {application.experience && (
                            <p className="text-gray-600 text-xs mt-1">{application.experience}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : application.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApplicationAction(application.id, 'approved')}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApplicationAction(application.id, 'rejected')}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                        {application.status !== 'pending' && (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

        {/* NGO Registrations Tab */}
        {activeTab === 'ngos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">NGO Registration Approval</h2>
            <p className="text-gray-600">This feature allows platform admins to review and approve NGO registrations. Integration with volunteer review system coming soon.</p>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600">View and manage all platform users - donors, volunteers, NGOs, and admins.</p>
          </div>
        )}

        {/* Campaign Moderation Tab */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Moderation</h2>
            <p className="text-gray-600">Monitor and moderate campaigns, flag suspicious activities, and ensure compliance.</p>
          </div>
        )}

        {/* Financial Reports Tab */}
        {activeTab === 'financial' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Oversight</h2>
            <p className="text-gray-600">View platform-wide financial reports, donation tracking, and transaction analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAdminPanel;

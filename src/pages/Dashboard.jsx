import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Heart, Users, TrendingUp, Plus, BarChart3, Shield } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCampaigns } from '../contexts/CampaignContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { campaigns } = useCampaigns();

  const [donorStats, setDonorStats] = React.useState({
    totalDonated: 0,
    campaignsSupported: 0,
    impactScore: 0,
    donations: [],
    loading: true,
  });

  React.useEffect(() => {
    const fetchDonorStats = async () => {
      if (!user || user.userType !== 'donor') {
        setDonorStats((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const q = query(
          collection(db, 'donations'),
          where('userId', '==', user.id)
        );
        const snapshot = await getDocs(q);
        const donations = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        });

        const totalDonated = donations.reduce(
          (sum, d) => sum + (Number(d.amount) || 0),
          0
        );
        const campaignsSupported = new Set(
          donations.map((d) => d.campaignId)
        ).size;

        // Simple impact score: donations amount + campaigns supported weight
        const impactScore = totalDonated / 1000 + campaignsSupported * 10;

        setDonorStats({
          totalDonated,
          campaignsSupported,
          impactScore: Math.round(impactScore),
          donations,
          loading: false,
        });
      } catch (error) {
        console.error('Error loading donor stats:', error);
        setDonorStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDonorStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600">
            {user?.userType === 'ngo' && 'Manage your campaigns and track impact'}
            {user?.userType === 'donor' && 'Track your donations and support causes'}
            {user?.userType === 'volunteer' && 'View your volunteer activities and opportunities'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {user?.userType === 'ngo' && 'Total Campaigns'}
                  {user?.userType === 'donor' && 'Total Donated'}
                  {user?.userType === 'volunteer' && 'Hours Volunteered'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {user?.userType === 'donor'
                    ? `₹${donorStats.totalDonated.toLocaleString('en-IN')}`
                    : '0'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {user?.userType === 'ngo' && 'Total Raised'}
                  {user?.userType === 'donor' && 'Campaigns Supported'}
                  {user?.userType === 'volunteer' && 'Campaigns Joined'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {user?.userType === 'ngo'
                    ? '₹0'
                    : donorStats.campaignsSupported.toString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {user?.userType === 'ngo' && 'Active Volunteers'}
                  {user?.userType === 'donor' && 'Impact Score'}
                  {user?.userType === 'volunteer' && 'Skills Shared'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {user?.userType === 'donor'
                    ? donorStats.impactScore.toString()
                    : '0'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user?.userType === 'ngo' ? (
              <>
                <Link
                  to="/create-campaign"
                  className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-6 h-6 mr-2 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-700">Create Campaign</span>
                </Link>

                <Link
                  to="/admin"
                  className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-700">View Statistics</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-700">Edit Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/campaigns"
                  className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <LayoutDashboard className="w-6 h-6 mr-2 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-700">Browse Campaigns</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-700">Edit Profile</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          {user?.userType === 'donor' ? (
            donorStats.loading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading your donation history...</p>
              </div>
            ) : donorStats.donations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No recent activity to display</p>
                <Link
                  to="/campaigns"
                  className="text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-block"
                >
                  Start by exploring campaigns
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {donorStats.donations.slice(0, 5).map((donation) => {
                  const campaign = campaigns.find(
                    (c) => c.id === donation.campaignId
                  );
                  return (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          Donated ₹{Number(donation.amount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {campaign?.title || 'Campaign'}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {donation.createdAt
                          ? donation.createdAt.toLocaleDateString()
                          : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No recent activity to display</p>
              <Link
                to="/campaigns"
                className="text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-block"
              >
                Start by exploring campaigns
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

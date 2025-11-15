import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, TrendingUp, CheckCircle, MapPin, Banknote, BarChart3, FileText, Package, Calendar, Award } from 'lucide-react';
import { useCampaigns } from '../contexts/CampaignContext';
import { useAuth } from '../contexts/AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Home = () => {
  const { campaigns, loading } = useCampaigns();
  const { user } = useAuth();
  const featuredCampaigns = campaigns.slice(0, 3);
  const [selectedState, setSelectedState] = React.useState(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState(6);

  const analyticsData = {
    summary: {
      totalDonations: 2500000,
      totalPurchases: 1800000,
      activeProjects: 12
    },
    monthlyData: [
      { month: 'Jan 2024', spending: 120000, donations: 180000 },
      { month: 'Feb 2024', spending: 150000, donations: 200000 },
      { month: 'Mar 2024', spending: 180000, donations: 220000 },
      { month: 'Apr 2024', spending: 140000, donations: 190000 },
      { month: 'May 2024', spending: 200000, donations: 250000 },
      { month: 'Jun 2024', spending: 160000, donations: 210000 },
      { month: 'Jul 2024', spending: 190000, donations: 240000 },
      { month: 'Aug 2024', spending: 220000, donations: 280000 },
      { month: 'Sep 2024', spending: 170000, donations: 230000 },
      { month: 'Oct 2024', spending: 210000, donations: 260000 },
      { month: 'Nov 2024', spending: 180000, donations: 220000 },
      { month: 'Dec 2024', spending: 230000, donations: 300000 }
    ]
  };

  const getFilteredData = (months) => {
    return analyticsData.monthlyData.slice(-months);
  };

  const filteredData = getFilteredData(selectedPeriod);
  const labels = filteredData.map(d => d.month);
  const spending = filteredData.map(d => d.spending);
  const donations = filteredData.map(d => d.donations);

  const spendingChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Monthly Spending',
        data: spending,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const comparisonChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Donations Received',
        data: donations,
        backgroundColor: '#27ae60'
      },
      {
        label: 'Purchases Made',
        data: spending,
        backgroundColor: '#e74c3c'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + (value / 1000) + 'k';
          }
        }
      }
    }
  };

  const povertyData = {
    'Andhra Pradesh': { rate: 9.2, population: 53903393, poor: 4959112 },
    'Arunachal Pradesh': { rate: 34.7, population: 1570458, poor: 544949 },
    'Assam': { rate: 31.9, population: 35607039, poor: 11358646 },
    'Bihar': { rate: 33.7, population: 124799926, poor: 42057575 },
    'Chhattisgarh': { rate: 39.9, population: 29436231, poor: 11747048 },
    'Goa': { rate: 5.1, population: 1542750, poor: 78680 },
    'Gujarat': { rate: 16.6, population: 63872399, poor: 10602878 },
    'Haryana': { rate: 11.2, population: 28204692, poor: 3158926 },
    'Himachal Pradesh': { rate: 8.1, population: 7451955, poor: 603608 },
    'Jharkhand': { rate: 36.9, population: 38593948, poor: 14241167 },
    'Karnataka': { rate: 20.9, population: 67562686, poor: 14120601 },
    'Kerala': { rate: 7.1, population: 35699443, poor: 2534661 },
    'Madhya Pradesh': { rate: 36.7, population: 85358965, poor: 31326740 },
    'Maharashtra': { rate: 17.4, population: 123144223, poor: 21427095 },
    'Manipur': { rate: 36.9, population: 3091545, poor: 1140800 },
    'Meghalaya': { rate: 11.9, population: 3366710, poor: 400639 },
    'Mizoram': { rate: 20.4, population: 1239244, poor: 252806 },
    'Nagaland': { rate: 18.9, population: 2249695, poor: 425192 },
    'Odisha': { rate: 32.6, population: 46356334, poor: 15112164 },
    'Punjab': { rate: 8.3, population: 29859154, poor: 2478310 },
    'Rajasthan': { rate: 14.7, population: 77264465, poor: 11357877 },
    'Sikkim': { rate: 8.2, population: 690251, poor: 56601 },
    'Tamil Nadu': { rate: 11.3, population: 76481545, poor: 8642415 },
    'Telangana': { rate: 9.2, population: 39362732, poor: 3621371 },
    'Tripura': { rate: 14.1, population: 4169794, poor: 587941 },
    'Uttar Pradesh': { rate: 29.4, population: 224979129, poor: 66143863 },
    'Uttarakhand': { rate: 11.3, population: 11250858, poor: 1271347 },
    'West Bengal': { rate: 19.9, population: 99609303, poor: 19822251 },
    'Delhi': { rate: 9.9, population: 18710922, poor: 1852381 },
  };

  const getColor = (rate) => {
    if (rate >= 35) return '#7f1d1d';
    if (rate >= 25) return '#dc2626';
    if (rate >= 15) return '#f97316';
    if (rate >= 10) return '#fbbf24';
    return '#22c55e';
  };

  if (user && user.userType === 'ngo') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* NGO Dashboard Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}</h1>
            <p className="text-xl text-purple-100">NGO Dashboard - Manage your impact and transparency</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
                  <p className="text-3xl font-bold text-blue-600">{campaigns.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Raised</p>
                  <p className="text-3xl font-bold text-green-600">₹2.5M</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Banknote className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Donors</p>
                  <p className="text-3xl font-bold text-purple-600">1,234</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Volunteers</p>
                  <p className="text-3xl font-bold text-orange-600">87</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Heart className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/create-campaign"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="p-3 bg-blue-600 rounded-lg mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Campaign</h3>
                  <p className="text-sm text-gray-600">Start a new fundraising campaign</p>
                </div>
              </Link>

              <Link
                to="/admin"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="p-3 bg-green-600 rounded-lg mr-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-600">Manage donations & purchases</p>
                </div>
              </Link>

              <Link
                to="/campaigns"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="p-3 bg-purple-600 rounded-lg mr-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View All Campaigns</h3>
                  <p className="text-sm text-gray-600">See all your campaigns</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Financial Transparency Dashboard */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Financial Transparency</h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>Last 3 Months</option>
                <option value={6}>Last 6 Months</option>
                <option value={12}>Last 12 Months</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Donations Received</p>
                <p className="text-3xl font-bold text-green-600">₹{analyticsData.summary.totalDonations.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Purchases Made</p>
                <p className="text-3xl font-bold text-red-600">₹{analyticsData.summary.totalPurchases.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Active Projects</p>
                <p className="text-3xl font-bold text-blue-600">{analyticsData.summary.activeProjects}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
                <div style={{ height: '300px' }}>
                  <Line data={spendingChartData} options={chartOptions} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donations vs Purchases</h3>
                <div style={{ height: '300px' }}>
                  <Bar data={comparisonChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Recent Campaigns</h2>
              <Link to="/campaigns" className="text-blue-600 hover:text-blue-700 font-semibold">
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/campaigns/${campaign.id}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{campaign.title}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Raised</span>
                          <span className="font-semibold text-green-600">₹{campaign.raised?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Goal</span>
                          <span className="font-semibold text-gray-900">₹{campaign.goal?.toLocaleString() || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Create Meaningful Social Impact in India
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connecting Indian NGOs, donors, and volunteers with transparency and accountability
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/campaigns"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center"
              >
                Browse Campaigns
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('featured-campaigns');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-blue-700 text-white hover:bg-blue-800 px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Full Transparency</h3>
              <p className="text-gray-600">
                Track every donation and see real-time impact with complete visibility into fund utilization.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified NGOs</h3>
              <p className="text-gray-600">
                All organizations are verified to ensure your contributions reach legitimate causes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Impact</h3>
              <p className="text-gray-600">
                See the difference you're making with live updates and detailed impact reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Campaigns */}
      <div id="featured-campaigns" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Campaigns</h2>
            <Link to="/campaigns" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center">
              View All
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  to={`/campaigns/${campaign.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <img
                    src={campaign.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-2">
                      {campaign.category}
                    </span>
                    <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">
                          {Math.round((campaign.raised / campaign.goal) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Raised: <strong>₹{campaign.raised?.toLocaleString() || 0}</strong>
                      </span>
                      <span className="text-gray-600">
                        Goal: <strong>₹{campaign.goal?.toLocaleString() || 0}</strong>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg">Loading campaigns...</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Dashboard Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Financial Transparency Dashboard</h2>
            <p className="text-xl text-gray-600">Track our income and expenditure with complete transparency</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="text-sm text-gray-600 mb-2">Total Donations Received</div>
              <div className="text-3xl font-bold text-green-600">
                ₹{analyticsData.summary.totalDonations.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="text-sm text-gray-600 mb-2">Total Purchases Made</div>
              <div className="text-3xl font-bold text-red-600">
                ₹{analyticsData.summary.totalPurchases.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="text-sm text-gray-600 mb-2">Active Projects</div>
              <div className="text-3xl font-bold text-blue-600">
                {analyticsData.summary.activeProjects}
              </div>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-gray-700">Time Period:</span>
              <button
                onClick={() => setSelectedPeriod(3)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 3
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => setSelectedPeriod(6)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 6
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setSelectedPeriod(9)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 9
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                9 Months
              </button>
              <button
                onClick={() => setSelectedPeriod(12)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === 12
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1 Year
              </button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Spending Trend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Monthly Spending Trend</h3>
              <div style={{ height: '300px' }}>
                <Line data={spendingChartData} options={chartOptions} />
              </div>
            </div>

            {/* Donations vs Spending */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Donations vs Spending</h3>
              <div style={{ height: '300px' }}>
                <Bar data={comparisonChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* India Poverty Map Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">India Poverty Map</h2>
            <p className="text-xl text-gray-600">Interactive visualization of poverty rates across Indian states</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="mb-4 flex flex-wrap gap-2 justify-center">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                  <span className="ml-2 text-sm text-gray-600">&lt;10%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                  <span className="ml-2 text-sm text-gray-600">10-15%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f97316' }}></div>
                  <span className="ml-2 text-sm text-gray-600">15-25%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                  <span className="ml-2 text-sm text-gray-600">25-35%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#7f1d1d' }}></div>
                  <span className="ml-2 text-sm text-gray-600">&gt;35%</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 flex items-center justify-center">
                <svg viewBox="0 0 800 900" className="w-full h-full" style={{ maxHeight: '600px', maxWidth: '500px' }}>
                  {/* SVG Map paths - with strokeWidth=0.5 to minimize gaps */}
                  <path d="M 200 50 L 250 40 L 280 60 L 290 90 L 270 110 L 240 100 Z" fill={selectedState === 'Jammu & Kashmir' ? '#3b82f6' : getColor(15.0)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Jammu & Kashmir')} />
                  <path d="M 240 100 L 270 110 L 290 130 L 280 150 L 250 140 Z" fill={selectedState === 'Himachal Pradesh' ? '#3b82f6' : getColor(8.1)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Himachal Pradesh')} />
                  <path d="M 210 130 L 250 140 L 260 160 L 240 170 Z" fill={selectedState === 'Punjab' ? '#3b82f6' : getColor(8.3)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Punjab')} />
                  <path d="M 240 170 L 260 160 L 280 180 L 270 200 Z" fill={selectedState === 'Haryana' ? '#3b82f6' : getColor(11.2)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Haryana')} />
                  <circle cx="260" cy="185" r="8" fill={selectedState === 'Delhi' ? '#3b82f6' : getColor(9.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Delhi')} />
                  <path d="M 280 150 L 310 140 L 330 160 L 320 180 L 290 170 L 280 150 Z" fill={selectedState === 'Uttarakhand' ? '#3b82f6' : getColor(11.3)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Uttarakhand')} />
                  <path d="M 180 180 L 250 190 L 260 250 L 240 280 L 200 290 L 160 260 L 170 220 Z" fill={selectedState === 'Rajasthan' ? '#3b82f6' : getColor(14.7)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Rajasthan')} />
                  <path d="M 270 200 L 320 180 L 380 190 L 390 240 L 360 260 L 320 250 L 280 240 L 260 220 L 270 200 Z" fill={selectedState === 'Uttar Pradesh' ? '#3b82f6' : getColor(29.4)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Uttar Pradesh')} />
                  <path d="M 140 280 L 200 290 L 220 340 L 200 380 L 160 390 L 120 360 L 110 320 Z" fill={selectedState === 'Gujarat' ? '#3b82f6' : getColor(16.6)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Gujarat')} />
                  <path d="M 240 280 L 320 250 L 360 260 L 380 300 L 360 340 L 320 350 L 280 340 L 250 320 Z" fill={selectedState === 'Madhya Pradesh' ? '#3b82f6' : getColor(36.7)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Madhya Pradesh')} />
                  <path d="M 390 240 L 440 230 L 470 250 L 460 280 L 430 290 Z" fill={selectedState === 'Bihar' ? '#3b82f6' : getColor(33.7)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Bihar')} />
                  <path d="M 430 290 L 470 280 L 490 310 L 480 340 L 450 350 L 420 330 Z" fill={selectedState === 'Jharkhand' ? '#3b82f6' : getColor(36.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Jharkhand')} />
                  <path d="M 470 250 L 520 240 L 540 270 L 530 310 L 500 320 L 480 300 L 470 280 L 470 250 Z" fill={selectedState === 'West Bengal' ? '#3b82f6' : getColor(19.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('West Bengal')} />
                  <path d="M 450 350 L 490 340 L 510 370 L 500 410 L 460 420 L 430 390 Z" fill={selectedState === 'Odisha' ? '#3b82f6' : getColor(32.6)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Odisha')} />
                  <path d="M 380 300 L 430 290 L 450 330 L 440 370 L 400 380 L 370 350 L 380 300 Z" fill={selectedState === 'Chhattisgarh' ? '#3b82f6' : getColor(39.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Chhattisgarh')} />
                  <path d="M 220 380 L 280 370 L 320 380 L 340 420 L 320 470 L 270 480 L 230 450 L 210 420 Z" fill={selectedState === 'Maharashtra' ? '#3b82f6' : getColor(17.4)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Maharashtra')} />
                  <path d="M 200 470 L 230 480 L 225 500 L 195 490 Z" fill={selectedState === 'Goa' ? '#3b82f6' : getColor(5.1)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Goa')} />
                  <path d="M 230 480 L 280 490 L 290 540 L 270 580 L 230 570 L 200 540 L 200 500 L 230 480 Z" fill={selectedState === 'Karnataka' ? '#3b82f6' : getColor(20.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Karnataka')} />
                  <path d="M 320 420 L 360 410 L 380 450 L 370 480 L 340 470 Z" fill={selectedState === 'Telangana' ? '#3b82f6' : getColor(9.2)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Telangana')} />
                  <path d="M 340 470 L 380 450 L 400 490 L 390 530 L 350 540 L 320 520 Z" fill={selectedState === 'Andhra Pradesh' ? '#3b82f6' : getColor(9.2)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Andhra Pradesh')} />
                  <path d="M 270 580 L 320 570 L 350 600 L 340 650 L 300 660 L 260 640 Z" fill={selectedState === 'Tamil Nadu' ? '#3b82f6' : getColor(11.3)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Tamil Nadu')} />
                  <path d="M 230 570 L 270 580 L 260 640 L 240 680 L 210 670 L 200 620 L 200 540 L 230 570 Z" fill={selectedState === 'Kerala' ? '#3b82f6' : getColor(7.1)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Kerala')} />
                  <path d="M 540 270 L 590 260 L 610 290 L 600 320 L 560 330 L 530 310 Z" fill={selectedState === 'Assam' ? '#3b82f6' : getColor(31.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Assam')} />
                  <path d="M 560 330 L 590 325 L 600 345 L 585 360 L 555 355 Z" fill={selectedState === 'Meghalaya' ? '#3b82f6' : getColor(11.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Meghalaya')} />
                  <path d="M 610 340 L 635 335 L 645 360 L 635 380 L 610 375 Z" fill={selectedState === 'Manipur' ? '#3b82f6' : getColor(36.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Manipur')} />
                  <path d="M 600 380 L 625 390 L 620 415 L 595 410 Z" fill={selectedState === 'Mizoram' ? '#3b82f6' : getColor(20.4)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Mizoram')} />
                  <path d="M 555 355 L 580 360 L 575 385 L 550 380 Z" fill={selectedState === 'Tripura' ? '#3b82f6' : getColor(14.1)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Tripura')} />
                  <path d="M 610 290 L 640 280 L 650 310 L 640 330 L 615 325 Z" fill={selectedState === 'Nagaland' ? '#3b82f6' : getColor(18.9)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Nagaland')} />
                  <path d="M 590 200 L 650 180 L 670 220 L 660 260 L 620 270 L 580 250 Z" fill={selectedState === 'Arunachal Pradesh' ? '#3b82f6' : getColor(34.7)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Arunachal Pradesh')} />
                  <path d="M 520 190 L 545 185 L 555 205 L 545 220 L 520 215 Z" fill={selectedState === 'Sikkim' ? '#3b82f6' : getColor(8.2)} stroke="#fff" strokeWidth="0.5" className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setSelectedState('Sikkim')} />
                </svg>
              </div>
            </div>

            {/* State Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">State Details</h3>
              {selectedState && povertyData[selectedState] ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="text-lg font-bold text-gray-900">{selectedState}</h4>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Poverty Rate</span>
                      <span className="text-2xl font-bold" style={{ color: getColor(povertyData[selectedState].rate) }}>
                        {povertyData[selectedState].rate}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-gray-700">Population</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {(povertyData[selectedState].population / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-gray-700">In Poverty</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {(povertyData[selectedState].poor / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Click a state to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference in India?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of Indian changemakers creating positive social impact across the nation
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold inline-flex items-center"
          >
            Join Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

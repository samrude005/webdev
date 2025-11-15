import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, MapPin, Calendar, Target, TrendingUp, Heart, Users, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampaignById } = useCampaigns();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    loadCampaignData();
  }, [id]);

  const loadCampaignData = async () => {
    setLoading(true);
    const result = await getCampaignById(id);
    if (result.success) {
      setCampaign(result.campaign);
      // Fetch donations and volunteers for this campaign
      await loadDonations(id);
      await loadVolunteers(id);
    }
    setLoading(false);
  };

  const loadDonations = async (campaignId) => {
    try {
      const q = query(
        collection(db, 'donations'),
        where('campaignId', '==', campaignId)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      });
      setDonations(items);
    } catch (error) {
      console.error('Error loading donations:', error);
    }
  };

  const loadVolunteers = async (campaignId) => {
    try {
      const q = query(
        collection(db, 'volunteers'),
        where('campaignId', '==', campaignId)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate().toISOString() : data.joinedAt,
        };
      });
      setVolunteers(items);
    } catch (error) {
      console.error('Error loading volunteers:', error);
    }
  };

  const handleDonate = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const amount = parseFloat(donationAmount);
    if (amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    // Show payment modal instead of directly processing
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const amount = parseFloat(donationAmount);
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    try {
      await addDoc(collection(db, 'donations'), {
        campaignId: id,
        userId: user.id,
        userName: user.name,
        amount,
        paymentMethod: selectedPaymentMethod,
        transactionId,
        message: 'Thank you for this amazing cause!',
        createdAt: serverTimestamp(),
        paymentStatus: 'COMPLETED',
        status: 'completed',
      });

      // Generate PDF receipt
      generateReceipt({
        transactionId,
        amount,
        paymentMethod: selectedPaymentMethod,
        campaignTitle: campaign.title,
        donorName: user.name,
        date: new Date().toLocaleString(),
      });

      const updatedRaised = (campaign.raised || 0) + amount;
      setCampaign({ ...campaign, raised: updatedRaised });
      setDonationAmount('');
      setShowDonateForm(false);
      setShowPaymentModal(false);
      setSelectedPaymentMethod('');
      await loadDonations(id);
      alert('✅ Payment successful! Receipt downloaded. Thank you for your donation!');
    } catch (error) {
      console.error('Error making donation:', error);
      alert('Failed to process donation. Please try again.');
    }
  };

  const generateReceipt = (data) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('DONATION RECEIPT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Social Impact Platform', 105, 30, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Receipt details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Transaction Details', 20, 55);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    // Transaction info
    let y = 70;
    doc.text('Transaction ID:', 20, y);
    doc.setFont(undefined, 'bold');
    doc.text(data.transactionId, 70, y);
    
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.text('Date & Time:', 20, y);
    doc.text(data.date, 70, y);
    
    y += 10;
    doc.text('Payment Method:', 20, y);
    doc.text(data.paymentMethod.toUpperCase(), 70, y);
    
    y += 10;
    doc.text('Status:', 20, y);
    doc.setTextColor(0, 128, 0);
    doc.setFont(undefined, 'bold');
    doc.text('COMPLETED', 70, y);
    
    // Donor details
    doc.setTextColor(0, 0, 0);
    y += 20;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Donor Information', 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Name:', 20, y);
    doc.text(data.donorName, 70, y);
    
    // Campaign details
    y += 20;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Campaign Details', 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Campaign:', 20, y);
    const lines = doc.splitTextToSize(data.campaignTitle, 120);
    doc.text(lines, 70, y);
    
    // Amount box
    y += 30;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y - 8, 180, 25, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Amount Donated:', 20, y);
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(20);
    doc.text(`₹${data.amount.toFixed(2)}`, 150, y);
    
    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text('Thank you for your generous contribution!', 105, 270, { align: 'center' });
    doc.text('This receipt serves as proof of your donation.', 105, 275, { align: 'center' });
    doc.text('For queries, contact: support@socialimpact.in', 105, 280, { align: 'center' });
    
    // Save PDF
    doc.save(`Receipt_${data.transactionId}.pdf`);
  };

  const handleVolunteer = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addDoc(collection(db, 'volunteers'), {
        campaignId: id,
        userId: user.id,
        userName: user.name,
        skills: 'General volunteering',
        joinedAt: serverTimestamp(),
        status: 'active',
      });

      await loadVolunteers(id);
      alert('Successfully registered as volunteer!');
    } catch (error) {
      console.error('Error registering volunteer:', error);
      alert('Failed to register. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h2>
        <Link to="/campaigns" className="text-blue-600 hover:text-blue-700">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Campaigns
        </button>

        {/* Campaign Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <img
            src={campaign.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200'}
            alt={campaign.title}
            className="w-full h-96 object-cover"
          />
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                {campaign.category}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
            
            {campaign.organizationName && (
              <p className="text-lg text-gray-600 mb-4">
                By: <span className="font-semibold">{campaign.organizationName}</span>
              </p>
            )}

            {campaign.location && (
              <p className="text-gray-600 flex items-center mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                {campaign.location}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-blue-600">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-lg font-bold text-gray-900">
                  ₹{(campaign.raised || 0).toLocaleString()} raised
                </span>
                <span className="text-gray-600">
                  of ₹{campaign.goal.toLocaleString()} goal
                </span>
              </div>
            </div>

            {/* Action Buttons - Hidden for NGO users */}
            {user?.userType !== 'ngo' && (
              <div className="flex gap-4 mb-8">
                {!showDonateForm ? (
                  <button
                    onClick={() => setShowDonateForm(true)}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Donate Now
                  </button>
                ) : null}
                <button
                  onClick={() => navigate('/volunteer-application')}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Apply as Volunteer
                </button>
              </div>
            )}

            {/* Donation Form - Hidden for NGO users */}
            {showDonateForm && user?.userType !== 'ngo' && (
              <form onSubmit={handleDonate} className="bg-blue-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-4">Make a Donation</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Donation Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      min="1"
                      step="0.01"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 font-semibold"
                    >
                      Donate
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDonateForm(false)}
                      className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Description */}
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">About This Campaign</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900">{donations.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Volunteers</p>
                <p className="text-3xl font-bold text-gray-900">{volunteers.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{Math.max(0, campaign.goal - (campaign.raised || 0)).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Donations</h2>
          {donations.length > 0 ? (
            <div className="space-y-4">
              {donations.slice(0, 10).map((donation, index) => (
                <div key={donation.id || index} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{donation.userName || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{donation.amount.toLocaleString()}</p>
                    {donation.message && (
                      <p className="text-sm text-gray-500 italic">"{donation.message}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No donations yet. Be the first to contribute!</p>
          )}
        </div>

        {/* Volunteers */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Volunteers</h2>
          {volunteers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteers.map((volunteer, index) => (
                <div key={volunteer.id || index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{volunteer.userName}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(volunteer.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No volunteers yet. Be the first to join!</p>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Donation</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPaymentMethod('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Donation Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Donation Amount:</span>
                  <span className="text-3xl font-bold text-blue-600">₹{donationAmount}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Credit Card */}
                <button
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedPaymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                    <span className="text-2xl">💳</span>
                  </div>
                  <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                </button>

                {/* UPI */}
                <button
                  onClick={() => setSelectedPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedPaymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">UPI Payment</span>
                    <span className="text-2xl">📱</span>
                  </div>
                  <p className="text-sm text-gray-600">PhonePe, GPay, Paytm</p>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedPaymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">PayPal</span>
                    <span className="text-2xl">🅿️</span>
                  </div>
                  <p className="text-sm text-gray-600">Fast & Secure</p>
                </button>

                {/* Bank Transfer */}
                <button
                  onClick={() => setSelectedPaymentMethod('bank')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedPaymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Bank Transfer</span>
                    <span className="text-2xl">🏦</span>
                  </div>
                  <p className="text-sm text-gray-600">Direct bank transfer</p>
                </button>
              </div>

              {/* QR Code Section */}
              {selectedPaymentMethod && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-center mb-4">Scan QR Code to Pay</h4>
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      {/* QR Code Placeholder - Using a simple SVG */}
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        <rect width="200" height="200" fill="white"/>
                        {/* QR Code Pattern */}
                        <rect x="20" y="20" width="60" height="60" fill="black"/>
                        <rect x="30" y="30" width="40" height="40" fill="white"/>
                        <rect x="120" y="20" width="60" height="60" fill="black"/>
                        <rect x="130" y="30" width="40" height="40" fill="white"/>
                        <rect x="20" y="120" width="60" height="60" fill="black"/>
                        <rect x="30" y="130" width="40" height="40" fill="white"/>
                        {/* Data pattern */}
                        <rect x="90" y="90" width="20" height="20" fill="black"/>
                        <rect x="50" y="90" width="10" height="10" fill="black"/>
                        <rect x="90" y="50" width="10" height="10" fill="black"/>
                        <rect x="110" y="110" width="15" height="15" fill="black"/>
                        <rect x="140" y="90" width="10" height="10" fill="black"/>
                        <rect x="90" y="140" width="10" height="10" fill="black"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    {selectedPaymentMethod === 'upi' && 'Scan with any UPI app to complete payment'}
                    {selectedPaymentMethod === 'card' && 'Scan to enter card details securely'}
                    {selectedPaymentMethod === 'paypal' && 'Scan to pay via PayPal'}
                    {selectedPaymentMethod === 'bank' && 'Scan for bank transfer details'}
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Payment ID: {Date.now().toString(36).toUpperCase()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPaymentMethod('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={!selectedPaymentMethod}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedPaymentMethod ? 'Complete Payment' : 'Select Payment Method'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const CampaignContext = createContext(null);

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const defaultCampaigns = [
    {
      id: 'demo1',
      title: 'Clean Water for Rural Villages',
      description: 'Providing clean drinking water to 50 villages in rural India through installation of water purification systems and bore wells.',
      category: 'Water & Sanitation',
      goal: 500000,
      raised: 325000,
      location: 'Rajasthan, India',
      organizationName: 'Water For Life Foundation',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo2',
      title: 'Education for Underprivileged Children',
      description: 'Building schools and providing educational materials for children in slum areas. Empowering 1000+ children with quality education.',
      category: 'Education',
      goal: 750000,
      raised: 580000,
      location: 'Mumbai, India',
      organizationName: 'Bright Future NGO',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo3',
      title: 'Healthcare Camp for Rural Areas',
      description: 'Mobile healthcare units providing free medical checkups, medicines, and awareness programs in remote villages.',
      category: 'Healthcare',
      goal: 400000,
      raised: 280000,
      location: 'Bihar, India',
      organizationName: 'Health First Initiative',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo4',
      title: 'Feed the Hungry - Community Kitchen',
      description: 'Establishing community kitchens to provide nutritious meals to homeless and underprivileged families daily.',
      category: 'Food Security',
      goal: 300000,
      raised: 195000,
      location: 'Delhi, India',
      organizationName: 'No One Hungry Foundation',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo5',
      title: 'Women Empowerment & Skill Training',
      description: 'Vocational training programs for women to become financially independent through tailoring, handicrafts, and digital skills.',
      category: 'Women Empowerment',
      goal: 250000,
      raised: 170000,
      location: 'Uttar Pradesh, India',
      organizationName: 'Women Rise Together',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
      createdAt: new Date().toISOString(),
    },
  ];

  const fetchCampaigns = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'campaigns'));
      const firebaseCampaigns = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const allCampaigns = [...defaultCampaigns, ...firebaseCampaigns];
      setCampaigns(allCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns(defaultCampaigns);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getCampaignById = async (id) => {
    try {
      const defaultCampaign = defaultCampaigns.find((c) => c.id === id);
      if (defaultCampaign) {
        return { success: true, campaign: defaultCampaign };
      }

      const ref = doc(db, 'campaigns', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return { success: false, error: 'Campaign not found' };
      }

      return { success: true, campaign: { id: snap.id, ...snap.data() } };
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return { success: false, error: 'Failed to fetch campaign' };
    }
  };

  const createCampaign = async (campaignData) => {
    try {
      const docRef = await addDoc(collection(db, 'campaigns'), {
        ...campaignData,
        createdAt: serverTimestamp(),
        raised: campaignData.raised || 0,
        status: campaignData.status || 'active',
      });

      await fetchCampaigns();

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { success: false, error: 'Failed to create campaign' };
    }
  };

  const updateCampaign = async (id, updates) => {
    try {
      const ref = doc(db, 'campaigns', id);
      await updateDoc(ref, {
        ...updates,
      });

      await fetchCampaigns();

      return { success: true };
    } catch (error) {
      console.error('Error updating campaign:', error);
      return { success: false, error: 'Failed to update campaign' };
    }
  };

  const value = {
    campaigns,
    loading,
    fetchCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
  };

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
};

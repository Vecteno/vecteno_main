'use client';

import { useState } from 'react';
import { User, Clock, BadgeDollarSign, Heart } from 'lucide-react';
import ProfileSettings from '../tabs/ProfileSettings';
import PurchaseHistory from '../tabs/PurchaseHistory';
import UserPlans from '../tabs/UserPlans';
import LikedSection from '../tabs/LikedSection';

const tabs = [
  { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
  { id: 'history', label: 'Purchase History', icon: <Clock size={18} /> },
  { id: 'plans', label: 'Plans', icon: <BadgeDollarSign size={18} /> },
  { id: 'liked', label: 'Liked Images', icon: <Heart color='red' size={18} /> },
];

export default function DashboardPage() {
  const [tab, setTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-900 drop-shadow-sm">
          Welcome to Your Dashboard
        </h1>

        <div className="flex justify-center mb-8 gap-4 flex-wrap">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center cursor-pointer gap-2 px-6 py-2 rounded-full transition duration-200 
                ${
                  tab === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-blue-100'
                }`}
            >
              {icon}
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-2xl animate-fade-in">
          {tab === 'profile' && <ProfileSettings />}
          {tab === 'history' && <PurchaseHistory />}
          {tab === 'plans' && <UserPlans />}
          {tab === 'liked' && <LikedSection />}
        </div>
      </div>
    </div>
  );
}

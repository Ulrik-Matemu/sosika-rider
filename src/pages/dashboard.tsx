import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  LogOut, 
  User, 
  Truck, 
  FileText,
  Bell
} from 'lucide-react';

// Assuming you have a type for your Rider data
interface RiderData {
  fullName: string;
  phoneNumber: string;
  plateNumber: string;
  status: 'pending_verification' | 'active' | 'suspended';
  nidaNumber: string;
  selfieUrl: string;
}

export const Dashboard: React.FC = () => {
  // Replace with your actual auth/firestore logic
  const [rider] = useState<RiderData | null>({
    fullName: "Ulrik Matemu",
    phoneNumber: "+255760903468",
    plateNumber: "12345",
    status: "pending_verification",
    nidaNumber: "1234567",
    selfieUrl: "https://res.cloudinary.com/db5isiex3/image/upload/v1774558346/rider_documents/btweshngwejzqtsxlnxk.jpg"
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending_verification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight">Sosika <span className="text-orange-600">Rider</span></h1>
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} className="text-slate-600" />
        </button>
      </nav>

      <main className="max-w-md mx-auto px-6 pt-8 space-y-6">
        
        {/* Profile Card */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-200">
            {rider?.selfieUrl ? (
              <img src={rider.selfieUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <User size={30} />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold">{rider?.fullName}</h2>
            <p className="text-slate-500 text-sm">{rider?.phoneNumber}</p>
          </div>
        </section>

        {/* Status Indicator */}
        <section className={`border rounded-2xl p-5 ${getStatusStyles(rider?.status || '')}`}>
          <div className="flex items-center space-x-3 mb-2">
            {rider?.status === 'pending_verification' ? <Clock size={18} /> : <CheckCircle size={18} />}
            <span className="font-semibold capitalize">{rider?.status?.replace('_', ' ')}</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            {rider?.status === 'pending_verification' 
              ? "We're currently reviewing your documents. This usually takes 24-48 hours. We'll notify you once you're ready to hit the road!"
              : "You are verified and ready to accept deliveries."}
          </p>
        </section>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <Truck size={20} className="text-orange-600 mb-2" />
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Plate Number</p>
            <p className="font-bold">{rider?.plateNumber}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <FileText size={20} className="text-blue-600 mb-2" />
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">NIDA ID</p>
            <p className="font-bold">{rider?.nidaNumber}</p>
          </div>
        </div>

        {/* Action List (Testers) */}
        <div className="space-y-3 pt-4">
          <p className="text-xs font-bold text-slate-400 uppercase px-1">Resources</p>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><AlertCircle size={18} /></div>
              <span className="font-medium">Need Help?</span>
            </div>
            <div className="text-slate-300">→</div>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 text-red-600 transition-colors mt-8">
            <div className="flex items-center space-x-3">
              <div className="bg-red-50 p-2 rounded-lg"><LogOut size={18} /></div>
              <span className="font-medium">Sign Out</span>
            </div>
          </button>
        </div>

      </main>
    </div>
  );
};
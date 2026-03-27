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
const [rider, setRider] = useState<RiderData | null>(null);
const [loading, setLoading] = useState(true);

// Subscribe to auth state and to the rider document in Firestore.
// This uses dynamic imports so you don't need to add top-level firebase imports here.
React.useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
    let unsubscribeDoc: (() => void) | null = null;
    let mounted = true;

    (async () => {
        try {
            const { getAuth, onAuthStateChanged, signOut: firebaseSignOut } = await import('firebase/auth');
            const { getFirestore, doc, onSnapshot } = await import('firebase/firestore');

            const auth = getAuth();
            const db = getFirestore();

            unsubscribeAuth = onAuthStateChanged(
                auth,
                (user) => {
                    if (!mounted) return;
                    if (!user) {
                        setRider(null);
                        setLoading(false);
                        // If you want to navigate to a sign-in page, do it here.
                        return;
                    }

                    // Listen for the rider document (assumes collection "riders" keyed by uid)
                    const riderRef = doc(db, 'riders', user.uid);
                    unsubscribeDoc = onSnapshot(
                        riderRef,
                        (snap) => {
                            if (!mounted) return;
                            const data = snap.data() as Partial<RiderData> | undefined;
                            if (!data) {
                                setRider(null);
                                setLoading(false);
                                return;
                            }

                            setRider({
                                fullName: data.fullName ?? (user.displayName ?? ''),
                                phoneNumber: data.phoneNumber ?? (user.phoneNumber ?? ''),
                                plateNumber: data.plateNumber ?? '',
                                status: (data.status as RiderData['status']) ?? 'pending_verification',
                                nidaNumber: data.nidaNumber ?? '',
                                selfieUrl: data.selfieUrl ?? (user.photoURL ?? ''),
                            });
                            setLoading(false);
                        },
                        (err) => {
                            console.error('rider onSnapshot error', err);
                            if (mounted) setLoading(false);
                        }
                    );
                },
                (err) => {
                    console.error('onAuthStateChanged error', err);
                    if (mounted) setLoading(false);
                }
            );

            // Optional: attach signOut helper to window for quick testing (remove in production)
            (window as any).__riderSignOut = async () => {
                try {
                    await firebaseSignOut(auth);
                } catch (e) {
                    console.error('signOut error', e);
                }
            };
        } catch (e) {
            console.error('Firebase dynamic import failed', e);
            if (mounted) setLoading(false);
        }
    })();

    return () => {
        mounted = false;
        if (unsubscribeDoc) unsubscribeDoc();
        if (unsubscribeAuth) unsubscribeAuth();
    };
}, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10 flex items-center justify-center">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

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
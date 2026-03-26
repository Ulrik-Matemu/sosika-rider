import React, { useState } from 'react';
import { db, auth } from './../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const RiderIdentityForm: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nidaNumber: '',
    plateNumber: '',
  });

  const CLOUDINARY_CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const UPLOAD_PRESET = (import.meta as any).env.VITE_FIREBASE_API_KEY;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "rider_documents"); // Organizes images in Cloudinary

    const resp = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
    const fileData = await resp.json();
    return fileData.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Session expired. Please login again.");

    setUploading(true);
    const form = e.currentTarget;
    const nidaPhoto = (form.elements.namedItem('nidaPhoto') as HTMLInputElement).files?.[0];
    const licensePhoto = (form.elements.namedItem('licensePhoto') as HTMLInputElement).files?.[0];
    const selfiePhoto = (form.elements.namedItem('selfiePhoto') as HTMLInputElement).files?.[0];

    if (!nidaPhoto || !licensePhoto || !selfiePhoto) {
      setUploading(false);
      return alert("Please upload all required photos.");
    }

    try {
      // Upload all 3 images to Cloudinary in parallel
      const [nidaUrl, licenseUrl, selfieUrl] = await Promise.all([
        uploadFile(nidaPhoto),
        uploadFile(licensePhoto),
        uploadFile(selfiePhoto),
      ]);

      // Update Firestore with the URLs and change status
      await updateDoc(doc(db, "riders", user.uid), {
        ...formData,
        nidaUrl,
        licenseUrl,
        selfieUrl,
        status: "pending_verification",
        updatedAt: new Date().toISOString(),
      });

      alert("Application submitted! We will verify your account shortly.");
      // Redirect to a 'Waiting' or 'Profile' screen
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Something went wrong during upload. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6">Complete Rider Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Text Fields */}
        <input name="fullName" placeholder="Full Name (as per NIDA)" onChange={handleInputChange} required className="w-full p-3 border rounded-lg" />
        <input name="nidaNumber" placeholder="NIDA Number" onChange={handleInputChange} required className="w-full p-3 border rounded-lg" />
        <input name="plateNumber" placeholder="Vehicle Plate (e.g., MC 123 ABC)" onChange={handleInputChange} required className="w-full p-3 border rounded-lg" />

        {/* File Inputs - Using 'capture' to open camera on mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700">NIDA Card Front</label>
          <input name="nidaPhoto" type="file" accept="image/*" capture="environment" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Driving License (Class A)</label>
          <input name="licensePhoto" type="file" accept="image/*" capture="environment" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Live Selfie</label>
          <input name="selfiePhoto" type="file" accept="image/*" capture="user" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" />
        </div>

        <button 
          disabled={uploading} 
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
        >
          {uploading ? "Uploading Documents..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
};

export default RiderIdentityForm;
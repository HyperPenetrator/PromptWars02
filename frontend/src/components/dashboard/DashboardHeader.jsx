import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { uploadProfilePicture, trackEvent } from '../../firebase';

/**
 * DashboardHeader component displays the user's welcome message and overall readiness progress.
 * @param {Object} props
 * @param {Object} props.user - The Firebase user object.
 * @param {number} props.completionPercentage - The calculated readiness percentage.
 */
export default function DashboardHeader({ user, completionPercentage }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    setIsUploading(true);
    try {
      const url = await uploadProfilePicture(user.uid, file);
      // In a real app, you'd update the user profile or firestore here
      // For the demo, we'll just track it and simulate success
      alert("Profile picture uploaded successfully! (Simulation)");
      trackEvent('profile_update_success');
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="dashboard-header glass-card">
      <div className="user-welcome">
        <div className="avatar-large u-relative">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}`} 
            alt={`Profile picture of ${user?.displayName || 'Voter'}`} 
          />
          <button 
            className="avatar-edit-btn u-flex-center" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload profile picture"
            title="Upload profile picture"
          >
            {isUploading ? <Loader2 className="u-spin" size={14} /> : <Camera size={14} />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="u-hidden" 
            accept="image/*"
          />
        </div>
        <div>
          <h2>Welcome back, {(user?.displayName || 'Voter').split(' ')[0]}!</h2>
          <p className="u-text-muted">You are {completionPercentage}% ready for the election.</p>
        </div>
      </div>
      <div 
        className="progress-track" 
        role="progressbar" 
        aria-valuenow={completionPercentage} 
        aria-valuemin="0" 
        aria-valuemax="100"
        aria-label="Election readiness progress"
      >
        <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
      </div>
    </div>
  );
}

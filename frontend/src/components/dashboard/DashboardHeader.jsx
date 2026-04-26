import React from 'react';

/**
 * DashboardHeader component displays the user's welcome message and overall readiness progress.
 * @param {Object} props
 * @param {Object} props.user - The Firebase user object.
 * @param {number} props.completionPercentage - The calculated readiness percentage.
 */
export default function DashboardHeader({ user, completionPercentage }) {
  return (
    <div className="dashboard-header glass-card">
      <div className="user-welcome">
        <div className="avatar-large">
          <img src={user?.photoURL} alt={user?.displayName} />
        </div>
        <div>
          <h2>Welcome back, {user?.displayName.split(' ')[0]}!</h2>
          <p className="u-text-muted">You are {completionPercentage}% ready for the election.</p>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
      </div>
    </div>
  );
}

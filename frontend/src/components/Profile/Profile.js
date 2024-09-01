import React from "react";
import "./Profile.css";

const Profile = () => {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-pic-container">
          <img src="profile-pic-url" alt="User Name" className="profile-pic" />
        </div>
        <h1 className="profile-name">User Name</h1>
        <p className="profile-username">@username</p>
        <div className="profile-actions">
          <button className="edit-profile-btn">Edit Profile</button>
          <button className="view-activity-btn">View Activity</button>
        </div>
      </div>
      <div className="profile-details">
        <h2 className="profile-section-title">About</h2>
        <p className="profile-description">
          This is a short bio about the user. It gives a quick overview of who
          they are, what they do, and their interests.
        </p>
        <h2 className="profile-section-title">Skills</h2>
        <ul className="profile-skills">
          <li className="skill">JavaScript</li>
          <li className="skill">React</li>
          <li className="skill">CSS</li>
          <li className="skill">Node.js</li>
        </ul>
        <h2 className="profile-section-title">Recent Activity</h2>
        <ul className="recent-activity">
          <li className="activity-item">
            Posted a new article: "How to build a modern web app."
          </li>
          <li className="activity-item">
            Commented on "JavaScript best practices."
          </li>
          <li className="activity-item">
            Joined the "React Developers" group.
          </li>
        </ul>
        <div className="profile-social-links">
          <a href="https://twitter.com" className="social-link">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://linkedin.com" className="social-link">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="https://github.com" className="social-link">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;

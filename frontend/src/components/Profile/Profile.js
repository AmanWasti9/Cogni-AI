import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "./Profile.css";
import { firestore, storage } from "../../firebase";
import { getAuth } from "firebase/auth";
import { IoCameraReverse } from "react-icons/io5";

const Profile = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    imageUrl: "",
  });
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(userData.username || "");
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(firestore, "Users", user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            username: data.username,
            email: data.email,
            imageUrl: data.imageUrl || "",
          });
          setNewUsername(data.username || "");
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user.uid]);

  const firstLetter = userData.username
    ? userData.username.charAt(0).toUpperCase()
    : "";

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Optionally show progress
          },
          (error) => {
            console.error("Error uploading image:", error.message);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const userDoc = doc(firestore, "Users", user.uid);
              await updateDoc(userDoc, {
                imageUrl: downloadURL,
              });
              setUserData((prevData) => ({
                ...prevData,
                imageUrl: downloadURL,
              }));
            } catch (error) {
              console.error(
                "Error getting download URL or updating Firestore:",
                error
              );
            }
          }
        );
      } catch (error) {
        console.error("Error uploading and updating image:", error);
      }
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleSaveUsername = async () => {
    try {
      const userDoc = doc(firestore, "Users", user.uid);
      await updateDoc(userDoc, {
        username: newUsername,
      });
      setUserData((prevData) => ({
        ...prevData,
        username: newUsername,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-pic-container">
          <div className="avatar">
            {!userData.imageUrl && <span>{firstLetter}</span>}
            {userData.imageUrl && (
              <img
                src={userData.imageUrl}
                alt="Profile"
                className="profile-image"
              />
            )}
          </div>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput">
            <IoCameraReverse className="camera-icon" />
          </label>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={newUsername}
            onChange={handleUsernameChange}
            className="edit-username-input"
          />
        ) : (
          <h1 className="profile-name">{userData.username}</h1>
        )}
        <p className="profile-username">{userData.email}</p>
        <div className="profile-actions">
          {isEditing ? (
            <button className="save-username-btn" onClick={handleSaveUsername}>
              Save
            </button>
          ) : (
            <button className="edit-profile-btn" onClick={handleEditToggle}>
              Edit Profile
            </button>
          )}
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



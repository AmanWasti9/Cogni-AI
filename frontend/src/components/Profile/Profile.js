import React, { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "./Profile.css";
import { firestore, storage } from "../../firebase";
import { getAuth } from "firebase/auth";
import { IoCameraReverse } from "react-icons/io5";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaUserEdit } from "react-icons/fa";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IoCloseCircle } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

const Profile = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    imageUrl: "",
    about: "",
    skills: [],
  });
  const [image, setImage] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const [summaries, setSummaries] = useState([]);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(userData.username || "");

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [newAbout, setNewAbout] = useState(userData.about || "");

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkills, setNewSkills] = useState(userData.skills.join(", ") || "");

  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page
  }, []);

  const handleEditToggle = (section) => {
    switch (section) {
      case "username":
        setIsEditingUsername(!isEditingUsername);
        break;
      case "about":
        setIsEditingAbout(!isEditingAbout);
        break;
      case "skills":
        setIsEditingSkills(!isEditingSkills);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        // Replace 'user.uid' with the actual UID of the logged-in user if available
        const userDocRef = doc(firestore, "Summaries", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userSummaries = userDocSnapshot.data().Summaries || [];

          console.log("Fetched summaries:", userSummaries);
          setSummaries(userSummaries);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
      }
    };
    fetchSummaries();
  }, []);

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleAboutChange = (e) => {
    setNewAbout(e.target.value);
  };

  const handleSkillsChange = (e) => {
    setNewSkills(e.target.value);
  };

  const handleSave = async (section) => {
    try {
      const userDoc = doc(firestore, "Users", user.uid);

      switch (section) {
        case "username":
          await updateDoc(userDoc, {
            username: newUsername,
          });
          setUserData((prevData) => ({
            ...prevData,
            username: newUsername,
          }));
          setIsEditingUsername(false);
          break;

        case "about":
          await updateDoc(userDoc, {
            about: newAbout,
          });
          setUserData((prevData) => ({
            ...prevData,
            about: newAbout,
          }));
          setIsEditingAbout(false);
          break;

        case "skills":
          const newSkillsArray = newSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0);

          const updatedSkillsArray = [
            ...new Set([...userData.skills, ...newSkillsArray]), // Combine existing skills with new ones and ensure uniqueness
          ];

          await updateDoc(userDoc, {
            skills: updatedSkillsArray,
          });

          setUserData((prevData) => ({
            ...prevData,
            skills: updatedSkillsArray,
          }));
          setIsEditingSkills(false);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

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
            about: data.about || "",
            skills: data.skills || [],
          });
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

  const handleOpen = async (summary) => {
    try {
      // Assuming that `summary.userId` and `summary.name` are correct
      const summariesCollectionRef = collection(
        firestore,
        `Summaries/${user.uid}/${summary.name}`
      );

      const summariesSnapshot = await getDocs(summariesCollectionRef);

      if (!summariesSnapshot.empty) {
        const summaryData = summariesSnapshot.docs.map((doc) => doc.data());
        setSelectedPost({ ...summary, summaries: summaryData });
      } else {
        console.log("No documents found in the sub-collection!");
        setSelectedPost({ ...summary, summaries: [] });
      }
    } catch (error) {
      console.error("Error fetching summary documents:", error);
    }
  };

  // Function to handle skill deletion
  const handleDeleteSkill = async (index) => {
    try {
      const userDoc = doc(firestore, "Users", user.uid);

      // Get current skills from state
      const updatedSkills = [...userData.skills];

      // Remove the skill at the specified index
      updatedSkills.splice(index, 1);

      // Update Firestore with the new list of skills
      await updateDoc(userDoc, {
        skills: updatedSkills,
      });

      // Update local state with the new list of skills
      setUserData((prevData) => ({
        ...prevData,
        skills: updatedSkills,
      }));
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave("skills");
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-pic-container">
          <div className="avatar text-font">
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
        {isEditingUsername ? (
          <input
            type="text"
            value={newUsername}
            onChange={handleUsernameChange}
            className="edit-username-input text-font"
            style={{
              border: "1px solid #5218fa",
              borderRadius: "10px",
              padding: "10px",
              fontSize: "20px",
              background: "transparent",
              color: "white",
              marginTop: "10px",
            }}
          />
        ) : (
          <h1 className="profile-name text-font">{userData.username}</h1>
        )}
        <p className="profile-username text-font">{userData.email}</p>
        <div className="profile-actions">
          {isEditingUsername ? (
            <button
              className="edit-profile-btn text-font"
              onClick={() => handleSave("username")}
            >
              Save
            </button>
          ) : (
            <button
              className="edit-profile-btn text-font"
              onClick={() => handleEditToggle("username")}
            >
              Edit Profile
            </button>
          )}
          <button className="view-activity-btn text-font">View Activity</button>
        </div>
      </div>
      <div className="profile-details text-font">
        <h2 className="profile-section-title text-font">About</h2>
        <div
          style={{
            display: "flex",
            flexDirection: isEditingAbout ? "column" : "row", // Conditional flexDirection
            gap: "20px",
          }}
        >
          {isEditingAbout ? (
            <textarea
              value={newAbout}
              onChange={handleAboutChange}
              className="edit-about-input text-font"
              style={{
                width: "100%",
                height: "100px",
                border: "1px solid #5218fa",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "16px",
                background: "transparent",
                color: "white",
                marginTop: "10px",
              }}
            />
          ) : (
            <p className="profile-description text-font">{userData.about}</p>
          )}
          {isEditingAbout ? (
            <button
              className="edit-profile-btn text-font"
              onClick={() => handleSave("about")}
            >
              Save
            </button>
          ) : (
            <span onClick={() => handleEditToggle("about")}>
              <FaUserEdit
                style={{
                  fontSize: "25px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              />
            </span>
          )}
        </div>
        <h2 className="profile-section-title text-font">Skills</h2>
        <div
          style={{
            display: "flex",
            flexDirection: isEditingSkills ? "column" : "row", // Conditional flexDirection
            gap: "20px",
          }}
        >
          {isEditingSkills ? (
            <input
              type="text"
              onChange={handleSkillsChange}
              onKeyDown={handleKeyDown}
              className="edit-skills-input text-font"
              style={{
                width: "100%",
                border: "1px solid #5218fa",
                borderRadius: "10px",
                padding: "10px",
                fontSize: "16px",
                background: "transparent",
                color: "white",
                marginTop: "10px",
              }}
            />
          ) : (
            <ul
              className="profile-skills"
              style={{
                listStyle: "none",
              }}
            >
              {userData.skills.map((skill, index) => (
                <li key={index} className="skill text-font">
                  {skill}
                  <span
                    onClick={() => handleDeleteSkill(index)}
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-5px",
                      cursor: "pointer",
                      color: "#5218fa",
                      fontSize: "20px",
                    }}
                  >
                    <IoCloseCircle />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {isEditingSkills ? (
            <button
              className="edit-profile-btn text-font"
              onClick={() => handleSave("skills")}
            >
              Add
            </button>
          ) : (
            <span onClick={() => handleEditToggle("skills")}>
              <IoAddCircleSharp
                style={{
                  fontSize: "35px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              />
            </span>
          )}
        </div>

        <h2 className="profile-section-title text-font">My Posts</h2>
        <div>
          {summaries.length > 0 ? (
            summaries.map((summary, index) => (
              <Accordion
                key={index}
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "white",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      style={{
                        color: "white",
                      }}
                    />
                  }
                  aria-controls="panel1-content"
                  id="panel1-header"
                  onClick={() => handleOpen(summary)}
                  className="text-font"
                >
                  {summary.name}
                  {summary.likes ? summary.likes.length : 0}{" "}
                  {summary.likes && summary.likes.length === 1
                    ? "like"
                    : "likes"}
                </AccordionSummary>

                <AccordionDetails>
                  {selectedPost && selectedPost.name === summary.name ? (
                    selectedPost.summaries.length > 0 ? (
                      selectedPost.summaries.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            paddingLeft: "10px",
                          }}
                          className="text-font"
                        >
                          <ReactMarkdown>{item.summary}</ReactMarkdown>
                        </div>
                      ))
                    ) : (
                      <p className="text-font">No summaries available</p>
                    )
                  ) : (
                    <p>Loading...</p>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

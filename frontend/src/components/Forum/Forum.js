import React, { useEffect, useState } from "react";
import "./Forum.css";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AiOutlineLike, AiFillLike } from "react-icons/ai"; // Importing the icons
import { FaShare } from "react-icons/fa";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]); // State to track liked posts
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { id } = useParams();
  const [shareLinkOpen, setShareLinkOpen] = useState(false); // New state for share link dialog
  const [shareLink, setShareLink] = useState(""); // State to store the share link

  const auth = getAuth();
  const user = auth.currentUser;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user) return;

      try {
        const userSummariesDocRef = doc(firestore, "Summaries", user.uid);
        const userSummariesDoc = await getDoc(userSummariesDocRef);

        if (userSummariesDoc.exists()) {
          const userSummariesData = userSummariesDoc.data();
          const summaries = userSummariesData.Summaries || [];

          // Extract the names of summaries that the user has liked
          const likedSummaryNames = summaries
            .filter(
              (summary) => summary.likes && summary.likes.includes(user.uid)
            )
            .map((summary) => summary.name);

          setLikedPosts(likedSummaryNames);
        }
      } catch (error) {
        console.error("Error fetching liked summaries:", error);
      }
    };

    fetchLikedPosts();
  }, [user]);

  // const handleOpen = async (post) => {
  //   try {
  //     const summariesCollectionRef = collection(
  //       firestore,
  //       `Summaries/${post.userId}/${post.name}`
  //     );

  //     const summariesSnapshot = await getDocs(summariesCollectionRef);
  //     if (!summariesSnapshot.empty) {
  //       const summaryData = summariesSnapshot.docs.map((doc) => doc.data());
  //       setSelectedPost({ ...post, summaries: summaryData });
  //       console.log(summaryData);
  //       setOpen(true);
  //       navigate(`/forum/post/${post.name}`, { replace: true });
  //     } else {
  //       console.error("No documents found in the sub-collection!");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching summary documents:", error);
  //   }
  // };

  const handleOpen = async (post) => {
    try {
      const summariesCollectionRef = collection(
        firestore,
        `Summaries/${post.userId}/${post.name}`
      );

      const summariesSnapshot = await getDocs(summariesCollectionRef);
      if (!summariesSnapshot.empty) {
        const summaryData = summariesSnapshot.docs.map((doc) => doc.data());
        setSelectedPost({ ...post, summaries: summaryData });
        console.log("Summary data:", summaryData);
        setOpen(true);
        navigate(`/forum/post/${post.name}`, { replace: true });
      } else {
        console.error("No documents found in the sub-collection!");
      }
    } catch (error) {
      console.error("Error fetching summary documents:", error);
    }
  };

  const handleShareLinkOpen = (post) => {
    console.log("Opening share link dialog");
    const link = `${window.location.origin}/forum/post/${post.name}`;
    setShareLink(link);
    setShareLinkOpen(true);
  };

  const handleClose = () => {
    setOpen(false); // Close summary dialog
    setShareLinkOpen(false); // Close share link dialog
    setSelectedPost(null); // Clear selected post
    navigate("/forum", { replace: true });
  };

  const topics = ["All", "General", "Announcements", "React"];

  useEffect(() => {
    const fetchPublicSummaries = async () => {
      try {
        const summariesCollection = collection(firestore, "Summaries");
        const summariesSnapshot = await getDocs(summariesCollection);

        const allSummaries = [];

        for (const docSnapshot of summariesSnapshot.docs) {
          const summaries = docSnapshot.data().Summaries || [];

          const userDocRef = doc(firestore, "Users", docSnapshot.id);
          const userDocSnapshot = await getDoc(userDocRef);
          const username = userDocSnapshot.exists()
            ? userDocSnapshot.data().username
            : "Unknown User";

          summaries.forEach((summary) => {
            if (summary.public) {
              allSummaries.push({
                userId: docSnapshot.id,
                name: summary.name,
                username,
                ...summary,
              });
            }
          });
        }

        console.log("Fetched public summaries with usernames:", allSummaries);
        setPosts(allSummaries);
      } catch (error) {
        console.error("Error fetching public summaries:", error);
      }
    };

    fetchPublicSummaries();
  }, []);

  useEffect(() => {
    const postName = location.pathname.split("/forum/post/")[1];
    if (postName) {
      const post = posts.find((p) => p.name === postName);
      if (post) {
        handleOpen(post);
      }
    }
  }, [location.pathname, posts]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleAddToCollection = (postId) => {
    const topic = prompt("Enter the topic name for this post:");
    if (topic) {
      const updatedPosts = posts.map((post) =>
        post.id === postId ? { ...post, topic } : post
      );
      setPosts(updatedPosts);
    }
  };

  const handleTopicSelection = (topic) => {
    setSelectedTopic(topic === "All" ? "" : topic);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.name.toLowerCase().includes(filter.toLowerCase()) &&
      (selectedTopic ? post.topic === selectedTopic : true)
  );

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  const handleLikeToggle = async (postId) => {
    // Find the post based on postId
    const post = posts.find((post) => post.name === postId);
    if (!post) {
      console.error("Post not found!");
      return;
    }

    const { userId, name } = post; // Destructure the necessary fields

    // Create reference to the user's Summaries document
    const userSummariesDocRef = doc(firestore, "Summaries", userId);

    try {
      // Fetch the user's Summaries document
      const userSummariesDoc = await getDoc(userSummariesDocRef);

      if (!userSummariesDoc.exists()) {
        console.error("User Summaries document does not exist!");
        return;
      }

      // Get the Summaries array from the user's document
      const userSummariesData = userSummariesDoc.data();
      const summaries = userSummariesData.Summaries || [];

      // Find the specific summary within the array
      const summaryIndex = summaries.findIndex(
        (summary) => summary.name === name
      );
      if (summaryIndex === -1) {
        console.error("Summary not found in the user's Summaries array!");
        return;
      }

      const summary = summaries[summaryIndex];
      const currentUserId = getAuth().currentUser.uid;

      // Update the likes array for the specific summary manually
      const updatedLikes = summary.likes || [];
      const alreadyLiked = updatedLikes.includes(currentUserId);

      if (alreadyLiked) {
        console.log(`User is unliking post with ID: ${postId}`);
        updatedLikes.splice(updatedLikes.indexOf(currentUserId), 1); // Remove user ID from likes
      } else {
        console.log(`User is liking post with ID: ${postId}`);
        updatedLikes.push(currentUserId); // Add user ID to likes
      }

      // Update the specific summary in the summaries array
      summaries[summaryIndex] = {
        ...summary,
        likes: updatedLikes,
      };

      // Update the user's Summaries document with the modified summaries array
      await updateDoc(userSummariesDocRef, {
        Summaries: summaries,
      });

      // Update local state
      setLikedPosts((prevLikedPosts) => {
        if (alreadyLiked) {
          return prevLikedPosts.filter((id) => id !== postId);
        } else {
          return [...prevLikedPosts, postId];
        }
      });
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  // const handleShareLinkOpen = (post) => {
  //   console.log("Opening share link dialog"); // Add this line for debugging
  //   const link = `${window.location.origin}/forum/post/${post.name}`;
  //   setShareLink(link);
  //   setShareLinkOpen(true);
  // };

  return (
    <div
      className="forum-layout"
      style={{
        marginTop: "150px",
      }}
    >
      <div className="sidebar">
        <h2>Collections</h2>
        <ul>
          {topics.map((topic) => (
            <li key={topic} onClick={() => handleTopicSelection(topic)}>
              {topic}
            </li>
          ))}
        </ul>
      </div>
      <div className="forum-container">
        <div className="forum-controls">
          <input
            type="text"
            placeholder="Filter posts..."
            value={filter}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <h1 className="forum-title">Forum</h1>
        <div className="posts-list">
          {sortedPosts.map((post) => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <span className="post-user">{post.username}</span>
                  <p className="post-content">Topic: {post.name}</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCollection(post.id);
                    }}
                    className="add-to-collection-btn"
                  >
                    Add to Collection
                  </button>
                  <button
                    onClick={() => handleOpen(post)}
                    className="add-to-collection-btn"
                  >
                    View More
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle(post.name);
                  }}
                  style={{
                    color: likedPosts.includes(post.name)
                      ? "lightblue"
                      : "white",
                    fontSize: "20px",
                    background: "transparent",
                  }}
                >
                  {likedPosts.includes(post.name) ? (
                    <AiFillLike />
                  ) : (
                    <AiOutlineLike />
                  )}
                  {post.likes && post.likes.length > 0 ? (
                    <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                      {post.likes.length}
                    </span>
                  ) : (
                    <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                      0
                    </span>
                  )}
                </span>

                <span onClick={() => handleShareLinkOpen(post)}>
                  <FaShare />{" "}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPost && (
        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              backgroundColor: "black",
              boxShadow: "none",
            },
          }}
        >
          <DialogTitle
            sx={{
              color: "white",
            }}
          >
            {selectedPost.name}
          </DialogTitle>
          <DialogContent>
            {selectedPost.summaries.map((summary, index) => (
              <DialogContentText
                key={index}
                sx={{
                  color: "white",
                  marginBottom: "16px",
                }}
              >
                <strong>Page:</strong> {summary.page}
                <br />
                {summary.formula && (
                  <>
                    <strong>Formula:</strong> {summary.formula}
                    <br />
                  </>
                )}
                {summary.diagrams && (
                  <>
                    <strong>Diagrams:</strong> {summary.diagrams}
                    <br />
                  </>
                )}
                <strong>Summary:</strong> {summary.summary}
              </DialogContentText>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Share Link Dialog */}
      {/* Share Link Dialog */}
      <Dialog open={shareLinkOpen} onClose={() => setShareLinkOpen(false)}>
        <DialogTitle>Share This Post</DialogTitle>
        <DialogContent>
          <DialogContentText>Copy the link below to share:</DialogContentText>
          <input
            type="text"
            value={shareLink}
            readOnly
            className="share-link-input"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareLinkOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Forum;

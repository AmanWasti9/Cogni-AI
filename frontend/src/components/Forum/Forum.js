import React, { useEffect, useState } from "react";
import "./Forum.css";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
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

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleOpen = (post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
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

          // Fetch the corresponding user document to get the username
          const userDocRef = doc(firestore, "Users", docSnapshot.id);
          const userDocSnapshot = await getDoc(userDocRef);
          const username = userDocSnapshot.exists()
            ? userDocSnapshot.data().username
            : "Unknown User";

          summaries.forEach((summary) => {
            if (summary.public) {
              allSummaries.push({
                id: docSnapshot.id, // This is the user document ID (uid)
                name: summary.name,
                username, // Add username here
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
            <div
              className="post"
              key={post.id}
              onClick={() => handleOpen(post)}
            >
              <div className="post-header">
                <span className="post-user">{post.username}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCollection(post.id);
                  }}
                  className="add-to-collection-btn"
                >
                  Add to Collection
                </button>
              </div>
              <p className="post-content">Topic: {post.name}</p>
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
            <DialogContentText
              sx={{
                color: "white",
              }}
            >
              <strong>Username:</strong> {selectedPost.username}
              <br />
              <strong>Content:</strong> {selectedPost.content}
              <br />
              <strong>Date:</strong> {selectedPost.date}
              <br />
              <strong>Topic:</strong> {selectedPost.topic}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              sx={{
                backgroundColor: "white",
                color: "indigo",
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Forum;

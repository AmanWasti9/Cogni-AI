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
import { useNavigate, useLocation, useParams } from "react-router-dom";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { id } = useParams();

  const auth = getAuth();
  const user = auth.currentUser;

  const navigate = useNavigate();
  const location = useLocation();

  const handleOpen = async (post) => {
    try {
      // Reference to the sub-collection
      const summariesCollectionRef = collection(
        firestore,
        `Summaries/${post.userId}/${post.name}`
      );

      // Fetch all documents within the sub-collection
      const summariesSnapshot = await getDocs(summariesCollectionRef);
      if (!summariesSnapshot.empty) {
        const summaryData = summariesSnapshot.docs.map((doc) => doc.data());
        setSelectedPost({ ...post, summaries: summaryData });
        console.log(summaryData);
        setOpen(true);
        navigate(`/forum/post/${post.name}`, { replace: true });
      } else {
        console.error("No documents found in the sub-collection!");
      }
    } catch (error) {
      console.error("Error fetching summary documents:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
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
            {selectedPost.summaries.map((summary, index) => (
              <DialogContentText
                key={index}
                sx={{
                  color: "white",
                  marginBottom: "16px", // Add some spacing between summaries
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
    </div>
  );
};

export default Forum;

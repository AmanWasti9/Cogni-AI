import React, { useState } from "react";
import "./Hero.css";
import {
  Alert,
  Box,
  Snackbar,
  TextField,
  CircularProgress,
} from "@mui/material";
import { firestore } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Card from "../Card/card";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const emailRef = doc(firestore, "waitlist", email);
      const emailDoc = await getDoc(emailRef);

      if (emailDoc.exists()) {
        // Email already exists in the waitlist
        setSnackbarMessage(
          "Email is already used. Please try a different one."
        );
        setSnackbarOpen(true);
      } else {
        // Email does not exist, so we add it to the waitlist
        await setDoc(emailRef, {
          email: email,
        });
        setEmail("");

        setSnackbarMessage("Joined Our Waitlist successfully!");
        setSnackbarOpen(true);

        // Delay the Snackbar closing to show the message
        setTimeout(() => {
          setSnackbarOpen(false);
          setLoading(true); // Start the loader before showing the card

          // Simulate a delay for the card to load
          setTimeout(() => {
            setLoading(false);
            setShowCard(true); // Show the Card component after loader
          }, 2000); // Adjust the delay as needed
        }, 3000);
      }
    } catch (error) {
      console.log(error.message);
      setSnackbarMessage("Registration failed. Please try again.");
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h2
            className="header-font text-center"
            style={{
              background: "linear-gradient(to bottom, #e848e5, #5218fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "6rem",
            }}
          >
            Cogni
          </h2>

          <Box
            className="fluid-gradient"
            component="form"
            onSubmit={handleJoin}
          >
            <TextField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              sx={{
                "& .MuiOutlinedInput-root": {
                  position: "relative",
                  width: "300px",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "4px",
                    padding: "2px",
                    background: "linear-gradient(to bottom, #e848e5, #5218fa)",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  },
                  "& fieldset": {
                    borderColor: "transparent",
                  },
                  "&:hover fieldset": {
                    borderColor: "transparent",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "transparent",
                  },
                  color: "white",
                },
                "& .MuiOutlinedInput-input": {
                  color: "white",
                },
              }}
              InputLabelProps={{
                style: { color: "white" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
            />
            <button className="hero-button" type="submit">
              Join our waitlist
            </button>
          </Box>
        </div>

        <div className="loader-container">
          {/* Conditionally render the loader or the Card component */}
          {loading ? (
            <CircularProgress color="secondary" />
          ) : (
            showCard && <Card />
          )}
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={
              snackbarMessage === "Joined Our Waitlist successfully!"
                ? "success"
                : "error"
            }
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </section>
    </div>
  );
}

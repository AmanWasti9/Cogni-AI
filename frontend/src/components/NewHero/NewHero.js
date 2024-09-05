import React, { useState } from "react";
import "./NewHero.css";
import { Alert, Box, Snackbar, TextField } from "@mui/material";
import { firestore } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import Card from "../Card/card";
import { Link } from "react-router-dom";

const NewHero = () => {
  const [email, setEmail] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [userName, setUserName] = useState(""); // New state for storing the extracted name

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      // Extract the name before the "@" sign
      const name = email.substring(0, email.indexOf("@"));
      setUserName(name);

      await setDoc(doc(firestore, "waitlist", email), {
        email: email,
      });
      setEmail("");

      setSnackbarMessage("Joined Our Waitlist successfully!");
      setSnackbarOpen(true);

      // Delay the Snackbar closing to show the message
      setTimeout(() => {
        setSnackbarOpen(false);
        setShowCard(true); // Show the Card component after snackbar closes
      }, 3000);
    } catch (error) {
      console.log(error.message);
      setSnackbarMessage("Registration failed. Please try again.");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="container_nh" id="home">
      <ul id="cards_nh">
        <li className="card_nh" id="card1_nh">
          <div className="card_body_nh">
            <div
              className="card_div1_nh"
              style={{
                fontSize: "20px",
              }}
            >
              <p className="text-font text-center">
                Tired of sifting through endless articles or scrolling through
                Wikipedia pages to find the information you need?{" "}
              </p>
            </div>
          </div>
        </li>

        <li className="card_nh" id="card2">
          <div className="card_body_nh">
            <div className="card_div1_nh">
              <p
                className="text-font text-center"
                style={{
                  fontSize: "20px",
                }}
              >
                We get it—it's frustrating.
                <br /> That's why we created . . .{" "}
              </p>
            </div>
          </div>
        </li>
        <li className="card_nh" id="card3_nh">
          <div className="card_body_nh">
            <div className="card_div1_nh">
              <h2
                className="header-font text-center res-cog"
                style={{
                  background: "linear-gradient(to bottom, #e848e5, #5218fa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                COGNI
              </h2>
              <br />
              <Box className="fluid-gradient" component="form">
                <Link
                  to="/signup"
                  className="hero-button txt-dec"
                  type="submit"
                >
                  Get Started
                </Link>
              </Box>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default NewHero;

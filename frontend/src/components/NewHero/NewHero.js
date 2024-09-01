import React, { useState } from "react";
import "./NewHero.css";
import { Alert, Box, Snackbar, TextField } from "@mui/material";
import { firestore } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import Card from "../Card/card";

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
        {/* <li className="card_nh" id="card3_nh">
          <div className="card_body_nh1">
            <div className="card_div1_nh1">
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
              <br />
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
                        background:
                          "linear-gradient(to bottom, #e848e5, #5218fa)",
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
                  Join
                </button>
              </Box>
            </div>
            <div>
              <div
                style={{ height: "90vh", width: "50vw", marginTop: "150px" }}
              >
                {showCard && <Card userName={userName} />}
              </div>
            </div>
          </div>
        </li> */}
      </ul>
      {/* <Snackbar
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
      </Snackbar> */}
    </div>
  );
};

export default NewHero;

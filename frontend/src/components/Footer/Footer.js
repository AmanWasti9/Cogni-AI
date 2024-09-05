import React from "react";
import "./Footer.css";
import { Container } from "@mui/material";
import { Link as ScrollLink } from "react-scroll";

export default function Footer() {
  return (
    <div
      id="footer"
      style={{
        marginTop: "100px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        paddingBottom: "50px", // Ensure space for the button
      }}
    >
      <Container>
        <hr />
        <br />

        <p className="text-center foot-font">
          Made by Team A<sup>3</sup> &copy;{" "}
          <span
            style={{
              background: "linear-gradient(to bottom, #e848e5, #5218fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cogni
          </span>{" "}
          . 2024
        </p>
        <p className="text-center foot-font">
          <a
            href="https://www.linkedin.com/in/aman-wasti/"
            target="_blank"
            rel="noopener noreferrer"
            className="txt-dec color-white"
          >
            Amanullah
          </a>{" "}
          |{" "}
          <a
            href="https://www.linkedin.com/in/ahmed-bashaar-200197225/"
            target="_blank"
            rel="noopener noreferrer"
            className="txt-dec color-white"
          >
            Ahmed
          </a>{" "}
          |{" "}
          <a
            href="https://www.linkedin.com/in/mirza-asfandyar-baig-44abb6218/"
            target="_blank"
            rel="noopener noreferrer"
            className="txt-dec color-white"
          >
            Asfandyar
          </a>
        </p>
      </Container>
    </div>
  );
}

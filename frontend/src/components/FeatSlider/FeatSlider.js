// src/components/FeatSlider.js
import React from "react";
import "./FeatSlider.css";
import url from "../../Images/url.png";
import forum from "../../Images/forum.png";
import one from "../../Images/one.png";
import hero from "../../Images/hero.jpg";

const FeatSlider = () => {
  return (
    <div>
      <div className="container" id="features">
        <h2
          className="header-font"
          style={{
            marginTop: "50px",
          }}
        >
          What do we offer ?
        </h2>

        <ul id="cards">
          <li className="card" id="card1">
            <div className="card-body">
              <div className="card-div1 b-l-rad ">
                <h2
                  className="header-font"
                  style={{
                    fontSize: "clamp(18px, 30px, 40px)",
                  }}
                >
                  Quick Scan & Summarize{" "}
                </h2>
                <br />

                <p className="text-font">
                  Instantly scan URLs to extract key information and get concise
                  summaries. Whether it's a lengthy article or a detailed
                  report, Cogni simplifies content consumption by providing you
                  with the most important points at a glance.
                </p>
              </div>
              <div className="card-div2 b-r-rad ">
                <img src={url} alt="" className="fs_img" />
              </div>
            </div>
          </li>
          <li className="card" id="card2">
            <div className="card-body">
              <div className="card-div2 b-l-rad">
                <img src={forum} alt="" className="fs_img" />
              </div>
              <div className="card-div1 b-r-rad">
                {" "}
                <h2
                  className="header-font"
                  style={{
                    fontSize: "clamp(18px, 30px, 40px)",
                  }}
                >
                  PDFs Simplified
                </h2>
                <br />
                <p className="text-font">
                  Upload your PDFs and let Cogni do the heavy lifting. Our
                  advanced summarization tool condenses lengthy documents into
                  easily digestible summaries, helping you save time and focus
                  on what truly matters
                </p>
              </div>
            </div>
          </li>
          <li className="card" id="card3">
            <div className="card-body">
              <div className="card-div1 b-l-rad">
                <h2
                  className="header-font"
                  style={{
                    fontSize: "clamp(18px, 30px, 40px)",
                  }}
                >
                  Engage & Exchange Ideas
                </h2>
                <br />

                <p className="text-font">
                  Join a vibrant community of learners and thinkers. Share
                  insights, ask questions, and participate in discussions that
                  enrich your knowledge. The Cogni forum is your space for
                  meaningful conversations and collaborative learning.
                </p>
              </div>
              <div className="card-div2 b-r-rad">
                <img src={one} alt="" className="fs_img" />
              </div>
            </div>
          </li>
          <li className="card" id="card4">
            <div className="card-body">
              <div className="card-div2 b-l-rad">
                <img
                  src={hero}
                  alt=""
                  className="fs_img"
                  style={{
                    borderRadius: "30px",
                  }}
                />
              </div>
              <div className="card-div1 b-r-rad">
                <h2
                  className="header-font"
                  style={{
                    fontSize: "clamp(18px, 30px, 40px)",
                  }}
                >
                  Learn with Flashcards
                </h2>
                <br />
                <p className="text-font">
                  Enhance your learning with customized flashcards. Whether
                  you're studying for an exam or mastering a new skill, Cogni's
                  flashcards are designed to reinforce your knowledge through
                  active recall and spaced repetition.
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FeatSlider;

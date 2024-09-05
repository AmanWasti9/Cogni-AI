import React, { useEffect, useState } from "react";
import "./UploadPdfPage.css";
import { Container } from "@mui/material";
const UploadPdfPage = () => {
  const [selectedOption, setSelectedOption] = useState("summary");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [selectedContent, setSelectedContent] = useState("");

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  const handleFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(selectedFile.type);
    }
  };

  return (
    <div
      style={{
        marginTop: "150px",
      }}
    >
      <Container>
        <div className="pdf-container">
          <div className="uploadSection">
            <form
              className={`file-upload-form ${dragging ? "dragging" : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label htmlFor="file" className="file-upload-label">
                <div className="file-upload-design">
                  <svg viewBox="0 0 640 512" height="1em">
                    <defs>
                      <linearGradient
                        id="gradient1"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#e848e5", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#5218fa", stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                      fill="url(#gradient1)"
                    ></path>
                  </svg>

                  <p>Drag and Drop</p>
                  <p>or</p>
                  <span className="browse-button">Browse file</span>
                </div>
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </form>
          </div>

          <div className="mainContent">
            <div className="column">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: "black",
                  padding: "20px",
                  borderRadius: "30px",
                }}
              >
                <span
                  onClick={() => handleOptionClick("summary")}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  Summary
                </span>
                <span
                  onClick={() => handleOptionClick("flashcards")}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  Flashcards
                </span>
                <span
                  onClick={() => handleOptionClick("qna")}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  Q&A with Chatbot
                </span>
                <span
                  onClick={() => handleOptionClick("equations")}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  Equations
                </span>
              </div>

              <div className="displaySection">
                {selectedOption === "summary" && (
                  <p>
                    Summary: This is a summary of the PDF... Lorem ipsum dolor
                    sit amet consectetur adipisicing elit. Optio provident
                    deserunt corporis, tenetur delectus et laudantium culpa
                    earum quas pariatur, fuga beatae dolorum mollitia ipsam,
                    aliquid voluptate neque hic eaque?
                  </p>
                )}
                {selectedOption === "flashcards" && (
                  <p>Flashcards: Here are some flashcards...</p>
                )}
                {selectedOption === "equation" && (
                  <p>Q&A: Chatbot is ready to answer your questions...</p>
                )}
                {selectedOption === "qna" && (
                  <div>
                    <h1>Equations</h1>
                    <div
                      style={{
                        border: "2px solid red",
                        height: "400px",
                        padding: "20px",
                      }}
                    >
                      <div
                        style={{
                          border: "2px solid blue",
                          height: "360px",
                        }}
                      ></div>
                      <div
                        style={{
                          border: "2px solid green",
                          height: "40px",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UploadPdfPage;

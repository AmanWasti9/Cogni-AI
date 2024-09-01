import {
  Box,
  Container,
  Stack,
  TextField,
  Button,
  InputAdornment,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "./WorkPage.css";
import { Link } from "react-router-dom";
import { BsFillSendFill } from "react-icons/bs";
import { styled } from "@mui/material/styles";

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "transparent",
  borderRadius: "50%",
  padding: "0.5rem",
  minWidth: "unset",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "white",
  },
  "&:focus": {
    outline: "none",
  },
  "&:active": {
    backgroundColor: "white",
  },
}));

export default function WorkPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [selectedContent, setSelectedContent] = useState("");

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

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

  const renderFilePreview = () => {
    if (!file) return null;

    if (fileType.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="file-preview"
        />
      );
    } else if (fileType === "application/pdf") {
      return (
        <embed
          src={URL.createObjectURL(file)}
          type="application/pdf"
          width="100%"
          height="500px"
        />
      );
    } else if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            URL.createObjectURL(file)
          )}`}
          width="100%"
          height="500px"
          frameBorder="0"
          title="doc-viewer"
        />
      );
    } else {
      return <p>Preview not available for this file type.</p>;
    }
  };

  // Chat bot Implementations
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage(); // Ensure this function is called on Enter key press
    }
  };

  const handleSendMessage = async () => {
    alert("Hello!");
  };

  return (
    <div
      style={{
        marginTop: "150px",
        marginBottom: "50px",
      }}
    >
      <Container>
        <div className="grid-container">
          <div id="first">
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
          <div id="second">
            {file ? (
              <div className="file-preview-container">
                {renderFilePreview()}
              </div>
            ) : (
              <p>No file uploaded</p>
            )}
          </div>
          <div
            id="third"
            style={{
              textAlign: "center",
            }}
          >
            Equations
          </div>
          <div id="fourth">
            <div className="func">
              <Link
                to="#"
                className="func-button text-font"
                onClick={() => setSelectedContent("summary")}
              >
                Summary
              </Link>
              <Link
                to="#"
                className="func-button text-font"
                onClick={() => setSelectedContent("flashcards")}
              >
                FlashCards
              </Link>
              <Link
                to="#"
                className="func-button text-font"
                onClick={() => setSelectedContent("qna")}
              >
                QnA with ChatBot
              </Link>
            </div>
            <div
              className="content"
              style={{
                height: "100%",
              }}
            >
              {selectedContent === "summary" && (
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "red",
                  }}
                >
                  Summary Content Here
                </div>
              )}
              {selectedContent === "flashcards" && (
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "blue",
                  }}
                >
                  FlashCards Content Here
                </div>
              )}
              {selectedContent === "qna" && <div></div>}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// <Box
// sx={{
//   padding: 2,
//   display: "flex",
//   flexDirection: "column",
//   height: "100%",
// }}
// >
// <Box sx={{ flex: 1, padding: 2 }}>
//   <Stack>
//     <div
//       // className="flex-1 overflow-y-auto p-2"

//       style={{
//         overflowY: "auto",
//         // backgroundColor: `${secondary}`,
//       }}
//     >
//       {messages.map((msg, index) => (
//         <div
//           key={index}
//           style={{
//             marginBottom: "1rem",
//             // textAlign:
//             //   msg.role === "user" ? "right" : "left",
//           }}
//         >
//           {/* <pre
//             style={{
//               display: "inline-block",
//               padding: "0.5rem",
//               borderRadius: "0.5rem",
//               backgroundColor:
//                 msg.role === "user" ? "violet" : "grey",
//               color:
//                 msg.role === "user" ? "white" : "white",
//             }}
//           >
//             {msg.text}
//           </pre> */}
//           <p
//             style={{
//               fontSize: "0.75rem",
//               // color: text,
//               marginTop: "0.25rem",
//             }}
//           >
//             {msg.role === "bot" ? "Bot" : "You"} -{" "}
//             {msg.timestamp.toLocaleTimeString()}
//           </p>
//         </div>
//       ))}
//     </div>
//   </Stack>
// </Box>
// <Box
//   sx={{
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "end",
//   }}
// >
{
  /* <TextField
  fullWidth
  value={userInput}
  onChange={(e) => setUserInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSendMessage(); // Trigger handleSendClick when Enter is pressed
    }
  }}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <CustomButton onClick={handleSendMessage}>
          <BsFillSendFill
            style={{ color: "#5218fa", fontSize: "25px" }}
          />
        </CustomButton>
      </InputAdornment>
    ),
    style: {
      color: "white",
    },
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "white",
        borderRadius: "30px",
        // Gradient from dark violet to purple
      },
      "&:hover fieldset": {
        borderColor: "white", // Gradient from dark violet to purple
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
      color: "white",
    },
    "& .MuiInputLabel-root": {
      color: "white",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "white",
    },
  }}
  InputLabelProps={{
    style: { color: "white" }, // Label color
  }}
/> */
}
// </Box>
// </Box>

// <div>
// <div
//   style={{
//     width: "100%",
//     background: "red",
//     height: "50px",
//   }}
// ></div>
// <div
//   style={{
//     position: "relative", // Ensure the parent has relative positioning
//     display: "flex",
//     alignItems: "end",
//     height: "75%",
//   }}
// >
//   <div
//     style={{
//       width: "100%", // Full width of the parent
//     }}
//   >
//     <TextField
//       fullWidth
//       value={userInput}
//       onChange={(e) => setUserInput(e.target.value)}
//       onKeyDown={(e) => {
//         if (e.key === "Enter") {
//           handleSendMessage(); // Trigger handleSendClick when Enter is pressed
//         }
//       }}
//       InputProps={{
//         endAdornment: (
//           <InputAdornment position="end">
//             <CustomButton onClick={handleSendMessage}>
//               <BsFillSendFill
//                 style={{ color: "#5218fa", fontSize: "25px" }}
//               />
//             </CustomButton>
//           </InputAdornment>
//         ),
//         style: {
//           color: "white",
//         },
//       }}
//       sx={{
//         "& .MuiOutlinedInput-root": {
//           "& fieldset": {
//             borderColor: "white",
//             borderRadius: "30px",
//             // Gradient from dark violet to purple
//           },
//           "&:hover fieldset": {
//             borderColor: "white", // Gradient from dark violet to purple
//           },
//           "&.Mui-focused fieldset": {
//             borderColor: "white",
//           },
//           color: "white",
//         },
//         "& .MuiInputLabel-root": {
//           color: "white",
//         },
//         "& .MuiInputLabel-root.Mui-focused": {
//           color: "white",
//         },
//       }}
//       InputLabelProps={{
//         style: { color: "white" }, // Label color
//       }}
//     />
//   </div>
// </div>
// </div>

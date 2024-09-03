import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import axios from "axios";
import {
  Box,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import "./PDFToImage.css";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { MdOutlineLastPage } from "react-icons/md";
import { MdOutlineFirstPage } from "react-icons/md";
import { FaShare } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { MdSaveAlt } from "react-icons/md";
import ReactMarkdown from "react-markdown";

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import SaveIcon from "@mui/icons-material/Save";
import { getAuth } from "firebase/auth";
import { firestore } from "../firebase";
import jsPDF from "jspdf";
import SendIcon from "@mui/icons-material/Send";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "white",
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

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFToImage = () => {
  const [selectedOption, setSelectedOption] = useState("summary");
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [extractedInformation, setExtractedInformation] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false); // New state to track if a file has been uploaded

  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state for authentication
  const auth = getAuth();
  const user = auth.currentUser;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false); // New state for toggle switch

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const messageEndRef = useRef(null);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [chatInitialized, setChatInitialized] = useState(false);
  const [historyMessages, setHistoryMessages] = useState([]);

  const API_KEY = "AIzaSyDYmligr0eUjKVNQqXJRKfFacWbWSiaPN0";
  const genAI = new GoogleGenerativeAI(API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/data");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        console.log("Fetched data:", result);
        console.log("User id", user?.uid);

        setData(result);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data.");
      }
    };
    loadData();
  }, []);

  const retrieveInformation = (userInput) => {
    const file1Data = Array.isArray(data.file1) ? data.file1 : [];
    const file2Data = Array.isArray(data.file2) ? data.file2 : [];
    const combinedData = [...file1Data, ...file2Data];

    console.log("Combined Data:", combinedData);

    const lowerCaseInput = userInput.toLowerCase();
    console.log("User Input (lowercase):", lowerCaseInput);

    const filteredData = combinedData.filter((item) => {
      const text = item.name ? item.name.toLowerCase() : "";
      console.log("Item Text (lowercase):", text);
      return text.includes(lowerCaseInput);
    });

    console.log("Filtered Data:", filteredData);

    return filteredData;
  };

  async function updateChatHistory(newMessages) {
    if (!user || !user.uid) {
      console.error("User is not authenticated or UID is missing");
      return;
    }

    try {
      const docRef = doc(collection(firestore, "UsersHistory"), user.uid);

      // Fetch the existing chat history
      const docSnap = await getDoc(docRef);
      let historyArray = [];

      if (docSnap.exists()) {
        historyArray = docSnap.data().history || [];
      }

      // Create a Map to filter out old messages
      const existingMessagesMap = new Map(
        historyArray.map((msg) => [
          `${msg.timestamp.toDate().getTime()}-${msg.text}`,
          msg,
        ])
      );

      // Append only the latest new messages
      const uniqueMessages = newMessages.filter((newMsg) => {
        const key = `${newMsg.timestamp.getTime()}-${newMsg.text}`;
        return !existingMessagesMap.has(key);
      });

      if (uniqueMessages.length > 0) {
        historyArray = [...historyArray, ...uniqueMessages];
        await setDoc(docRef, { history: historyArray });
        console.log("Chat history successfully updated!");
      }
    } catch (e) {
      console.error("Error updating chat history: ", e);
    }
  }

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setUserInput("");

      const retrievedData = retrieveInformation(userInput);
      console.log("Retrieved Data", retrievedData);

      const context = retrievedData
        .map((item) => {
          const { name, price, rpm, noise_level } = item;
          return `name: ${name}, price: ${price}, rpm= ${rpm}, noise_level= ${noise_level}`;
        })
        .join("\n");

      console.log("Context:", context);

      if (chat) {
        const contextMessages = newMessages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text || "" }],
        }));

        const result = await chat.sendMessage(userInput, {
          context,
          history: contextMessages,
        });
        const botMessage = {
          text: result.response.text(),
          role: "model",
          timestamp: new Date(),
        };

        const updatedMessages = [...newMessages, botMessage];
        setMessages(updatedMessages);

        // Update Firebase with both user and bot messages
        await updateChatHistory([userMessage, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!user || !user.uid || chatInitialized) {
        return;
      }

      try {
        const docRef = doc(collection(firestore, "UsersHistory"), user.uid);
        const docSnap = await getDoc(docRef);

        let historyarray = docSnap.exists() ? docSnap.data().history || [] : [];

        const chatHistory = historyarray.map((msg) => ({
          role: msg.role === "bot" ? "model" : msg.role,
          parts: [{ text: msg.text || "" }],
        }));

        console.log("Chat history being sent:", chatHistory);

        const newChat = await model.startChat({
          history: chatHistory,
          generationConfig,
          safetySettings,
        });

        setChat(newChat);
        setChatInitialized(true); // Set chat as initialized
        setHistoryMessages(
          chatHistory.map((msg) => ({
            // Set chat history state
            text: msg.parts[0].text,
            role: msg.role,
            timestamp: new Date(), // Placeholder, you might need to adjust based on your data
          }))
        );
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setError("Failed to initialize chat. Please try again.");
      }
    };

    initChat();
  }, [user, chatInitialized]); // Use chatInitialized as a dependency

  // Pdf Convertion
  useEffect(() => {
    const convertPdfToImages = async () => {
      if (!file) return;

      try {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          const typedArray = new Uint8Array(event.target.result);
          const loadingTask = pdfjsLib.getDocument({ data: typedArray });
          const pdf = await loadingTask.promise;

          setNumPages(pdf.numPages);

          const pages = [];
          const pages_api = [];
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;
            const image = canvas.toDataURL("image/png");

            const cleanImage = image.replace("data:image/png;base64,", "");
            pages_api.push({ page: pageNum, cleanImage });

            pages.push({ page: pageNum, image });
          }
          setImages(pages);

          try {
            const response = await axios.post(
              "http://localhost:8000/extract_pdf/",
              {
                pdf: { pages_api },
              }
            );
            if (response.data.extracted_information) {
              setExtractedInformation(response.data.extracted_information);
            }
          } catch (error) {
            console.error("Error extracting PDF information:", error);
          }
        };

        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error converting PDF to images:", error);
      }
    };

    convertPdfToImages();
  }, [file]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    extractedInformation.forEach((info, index) => {
      doc.text(20, 20 + index * 10, `Summary ${index + 1}: ${info.summary}`);
      if (info.formula) {
        doc.text(20, 30 + index * 10, `Formula: ${info.formula}`);
      }
    });
    doc.save("summary.pdf");
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const convertPdfToImages = async () => {
      if (!file) return;

      try {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          const typedArray = new Uint8Array(event.target.result);
          const loadingTask = pdfjsLib.getDocument({ data: typedArray });
          const pdf = await loadingTask.promise;

          setNumPages(pdf.numPages);

          const pages = [];
          const pages_api = [];
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;
            const image = canvas.toDataURL("image/png");

            const cleanImage = image.replace("data:image/png;base64,", "");
            pages_api.push({ page: pageNum, cleanImage });

            pages.push({ page: pageNum, image });
          }
          setImages(pages);

          try {
            const response = await axios.post(
              "http://localhost:8000/extract_pdf/",
              {
                pdf: { pages_api },
              }
            );
            console.log("Server response:", response.data);
            if (response.data.extracted_information) {
              setExtractedInformation(response.data.extracted_information);
            }
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response) {
                console.error("Server response error:", error.response.data);
                console.error("Status code:", error.response.status);
              } else if (error.request) {
                console.error("Request error:", error.request);
              } else {
                console.error("Error message:", error.message);
              }
            } else {
              console.error("Unexpected error:", error);
            }
          }
        };

        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error converting PDF to images:", error);
      }
    };

    convertPdfToImages();
  }, [file]);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileUploaded(true); // Set fileUploaded to true when a file is uploaded
      setPageNumber(1);
    }
  };

  const handlePageChange = (delta) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = Math.max(
        1,
        Math.min(prevPageNumber + delta, numPages)
      );
      return newPageNumber;
    });
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  // Save The Summaries

  const saveSummary = async () => {
    if (!name) {
      alert("Please enter a name for the summary.");
      return;
    }

    if (!extractedInformation || extractedInformation.length === 0) {
      alert("No extracted information to save.");
      return;
    }

    if (!user) {
      alert("You must be logged in to save the summary.");
      return;
    }

    const batch = writeBatch(firestore);
    const userDocRef = doc(firestore, "Summaries", user.uid);

    try {
      const docSnap = await getDoc(userDocRef);

      const summaryData = { name, public: isPublic }; // Add public field to summary data

      if (docSnap.exists()) {
        const existingSummaries = docSnap.data().Summaries || [];
        if (existingSummaries.find((summary) => summary.name === name)) {
          alert("A summary with the same name already exists.");
          return;
        } else {
          batch.update(userDocRef, { Summaries: arrayUnion(summaryData) });
        }
      } else {
        batch.set(userDocRef, { Summaries: [summaryData] });
      }

      const summariesCollectionRef = collection(userDocRef, name);
      extractedInformation.forEach((info, index) => {
        const summaryDocRef = doc(
          summariesCollectionRef,
          `summary_${index + 1}`
        );
        batch.set(summaryDocRef, info);
      });

      await batch.commit();
      handleClose();
      setSnackbarMessage("Summary have been saved successfully.");
      setName("");
      setIsPublic(false);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving summaries:", error);
      alert("There was an error saving your summaries. Please try again.");
    }
  };

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  useEffect(() => {
    // Scroll to the bottom of the chat messages when new message is added
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add user message immediately
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: userInput, sender: "user" },
    ]);
    setUserInput(""); // Clear the input field after adding the user message

    // Show loading indicator
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/ask-question/", {
        question: userInput,
      });

      // Add bot response after loading
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: res.data.answer, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop the loading indicator
    }
  };

  return (
    <div style={{ marginTop: "150px" }}>
      <Container>
        {fileUploaded ? (
          <div className="pdf-main-div">
            <div className="pdf-page">
              {images.length > 0 && (
                <div>
                  <img
                    src={images.find((img) => img.page === pageNumber)?.image}
                    alt={`PDF Page ${pageNumber}`}
                    style={{
                      maxHeight: "60vh",
                      width: "95%",
                      objectFit: "contain",
                    }}
                  />
                  <br />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <MdOutlineFirstPage
                        onClick={() => handlePageChange(-1)}
                        disabled={pageNumber <= 1}
                        style={{
                          color: "white",
                          fontSize: "30px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      />{" "}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      Page {pageNumber} of {numPages}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MdOutlineLastPage
                        onClick={() => handlePageChange(1)}
                        disabled={pageNumber >= numPages}
                        style={{
                          color: "white",
                          fontSize: "30px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      />{" "}
                    </span>
                  </div>
                </div>
              )}
              <br />
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={
                  <CloudUploadIcon
                    style={{
                      fontSize: "40px",
                    }}
                  />
                }
                fullWidth
                sx={{
                  padding: "20px",
                  fontSize: "20px",
                  background: "linear-gradient(45deg, #e848e5, #5218fa)",
                }}
              >
                Upload files
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileChange}
                  multiple
                />
              </Button>
            </div>
            <div className="extracted-data-disp-main">
              <div>
                <div className="sc-nav">
                  <ul>
                    <li
                      className={`extracted-d-link ${
                        selectedOption === "summary" ? "active" : ""
                      }`}
                      onClick={() => handleOptionClick("summary")}
                    >
                      Summary
                    </li>
                    <li
                      className={`extracted-d-link ${
                        selectedOption === "flashcards" ? "active" : ""
                      }`}
                      onClick={() => handleOptionClick("flashcards")}
                    >
                      FlashCards
                    </li>
                    <li
                      className={`extracted-d-link ${
                        selectedOption === "qna" ? "active" : ""
                      }`}
                      onClick={() => handleOptionClick("qna")}
                    >
                      QnA
                    </li>
                  </ul>
                </div>
                <div>
                  {selectedOption === "summary" && (
                    <div>
                      <p style={{ textAlign: "justify" }}>
                        {extractedInformation[pageNumber - 1]?.summary ||
                          "No summary available"}
                      </p>
                      <p>
                        {extractedInformation[pageNumber - 1]?.formula ||
                          "No formula available"}
                      </p>

                      {/* Button wrapper */}
                      <div className="all-btns-wrapper">
                        <div className="all-btns">
                          <span>
                            <FaSave
                              style={{
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                              onClick={handleOpen}
                              disabled={!isAuthenticated} // Disable button if not authenticated
                            />
                          </span>
                          <span>
                            <MdSaveAlt
                              onClick={handleDownloadPDF}
                              style={{
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                            />
                          </span>
                          <span>
                            <FaShare
                              style={{
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedOption === "flashcards" && (
                    <div>
                      <h2>Coming Soon . . .</h2>
                    </div>
                  )}
                  {selectedOption === "qna" && (
                    <div>
                      <div
                        style={{
                          padding: 2,
                          display: "flex",
                          flexDirection: "column",
                          height: "40vh",
                          overflowX: "hidden",
                        }}
                      >
                        {messages.map((msg, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent:
                                msg.role === "user" ? "flex-end" : "flex-start",
                              flexDirection: "column",
                              alignItems:
                                msg.role === "user" ? "flex-end" : "flex-start",
                              marginBottom: 8, // Updated margin for better spacing
                              padding: "0 8px",
                            }}
                          >
                            <p
                              style={{
                                backgroundColor:
                                  msg.role === "user"
                                    ? "rgba(36, 30, 30, 0.05);"
                                    : "rgba(36, 30, 30, 0.05);",
                                wordWrap: "break-word",
                                padding: 8,
                                borderRadius: 8,
                                maxWidth: "75%",
                                textAlign:
                                  msg.role === "user" ? "right" : "left",
                              }}
                            >
                              {msg.text}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="chatbot-wrapper">
                        <TextField
                          type="text"
                          fullWidth
                          label="Prompt Here..."
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
                                  <SendIcon style={{ color: "purple" }} />
                                </CustomButton>
                              </InputAdornment>
                            ),
                            style: {
                              color: "white",
                              borderRadius: "30px",
                              padding: "0 20px",
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "indigo", // Gradient from dark violet to purple
                              },
                              "&:hover fieldset": {
                                borderColor: "indigo", // Gradient from dark violet to purple
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "indigo",
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
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                Save your Work
              </DialogTitle>
              <DialogContent>
                <DialogContentText
                  sx={{
                    color: "white",
                  }}
                >
                  Please enter a collection name for your work.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  placeHolder="Summary Name"
                  type="text"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    style: { color: "white" }, // Label color
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "white", // Thumb color when checked
                          "& + .MuiSwitch-track": {
                            backgroundImage:
                              "linear-gradient(to bottom, #e848e5, #5218fa)", // Gradient for the track when checked
                          },
                        },
                        "& .MuiSwitch-switchBase": {
                          color: "white", // Thumb color when unchecked
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor: "#ccc", // Default track color when unchecked
                        },
                      }}
                    />
                  }
                  label="Make Summary Public"
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  sx={{
                    backgroundColor: "white",
                    color: "indigo",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSummary}
                  sx={{
                    background: "linear-gradient(to bottom, #e848e5, #5218fa)",
                    color: "white",
                  }}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
            />
          </div>
        ) : (
          <div className="upload-btn">
            <form className="file-upload-form">
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
                      fill="url(#gradient1)"
                      d="M432 320h-80V160c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v160h-80c-14.2 0-21.4 17.2-11.3 27.3l152 152c6.6 6.6 17.4 6.6 24 0l152-152c10.1-10.1 2.9-27.3-11.3-27.3zM480 32H160C71.6 32 0 103.6 0 192v192c0 88.4 71.6 160 160 160h96c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16h-96c-52.93 0-96-43.1-96-96V192c0-52.93 43.07-96 96-96h320c52.9 0 96 43.07 96 96v192c0 52.93-43.1 96-96 96h-96c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h96c88.4 0 160-71.6 160-160V192c0-88.4-71.6-160-160-160z"
                    />
                  </svg>
                  <h3>Drag and Drop or Browse to Upload a file</h3>
                </div>
              </label>
              <input
                id="file"
                name="file"
                type="file"
                className="file-upload-input"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </form>
          </div>
        )}
      </Container>
    </div>
  );
};

export default PDFToImage;

// <div style={{ marginTop: "10px", overflowY: "auto" }}>
// <div
//   style={{
//     overflowY: "auto",
//     height: "50vh",
//     color: "white",
//     padding: "10px",
//     borderRadius: "15px",
//   }}
// >
//   {messages.map((msg, index) => (
//     <div
//       key={index}
//       style={{
//         display: "flex",
//         justifyContent:
//           msg.sender === "user"
//             ? "flex-end"
//             : "flex-start",
//         flexDirection: "column",
//         alignItems:
//           msg.sender === "user"
//             ? "flex-end"
//             : "flex-start",
//         marginBottom: "10px",
//       }}
//     >
//       <div
//         style={{
//           wordWrap: "break-word",
//           backgroundColor:
//             msg.sender === "user" ? "#4a90e2" : "#e2e2e2",
//           color:
//             msg.sender === "user" ? "white" : "black",
//           padding: "10px",
//           borderRadius: "15px",
//           maxWidth: "75%",
//           textAlign:
//             msg.sender === "user" ? "right" : "left",
//         }}
//       >
//         {msg.text}
//       </div>
//       <Typography
//         variant="caption"
//         style={{
//           color: "gray",
//           marginTop: "5px",
//           textAlign:
//             msg.sender === "user" ? "right" : "left",
//         }}
//       >
//         {msg.sender === "user" ? "You" : "Bot"}
//       </Typography>
//     </div>
//   ))}

//   {loading && (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "flex-start",
//         flexDirection: "column",
//         alignItems: "flex-start",
//         marginBottom: "10px",
//       }}
//     >
//       <div
//         style={{
//           wordWrap: "break-word",
//           backgroundColor: "#f5f5f5",
//           padding: "10px",
//           borderRadius: "15px",
//           maxWidth: "75%",
//           textAlign: "left",
//         }}
//       >
//         <span>
//           <div className="loader"></div>
//         </span>
//       </div>
//       <Typography
//         variant="caption"
//         style={{
//           color: "gray",
//           marginTop: "5px",
//           textAlign: "left",
//         }}
//       >
//         Bot
//       </Typography>
//     </div>
//   )}
//   <div ref={messageEndRef} />
// </div>

// <div className="chatbot-wrapper">
//   <TextField
//     type="text"
//     fullWidth
//     label="Prompt Here..."
//     value={userInput}
//     onChange={(e) => setUserInput(e.target.value)}
//     onKeyDown={(e) => {
//       if (e.key === "Enter") {
//         handleSendMessage(); // Trigger handleSendClick when Enter is pressed
//       }
//     }}
//     InputProps={{
//       endAdornment: (
//         <InputAdornment position="end">
//           <CustomButton onClick={handleSendMessage}>
//             <SendIcon style={{ color: "purple" }} />
//           </CustomButton>
//         </InputAdornment>
//       ),
//       style: {
//         color: "white",
//         borderRadius: "30px",
//         padding: "0 20px",
//       },
//     }}
//     sx={{
//       "& .MuiOutlinedInput-root": {
//         "& fieldset": {
//           borderColor: "indigo",
//         },
//         "&:hover fieldset": {
//           borderColor: "indigo",
//         },
//         "&.Mui-focused fieldset": {
//           borderColor: "indigo",
//         },
//         color: "white",
//       },
//       "& .MuiInputLabel-root": {
//         color: "white",
//       },
//       "& .MuiInputLabel-root.Mui-focused": {
//         color: "white",
//       },
//     }}
//     InputLabelProps={{
//       style: { color: "white" },
//     }}
//   />
// </div>
// </div>

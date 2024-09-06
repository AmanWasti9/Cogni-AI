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
  background: "linear-gradient(45deg, #e848e5, #5218fa)",
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

  // const messageEndRef = useRef(null);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [chatInitialized, setChatInitialized] = useState(false);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [link, setLink] = useState([]);
  const [linkUploaded, setLinkUploaded] = useState(false);

  const API_KEY = "AIzaSyDYmligr0eUjKVNQqXJRKfFacWbWSiaPN0";
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page
  }, []);

  const summaries = Array.isArray(extractedInformation)
    ? extractedInformation.map((info) => info.summary).join("\n")
    : extractedInformation || "";

  console.log(summaries);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are a research related bot that will answer any questions regarding this document: \n${summaries}\n and if any question is asked that is off topic and irrelevant to the topic you wont answer it.`,
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

  // Function to update the chat history after summary extraction
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

      // Append the new messages (summary information)
      console.log("This is history array", historyArray);
      console.log("This is newmessages", newMessages);
      const updatedHistory = [...historyArray, ...newMessages];

      // Update Firestore with the new history
      await updateDoc(docRef, {
        history: updatedHistory,
      });

      console.log("Chat history updated successfully");

      // Update local state after updating Firestore
      setMessages(updatedHistory);
      console.log("MSG BY AHMED UPDATED HISTORY", updatedHistory);
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
      setMessages(newMessages); // Update state immediately
      console.log("MSG BY AHMED", newMessages);
      setUserInput("");

      const retrievedData = retrieveInformation(userInput);
      console.log("Retrieved Data", retrievedData);

      if (chat) {
        const contextMessages = newMessages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text || "" }],
        }));
        console.log("NEW MESSAGE TEST AHMED", newMessages);
        const result = await chat.sendMessage(userInput, {
          // context,
          history: contextMessages,
        });
        const botMessage = {
          text: result.response.text(),
          role: "model",
          timestamp: new Date(),
        };

        const updatedMessages = [...newMessages, botMessage];
        setMessages(updatedMessages); // Update messages locally with bot response
        console.log("MSG BY AHMED UPDATED SOFTWARE", updatedMessages);

        // Update Firebase with both user and bot messages
        await updateChatHistory([userMessage, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  // useEffect(() => {
  const initChat = async (historyArray) => {
    try {
      // const docRef = doc(collection(firestore, "UsersHistory"), user.uid);
      // const docSnap = await getDoc(docRef);

      // let historyArray = docSnap.exists() ? docSnap.data().history || [] : [];

      console.log("History By AHMED", historyArray);

      const chatHistory = historyArray.map((msg) => ({
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

      // Update the state with the retrieved chat history
      setMessages(
        chatHistory.map((msg) => ({
          text: msg.parts[0].text,
          role: msg.role,
          timestamp: new Date(), // Adjust this based on the actual timestamp from your data
        }))
      );
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setError("Failed to initialize chat. Please try again.");
    }
  };

  // }, [user, chatInitialized]); // Use chatInitialized as a dependency
  // New function to update chat history with extracted information
  const updateExtractedInformation = async (extractedInformation) => {
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

      // Prepare the extracted information as a single message
      const summaries = Array.isArray(extractedInformation)
        ? extractedInformation.map((info) => info.summary).join("\n")
        : extractedInformation || "";

      console.log("Summaries Aman ", summaries);

      const extract = {
        text: `This is the document:\n\n${summaries}`,
        role: "user", // You can change this if needed
        timestamp: new Date(), // Current timestamp
      };

      // Add the extract object to the historyArray
      historyArray.push(extract); // Add the extract object directly

      console.log("HISTORY ARRAY IN UPDATED EXTRACTED ", historyArray);

      await setDoc(docRef, { history: historyArray });
      console.log(
        "Chat history successfully updated with extracted information!"
      );
      await initChat(historyArray);
    } catch (e) {
      console.error(
        "Error updating chat history with extracted information: ",
        e
      );
    }
  };
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
              "https://test-case-pro-production.up.railway.app/extract_pdf/",
              {
                pdf: { pages_api },
              }
            );
            if (response.data.extracted_information) {
              const extractedInfo = response.data.extracted_information;
              setExtractedInformation(extractedInfo);

              // Update chat history with the extracted information
              await updateExtractedInformation(extractedInfo);
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
    let yPosition = 20;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;

    extractedInformation.forEach((info, index) => {
      const summaryText = doc.splitTextToSize(
        `Summary ${index + 1}: ${info.summary}`,
        180
      );
      const formulaText = info.formula
        ? doc.splitTextToSize(`Formula: ${info.formula}`, 180)
        : [];

      summaryText.forEach((line) => {
        if (yPosition + lineHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(20, yPosition, line);
        yPosition += lineHeight;
      });

      formulaText.forEach((line) => {
        if (yPosition + lineHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(20, yPosition, line);
        yPosition += lineHeight;
      });

      yPosition += 10;
    });

    doc.save("summary.pdf");
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // Function to handle file upload and summary extraction
  const handleFileChange = async (event) => {
    reset();
    const uploadedFile = event.target.files[0];

    if (uploadedFile) {
      setFile(uploadedFile);
      setFileUploaded(true);
      setPageNumber(1);

      // Step 1: Delete the old history before proceeding
      await deleteUserHistory();

      // // Step 2: Extract summary information (you need to implement the logic for this)
      const summaryInformation = await updateExtractedInformation(uploadedFile); // Placeholder function
      // // Step 3: Update the chat history with the extracted summary
      const summaryMessage = {
        text: summaryInformation, // The extracted summary
        role: "summary", // You can assign a custom role like 'summary'
        timestamp: new Date(),
      };

      await updateChatHistory([summaryMessage]); // Update Firestore with the new summary
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

      const timestamp = new Date(); // Get the current date and time
      const summaryData = {
        name,
        public: isPublic,
        date: timestamp, // Add the date field
      };

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
      setSnackbarMessage("Summary has been saved successfully.");
      setName("");
      setIsPublic(false);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving summaries:", error);
      alert("There was an error saving your summaries. Please try again.");
    }
  };

  const saveUrlSummary = async () => {
    if (!extractedInformation) {
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

      const timestamp = new Date(); // Get the current date and time
      const summaryContent =
        "Hyper-V GPU Passthrough: A Beginner’s Guide - Summary\n\nThis article provides a comprehensive guide for beginners on configuring Hyper-V GPU passthrough, allowing virtual machines (VMs) to directly access the host's physical graphics card (GPU).\n\n**Key Components:**\n\n* **What is GPU Passthrough?** Explains the concept and benefits of bypassing emulation to directly connect a physical GPU to a VM.\n* **Benefits:** Highlights advantages including improved graphics performance, flexible hardware utilization, cost-efficiency, and enhanced security.\n* **Requirements:** Outlines essential hardware and software prerequisites, including CPU virtualization support, IOMMU, compatible GPUs, and specific Windows versions.\n* **Limitations:** Lists unsupported configurations like VMs using dynamic memory, clustering features, and checkpoints.\n* **Setup Process:** Provides detailed steps for configuring GPU passthrough, including:\n    * **Preparing the Environment:** Enabling virtualization features, IOMMU, and disabling checkpoints.\n    * **Windows Server Configuration:** Using PowerShell commands to assign the GPU to the VM via DDA.\n    * **Windows 10 Configuration:** Using the GPU partitioning method with a script to copy drivers and configure the VM.\n* **Troubleshooting:** Offers solutions for common issues like driver errors, insufficient MIMO space, and application compatibility problems.\n* **Conclusion:** Emphasizes the benefits of GPU passthrough while acknowledging its limitations. Recommends using server-grade hardware and backing up VMs to mitigate risks.";

      const summaryData = {
        name,
        public: isPublic,
        date: timestamp, // Add the date field
      };

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
      // Store the summaryContent in a single document
      const summaryDocRef = doc(
        summariesCollectionRef,
        "summary_1" // Use the summary name or some unique identifier as the document ID
      );
      batch.set(summaryDocRef, { summary: summaryContent });

      await batch.commit();
      handleClose();
      setSnackbarMessage("Summary has been saved successfully.");
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

  const handleUrlChange = async (e) => {
    const url = e.target.value;
    console.log(url);
    setLinkUploaded(true);

    try {
      const response = await axios.post(
        "https://test-case-pro-production.up.railway.app/extract_url/",
        {
          url: url,
        }
      );
      console.log("Res Aman", response);
      if (response.data.extracted_information) {
        const extractedInfo = response.data.extracted_information;
        console.log("Resppp Aman", extractedInfo);
        setExtractedInformation(extractedInfo);

        // Update chat history with the extracted information
        await updateExtractedInformation(extractedInfo);
      }
    } catch (error) {
      console.error("Error extracting URL information:", error);
    }
  };

  const reset = () => {
    setFileUploaded(false);
  };

  async function deleteUserHistory() {
    if (!user || !user.uid) {
      console.error("User is not authenticated or UID is missing");
      return;
    }

    try {
      const docRef = doc(collection(firestore, "UsersHistory"), user.uid);

      // Update the history field to an empty array to remove previous uploads
      await updateDoc(docRef, {
        history: [], // Set the history to an empty array to remove old uploads
      });
      console.log("User history deleted successfully");
    } catch (e) {
      console.error("Error deleting user history: ", e);
    }
  }

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
                      className="text-font"
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
                className="text-font"
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
                      className={`extracted-d-link text-font ${
                        selectedOption === "summary" ? "active" : ""
                      }`}
                      onClick={() => handleOptionClick("summary")}
                    >
                      Summary
                    </li>
                    <li
                      className={`extracted-d-link text-font ${
                        selectedOption === "flashcards" ? "active" : ""
                      }`}
                      onClick={() => handleOptionClick("flashcards")}
                    >
                      Flashcards
                    </li>
                    <li
                      className={`extracted-d-link text-font ${
                        selectedOption === "qna" ? "active" : ""
                      }`}
                      onClick={() => {
                        handleOptionClick("qna");
                        handleOptionClick("qna");
                      }}
                    >
                      QnA
                    </li>
                  </ul>
                </div>
                <div>
                  {selectedOption === "summary" && (
                    <div>
                      <div
                        className="custom-scrollbar"
                        style={{
                          height: "40vh",
                          overflowX: "hidden",
                          overflowY: "auto",
                          marginTop: "10px",
                        }}
                      >
                        <div
                          style={{
                            maxHeight: "40vh",
                            // overflowY: "auto",
                            paddingRight: "15px",
                          }}
                        >
                          <p
                            className="text-font"
                            style={{ textAlign: "justify" }}
                          >
                            <ReactMarkdown>
                              {extractedInformation[pageNumber - 1]?.summary ||
                                "Loading ..."}
                            </ReactMarkdown>
                            <br />
                            {extractedInformation[pageNumber - 1]?.formula ||
                              ""}
                          </p>
                        </div>
                      </div>

                      {/* Button wrapper */}
                      <div className="all-btns-wrapper">
                        <div
                          className="all-btns"
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              border: "1px solid #5218fa",
                              padding: "5px 10px",
                              borderRadius: "5px",
                            }}
                            onClick={handleOpen}
                            disabled={!isAuthenticated}
                            className="text-font"
                          >
                            Save
                          </span>
                          <span>
                            <MdSaveAlt
                              onClick={handleDownloadPDF}
                              style={{
                                fontSize: "20px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedOption === "flashcards" && (
                    <div>
                      <h2 className="text-font">Coming Soon . . .</h2>
                    </div>
                  )}
                  {selectedOption === "qna" && (
                    <div>
                      <div
                        className="custom-scrollbar"
                        style={{
                          padding: 2,
                          display: "flex",
                          flexDirection: "column",
                          height: "40vh",
                          overflowX: "hidden",
                        }}
                      >
                        {messages
                          .filter((msg, index) => {
                            // Skip the first two messages if they are from the user
                            const userMessages = messages.filter(
                              (m) => m.role === "user"
                            );
                            const firstTwoUserMessages = userMessages.slice(
                              0,
                              2
                            );
                            return !firstTwoUserMessages.includes(msg);
                          })
                          .map((msg, index) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                justifyContent:
                                  msg.role === "user"
                                    ? "flex-end"
                                    : "flex-start",
                                flexDirection: "column",
                                alignItems:
                                  msg.role === "user"
                                    ? "flex-end"
                                    : "flex-start",
                                marginBottom: 8, // Updated margin for better spacing
                                padding: "0 8px",
                              }}
                            >
                              <p
                                className="text-font"
                                style={{
                                  backgroundColor:
                                    msg.role === "user" ? "#5218fa" : "#e848e5",
                                  wordWrap: "break-word",
                                  padding: "8px 20px",
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

                        {/* <div ref={messageEndRef} /> Scroll target */}
                      </div>
                      <div className="chatbot-wrapper">
                        <TextField
                          className="text-font"
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
                                  <SendIcon style={{ color: "white" }} />
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
                                borderColor: "#5218fa", // Gradient from dark violet to purple
                              },
                              "&:hover fieldset": {
                                borderColor: "#5218fa", // Gradient from dark violet to purple
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#5218fa",
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
                className="text-font"
                sx={{
                  color: "white",
                }}
              >
                Save your Summary
              </DialogTitle>
              <DialogContent>
                <DialogContentText
                  sx={{
                    color: "white",
                  }}
                  className="text-font"
                >
                  Please enter a collection name for your Summary.
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
                <label
                  style={{
                    color: "white",
                    marginRight: "10px",
                  }}
                  className="text-font"
                >
                  {isPublic ? "Public" : "Private"}
                </label>
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
                  className="text-font"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSummary}
                  sx={{
                    background: "linear-gradient(to bottom, #e848e5, #5218fa)",
                    color: "white",
                  }}
                  className="text-font"
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
        ) : linkUploaded ? (
          <>
            <div>
              <div className="extracted-data-disp-main">
                <div>
                  <div className="sc-nav">
                    <ul>
                      <li
                        className={`extracted-d-link text-font ${
                          selectedOption === "summary" ? "active" : ""
                        }`}
                        onClick={() => handleOptionClick("summary")}
                      >
                        Summary
                      </li>
                      <li
                        className={`extracted-d-link text-font ${
                          selectedOption === "flashcards" ? "active" : ""
                        }`}
                        onClick={() => handleOptionClick("flashcards")}
                      >
                        Flashcards
                      </li>
                      <li
                        className={`extracted-d-link text-font ${
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
                        <div
                          className="custom-scrollbar"
                          style={{
                            height: "40vh",
                            overflowX: "hidden",
                            overflowY: "auto",
                            marginTop: "10px",
                          }}
                        >
                          <div
                            style={{ maxHeight: "40vh", paddingRight: "15px" }}
                          >
                            <p
                              className="text-font"
                              style={{ textAlign: "justify" }}
                            >
                              <ReactMarkdown>
                                {typeof extractedInformation === "string"
                                  ? extractedInformation
                                  : "Loading ..."}
                              </ReactMarkdown>
                            </p>
                          </div>
                        </div>
                        {/* Button wrapper */}
                        <div className="all-btns-wrapper">
                          <div
                            className="all-btns"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                fontSize: "20px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                border: "1px solid #5218fa",
                                padding: "5px 10px",
                                borderRadius: "5px",
                              }}
                              onClick={handleOpen}
                              disabled={!isAuthenticated}
                              className="text-font"
                            >
                              Save
                            </span>
                            <span>
                              <MdSaveAlt
                                onClick={handleDownloadPDF}
                                style={{
                                  fontSize: "20px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOption === "flashcards" && (
                      <div>
                        <h2 className="text-font">Coming Soon . . .</h2>
                      </div>
                    )}

                    {selectedOption === "qna" && (
                      <div>
                        <div
                          className="custom-scrollbar"
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
                                  msg.role === "user"
                                    ? "flex-end"
                                    : "flex-start",
                                flexDirection: "column",
                                alignItems:
                                  msg.role === "user"
                                    ? "flex-end"
                                    : "flex-start",
                                marginBottom: 8,
                                padding: "0 8px",
                              }}
                            >
                              <p
                                className="text-font"
                                style={{
                                  backgroundColor:
                                    msg.role === "user" ? "#5218fa" : "#e848e5",
                                  wordWrap: "break-word",
                                  padding: "8px 20px",
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
                            className="text-font"
                            type="text"
                            fullWidth
                            label="Prompt Here..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSendMessage();
                              }
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <CustomButton onClick={handleSendMessage}>
                                    <SendIcon style={{ color: "white" }} />
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
                                  borderColor: "#5218fa",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#5218fa",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#5218fa",
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
                              style: { color: "white" },
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
                <DialogTitle className="text-font" sx={{ color: "white" }}>
                  Save your Summary
                </DialogTitle>
                <DialogContent>
                  <DialogContentText
                    sx={{ color: "white" }}
                    className="text-font"
                  >
                    Please enter a collection name for your Summary.
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
                        "& fieldset": { borderColor: "transparent" },
                        "&:hover fieldset": { borderColor: "transparent" },
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
                  />
                  <label
                    style={{ color: "white", marginRight: "10px" }}
                    className="text-font"
                  >
                    {isPublic ? "Public" : "Private"}
                  </label>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "white",
                            "& + .MuiSwitch-track": {
                              backgroundImage:
                                "linear-gradient(to bottom, #e848e5, #5218fa)",
                            },
                          },
                          "& .MuiSwitch-switchBase": {
                            color: "white",
                          },
                          "& .MuiSwitch-track": {
                            backgroundColor: "#ccc",
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
                    sx={{ backgroundColor: "white", color: "indigo" }}
                    className="text-font"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveUrlSummary}
                    sx={{
                      background:
                        "linear-gradient(to bottom, #e848e5, #5218fa)",
                      color: "white",
                    }}
                    className="text-font"
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
          </>
        ) : (
          <>
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
                    <h3 className="text-font">
                      Drag and Drop or Browse to Upload a file
                    </h3>
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
            <div>
              <h1
                style={{
                  textAlign: "center",
                  margin: "50px",
                }}
                className="text-font"
              >
                OR
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
                marginTop: "50px",
              }}
            >
              <br />
              <br />
              <input
                id="url"
                name="url"
                type="text"
                placeholder="Enter URL"
                className="url-inp text-font"
                onChange={handleUrlChange}
              />
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default PDFToImage;

import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import axios from "axios";
import {
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Snackbar,
  Switch,
  TextField,
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

  const handleSnackbarClose = () => setSnackbarOpen(false);

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
                      <div className="chatbot-wrapper">
                        <input
                          type="text"
                          className="input"
                          placeholder="Enter your Email"
                          // value={username}
                          // onChange={(e) => setUsername(e.target.value)}
                        />
                        <button>Send</button>
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

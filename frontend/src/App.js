import logo from "./logo.svg";
import "./App.css";
// import Header from "./components/Header/Header";
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Forum from "./components/Forum/Forum";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import SignIn from "./components/SignIn/form";
import SignUp from "./components/SignUp/form";
import DashboardPage from "./pages/DashboardPage";
// import WorkPage from "./pages/WorkPage";
import PDFToImage from "./pages/PDFToImage";
import Profile from "./components/Profile/Profile";
// import SinglePost from "./pages/SinglePost";

function App() {
  return (
    <div id="top">
      <Router>
        <header>
          {/* <Header /> */}
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />

            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/work"
              element={<PDFToImage pdfUrl="../public/02_knn_notes.pdf" />}
            />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/post/:postName" element={<Forum />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/profile/post/:postName" element={<Profile />} /> */}
          </Routes>
        </main>
        <br />
        <br />
        <br />
        <br />
        <footer>
          <Footer />
        </footer>
        <br />
      </Router>
    </div>
  );
}

export default App;

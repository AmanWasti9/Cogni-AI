import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { auth } from "../../firebase"; // Import Firebase auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Navbar.css";
import logo from "../../Images/logo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        closeMenu();
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-wrapper">
        <img
          src={logo}
          style={{
            width: "60px",
          }}
          alt="Logo"
        />
        <div
          className={`menu-icon ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
        <ul className={`text-font nav-menu ${isOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>

          {!user && (
            <>
              <li className="nav-item">
                <ScrollLink
                  to="features"
                  spy={true}
                  smooth={true}
                  offset={-20}
                  duration={1000}
                  onClick={closeMenu}
                >
                  <span className="nav-link">Features</span>
                </ScrollLink>
              </li>

              <li className="nav-item">
                <Link to="/about" className="nav-link" onClick={closeMenu}>
                  About
                </Link>
              </li>

              <li className="nav-item">
                <ScrollLink
                  to="footer"
                  spy={true}
                  smooth={true}
                  offset={-20}
                  duration={1000}
                  onClick={closeMenu}
                >
                  <span className="nav-link">Contact</span>
                </ScrollLink>
              </li>
            </>
          )}
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link" onClick={closeMenu}>
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/forum" className="nav-link" onClick={closeMenu}>
                  Forum
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/work" className="nav-link" onClick={closeMenu}>
                  Upload File
                </Link>
              </li>
              <li className="nav-item">
                {/* <button className="nav-link" onClick={handleLogout}>
                  Logout
                </button> */}
                <Link to="/signin" className="nav-link" onClick={handleLogout}>
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/signin" className="nav-link" onClick={closeMenu}>
                Get Started
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

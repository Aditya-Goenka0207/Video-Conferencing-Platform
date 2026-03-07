import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navheader">
          <h2>Apna Video Call</h2>
        </div>

        <div className="navlist">
          <p
            onClick={() => navigate("/auth")}
            style={{ cursor: "pointer" }} 
          >
            Join as Guest
          </p>

          <p
            onClick={() => navigate("/auth")}
            style={{ cursor: "pointer" }}
          >
            Register
          </p>

          <div
            onClick={() => navigate("/auth")}
            role="button"
            style={{ cursor: "pointer" }}
          >
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>Connect</span> with your loved
            ones
          </h1>

          <p>Cover a distance by Apna Video Call</p>

          <div role="button" style={{ marginTop: "1rem" }}>
            <Link to="/auth">Get Started</Link>
          </div>
        </div>

        <div>
          <img src="/mobile.png" alt="Video call illustration" />
        </div>
      </div>
    </div>
  );
}
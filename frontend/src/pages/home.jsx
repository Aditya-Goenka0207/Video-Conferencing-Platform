import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  // ================= Join Video Call =================
  const handleJoinVideoCall = async () => {
    const code = meetingCode.trim();
    if (!code) {
      alert("Please enter a meeting code");
      return;
    }

    try {
      await addToUserHistory(code);

      // Navigate to VideoMeet page
      navigate(`/meeting/${code}`);
    } catch (err) {
      console.error("Failed to join meeting", err);
      alert(typeof err === "string" ? err : "Failed to join meeting");
    }
  };

  // ================= Logout =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Apna Video Call</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <IconButton onClick={() => navigate("/history")}>
            <RestoreIcon />
          </IconButton>
          <p>History</p>

          <Button onClick={handleLogout} variant="outlined">
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <h2>Providing Quality Video Call Just Like Quality Education</h2>

          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            <TextField
              id="meeting-code"
              variant="outlined"
              label="Meeting Code"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />

            <Button onClick={handleJoinVideoCall} variant="contained">
              Join
            </Button>
          </div>
        </div>

        <div className="rightPanel">
          <img src="/logo3.png" alt="Video Call Illustration" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
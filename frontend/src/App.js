import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import HomeComponent from "./pages/home";
import History from "./pages/history";
import VideoMeetComponent from "./pages/VideoMeet";
import { AuthProvider } from "./contexts/AuthContext";
import withAuth from "./utils/withAuth";

function App() {
  const ProtectedHome = withAuth(HomeComponent);
  const ProtectedHistory = withAuth(History);
  const ProtectedVideoMeet = withAuth(VideoMeetComponent);

  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />

            {/* Protected Routes */}
            <Route path="/home" element={<ProtectedHome />} />
            <Route path="/history" element={<ProtectedHistory />} />
            <Route path="/meeting/:url" element={<ProtectedVideoMeet />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
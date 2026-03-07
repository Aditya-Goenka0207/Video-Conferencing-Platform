import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const router = useNavigate();

  // ================= Register =================
  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name: name.trim(),
        username: username.trim(),
        password: password,
      });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      throw err.response?.data?.message || "Registration failed";
    }
  };

  // ================= Login =================
  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username: username.trim(),
        password: password,
      });

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);

        setUserData({ username: username.trim() });

        router("/home");
      }
    } catch (err) {
      throw err.response?.data?.message || "Login failed";
    }
  };

  // ================= Get Meeting History =================
  const getHistoryOfUser = async () => {
    try {
      const request = await client.get("/get_all_activity", {
        params: {
          token: localStorage.getItem("token"), 
        },
      });

      return request.data;
    } catch (err) {
      throw err.response?.data?.message || "Failed to fetch history";
    }
  };

  // ================= Add Meeting to History =================
  const addToUserHistory = async (meetingCode) => {
    try {
      const request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"), 
        meetingCode: meetingCode.trim(),  
      });

      return request.data;
    } catch (e) {
      throw e.response?.data?.message || "Failed to add meeting";
    }
  };

  const data = {
    userData,
    setUserData,
    addToUserHistory,
    getHistoryOfUser,
    handleRegister,
    handleLogin,
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};
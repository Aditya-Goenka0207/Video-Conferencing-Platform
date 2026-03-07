import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
      }
    }, [navigate]);

    const token = localStorage.getItem("token");
    if (!token) return null; // Prevent rendering if not authenticated

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
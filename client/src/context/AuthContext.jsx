import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isValidJSON, requestHandler } from "../utils";
import { loginUser, logoutUser, registerUser } from "../api";
import { useSocket } from "./SocketContext"; // Import the useSocket hook

// Creating Auth Context
const AuthContext = createContext({});

// Hook to access AuthContext
const useAuth = () => useContext(AuthContext);

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(
    isValidJSON(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authMessage, setAuthMessage] = useState(null);
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();
  const { socket, initializeSocket } = useSocket(); // ✅ Added initializeSocket for reconnection

  // ✅ FIXED: Function to store token safely & validate it
  const storeToken = (token) => {
    if (!token || typeof token !== "string" || token.split(".").length !== 3) {
      console.error("Invalid JWT Token!");
      return;
    }
    localStorage.setItem("token", token);
    setToken(token);
  };

  // Handle Login
  const login = async (data) => {
    await requestHandler(
      () => loginUser(data),
      setIsLoading,
      (res) => {
        const { data } = res;
        setUser({ ...data.user, isOnline: true });
        storeToken(data.tokens.accessToken);
        localStorage.setItem("user", JSON.stringify({ ...data.user, isOnline: true }));

        // ✅ FIXED: Ensure socket exists before emitting
        if (socket) {
          socket.emit("userOnline", data.user._id);
        } else {
          initializeSocket(); // ✅ Reconnect socket if it's not initialized
        }

        navigate("/chat");
      },
      setAuthError
    );
  };

  // Handle Register
  const register = async (data) => {
    await requestHandler(
      () => registerUser(data),
      setIsLoading,
      () => {
        setAuthMessage("Registration successful!");
        navigate("/login");
      },
      setAuthError
    );
  };

  // Handle Logout
  const logout = async () => {
    await requestHandler(
      () => logoutUser(),
      setIsLoading,
      () => {
        if (user && socket) {
          socket.emit("userOffline", user._id);
          socket.disconnect(); // ✅ Fully disconnect socket
        }

        setUser(null);
        setToken(null);
        localStorage.clear();
        navigate("/login");
      },
      setAuthError
    );
  };

  // Clear Auth Error after 2 seconds
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => setAuthError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        authMessage,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, useAuth, AuthProvider };

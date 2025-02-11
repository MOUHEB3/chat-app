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
  const { socket } = useSocket(); // ✅ FIXED: Destructure socket properly

  // Handle Login
  const login = async (data) => {
    await requestHandler(
      () => loginUser(data),
      setIsLoading,
      (res) => {
        const { data } = res;
        setUser({ ...data.user, isOnline: true });
        setToken(data.tokens.accessToken);
        localStorage.setItem("user", JSON.stringify({ ...data.user, isOnline: true }));
        localStorage.setItem("token", data.tokens.accessToken); // ✅ FIXED: Don't use JSON.stringify

        // ✅ FIXED: Ensure socket exists before emitting
        if (socket) socket.emit("userOnline", data.user._id);

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

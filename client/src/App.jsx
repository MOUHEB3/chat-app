import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { SocketProvider } from "./context/SocketContext";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import DesktopOnly from "./components/DesktopOnly";
import WebRtcContextProvider from "./context/WebRtcContext";

function AppRoutes() {
  const { token, user } = useAuth(); // ✅ Now useAuth() is inside AuthProvider

  return (
    <Routes>
      {/* Redirect to chat if logged in, otherwise login */}
      <Route
        path="/"
        element={token && user?._id ? <Navigate to="/chat" /> : <Navigate to="/login" />}
      />

      <Route
        exact
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        exact
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatProvider>
              <WebRtcContextProvider>
                <Chat />
              </WebRtcContextProvider>
            </ChatProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/chat/:chatId"
        element={
          <PrivateRoute>
            <ChatProvider>
              <WebRtcContextProvider>
                <Chat />
              </WebRtcContextProvider>
            </ChatProvider>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider> {/* ✅ AuthProvider should wrap everything */}
      <SocketProvider> {/* ✅ Ensure socket works only after authentication */}
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

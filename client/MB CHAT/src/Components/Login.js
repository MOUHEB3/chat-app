import React, { useState } from "react";
import "./myStyle.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SimpleBackdrop from "./PageLoading";
import { message } from "antd";
import { styled } from "@mui/material/styles";
import chatnow from "./Images/chat.png";
import Chip from "@mui/material/Chip";
import ImageIcon from "@mui/icons-material/Image";
import GitHubIcon from "@mui/icons-material/GitHub";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AttachEmailSharpIcon from "@mui/icons-material/AttachEmailSharp";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Login() {
  const ENDPOINT = process.env.REACT_APP_API_KEY;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const navigate = useNavigate();
  const [Image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${ENDPOINT}/user/login`, {
        name: username.trimEnd(),
        password: password,
      });

      // Save the token to localStorage upon successful login
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data._id);
      localStorage.setItem("userName", response.data.name);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("userImage", response.data.image);

      // Check if the response contains a valid token
      if (response.data.token) {
        console.log("Login successful");
        console.log(localStorage.getItem("token"));
        setLoading(false);
        navigate("/app/welcome");
      } else {
        console.error("Login failed:", "Invalid token");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      if (error.response && error.response.status === 401) {
        console.log("Invalid credentials provided");
        messageApi.open({
          type: "error",
          content: "Invalid credentials provided",
          className: "custom-class",
          style: {
            marginTop: "20vh",
          },
        });
      }
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (username === "" || email === "" || password === "") {
      messageApi.open({
        type: "error",
        content: "fields cannot be left blank",
        className: "custom-class",
        style: {
          marginTop: "20vh",
        },
      });
      return;
    }
    const formData = new FormData();
    formData.append("image", Image);
    formData.append("name", username.trimEnd());
    formData.append("email", email);
    formData.append("password", password);
    setLoading(true);
    try {
      // Removed the unused 'response' variable assignment here:
      await axios.post(`${ENDPOINT}/user/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Registration successful");
      setLoading(false);
      navigate("/");
      setRegister(false);
    } catch (error) {
      console.error("Registration failed:", error.response.data);
      messageApi.open({
        type: "error",
        content: error.response.data.error,
        className: "custom-class",
        style: {
          marginTop: "20vh",
        },
      });
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  return (
    <div className="login-container">
      {contextHolder}
      <div className="image-container">
        <img src={chatnow} alt="alt" className="welcome-logo" draggable="false" />
      </div>
      {!register ? (
        <div className="login-box" style={{ position: "relative" }}>
          <p>login to your account</p>
          <TextField
            id="username-field"
            name="username"
            type="text"
            label="Enter Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            sx={{ boxShadow: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            id="password-field"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            sx={{ boxShadow: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" onClick={handleLogin}>
            Login
          </Button>
          <div>
            <p style={{ cursor: "pointer" }} onClick={() => setRegister(true)}>
              Register now
            </p>
          </div>
          <div
            style={{
              alignSelf: "flex-end",
              position: "absolute",
              right: "50px",
              bottom: "5px",
            }}
          >
            <IconButton
              onClick={() => window.open("https://github.com/MOUHEB3")}
              title="vibhorarya12"
            >
              <GitHubIcon sx={{ color: "grey" }} fontSize="large" />
            </IconButton>
            <p>github</p>
          </div>
        </div>
      ) : (
        <div className="login-box" style={{ position: "relative", overflowY: "auto" }}>
          <Stack direction={"column"} spacing={3}>
            {Image ? (
              <div style={{ position: "relative" }}>
                <Avatar
                  sx={{
                    width: "auto",
                    height: "15vh",
                    maxWidth: "150px",
                    boxShadow: 15,
                  }}
                  src={URL.createObjectURL(Image)}
                />
                <Chip label="X" size="small" variant="outlined" onClick={() => setImage(null)} />
              </div>
            ) : null}

            <p>Register now</p>
            <TextField
              id="reg-username-field"
              name="username"
              type="text"
              label="Enter Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              sx={{ boxShadow: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              id="reg-email-field"
              name="email"
              type="email"
              label="Enter Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              sx={{ boxShadow: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AttachEmailSharpIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              id="reg-password-field"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              sx={{ boxShadow: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              component="label"
              variant="contained"
              startIcon={<ImageIcon />}
              style={{
                borderRadius: "23px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
              }}
              sx={{ bgcolor: "#9b44e8" }}
            >
              Profile pic (optional)
              <VisuallyHiddenInput
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            <Button variant="outlined" onClick={handleRegister}>
              Register
            </Button>
            <div>
              <p
                style={{ cursor: "pointer", bottom: "10px", position: "relative" }}
                onClick={() => setRegister(false)}
              >
                Already have an account?
              </p>
            </div>
          </Stack>
        </div>
      )}

      {loading ? <SimpleBackdrop title="please wait..." /> : null}
    </div>
  );
}

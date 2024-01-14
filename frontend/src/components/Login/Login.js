import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    setError("");
    if (!username.trim() && !password.trim()) {
      setError("Email and password are required.");
      return;
    } else if (!password.trim()) {
      setError("Password is required.");
      return;
    } else if(!username.trim()) {
      setError("Email is required.");
      return;
    }
    
    navigate('/home')
    console.log(
      `Login attempt with username: ${username} and password: ${password}`
    );
  };

  return (
    <div className="login-container">
      <Card className="card-container">
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            style={{ fontFamily: "Poppins", color: "#7077A1" }}
          >
            Login
          </Typography>
          <form>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                style: { color: "#7077A1", fontFamily: "Poppins" },
              }}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                style: { color: "#7077A1", fontFamily: "Poppins" },
              }}
            />
            {error && (
              <Alert
                severity="error"
                style={{ fontFamily: "Poppins", marginTop: "0.5rem" }}
              >
                {error}
              </Alert>
            )}
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                  style={{
                    marginTop: "1rem",
                    fontFamily: "Poppins",
                    backgroundColor: "#2D3250",
                  }}
                >
                  Login
                </Button>
              </Grid>
              <Grid item>
                <Typography
                  style={{
                    color: "#7077A1",
                    marginTop: "1rem",
                    fontFamily: "Poppins",
                    fontSize: "14px",
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    component={RouterLink}
                    to="/signup"
                    style={{ color: "#2D3250", textDecoration: "none" }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

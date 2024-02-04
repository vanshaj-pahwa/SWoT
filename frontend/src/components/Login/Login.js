import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../slice/userSlice";
import { selectToken, selectApiError } from "../../slice/userSlice";

import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectToken);
  const apiError = useSelector(selectApiError);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!email.trim() && !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    } else if (!password.trim()) {
      setError("Password is required.");
      setLoading(false);
      return;
    } else if (!email.trim()) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    const credentials = {
      email,
      password,
    };

    try {
      await dispatch(loginUser(credentials));

      if (token || localStorage.getItem("token")) {
        navigate("/home");
      } else {
        setError(apiError || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      color="secondary"
                      style={{ color: "white" }}
                    />
                  ) : (
                    "Login"
                  )}
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

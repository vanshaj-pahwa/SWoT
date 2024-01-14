import React, { useState } from "react";
import Alert from "@mui/material/Alert";
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

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const handleSignUp = () => {
    setError("");

    if (!username.trim() || !emailRegex.test(username)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim() || !passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one letter and one number."
      );
      return;
    }

    console.log(
      `Sign up attempt with username: ${username} and password: ${password}`
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
            Sign up
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
                  onClick={handleSignUp}
                  style={{
                    marginTop: "1rem",
                    fontFamily: "Poppins",
                    backgroundColor: "#2D3250",
                  }}
                >
                  Sign Up
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
                  Already have an account?{" "}
                  <Link
                    component={RouterLink}
                    to="/login"
                    style={{ color: "#2D3250", textDecoration: "none" }}
                  >
                    Sign In
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

export default SignUp;

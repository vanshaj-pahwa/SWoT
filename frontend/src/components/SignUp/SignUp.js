import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../slice/userSlice";
import { selectToken, selectApiError } from "../../slice/userSlice";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  CircularProgress
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectToken);
  const apiError = useSelector(selectApiError);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const handleSignUp = async () => {
    setError("");
    setLoading(true);

    if (!email.trim() || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim() || !passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one letter and one number."
      );
      return;
    }

    const userInfo = {
      name: username,
      email: email,
      password: password
    }

    try {
      await dispatch(signupUser(userInfo));

      if (token) {
        navigate("/home");
      } else {
        setError(apiError || "Signup failed. Please check your credentials.");
      }
    } catch (error) {
      setError("An error occurred during signup.");
    } finally {
      setLoading(false); // Set loading to false when signup process completes
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
            Sign up
          </Typography>
          <form>
          <TextField
              label="Username"
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
                  onClick={handleSignUp}
                  style={{
                    marginTop: "1rem",
                    fontFamily: "Poppins",
                    backgroundColor: "#2D3250",
                  }}
                  disabled={loading} // Disable the button when loading
                >
                  {loading ? <CircularProgress size={24} color="secondary" style={{color: 'white'}}/> : "Sign Up"}
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

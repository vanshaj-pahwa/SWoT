import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const Navbar = () => {
  const navigate = useNavigate();
  const emailId = localStorage.getItem("emailId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("emailId");
    navigate("/login");
  };

  return (
    <AppBar position="static" style={{ backgroundColor: "#7077A1" }}>
      <Toolbar style={{ display: "flex", justifyContent: "flex-end" }}>
        <Typography
          variant="h6"
          style={{ padding: "10px", fontFamily: "Poppins", fontSize: "16px" }}
        >
          {emailId}
        </Typography>
        <Button
          variant="outlined"
          style={{
            color: "#2D3250",
            border: "2px solid",
            borderColor: "#2D3250",
            fontWeight: "bold",
            fontFamily: "Poppins",
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

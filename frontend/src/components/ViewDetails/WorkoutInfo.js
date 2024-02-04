import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const WorkoutInfo = ({ workoutData }) => {
  return (
    <Card style={{ backgroundColor: "#7077A1", color: "white" }}>
      <CardContent>
        <Typography style={{ fontFamily: "Poppins", fontSize: "12px" }}>
          YOUR NEXT WORKOUT
        </Typography>
        <Typography
          style={{ fontFamily: "Poppins", marginTop: "10px" }}
          variant="h5"
        >
          Chest, Shoulder, Triceps
        </Typography>
      </CardContent>
    </Card>
  );
};

export default WorkoutInfo;

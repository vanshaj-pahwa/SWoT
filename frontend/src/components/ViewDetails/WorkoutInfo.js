import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const WorkoutInfo = ({ workoutData }) => {
  return (
    <Card style={{margin: '1.5rem', width: '20rem'}}>
      <CardContent>
        <Typography variant="h6">{workoutData.title}</Typography>
        <Typography>{`Duration: ${workoutData.duration} minutes`}</Typography>
      </CardContent>
    </Card>
  );
};

export default WorkoutInfo;

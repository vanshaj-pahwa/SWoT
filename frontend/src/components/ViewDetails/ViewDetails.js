import React, { useState } from "react";
import { Card, CardContent, Grid } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "./ViewDetails.css";

const ViewDetails = () => {
  const currentDate = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [selectedDate, setSelectedDate] = useState(0); // Set the default selected date to today

  const handleCardClick = (index) => {
    setSelectedDate(index);
  };

  return (
    <div>
      <div className="calendar-wrapper">
        <div className="calendarIcon">
          <CalendarMonthIcon style={{ color: "white" }} />
        </div>
        <div>
          <div className="calendarDay">
            {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
          </div>
          <div className="calendarMonth">{`${currentDate.getDate()} ${currentDate.toLocaleString("default", { month: "long" }
          )}`}</div>
        </div>
      </div>
      <Grid container spacing={2} margin={'0.5rem'}>
        {[...Array(14)].map((_, index) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - index);

          const isSelected = selectedDate === index;
          const backgroundColor = isSelected ? "#7077A1" : "white";
          const textColor = isSelected ? "white" : "#7077A1";

          return (
            <Grid item key={index}>
              <Card
                onClick={() => handleCardClick(index)}
                style={{
                  width: "fit-content",
                  backgroundColor: backgroundColor,
                  color: textColor,
                  cursor: "pointer",
                }}
              >
                <CardContent
                  style={{
                    fontSize: "18px",
                    padding: "0.5rem",
                    width: "2.5rem",
                    textAlign: "center",
                  }}
                >
                  <div>{date.getDate()}</div>
                  <div>{days[date.getDay()]}</div>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default ViewDetails;

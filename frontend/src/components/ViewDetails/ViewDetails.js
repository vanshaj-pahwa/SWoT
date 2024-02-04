import React, { useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  Chip,
  useMediaQuery,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import "./ViewDetails.css";
import WorkoutInfo from "./WorkoutInfo";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";

const ViewDetails = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [selectedDate, setSelectedDate] = useState(0); // Set the default selected date to today

  const workoutDataPerDate = [
    [
      { title: "Morning Run", duration: 30 },
      { title: "Afternoon Yoga", duration: 45 },
      { title: "Morning Run", duration: 30 },
      { title: "Afternoon Yoga", duration: 45 },
      { title: "Afternoon Yoga", duration: 45 },
    ],
    [
      { title: "Evening Walk", duration: 20 },
      { title: "Cycling", duration: 60 },
    ],
  ];

  const isMobile = useMediaQuery("(max-width:500px)");
  const isTablet = useMediaQuery("(max-width:1023px)");

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 3 : isTablet ? 8 : 15,
    slidesToScroll: isMobile ? 3 : isTablet ? 8 : 15,
    nextArrow: <KeyboardArrowRightIcon />,
    prevArrow: <KeyboardArrowLeftIcon />,
  };

  const handleCardClick = (index) => {
    setSelectedDate(index);
  };

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <React.Fragment>
      <Navbar />
      <div className="view-details">
        <div className="header">
          <div className="back-to-home" onClick={handleBack}>
            <KeyboardBackspaceIcon style={{ color: "#2d3250" }} />
            <span>Back to Home</span>
          </div>
          <div className="calendar-wrapper">
            <div className="calendarIcon">
              <CalendarMonthIcon style={{ color: "white" }} />
            </div>
            <div>
              <div className="calendarDay">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div className="calendarMonth">{`${currentDate.getDate()} ${currentDate.toLocaleString(
                "default",
                { month: "long" }
              )}`}</div>
            </div>
          </div>
        </div>
        <Slider {...settings}>
          {[...Array(30)].map((_, index) => {
            const date = new Date();
            date.setDate(currentDate.getDate() - index);

            const isSelected = selectedDate === index;
            const backgroundColor = isSelected ? "#7077A1" : "white";
            const textColor = isSelected ? "white" : "#7077A1";
            const monthTag = date.toLocaleString("default", { month: "short" });

            return (
              <Grid item key={index} margin={"1rem"}>
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
                      width: "2.8rem",
                      textAlign: "center",
                    }}
                  >
                    <Chip
                      label={monthTag}
                      variant="outlined"
                      style={{
                        border: "1px solid",
                        color: isSelected ? "white" : "#2D3250",
                        height: "1.2rem",
                        marginTop: "-1rem",
                        fontFamily: "Poppins",
                        fontSize: "9px",
                      }}
                    />
                    <div>{date.getDate()}</div>
                    <div>{days[date.getDay()]}</div>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Slider>
        <Typography
          variant="h6"
          style={{
            margin: "1rem 0rem 1rem 0",
            fontFamily: "Poppins",
            color: "#424769",
          }}
        >
          You Performed
        </Typography>

        <Grid container spacing={1}>
          {workoutDataPerDate[selectedDate].map((workout, idx) => (
            <Grid item key={idx} xs={12} sm={6} md={3}>
              <WorkoutInfo workoutData={workout} />
            </Grid>
          ))}
        </Grid>
      </div>
    </React.Fragment>
  );
};

export default ViewDetails;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCustomWorkout,
  fetchCustomWorkouts,
  fetchWorkouts,
  selectCustomWorkouts,
  selectWorkouts,
  selectError,
  setError,
  deleteCustomWorkout,
  addExercise,
  viewExercise,
  selectFetchedExercises,
} from "../../slice/workoutSlice";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./WorkoutForm.css";

const WorkoutForm = () => {
  const dispatch = useDispatch();
  const workouts = useSelector(selectWorkouts);
  const customWorkouts = useSelector(selectCustomWorkouts);
  const error = useSelector(selectError);
  const fetchedExercises = useSelector(selectFetchedExercises);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [addedExercises, setAddedExercises] = useState([]);
  const [customWorkout, setCustomWorkout] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchCustomWorkouts(userId));
    dispatch(viewExercise(userId));
  }, [dispatch, userId]);

  const handleAddExercise = () => {
    if (selectedWorkout.trim() !== "" && exerciseName.trim() !== "") {
      dispatch(viewExercise(userId));
      let body = {
        userId: userId,
        workoutName: selectedWorkout,
        excerciseName: exerciseName,
      };
      dispatch(addExercise(body));
      setAddedExercises([
        ...addedExercises,
        {
          workoutName: selectedWorkout,
          exerciseName: exerciseName,
          sets: [{ setNumber: 1, weight: "", reps: "" }],
        },
      ]);
      setExerciseName("");
    }
  };

  const handleAddSet = (exerciseIndex) => {
    const updatedExercises = [...addedExercises];
    const newSetNumber = addedExercises[exerciseIndex].sets.length + 1;
    updatedExercises[exerciseIndex].sets.push({
      setNumber: newSetNumber,
      weight: "",
      reps: "",
    });
    setAddedExercises(updatedExercises);
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...addedExercises];
    const sets = updatedExercises[exerciseIndex].sets;

    if (sets.length === 1) {
      // If there is only one set, set weight and reps to null
      sets[setIndex].weight = "";
      sets[setIndex].reps = "";
    } else {
      // If there are multiple sets, delete the complete row
      sets.splice(setIndex, 1);
    }

    setAddedExercises(updatedExercises);
  };

  const handleAddCustomWorkout = () => {
    if (customWorkout.trim() !== "" && !workouts.includes(customWorkout)) {
      dispatch(addCustomWorkout(userId, customWorkout));
      setSelectedWorkout(customWorkout);
      setCustomWorkout("");
      handleSuccessAlert("Your custom workout added successfully!");
    }
  };

  const handleDeleteWorkout = (userWorkoutId) => {
    dispatch(deleteCustomWorkout(userWorkoutId));
    handleSuccessAlert("Your custom workout deleted successfully!");
  };

  const handleSuccessAlert = (message) => {
    setAlertMessage(message);
    setShowSuccessAlert(true);

    // Automatically disable the alert after 4000 milliseconds (4 seconds)
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 4000);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="workout-form">
      <Typography
        variant="h6"
        style={{ fontFamily: "Poppins", color: "#424769" }}
      >
        Select Today's Workout
      </Typography>

      <FormControl fullWidth>
        <InputLabel
          id="workout-select-label"
          style={{ marginTop: "20px", color: "#7077A1", fontFamily: "Poppins" }}
        >
          Workout
        </InputLabel>
        <Select
          labelId="workout-select-label"
          id="workout-select"
          value={selectedWorkout}
          onChange={(e) => setSelectedWorkout(e.target.value)}
          onClose={() => setIsDropdownOpen(false)}
          onOpen={() => setIsDropdownOpen(true)}
          label="Workout"
          style={{ marginTop: "20px", color: "#7077A1", fontFamily: "Poppins" }}
        >
          {/* Pre-added workouts */}
          {workouts.map((workout) => (
            <MenuItem
              key={workout.workoutId}
              value={workout.workoutType}
              style={{ color: "#7077A1", fontFamily: "Poppins" }}
            >
              {workout.workoutType}
            </MenuItem>
          ))}

          {/* Custom workouts */}
          {Array.isArray(customWorkouts) &&
            customWorkouts.map((workout) => (
              <MenuItem
                key={workout.userWorkoutId}
                value={workout.workoutName}
                style={{ color: "#7077A1", fontFamily: "Poppins" }}
              >
                {workout.workoutName}
                {isDropdownOpen && selectedWorkout !== workout.workoutName && (
                  <DeleteIcon
                    style={{ marginLeft: "auto", cursor: "pointer" }}
                    onClick={() => handleDeleteWorkout(workout.userWorkoutId)}
                  />
                )}
              </MenuItem>
            ))}

          {/* Add Yours option */}
          <MenuItem
            value="addYours"
            style={{ color: "#7077A1", fontFamily: "Poppins" }}
          >
            Add Yours
          </MenuItem>
        </Select>
        {/* Text box for adding custom workout */}
        {selectedWorkout === "addYours" && (
          <div>
            <TextField
              label="Your Workout Name"
              variant="outlined"
              value={customWorkout}
              onChange={(e) => setCustomWorkout(e.target.value)}
              fullWidth
              style={{ marginTop: "20px", fontFamily: "Poppins" }}
              InputProps={{
                style: { color: "#7077A1", fontFamily: "Poppins" },
              }}
            />
            <Button
              style={{
                marginTop: "20px",
                backgroundColor: "#7077A1",
                fontFamily: "Poppins",
              }}
              onClick={handleAddCustomWorkout}
              variant="contained"
              color="primary"
            >
              Add to List
            </Button>
          </div>
        )}
      </FormControl>

      {selectedWorkout && selectedWorkout !== "addYours" && (
        <div>
          <TextField
            label="Exercise Name"
            variant="outlined"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            fullWidth
            style={{ marginTop: "20px", fontFamily: "Poppins" }}
            InputProps={{
              style: { color: "#7077A1", fontFamily: "Poppins" },
            }}
          />
          <Button
            style={{
              marginTop: "20px",
              backgroundColor: "#7077A1",
              fontFamily: "Poppins",
            }}
            onClick={handleAddExercise}
            variant="contained"
            color="primary"
          >
            Add Exercise
          </Button>
        </div>
      )}

      <div className="addedExercises" style={{ marginTop: "20px" }}>
        <Slider {...sliderSettings}>
          {fetchedExercises && fetchedExercises.map((item) => (
            item.workoutName === selectedWorkout && <Card key={item.userExcerciseId}>
              <CardContent style={{ padding: 0 }}>
                <Typography
                  style={{
                    fontFamily: "Poppins",
                    color: "white",
                    fontSize: "12px",
                    backgroundColor: "#424769",
                    padding: "10px",
                  }}
                >
                  YOUR EXERCISE
                </Typography>
                <Typography
                  style={{
                    fontFamily: "Poppins",
                    color: "#424769",
                    margin: "10px",
                  }}
                  variant="h5"
                >{`${item.workoutName} - ${item.exerciseName}`}</Typography>
                {/* {item.sets.map((set, setIndex) => (
                  <Grid container justifyContent={"center"}>
                    <Grid item xs={2}>
                      <Typography
                        style={{
                          fontFamily: "Poppins",
                          color: "#7077A1",
                          fontSize: "12px",
                          margin: "10px",
                        }}
                      >
                        Set
                      </Typography>
                      <Typography
                        style={{
                          fontFamily: "Poppins",
                          color: "#7077A1",
                          fontSize: "12px",
                          margin: "10px",
                        }}
                      >
                        {set.setNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        style={{
                          fontFamily: "Poppins",
                          color: "#7077A1",
                          fontSize: "12px",
                          margin: "10px",
                        }}
                      >
                        Weight
                      </Typography>
                      <TextField
                        value={set.weight}
                        InputProps={{
                          style: {
                            color: "#7077A1",
                            fontFamily: "Poppins",
                            fontSize: "12px",
                            height: "1.4375em",
                          },
                        }}
                        className="weight-input"
                        onChange={(e) => {
                          const updatedExercises = [...addedExercises];
                          updatedExercises[item.userExcerciseId].sets[
                            setIndex
                          ].weight = e.target.value;
                          setAddedExercises(updatedExercises);
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        style={{
                          fontFamily: "Poppins",
                          color: "#7077A1",
                          fontSize: "12px",
                          margin: "10px",
                        }}
                      >
                        Reps
                      </Typography>
                      <TextField
                        value={set.reps}
                        InputProps={{
                          style: {
                            color: "#7077A1",
                            fontFamily: "Poppins",
                            fontSize: "12px",
                            height: "1.4375em",
                          },
                        }}
                        className="weight-input"
                        onChange={(e) => {
                          const updatedExercises = [...addedExercises];
                          updatedExercises[item.userExcerciseId].sets[setIndex].reps =
                            e.target.value;
                          setAddedExercises(updatedExercises);
                        }}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={2}
                      marginTop={"2rem"}
                      className="delete-icon"
                    >
                      <DeleteIcon
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDeleteSet(item.userExerciseId, setIndex)}
                      />
                    </Grid>
                  </Grid>
                ))} */}
                <div className="add-set-button">
                  <Button
                    variant="text"
                    style={{
                      color: "#424769",
                      fontWeight: "bold",
                      fontFamily: "Poppins",
                    }}
                    onClick={() => handleAddSet(item.userExerciseId)}
                  >
                    Add Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </Slider>
      </div>
      {addedExercises.length > 0 && (
        <Button
          variant="contained"
          style={{
            marginTop: "20px",
            backgroundColor: "#7077A1",
            fontFamily: "Poppins",
          }}
        >
          ADD WORKOUT
        </Button>
      )}

      {showSuccessAlert && (
        <Alert
          style={{ marginTop: "1rem" }}
          severity="success"
          onClose={() => setShowSuccessAlert(false)}
        >
          {alertMessage}
        </Alert>
      )}
      {error && (
        <Alert
          style={{ marginTop: "1rem" }}
          severity="error"
          onClose={() => dispatch(setError(null))}
        >
          {error}
        </Alert>
      )}
    </div>
  );
};

export default WorkoutForm;

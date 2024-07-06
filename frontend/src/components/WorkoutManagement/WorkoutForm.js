import React, { useState, useEffect, useRef } from "react";
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
  viewAddedSets,
  selectAddedSets,
  selectLoading,
  addExerciseSets,
  deleteSet,
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
  const loading = useSelector(selectLoading);
  const fetchedExercises = useSelector(selectFetchedExercises);
  const addedSets = useSelector(selectAddedSets);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [addedExercises, setAddedExercises] = useState([]);
  const [customWorkout, setCustomWorkout] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [exerciseSets, setExerciseSets] = useState({});
  const [addSetData, setAddSetData] = useState([]);

  const bottomRef = useRef(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchCustomWorkouts(userId));
    dispatch(viewExercise(userId));
    dispatch(viewAddedSets());
  }, [dispatch, userId]);

  const handleAddExercise = () => {
    if (selectedWorkout.trim() !== "" && exerciseName.trim() !== "") {
      let body = {
        userId: userId,
        workoutName: selectedWorkout,
        excerciseName: exerciseName,
      };
      dispatch(addExercise(body));
      dispatch(viewExercise(userId));
      if (Array.isArray(addedExercises)) {
        setAddedExercises([...addedExercises, ...fetchedExercises]);
      } else {
        setAddedExercises([...fetchedExercises]);
      }
      setExerciseName("");
    }
  };

  useEffect(() => {
    viewExercise(userId);
  }, [fetchedExercises, userId]);

  useEffect(() => {
    if (addedSets.length > 0) {
      const newExerciseSets = {};
      addedSets.forEach((set) => {
        if (!newExerciseSets[set.userExcerciseId]) {
          newExerciseSets[set.userExcerciseId] = [];
        }
        newExerciseSets[set.userExcerciseId].push({
          setNumber: newExerciseSets[set.userExcerciseId].length + 1,
          weight: set.weight.toString(),
          reps: set.reps.toString(),
        });
      });
      setExerciseSets(newExerciseSets);
    }
  }, [addedSets]);

  // const handleAddSet = (exerciseId) => {
  //   const sets = exerciseSets[exerciseId] || [];
  //   const lastSet = sets[sets.length - 1];

  //   if (lastSet === undefined) {
  //     const newSet = { setNumber: sets.length + 1, weight: "", reps: "" };
  //     sets.push(newSet);
  //     setExerciseSets({ ...exerciseSets, [exerciseId]: sets });
  //     dispatch(setError(""));
  //     scrollToBottom();
  //   } else if (
  //     lastSet &&
  //     lastSet.weight.trim() !== "" &&
  //     lastSet.reps.trim() !== ""
  //   ) {
  //     const newSet = { setNumber: sets.length + 1, weight: "", reps: "" };
  //     sets.push(newSet);
  //     setExerciseSets({ ...exerciseSets, [exerciseId]: sets });
  //     dispatch(setError(""));
      
  //     let body = [{
  //       "userExcerciseId" : exerciseId,
  //       "weight" : lastSet.weight,
  //       "reps" : lastSet.reps
  //     }];

  //     dispatch(addExerciseSets(body));
  //     setAddSetData(body);

  //     scrollToBottom();
  //   } else {
  //     dispatch(setError("Please enter weight and reps before adding a new set."));
  //     scrollToBottom();
  //   }
  // };

  const handleAddSet = (exerciseId) => {
    const sets = exerciseSets[exerciseId] || [];
    const newSet = { setNumber: sets.length + 1, weight: "", reps: "" };
    sets.push(newSet);
    setExerciseSets({ ...exerciseSets, [exerciseId]: sets });
    dispatch(setError(""));
    scrollToBottom();
  };

  const saveWorkout = () => {
    if(addSetData.length > 0) {
      dispatch(addExerciseSets(addSetData));
      dispatch(setError(""));
    } else {
      dispatch(setError("Please add all the information before saving the workout."))
    }
  }

  // const handleSetChange = (exerciseId, setNumber, field, value) => {
  //   const sets = exerciseSets[exerciseId] || [];
  //   const updatedSets = sets.map((set) =>
  //     set.setNumber === setNumber ? { ...set, [field]: value } : set
  //   );
  //   setExerciseSets({ ...exerciseSets, [exerciseId]: updatedSets });
  // };

  const handleSetChange = (exerciseId, setNumber, field, value) => {
    const sets = exerciseSets[exerciseId] || [];
    const updatedSets = sets.map((set) =>
      set.setNumber === setNumber ? { ...set, [field]: value } : set
    );
    setExerciseSets({ ...exerciseSets, [exerciseId]: updatedSets });
  
    // Update addSetData
    const updatedAddSetData = updatedSets.map((set) => ({
      userExcerciseId: exerciseId,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps,
    }));
    setAddSetData(updatedAddSetData);
  };

  const handleDeleteSet = (exerciseId, setNumber) => {
    const sets = exerciseSets[exerciseId] || [];
    const updatedSets = sets.filter((set) => set.setNumber !== setNumber);
    setExerciseSets({ ...exerciseSets, [exerciseId]: updatedSets });
  
    const setExists = addedSets.some(set => 
      set.userExcerciseId === exerciseId && set.setNumber === setNumber
    );

    console.log(addedSets, setExists);
  
    if (setExists) {
      dispatch(deleteSet(setNumber));
    } else {
      console.log("Set not saved yet, only removing from local state");
    }
  
    // Update addSetData to reflect the deletion
    const updatedAddSetData = updatedSets.map((set) => ({
      userExcerciseId: exerciseId,
      weight: set.weight,
      reps: set.reps,
    }));
    setAddSetData(updatedAddSetData);
  };

  const handleAddCustomWorkout = () => {
    if (customWorkout.trim() !== "" && !workouts.includes(customWorkout)) {
      dispatch(addCustomWorkout(userId, customWorkout));
      setSelectedWorkout(customWorkout);
      setCustomWorkout("");
      !loading &&
        !error &&
        handleSuccessAlert("Your custom workout added successfully!");
    }
  };

  const handleDeleteWorkout = (userWorkoutId) => {
    dispatch(deleteCustomWorkout(userWorkoutId));
    !loading &&
      !error &&
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

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isExerciseAdded = (userExerciseId) => {
    return addedSets.some((set) => set.userExcerciseId === userExerciseId);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="workout-form" ref={bottomRef}>
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
          {fetchedExercises &&
            fetchedExercises.map(
              (item) =>
                item.workoutName === selectedWorkout && (
                  <Card key={item.userExcerciseId}>
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
                      {exerciseSets[item.userExcerciseId] &&
                        exerciseSets[item.userExcerciseId].map((set) => (
                          <Grid
                            container
                            key={set.setNumber}
                            justifyContent={"center"}
                          >
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
                                onChange={(e) =>
                                  handleSetChange(
                                    item.userExcerciseId,
                                    set.setNumber,
                                    "weight",
                                    e.target.value
                                  )
                                }
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
                                onChange={(e) =>
                                  handleSetChange(
                                    item.userExcerciseId,
                                    set.setNumber,
                                    "reps",
                                    e.target.value
                                  )
                                }
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
                                onClick={() =>
                                  handleDeleteSet(
                                    item.userExcerciseId,
                                    set.setNumber
                                  )
                                }
                              />
                            </Grid>
                          </Grid>
                        ))}
                      {<div className="add-set-button">
                        <Button
                          variant="text"
                          style={{
                            color: "#424769",
                            fontWeight: "bold",
                            fontFamily: "Poppins",
                          }}
                          onClick={() => handleAddSet(item.userExcerciseId)}
                        >
                          Add Set
                        </Button>
                      </div>}
                    </CardContent>
                  </Card>
                )
            )}
        </Slider>
      </div>
      {fetchedExercises.length > 0 && (
        <Button
          variant="contained"
          style={{
            marginTop: "20px",
            backgroundColor: "#7077A1",
            fontFamily: "Poppins",
          }}
          onClick={saveWorkout}
        >
          SAVE WORKOUT
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

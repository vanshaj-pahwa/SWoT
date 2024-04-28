import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  ADD_CUSTOM_WORKOUT,
  GET_CUSTOM_WORKOUTS,
  GET_WORKOUTS,
  DELETE_CUSTOM_WORKOUT,
  ADD_EXERCISE,
  VIEW_EXERCISE,
} from "../constants/constants";

export const workoutSlice = createSlice({
  name: "workout",
  initialState: {
    workouts: [],
    customWorkouts: [],
    loading: false,
    error: null,
    addExerciseSuccessMsg: null,
    fetchedExercises: [],
  },
  reducers: {
    addCustomWorkoutSuccess: (state, action) => {
      state.customWorkouts.push(action.payload);
    },
    addExerciseSuccess: (state, action) => {
      state.addExerciseSuccessMsg = action.payload;
    },
    setFetchedExercises: (state, action) => {
      state.fetchedExercises = action.payload;
    },
    deleteWorkout: (state, action) => {
      state.workouts = state.workouts.filter((workout) => workout !== action.payload);
    },
    deleteCustomWorkoutSuccess: (state, action) => {
      state.customWorkouts = state.customWorkouts.filter(
        (workout) => workout.userWorkoutId !== action.payload
      );
    },
    setWorkouts: (state, action) => {
      state.workouts = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCustomWorkouts: (state, action) => {
      state.customWorkouts = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  addCustomWorkoutSuccess,
  deleteCustomWorkoutSuccess,
  setError,
  setLoading,
  setWorkouts,
  setCustomWorkouts,
  setUserWorkoutId,
  deleteWorkout,
  addExerciseSuccess,
  setFetchedExercises
} = workoutSlice.actions;

export const selectWorkouts = (state) => state.workout.workouts;
export const selectLoading = (state) => state.workout.loading;
export const selectError = (state) => state.workout.error;
export const selectCustomWorkouts = (state) => state.workout.customWorkouts;
export const selectUserWorkoutId = (state) => state.workout.userWorkoutId;
export const selectAddExerciseMsg = (state) => state.workout.addExerciseSuccessMsg;
export const selectFetchedExercises = (state) => state.workout.fetchedExercises;

/* Fetch pre-added workouts */
export const fetchWorkouts = () => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(GET_WORKOUTS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "Success") {
      dispatch(setWorkouts(response.data.body));
    } else {
      dispatch(setError("Failed to fetch workouts."));
    }
  } catch (error) {
    dispatch(setError("An error occurred while fetching workouts."));
  }
};

/* Fetch custom workouts */
export const fetchCustomWorkouts = (userId) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(GET_CUSTOM_WORKOUTS, {
      params: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "Success") {
      dispatch(setCustomWorkouts(response.data.body));
    } else {
      dispatch(setError("Failed to fetch workouts."));
    }
  } catch (error) {
    dispatch(setError("An error occurred while fetching workouts."));
  }
};

/* Add custom workout */
export const addCustomWorkout = (userId, workoutName) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(ADD_CUSTOM_WORKOUT, null, {
      params: {
        userId,
        workoutName,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "Success") {
      dispatch(addCustomWorkoutSuccess(response.data.body));
    } else {
      dispatch(setError("Failed to add custom workout."));
    }
  } catch (error) {
    dispatch(setError("An error occurred while adding custom workout."));
  }
};

/* Delete custom workout */
export const deleteCustomWorkout = (userWorkoutId) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${DELETE_CUSTOM_WORKOUT}/${userWorkoutId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.status === "Success") {
      dispatch(deleteCustomWorkoutSuccess(userWorkoutId));
    } else {
      dispatch(setError("Failed to delete custom workout."));
    }
  } catch (error) {
    dispatch(setError("An error occurred while deleting custom workout."));
  }
};

/* Add Exercise */
export const addExercise = (body) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(ADD_EXERCISE, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "Success") {
      dispatch(addExerciseSuccess(response.data.body));
    } else {
      dispatch(setError("Failed to add exercise."));
    }
  } catch (error) {
    dispatch(setError("An error occurred while adding exercise."));
  }
};

/* View Exercise */
export const viewExercise = (userId) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(VIEW_EXERCISE, {
      params: {
        userId
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "Success") {
      dispatch(setFetchedExercises(response.data.body));
    } else {
      dispatch(setError("Failed to add exercise."));
    }
  } catch (error) {
    dispatch(setError("An error occurred while adding exercise."));
  }
};

export default workoutSlice.reducer;

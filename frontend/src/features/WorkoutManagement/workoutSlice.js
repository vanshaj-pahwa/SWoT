import { createSlice } from '@reduxjs/toolkit';

export const workoutSlice = createSlice({
  name: 'workout',
  initialState: {
    workouts: [],
  },
  reducers: {
    addWorkout: (state, action) => {
      state.workouts.push(action.payload);
    },
    deleteWorkout: (state, action) => {
      state.workouts = state.workouts.filter((workout) => workout !== action.payload);
    },
  },
});

export const { addWorkout, deleteWorkout } = workoutSlice.actions;

export const selectWorkout = (state) => state.workout.workouts;

export default workoutSlice.reducer;

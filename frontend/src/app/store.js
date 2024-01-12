import { configureStore } from '@reduxjs/toolkit';
import workoutReducer from '../features/WorkoutManagement/workoutSlice';

export const store = configureStore({
  reducer: {
    workout: workoutReducer,
  },
});

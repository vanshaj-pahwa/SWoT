import { configureStore } from '@reduxjs/toolkit';
import workoutReducer from '../slice/workoutSlice';

export const store = configureStore({
  reducer: {
    workout: workoutReducer,
  },
});

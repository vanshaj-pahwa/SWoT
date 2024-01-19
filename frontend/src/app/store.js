import { configureStore } from '@reduxjs/toolkit';
import workoutReducer from '../slice/workoutSlice';
import userReducer from '../slice/userSlice';

export const store = configureStore({
  reducer: {
    workout: workoutReducer,
    user: userReducer
  },
});

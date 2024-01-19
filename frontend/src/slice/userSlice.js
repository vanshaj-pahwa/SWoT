import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { SIGN_IN_URL, SIGN_UP_URL } from '../constants/constants';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.token = null;
      state.error = action.payload;
    },
    signupSuccess: (state, action) => {
      state.token = action.payload;
      state.error = null;
    },
    signupFailure: (state, action) => {
      state.token = null;
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, loginFailure, signupSuccess, signupFailure } = userSlice.actions;

// Async thunk for user login
export const loginUser = (credentials) => async (dispatch) => {
  try {
    const response = await axios.post(SIGN_IN_URL, credentials);
    if (response.status === 200) {
        const { token } = response.data.body;
        dispatch(loginSuccess(token));
      } else {
        dispatch(loginFailure(response.data.message || 'An error occurred during login.'));
      }
  } catch (error) {
    dispatch(loginFailure(error.message || 'An error occurred during login.'));
  }
};

// Async thunk for user signup
export const signupUser = (userInfo) => async (dispatch) => {
  try {
    const response = await axios.post(SIGN_UP_URL, userInfo);

    if (response.data.status === "Success") {
        const { token } = response.data.body;
        dispatch(signupSuccess(token));
      } else {
        dispatch(signupFailure(response.data.message || 'An error occurred during signup.'));
      }
  } catch (error) {
    dispatch(signupFailure(error.message || 'An error occurred during signup.'));
  }
};

export const selectToken = (state) => state.user.token;
export const selectApiError = (state) => state.user.error;

export default userSlice.reducer;

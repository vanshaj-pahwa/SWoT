import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { SIGN_IN_URL, SIGN_UP_URL } from "../constants/constants";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    token: null,
    userName: null,
    emailId: null,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const { token, userName, emailId } = action.payload;
      state.token = token;
      state.userName = userName;
      state.emailId = emailId;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.token = null;
      state.userName = null;
      state.emailId = null;
      state.error = action.payload;
    },
    signupSuccess: (state, action) => {
      const { token, userName, emailId } = action.payload;
      state.token = token;
      state.userName = userName;
      state.emailId = emailId;
      state.error = null;
    },
    signupFailure: (state, action) => {
      state.token = null;
      state.userName = null;
      state.emailId = null;
      state.error = action.payload;
    },
  },
});

export const {
  loginSuccess,
  loginFailure,
  signupSuccess,
  signupFailure,
} = userSlice.actions;

// Async thunk for user login
export const loginUser = (credentials) => async (dispatch) => {
  try {
    const response = await axios.post(SIGN_IN_URL, credentials);
    if (response.status === 200) {
      const { token, userName, emailId } = response.data.body;
      dispatch(loginSuccess({ token, userName, emailId }));
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName);
      localStorage.setItem("emailId", emailId);
    } else {
      dispatch(
        loginFailure(response.data.message || "An error occurred during login.")
      );
      localStorage.clear();
    }
  } catch (error) {
    dispatch(loginFailure(error.message || "An error occurred during login."));
    localStorage.clear();
  }
};

// Async thunk for user signup
export const signupUser = (userInfo) => async (dispatch) => {
  try {
    const response = await axios.post(SIGN_UP_URL, userInfo);

    if (response.data.status === "Success") {
      const { token, userName, emailId } = response.data.body;
      dispatch(signupSuccess({ token, userName, emailId }));
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName);
      localStorage.setItem("emailId", emailId);
    } else {
      dispatch(
        signupFailure(
          response.data.message || "An error occurred during signup."
        )
      );
      localStorage.clear();
    }
  } catch (error) {
    dispatch(
      signupFailure(error.message || "An error occurred during signup.")
    );
    localStorage.clear();
  }
};

export const selectToken = (state) => state.user.token;
export const selectUserName = (state) => state.user.userName;
export const selectEmailId = (state) => state.user.emailId;
export const selectApiError = (state) => state.user.error;

export default userSlice.reducer;

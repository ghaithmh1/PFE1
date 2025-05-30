import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authslice";
import { profileReducer } from "./slices/profileSlice";


const store = configureStore({
    reducer: {
       auth: authReducer,
       profile: profileReducer,
    }
});

export default store;
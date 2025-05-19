import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
   name: "auth",
   initialState: {
    user: localStorage.getItem("userInfo") ?
    JSON.parse(localStorage.getItem("userInfo")) : null,
    accountId: null
   },
   reducers: {
      login(state,action) {
        state.user = action.payload;
        state.accountId = action.payload.accountId;
      },
      logout(state) {
         state.user = null;
         state.accountId = null;
      },
      setNom(state, action) {
         state.user.nom = action.payload;
      }
   },
   
});

const authReducer = authSlice.reducer;
const authActions = authSlice.actions;

export { authActions, authReducer }
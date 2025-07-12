import { createSlice } from "@reduxjs/toolkit";

const getInitialUserData = () => {
    const stored = sessionStorage.getItem('userData');
    if (stored) {
        try {
            return { userData: JSON.parse(stored), isAuthenticated: true };
        } catch {
            return { userData: null, isAuthenticated: false };
        }
    }
    return { userData: null, isAuthenticated: false };
};

const userSlice = createSlice({
    name: "user",
    initialState: getInitialUserData(),
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.isAuthenticated = true;
            sessionStorage.setItem('userData', JSON.stringify(action.payload));
        },
        removeUserData: (state, action) => {
            state.userData = null;
            state.isAuthenticated = false;
            sessionStorage.removeItem('userData');
        },
    },
});

export const { setUserData, removeUserData } = userSlice.actions;
export const selectUserData = (state) => state.user.userData;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;
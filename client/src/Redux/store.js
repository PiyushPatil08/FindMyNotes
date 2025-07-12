import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/user-slice";
import notificationsReducer from './slices/notifications-slice';

const rootReducer = combineReducers({
    user: userReducer,
    notifications: notificationsReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});
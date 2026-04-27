import { combineReducers, configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import menuReducer from './menuSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
    cart: cartReducer,
    menu: menuReducer,
    user: userReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

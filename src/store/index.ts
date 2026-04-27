import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { persistReducer, persistStore } from 'redux-persist';
import cartReducer from './cartSlice';
import menuReducer from './menuSlice';
import userReducer from './userSlice';

const storage = Platform.OS === 'web' 
    ? require('redux-persist/lib/storage').default 
    : AsyncStorage;

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user'], // only persist user state (config, login)
};

const rootReducer = combineReducers({
    cart: cartReducer,
    menu: menuReducer,
    user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

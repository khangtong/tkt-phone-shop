import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import productReducer from './product/productSlice';
import categoryReducer from './category/categorySlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import variationReducer from './variation/variationSlice';
import discountReducer from './discount/discountSlice';

const rootReducer = combineReducers({
	user: userReducer,
	product: productReducer,
	variation: variationReducer,
	category: categoryReducer,
	discount: discountReducer,
});

const persistConfig = {
	key: 'root',
	storage,
	version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export const persistor = persistStore(store);

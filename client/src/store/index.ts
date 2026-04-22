import { configureStore } from "@reduxjs/toolkit";
import { otpAuthApi } from "@/lib/otpAuthApi";

export const store = configureStore({
  reducer: {
    [otpAuthApi.reducerPath]: otpAuthApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(otpAuthApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

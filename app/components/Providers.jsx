'use client'

import { SessionProvider } from "next-auth/react";
import { AppContextProvider } from "../context/AppContext";
import { CustomSessionProvider } from "./CustomSessionProvider";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CustomSessionProvider>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </CustomSessionProvider>
    </SessionProvider>
  );
}

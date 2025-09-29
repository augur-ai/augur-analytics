/**
 * React Context for Augur Analytics
 */

import React, { createContext, useContext, ReactNode } from "react";
import { AugurAnalytics, AugurConfig } from "@augur/analytics-core";

interface AugurContextType {
  analytics: AugurAnalytics | null;
  isInitialized: boolean;
}

const AugurContext = createContext<AugurContextType>({
  analytics: null,
  isInitialized: false,
});

interface AugurProviderProps {
  children: ReactNode;
  config: AugurConfig;
}

export function AugurProvider({ children, config }: AugurProviderProps) {
  const [analytics] = React.useState(() => {
    if (typeof window === "undefined") {
      return null; // SSR support
    }

    const { createAnalytics } = require("@augur/analytics-core");
    return createAnalytics(config);
  });

  const isInitialized = analytics !== null;

  return (
    <AugurContext.Provider value={{ analytics, isInitialized }}>
      {children}
    </AugurContext.Provider>
  );
}

export function useAugurContext() {
  const context = useContext(AugurContext);

  if (!context.isInitialized) {
    throw new Error("useAugur must be used within an AugurProvider");
  }

  return context;
}

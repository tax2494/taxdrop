"use client";
import { createContext, useContext, useState } from "react";

type Totals = Record<string, number>;

const TotalsContext = createContext<{
  totals: Totals;
  setTotals: (t: Totals) => void;
}>({ totals: {}, setTotals: () => {} });

export const TotalsProvider = ({ children, initial }: { children: React.ReactNode; initial: Totals }) => {
  const [totals, setTotals] = useState<Totals>(initial);
  return <TotalsContext.Provider value={{ totals, setTotals }}>{children}</TotalsContext.Provider>;
};

export const useTotals = () => useContext(TotalsContext);
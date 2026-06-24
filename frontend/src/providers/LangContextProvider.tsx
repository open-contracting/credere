import React from "react";

import { getLang, saveLang } from "../api/localstore";
import { DISPATCH_ACTIONS } from "../constants";

type LangState = {
  selected: string;
};

type ActionSetLang = {
  type: string;
  payload: string;
};

type Dispatch = (action: ActionSetLang) => void;

const initialState: LangState = {
  selected: `${getLang() || import.meta.env.VITE_DEFAULT_LANG || "es"}`,
};

type LangContextProviderProps = { children: React.ReactNode };

export const LangContext = React.createContext<{ state: LangState; dispatch: Dispatch } | undefined>(undefined);

const langReducer = (state: LangState, action: ActionSetLang) => {
  switch (action.type) {
    case DISPATCH_ACTIONS.SET_LANG: {
      saveLang(action.payload);
      return {
        ...state,
        selected: action.payload,
      };
    }
    default: {
      throw new Error("Unhandled action type");
    }
  }
};

function LangContextProvider({ children }: LangContextProviderProps) {
  const [state, dispatch] = React.useReducer(langReducer, initialState);

  const value = React.useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export default LangContextProvider;

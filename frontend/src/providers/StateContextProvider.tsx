import React from "react";

import { getUser, saveUser } from "../api/localstore";
import { DISPATCH_ACTIONS } from "../constants";
import type { IUser } from "../schemas/auth";

type AuthState = {
  user: IUser | null;
};

type ActionSetAuth = {
  type: string;
  payload: IUser | null;
};

type Dispatch = (action: ActionSetAuth) => void;

const initialState: AuthState = {
  user: getUser(),
};

type StateContextProviderProps = { children: React.ReactNode };

export const StateContext = React.createContext<{ state: AuthState; dispatch: Dispatch } | undefined>(undefined);

const authReducer = (state: AuthState, action: ActionSetAuth) => {
  switch (action.type) {
    case DISPATCH_ACTIONS.SET_USER: {
      saveUser(action.payload);
      return {
        ...state,
        user: action.payload,
      };
    }
    default: {
      throw new Error("Unhandled action type");
    }
  }
};

function StateContextProvider({ children }: StateContextProviderProps) {
  const [state, dispatch] = React.useReducer(authReducer, initialState);

  const value = React.useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export default StateContextProvider;

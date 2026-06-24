import React from "react";

import { DISPATCH_ACTIONS } from "../constants";
import type { IApplicationResponse } from "../schemas/application";

type ApplicationState = {
  data: IApplicationResponse | null;
};

type Action = {
  type: string;
  payload: IApplicationResponse | null;
};

type Dispatch = (action: Action) => void;

const initialState: ApplicationState = {
  data: null,
};

type ApplicationContextProviderProps = { children: React.ReactNode };

export const ApplicationContext = React.createContext<{ state: ApplicationState; dispatch: Dispatch } | undefined>(
  undefined,
);

const applicationReducer = (state: ApplicationState, action: Action) => {
  switch (action.type) {
    case DISPATCH_ACTIONS.SET_APPLICATION: {
      return {
        ...state,
        data: action.payload,
      };
    }
    default: {
      throw new Error("Unhandled action type");
    }
  }
};

function ApplicationContextProvider({ children }: ApplicationContextProviderProps) {
  const [state, dispatch] = React.useReducer(applicationReducer, initialState);

  const value = React.useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export default ApplicationContextProvider;

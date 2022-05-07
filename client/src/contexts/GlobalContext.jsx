import React from 'react';
import PropTypes from 'prop-types';

const defaultState = {
  dialog: {
    show: false,
    message: '',
    title: '',
    dialogType: 'ALERT',
    onClose: () => { }
  },
  installer: {
    isInstaller: (new URLSearchParams(window.location.search)).get("type") === "INSTALLER",
    mapName: (new URLSearchParams(window.location.search)).get("mapName")
  }
}

const GlobalReducer = (
  state,
  action
) => {
  const { type, ...payload } = action;

  switch (type) {
    case 'SHOW_DIALOG':
      return {
        ...state,
        dialog: {
          show: true,
          message: payload.message ? payload.message : defaultState.message,
          title: payload.title ? payload.title : defaultState.title,
          dialogType: payload.dialogType ? payload.dialogType : defaultState.dialogType,
          onClose: payload.onClose ? payload.onClose : defaultState.onClose
        },
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialog: defaultState.dialog
      };
    default:
      return state;
  }
};

const context = React.createContext({});

function GlobalContext({ children }) {
  const [state, dispatch] = React.useReducer(GlobalReducer, defaultState);

  return (
    <context.Provider value={{ state, dispatch }}>{children}</context.Provider>
  );
}

GlobalContext.propTypes = {
  children: PropTypes.node.isRequired,
};

export default context;
export const Provider = GlobalContext;
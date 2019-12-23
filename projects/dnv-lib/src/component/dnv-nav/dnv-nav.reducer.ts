import { DnvButton, DnvNavState, initialDnvNavState } from './dnv-nav.state';
import { DnvNavAction, dnvNavActionType } from './dnv-nav.actions';

function toggleButton(buttons: DnvButton[], button: DnvButton) {
  const index = buttons.findIndex((b) => b.name === button.name);
    return [...buttons.slice(0, index),
      Object.assign({}, buttons[index], { isActive: !button.isActive }),
        ...buttons.slice(index + 1)];
}

export function dnvNavReducer(
  state: DnvNavState = initialDnvNavState,
  action: DnvNavAction): DnvNavState {
  switch (action.type) {
    case dnvNavActionType.LOAD_BUTTONS: {
      return Object.assign({}, state, { buttonsUrl: action.payload });
    }

    case dnvNavActionType.LOAD_BUTTONS_SUCCESS: {
      return Object.assign({}, state, {
        dnvButtons: action.payload
      });
    }

    case dnvNavActionType.BUTTON_PRESSED: {
      return Object.assign({}, state, { dnvButtons: toggleButton(state.dnvButtons, action.payload as DnvButton) });
    }

    case dnvNavActionType.BUTTON_RELEASED: {
      return Object.assign({}, state, { dnvButtons: toggleButton(state.dnvButtons, action.payload as DnvButton) });
    }

    case dnvNavActionType.TOGGLE_MORE_PANEL: {
      return Object.assign({}, state, { morePanelOpen: !state.morePanelOpen });
    }

    default:
      return state;
  }
}

import { ActionReducer } from '@ngrx/store';
import { PropertiesState, initialPropertiesState } from './properties.state';
import { PropertiesActionType, SetProperties } from './properties.action';

export function propertiesReducer(state: PropertiesState = initialPropertiesState, action: SetProperties): PropertiesState {
        switch (action.type) {
            case PropertiesActionType.PARCEL_PROPERTIES:
                return action.payload;

            default:
                return state;
        }
    }

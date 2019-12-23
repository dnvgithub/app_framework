export interface ParcelProperties {
    properties: Array<[string, string]>;
}

export type PropertiesState = ParcelProperties | null;

export const initialPropertiesState: PropertiesState = null;

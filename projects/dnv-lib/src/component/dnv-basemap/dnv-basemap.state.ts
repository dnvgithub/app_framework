import { DnvBasemap } from '../dnv-map/dnv-map.state';

export interface BaseMapState {
    basemap: DnvBasemap[];
    showBasemaps: boolean;
}

export const initialBaseMapState: BaseMapState = {
    basemap: [],
    showBasemaps: false
};

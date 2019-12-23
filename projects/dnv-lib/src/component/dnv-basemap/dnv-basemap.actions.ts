import { Action } from '@ngrx/store';
import { DnvBasemap } from '../dnv-map/dnv-map.state';

export const DnvBaseMapActionType = {
    LoadBaseMaps: '[Map] LoadBaseMaps',
    SetBaseMaps: '[Map] SetBaseMaps',
    SetBaseMapSelected: '[Map] SetBaseMapSelected',
    ToggleBasemaps: '[Map] ToggleBasemaps',
    CloseBasemaps: '[Map] CloseBasemaps'
};

export class LoadBaseMaps implements Action {
    type = DnvBaseMapActionType.LoadBaseMaps;
    constructor(public payload: string) { }
}

export class SetBaseMaps implements Action {
    type = DnvBaseMapActionType.SetBaseMaps;
    constructor(public payload: DnvBasemap[]) { }
}

export class SetBaseMapSelected implements Action {
    type = DnvBaseMapActionType.SetBaseMapSelected;
    constructor(public payload: any) { }
}

export class ToggleBasemaps implements Action {
    type = DnvBaseMapActionType.ToggleBasemaps;
    constructor(public payload: any = null) { }
}

export class CloseBasemaps implements Action {
    type = DnvBaseMapActionType.CloseBasemaps;
    constructor(public payload: any = null) { }
}

export type DnvBaseMapAction =
    LoadBaseMaps |
    SetBaseMaps |
    SetBaseMapSelected |
    ToggleBasemaps |
    CloseBasemaps;

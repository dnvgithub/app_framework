export interface DnvButton {
  name: string;
  fontAwesome: string;
  description?: string;
  needActiveState?: boolean;
  isActive: boolean;
}

export class DnvNavState {
  dnvButtons: DnvButton[];
  buttonsUrl: string;
  moreCutoff: number;
  moreButtonLabel: string;
  morePanelOpen: boolean;
  panelAutoClose: boolean;
}

export const initialDnvNavState: DnvNavState = {
  dnvButtons: [],
  buttonsUrl: '',
  moreCutoff: 4, // Don't show more than moreCutoff buttons (including the 'More' button) on small screens
  moreButtonLabel: 'More',
  morePanelOpen: false,
  panelAutoClose: true
};

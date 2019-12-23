import { Observable } from 'rxjs';

export interface DnvSearchState {
  searchItemsUrl: string;
  searchItems: SearchItem[];
  dataSource?: Observable<SearchItem[]>;
  selected: SearchItem;
  iconsUrl: string;
  icons?: SearchTypeInfo[];
  currentSearchUrl?: string;
}

export enum SearchItemType {
  Unknown,
  Address,
  StreetName,
  Park
}

export const initialSearchItem: SearchItem = {
  id: 0,
  name: '',
  type: SearchItemType.Unknown
};

export const initialSearchState: DnvSearchState = {
  searchItemsUrl: '',
  iconsUrl: '',
  searchItems: [],
  selected: initialSearchItem,
  icons: [
    {
      'id': 0,
      'searchItemType': 'Unknown',
      'fontAwesome': 'far fa-question-circle'
    },
    {
      'id': 1,
      'searchItemType': 'Address',
      'fontAwesome': 'far fa-map-marker-alt'
    },
    {
      'id': 2,
      'searchItemType': 'StreetName',
      'fontAwesome': 'far fa-map-signs'
    },
    {
      'id': 3,
      'searchItemType': 'Park',
      'fontAwesome': 'far fa-tree-alt'
    }
  ]
};

export interface SearchItem {
  id: number;
  name: string;
  type: SearchItemType;
  assetId?: string;
}

export interface Asset {
  asset_Id: string;
}

export interface SearchTypeInfo {
  id: number;
  searchItemType: string;
  fontAwesome: string;
}

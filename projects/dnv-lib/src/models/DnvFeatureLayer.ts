// The map shows DnvFeatureLayer added to mapState.featureLayers[]
export interface DnvFeatureLayer {
  url: string;
  opacity: number;
  type: string;
  propertyLabel?: string;
  fieldFilters?: DnvFieldFilter[];
  whereClause?: string;
  allow_inspections: boolean;
  gisLayerNum: string;
  fullLayerUrl: string;
  writeUrl: string;
  layer_Version_Id: string;
  hasAttachments: boolean;
}

// WHERE name IN (filter)
export interface DnvFieldFilter {
  name: string;
  filter: string | string[]; // DnvCodedValue.code
}

export interface DnvFieldMeta {
  name: string;
  alias: string; // The user friendly name to display
  type: string; // See sample list above
  canFilter: boolean; // Show a control in the filter pane for this field
  selectMultiple: boolean; // Can the user select multiple values from the domain
  domain: DnvCodedValue[];
}

export interface DnvCodedValue {
  code: string; // "DNV"
  name: string; // "DISTRICT OF NORTH VANCOUVER"
}


export function whereList(fieldFilter: DnvFieldFilter): string {
  const filters = [].concat(fieldFilter.filter);
  let inClause = '';
  for (let index = 0; index < filters.length; index++) {
    if (index > 0) {
      inClause += ', ';
    }
    inClause += '\'' + filters[index] + '\'';
  }
  return inClause;
}


const likeRegex: RegExp = new RegExp('%.*%');
export function toWhereClause(fieldFilters: DnvFieldFilter[]): string {
  if (fieldFilters && (fieldFilters.length > 0)) {
    let whereClause = '';
    for (let index = 0; index < fieldFilters.length; index++) {
      if (index > 0) {
        whereClause += ' AND ';
      }

      const likeFilter = isLikeFilter(fieldFilters[index].filter);
      if (likeFilter) {
        whereClause += fieldFilters[index].name + ' LIKE ' + '\'' + likeFilter + '\'';
      } else {
        whereClause += fieldFilters[index].name + ' IN (' +
          whereList(fieldFilters[index]) +
          ')';
      }
    }

    return whereClause;
  } else {
    return '1=1';
  }
}

export function isLikeFilter(fieldFilter: string | string[]): string {
  const filters = [].concat(fieldFilter);
  if (filters.length === 1 && likeRegex.test(filters[0])) {
    return filters[0];
  }
  return null;
}

export function stripLikeFilterBrackets(filter: string): string {
  return filter.substring(1, filter.length - 1);
}

import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Layer, LayerState, FeatureFilterUpdate } from '../dnv-layer/dnv-layer.state';
import { DnvFieldMeta, DnvFieldFilter, toWhereClause, isLikeFilter, stripLikeFilterBrackets } from '../../models/DnvFeatureLayer';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-layer-filter',
  templateUrl: './dnv-layer-filter.component.html',
  styleUrls: ['./dnv-layer-filter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvLayerFilterComponent implements OnInit {

  public _layer: Layer = null;
  public _fields: DnvFieldMeta[];
  public _items: { [id: string]: any } = {};
  public _id = null;
  public _models: { [id: string]: any } = {};

  // dnv-layer-filter state management is based on dnv-layer
  @Input('layerState') set layerState(value: LayerState) {

    const layers: Layer[] = value.layers
      .filter(layer => layer.canFilter && layer.showFilterPanel);

    if (layers.length > 0) {
      const layer = layers[0];
      this._id = layer.id;
      this._layer = layer;
      this._fields = this.fields();
      this._fields.forEach((field: DnvFieldMeta) => {
        if (field.domain.length > 0) {
          this._items[field.name] = field.domain;
        } else {
          const fieldFilters: DnvFieldFilter[] = layer.fieldFilters
            .filter(ff => ff.name === field.name);

          let likeFilter: string = null;
          if (fieldFilters.length === 1) {
            likeFilter = isLikeFilter(fieldFilters[0].filter);
          }

          if (likeFilter) {
            const filterValue = stripLikeFilterBrackets(likeFilter);
            this._items[field.name] = [{ code: filterValue, name: filterValue }];
          } else {
            this._items[field.name] = [];
          }
        }
      });

      this._models = this.fromFieldFilterToModel();
    }
  }
  @Input() headerHeight = 150;
  @Input() link = '';

  // tslint:disable-next-line:no-output-on-prefix
  @Output() updateFilter = new EventEmitter<FeatureFilterUpdate>();
  @Output() zoomToFeatures = new EventEmitter<FeatureFilterUpdate>();
  @Output() exportFeatures = new EventEmitter<FeatureFilterUpdate>();

  constructor() { }

  ngOnInit() { }

  onClearFilter() {
    this._fields.forEach((field: DnvFieldMeta) => {
      if (this._models[field.name]) {
        if (field.selectMultiple) {
          this._models[field.name] = [];
        } else {
          this._models[field.name] = null;
        }
      }
    });

    this.onUpdateFilter();
  }

  onZoomToFeatures() {
    this.zoomToFeatures.emit({
      id: this._id,
      newFilters: null,
      whereClause: this._layer.whereClause,
      layer: this._layer
    });
  }

  downloadFeatures() {
    this.exportFeatures.emit({
      id: this._id,
      newFilters: null,
      whereClause: this._layer.whereClause,
      layer: this._layer
    });
  }

  onUpdateFilter() {
    const fieldFilters: DnvFieldFilter[] = this.fromModelToFieldFilter();
    const whereClause: string = toWhereClause(fieldFilters);
    this.updateFilter.emit({
      id: this._id,
      newFilters: fieldFilters,
      whereClause: whereClause,
      layer: this._layer
    });
  }

  onChange(_) {
    this.onUpdateFilter();
  }

  // This allows users to dynamically type in filter values for fields where the domain is null
  onSearch(fieldName: string, $event: any) {
    if (this._items && this._items[fieldName] && this._items[fieldName].length <= 1) {
      this._items[fieldName] = [{ code: $event.term, name: $event.term }];
    }
    return;
  }

  onFocus(event) {
    event.preventDefault();
    event.stopPropagation();
    window.scrollTo(0, 0);
  }

  private fields(): DnvFieldMeta[] {
    if (this._layer && this._layer.meta) {
      return this._layer.meta
        .sort((lhs: DnvFieldMeta, rhs: DnvFieldMeta) => lhs.name.localeCompare(rhs.name));
    }

    return [];
  }

  featureCount(): string {
    if (this._layer) {
      if (this._layer.loadingFilterCount) {
        return 'Loading Feature Count...';
      } else {
        if (this._layer.featureCount >= 0) {
          return 'Matching Feature Count: ' + this._layer.featureCount.toString();
        }
      }
    }
    return '';
  }


  // Utility functions
  // Convert to and from a Layer's array of DnvFieldFilter and a dictionary compatible with the ng-select model
  fromFieldFilterToModel(): { [id: string]: any } {
    const newFilter: { [id: string]: any } = {};

    if (this._layer.fieldFilters && (this._layer.fieldFilters.length > 0)) {
      this._layer.fieldFilters.forEach((fieldFilter: DnvFieldFilter) => {
        const likeFilter = isLikeFilter(fieldFilter.filter);
        if (likeFilter) {
          newFilter[fieldFilter.name] = stripLikeFilterBrackets(likeFilter);
        } else {
          newFilter[fieldFilter.name] = fieldFilter.filter;
        }
      });
    }

    return newFilter;
  }

  fromModelToFieldFilter(): DnvFieldFilter[] {
    const fieldFilters: DnvFieldFilter[] = [];

    if (this._models && (Object.keys(this._models).length > 0)) {
      for (const key in this._models) {
        if (this._models.hasOwnProperty(key) && this._models[key] && ([].concat(this._models[key]).length > 0)) {
          let filter = this._models[key];

          // If the domain of the field doesn't contain 2 or more values to choose from, it's most likely a free text input
          if (this._items[key].length <= 1) {
            filter = '%' + filter + '%';
          }

          fieldFilters.push({
            name: key,
            filter: filter
          });
        }
      }
    }
    return fieldFilters;
  }

  getLayerName(): string {
    return this._layer ? this._layer.name : '';
  }
}

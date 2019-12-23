import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy, ElementRef
} from '@angular/core';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, switchMap, debounceTime } from 'rxjs/operators';

import { DnvSearchState, SearchItem, SearchItemType, initialSearchItem } from './dnv-search.state';
import { DnvSearchService } from './dnv-search.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-search',
  templateUrl: './dnv-search.component.html',
  styleUrls: ['./dnv-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvSearchComponent implements OnInit {
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSearchClick = new EventEmitter<SearchItem>();

  @Input() dnvSearchState: DnvSearchState;

  private readonly defaultIcon = 'far fa-question-circle'; // TODO move out

  private selected: SearchItem = initialSearchItem;
  private searchItems: SearchItem[] = [];
  public search: (text$: Observable<string>) => Observable<SearchItem[]>;

    onSelectItem(event: NgbTypeaheadSelectItemEvent) {
      this.selected = event.item;
      this.onSearchClick.emit(this.selected);
    }

    onKeyUp() {
      this.onSearchClick.emit(this.selected);
    }

  constructor(private dnvSearchService: DnvSearchService) {}

  ngOnInit() {

    this.search = (text$: Observable<string>): Observable<SearchItem[]> => {
      return text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((name: string) => {
          let result = of(this.searchItems);
          if (this.dnvSearchState.searchItemsUrl) {
            const currentSearchUrl = this.dnvSearchState.searchItemsUrl + '/' + name;
            result = this.getSearchResultsAsObservable(name, currentSearchUrl);
            result.subscribe(data => this.searchItems = data);
          }
          return result;
        })
      );
    };
  }

  getSearchResultsAsObservable(
    token: string,
    currentSearchUrl: string
  ): Observable<SearchItem[]> {
    let result = of(this.searchItems);

    if (currentSearchUrl) {
      result = this.dnvSearchService.getSearchItems(currentSearchUrl);
    } else if (this.searchItems.length > 0) {
      const query = new RegExp(token, 'i');
      result = of(
        this.searchItems.filter((searchItem: SearchItem) => {
          return query.test(searchItem.name);
        })
      );
    }

    return result;
  }

  // Format the autosuggested item into a string for the input control
  formatter = (x: {name: string}) => x.name;

  getClass(type: number): string {
    let result = this.defaultIcon;
    if (this.dnvSearchState.icons) {
      const icon = this.dnvSearchState.icons.find(x => x.id === type);
      if (icon) {
        result = icon.fontAwesome;
      }
    }
    return result;
  }

  onClearClicked(searchInput: any) {
    searchInput.value = '';
    this.selected = initialSearchItem;
    this.searchItems = [];
    this.onSearchClick.emit(null);
  }
}

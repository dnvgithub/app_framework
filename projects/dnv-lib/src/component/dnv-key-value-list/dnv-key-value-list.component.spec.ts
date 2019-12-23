import { TestBed, async } from '@angular/core/testing';

import { DnvKeyValueListComponent, DnvKeyValuePairComponent } from './dnv-key-value-list.component';

describe('DnvKeyValueListComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DnvKeyValueListComponent,
        DnvKeyValuePairComponent
      ],
    }).compileComponents();
  }));

  it('should create the DnvKeyValueListComponent', async(() => {
    const fixture = TestBed.createComponent(DnvKeyValueListComponent);
    const comp = fixture.componentInstance;

    const kvpairs: Array<[string, string]> = [['k1', 'v1'], ['k2', 'v2']];
    comp.kvpairs = kvpairs;
    fixture.detectChanges();
    expect(comp).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('k1');
  }));

});

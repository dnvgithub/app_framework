"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
var dnv_key_value_list_component_1 = require("./dnv-key-value-list.component");
describe('DnvKeyValueListComponent', function () {
    beforeEach(testing_1.async(function () {
        testing_1.TestBed.configureTestingModule({
            declarations: [
                dnv_key_value_list_component_1.DnvKeyValueListComponent,
                dnv_key_value_list_component_1.DnvKeyValuePairComponent
            ],
        }).compileComponents();
    }));
    it('should create the DnvKeyValueListComponent', testing_1.async(function () {
        var fixture = testing_1.TestBed.createComponent(dnv_key_value_list_component_1.DnvKeyValueListComponent);
        var comp = fixture.componentInstance;
        var kvpairs = [['k1', 'v1'], ['k2', 'v2']];
        comp.kvpairs = kvpairs;
        fixture.detectChanges();
        expect(comp).toBeTruthy();
        expect(fixture.nativeElement.textContent).toContain('k1');
    }));
});
//# sourceMappingURL=dnv-key-value-list.component.spec.js.map
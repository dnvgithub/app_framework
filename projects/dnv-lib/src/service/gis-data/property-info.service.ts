export class Geometry {
    coordinates: number[][][][];
    type: string;
}

export class Address {
    FullAddress: string;
    House: number;
    Street: string;
    Unit?: string;
}

export class Assessment {
    BuildingValue: number;
    LandValue: number;
    TaxConsolidation: boolean;
    TotalValue: number;
}

export class SolarDetails {
    DailyAverageOptimal: number;
    DailyAverageRoof: number;
    SouthPercentage: number;
    StarRating: number;
}

export class Building {
    HeritageRegistry: boolean;
    HeritageStatus?: string;
    Name: string;
    SolarDetails: SolarDetails;
    Subtype: string;
    Type: string;
    YearBuilt: number;
}

export class LegalPlan {
    FileName: string;
    PlanNumber: string;
    Type: string;
}

export class Drawing {
    DrawingNumber: string;
    DrawingType: string;
    DrawingYear: string;
    FileName: string;
}

export class Documents {
    LegalPlans: LegalPlan[];
    SanitaryDrawings: Drawing[];
    StormDrawings: Drawing[];
    WaterDrawings: Drawing[];
}

export class Geography {
    Area: number;
    Elevation: number;
    Latitude: number;
    Longitude: number;
    StreetViewAngle: number;
    StreetViewLat: number;
    StreetViewLong: number;
}

export class Identification {
    DBLink: string;
    Folio: string;
    LTOPID: string;
    LegalDescription: string;
}

export class Ownership {
    IsLeased: boolean;
    OwnershipType: string;
    PropertyType: string;
}

export class DPA {
    Name: string;
    Subtype: string;
}

export class HazardReport {
    Author: string;
    Date: string;
    FileName: string;
    HazardType: string;
    Name: string;
}

export class Zoning {
    ZoneClass: string;
    Zoning: string;
}

export class SpatialRelations {
    DPAs: DPA[];
    ElectoralRiding: string;
    ElementarySchool: string;
    Firehall: string;
    GarbageDays: string[];
    HazardReports: HazardReport[];
    Hospital: string;
    Hydrant: number;
    Library: string;
    Neighbourhood: string;
    PoliceStation: string;
    RecreationCentre: string;
    SecondarySchool: string;
    Zonings: Zoning[];
}

export class Details {
    Assessment: Assessment;
    Building?: Building;
    Documents: Documents;
    Geography: Geography;
    Identification: Identification;
    Ownership: Ownership;
    SpatialRelations: SpatialRelations;
}

export class Property {
    Addresses: Address[];
    DBLink: string;
    Details?: Details;
    LTOPID: string;
}

export class PropertyInfo {
    Geometries?: Geometry[];
    Properties: Property[];
    PropertyCount: number;
}

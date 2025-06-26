export interface Pais {
  id: string;
  name: string;
  iso3: string;
  iso2: string;
}

export interface Region {
  id: string;
  name: string;
  stateCode: string;
  idCountry: string;
  country?: Pais;
}

export interface Provincia {
  id: string;
  name: string;
  idState: string;
  state?: Region;
}

export interface Ciudad {
  id: string;
  name: string;
  idProvince: string;
  province?: Provincia;
}

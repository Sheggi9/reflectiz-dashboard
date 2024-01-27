export interface GeoDot {
  lat: string,
  lon: string,
  userCount: number,
  name: string,
  originalCityName: string
}

export interface GeoRequestDto {
  counter: number,
  city: string,
  query: string
}

export interface GeoResponseDto {
  userCount: number,
  "place_id": number,
  "licence": string,
  "osm_type": string,
  "osm_id": number,
  "lat": string,
  "lon": string,
  "class": string,
  "type": string,
  "place_rank": number,
  "importance": number,
  "addresstype": string,
  "name": string,
  "display_name": string,
  "boundingbox": string[],
  "originalQuery": string
}

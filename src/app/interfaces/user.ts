import {UserGender} from "@types";

export interface User {
  "birthday": string,
  "email": string,
  "firstName": string,
  "lastName": string,
  "gender": UserGender,
  "address": string,
  "city": string,
  "country": string,
  "amountSeats": number,
  "engine": 'fuel' | 'electric',
  "color": string,
  "hobby": string[]
}

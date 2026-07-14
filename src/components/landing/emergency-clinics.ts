// Real 24/7 emergency vet clinics — a curated copy of the seed rows in the
// `emergency_contacts` table, extended with approximate lat/lng so they can be
// plotted on the landing-page map. The per-user, state-filtered locator inside
// the app reads the live table; this static list powers the public marketing
// map only. Phone/address are exact; coordinates are suburb-accurate.
export type EmergencyClinic = {
  name: string;
  state: string; // "ALL" = national hotline (no physical marker)
  phone: string;
  address: string;
  lat: number | null;
  lng: number | null;
};

export const EMERGENCY_CLINICS: EmergencyClinic[] = [
  {
    name: "Animal Emergency Australia",
    state: "ALL",
    phone: "1300 226 226",
    address: "National 24/7 hotline",
    lat: null,
    lng: null,
  },
  {
    name: "SASH Small Animal Specialist Hospital",
    state: "NSW",
    phone: "(02) 9197 4444",
    address: "North Ryde NSW 2113",
    lat: -33.7975,
    lng: 151.1223,
  },
  {
    name: "Animal Referral Hospital",
    state: "NSW",
    phone: "(02) 9190 9999",
    address: "Homebush NSW 2140",
    lat: -33.8677,
    lng: 151.0865,
  },
  {
    name: "Veterinary Emergency Group",
    state: "VIC",
    phone: "(03) 9417 6488",
    address: "Clifton Hill VIC 3068",
    lat: -37.792,
    lng: 144.989,
  },
  {
    name: "U. of Melbourne Vet Hospital",
    state: "VIC",
    phone: "(03) 9731 2000",
    address: "Werribee VIC 3030",
    lat: -37.899,
    lng: 144.698,
  },
  {
    name: "Animal Emergency Service",
    state: "QLD",
    phone: "(07) 3423 1888",
    address: "Stafford QLD 4053",
    lat: -27.4076,
    lng: 153.0175,
  },
  {
    name: "Perth Animal Hospital",
    state: "WA",
    phone: "(08) 9204 0400",
    address: "Osborne Park WA 6017",
    lat: -31.901,
    lng: 115.814,
  },
  {
    name: "Adelaide Animal Emergency Centre",
    state: "SA",
    phone: "(08) 8336 6111",
    address: "Felixstow SA 5070",
    lat: -34.893,
    lng: 138.641,
  },
];

export interface FraudCase {
  id: string;
  date: string;
  flightNumber: string;
  destination: string;
  passengerCount: number;
  passport: {
    type: string;
    country: string;
    nature: string;
    fraudType: string;
  };
  visa: {
    type: string;
    country: string;
    nature: string;
    fraudType: string;
  };
  nationality: string;
  origin: string;
  sex: 'M' | 'F';
  isMinor: boolean;
  observations: string;
}

export const fraudCases: FraudCase[] = [
  {
    id: "1",
    date: "2025-04-01",
    flightNumber: "HC331",
    destination: "CASABLANCA",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "VC", country: "Serbe", nature: "TIERS", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "TERANGA SA",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "2",
    date: "2025-04-04",
    flightNumber: "AF719",
    destination: "PARIS",
    passengerCount: 2,
    passport: { type: "P.O", country: "Guinéen", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Grec", nature: "UE", fraudType: "Obtention Indue" },
    nationality: "Guinéenne",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "3",
    date: "2025-04-06",
    flightNumber: "AT502",
    destination: "CASABLANCA",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Français", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "SEN-SICAS",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "4",
    date: "2025-04-07",
    flightNumber: "AH5011",
    destination: "ALGER",
    passengerCount: 2,
    passport: { type: "P.O", country: "Gambien", nature: "CEDEAO", fraudType: "Usurpation" },
    visa: { type: "T.S", country: "Italien", nature: "UE", fraudType: "Usurpation" },
    nationality: "Gambienne",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "5",
    date: "2025-04-08",
    flightNumber: "VY7889",
    destination: "BARCELONE",
    passengerCount: 1,
    passport: { type: "", country: "", nature: "", fraudType: "" },
    visa: { type: "T.S", country: "Belge", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Guinéenne",
    origin: "AMARENTE",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "6",
    date: "2025-04-10",
    flightNumber: "TK502",
    destination: "ISTANBUL",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "Contrefaçon" },
    visa: { type: "", country: "", nature: "", fraudType: "" },
    nationality: "Sénégalaise",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "7",
    date: "2025-04-10",
    flightNumber: "TU0343",
    destination: "TUNIS",
    passengerCount: 1,
    passport: { type: "P.D", country: "Congolais RDC", nature: "CEDEAO", fraudType: "Contrefaçon" },
    visa: { type: "", country: "", nature: "", fraudType: "" },
    nationality: "Congolaise RDC",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "8",
    date: "2025-04-11",
    flightNumber: "AZ285",
    destination: "ROME",
    passengerCount: 1,
    passport: { type: "", country: "", nature: "", fraudType: "" },
    visa: { type: "T.S", country: "Grec", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Guinéenne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "9",
    date: "2025-04-11",
    flightNumber: "IB09222",
    destination: "MADRID",
    passengerCount: 2,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "Usurpation" },
    visa: { type: "T.S", country: "Français", nature: "UE", fraudType: "Usurpation" },
    nationality: "Guinéenne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "10",
    date: "2025-04-13",
    flightNumber: "IB09222",
    destination: "MADRID",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "D.C.E.M", country: "Français", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "11",
    date: "2025-05-14",
    flightNumber: "HC403",
    destination: "PARIS",
    passengerCount: 1,
    passport: { type: "P.O", country: "Guinéen", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Belge", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Guinéenne",
    origin: "TSA",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "12",
    date: "2025-05-15",
    flightNumber: "TO8027",
    destination: "MARSEILLE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Comorien", nature: "TIERS", fraudType: "" },
    visa: { type: "T.S", country: "Français", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Comorienne",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "13",
    date: "2025-04-16",
    flightNumber: "IB0922",
    destination: "MADRID",
    passengerCount: 1,
    passport: { type: "P.O", country: "Ivoirien", nature: "CEDEAO", fraudType: "" },
    visa: { type: "D.C.E.M", country: "Français", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Ivoirienne",
    origin: "AMARENTE",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "14",
    date: "2025-04-22",
    flightNumber: "TP1484",
    destination: "LISBONNE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Gambien", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Espagnol", nature: "UE", fraudType: "Usurpation" },
    nationality: "Gambienne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "15",
    date: "2025-05-02",
    flightNumber: "AZ885",
    destination: "ROME",
    passengerCount: 1,
    passport: { type: "P.O", country: "Guinéen", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Italien", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Guinéenne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "16",
    date: "2025-05-03",
    flightNumber: "TP1484",
    destination: "LISBONNE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "V.C", country: "Sénégalais", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "AMARENTE",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "17",
    date: "2025-05-06",
    flightNumber: "TO8027",
    destination: "MARSEILLE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Français", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "18",
    date: "2025-05-06",
    flightNumber: "TP1484",
    destination: "LISBONNE",
    passengerCount: 2,
    passport: { type: "P.O", country: "Ghanéen", nature: "CEDEAO", fraudType: "Contrefaçon" },
    visa: { type: "T.S", country: "Français", nature: "UE", fraudType: "Usurpation" },
    nationality: "Guinéenne",
    origin: "AMARENTE",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "19",
    date: "2025-05-07",
    flightNumber: "TK502",
    destination: "ISTANBUL",
    passengerCount: 1,
    passport: { type: "P.O", country: "Guinéen", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Polonais", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Guinéenne",
    origin: "SEN-SICAS",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "20",
    date: "2025-05-08",
    flightNumber: "TK502",
    destination: "ISTANBUL",
    passengerCount: 1,
    passport: { type: "P.O", country: "Guinéen", nature: "CEDEAO", fraudType: "" },
    visa: { type: "V.C", country: "Italien", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Guinéenne",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "21",
    date: "2025-05-08",
    flightNumber: "TK502",
    destination: "ISTANBUL",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "V.C", country: "Italien", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "22",
    date: "2025-05-09",
    flightNumber: "IB0922",
    destination: "MADRID",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Français", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "23",
    date: "2025-05-10",
    flightNumber: "TK504",
    destination: "ISTANBUL",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "V.C", country: "Serbe", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "24",
    date: "2025-05-16",
    flightNumber: "TO8027",
    destination: "MARSEILLE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Marocain", nature: "TIERS", fraudType: "" },
    visa: { type: "T.S", country: "Espagnol", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Marocaine",
    origin: "CSA",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "25",
    date: "2025-05-18",
    flightNumber: "HC403",
    destination: "PARIS",
    passengerCount: 3,
    passport: { type: "P.O", country: "Somalien", nature: "TIERS", fraudType: "" },
    visa: { type: "T.S", country: "Chypriote", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Somalienne",
    origin: "CSA",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "26",
    date: "2025-05-19",
    flightNumber: "NO7421",
    destination: "BERGAMON",
    passengerCount: 1,
    passport: { type: "P.O", country: "Autrichien", nature: "UE", fraudType: "Usurpation" },
    visa: { type: "", country: "", nature: "", fraudType: "" },
    nationality: "Syrienne",
    origin: "CSA",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "27",
    date: "2025-05-21",
    flightNumber: "AT502",
    destination: "CASABLANCA",
    passengerCount: 1,
    passport: { type: "P.O", country: "Kényan", nature: "TIERS", fraudType: "" },
    visa: { type: "T.S", country: "Émirien", nature: "TIERS", fraudType: "Contrefaçon" },
    nationality: "Kényane",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "28",
    date: "2025-05-21",
    flightNumber: "IB0922",
    destination: "MADRID",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "V.C", country: "Espagnol", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "29",
    date: "2025-05-22",
    flightNumber: "AT500",
    destination: "CASABLANCA",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Brésilien", nature: "TIERS", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "30",
    date: "2025-05-22",
    flightNumber: "IB0922",
    destination: "MADRID",
    passengerCount: 4,
    passport: { type: "P.O", country: "Ghanéen", nature: "CEDEAO", fraudType: "Falsification" },
    visa: { type: "V.C", country: "Bulgare", nature: "UE", fraudType: "Falsification" },
    nationality: "Ghanéenne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "31",
    date: "2025-05-24",
    flightNumber: "VY7887",
    destination: "BARCELONE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Gambien", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Espagnol", nature: "UE", fraudType: "Usurpation" },
    nationality: "Gambienne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "32",
    date: "2025-05-24",
    flightNumber: "AT502",
    destination: "CASABLANCA",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Italien", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "CSA",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "33",
    date: "2025-05-25",
    flightNumber: "TK502",
    destination: "ISTANBUL",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "V.C", country: "Britannique", nature: "TIERS", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "SEN-SICAS",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "34",
    date: "2025-05-27",
    flightNumber: "NT1603",
    destination: "GRANDE CANARIE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Canadien", nature: "TIERS", fraudType: "Usurpation" },
    visa: { type: "", country: "", nature: "", fraudType: "" },
    nationality: "Somalienne",
    origin: "AMARENTE",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "35",
    date: "2025-05-27",
    flightNumber: "NT1603",
    destination: "GRANDE CANARIE",
    passengerCount: 2,
    passport: { type: "P.O", country: "Gambien", nature: "CEDEAO", fraudType: "Usurpation" },
    visa: { type: "T.S", country: "Italien", nature: "UE", fraudType: "Usurpation" },
    nationality: "Gambienne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "36",
    date: "2025-05-31",
    flightNumber: "IB0922",
    destination: "MADRID",
    passengerCount: 2,
    passport: { type: "P.O", country: "Bissau-Guinéen", nature: "CEDEAO", fraudType: "Usurpation" },
    visa: { type: "T.S", country: "Portugais", nature: "UE", fraudType: "Usurpation" },
    nationality: "Bissau-Guinéenne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "37",
    date: "2025-06-02",
    flightNumber: "IB0922",
    destination: "MADRID",
    passengerCount: 1,
    passport: { type: "P.O", country: "Allemand", nature: "UE", fraudType: "Usurpation" },
    visa: { type: "", country: "", nature: "", fraudType: "" },
    nationality: "Gambienne",
    origin: "AMARENTE",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "38",
    date: "2025-06-03",
    flightNumber: "TP1484",
    destination: "LISBONNE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Seychellois", nature: "TIERS", fraudType: "Contrefaçon" },
    visa: { type: "", country: "", nature: "", fraudType: "" },
    nationality: "Guinéenne",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  },
  {
    id: "39",
    date: "2025-06-05",
    flightNumber: "TP1484",
    destination: "LISBONNE",
    passengerCount: 1,
    passport: { type: "P.O", country: "Bissau-Guinéen", nature: "CEDEAO", fraudType: "Usurpation" },
    visa: { type: "T.S", country: "Espagnol", nature: "UE", fraudType: "Usurpation" },
    nationality: "Bissau-Guinéenne",
    origin: "AMARENTE",
    sex: "F",
    isMinor: false,
    observations: ""
  },
  {
    id: "40",
    date: "2025-06-08",
    flightNumber: "IB0922",
    destination: "MADRID",
    passengerCount: 1,
    passport: { type: "P.O", country: "Sénégalais", nature: "CEDEAO", fraudType: "" },
    visa: { type: "T.S", country: "Italien", nature: "UE", fraudType: "Contrefaçon" },
    nationality: "Sénégalaise",
    origin: "AMARENTE",
    sex: "M",
    isMinor: false,
    observations: ""
  }
];

export const getStats = () => {
  const totalCases = fraudCases.length;
  const totalPassengers = fraudCases.reduce((acc, c) => acc + c.passengerCount, 0);
  
  const fraudTypes: Record<string, number> = {};
  const destinations: Record<string, number> = {};
  const nationalities: Record<string, number> = {};
  const origins: Record<string, number> = {};
  const monthlyStats: Record<string, number> = {};

  fraudCases.forEach(c => {
    // Fraud types
    const passportFraud = c.passport.fraudType;
    const visaFraud = c.visa.fraudType;
    if (passportFraud) {
      fraudTypes[passportFraud] = (fraudTypes[passportFraud] || 0) + c.passengerCount;
    }
    if (visaFraud) {
      fraudTypes[visaFraud] = (fraudTypes[visaFraud] || 0) + c.passengerCount;
    }
    
    // Destinations
    destinations[c.destination] = (destinations[c.destination] || 0) + c.passengerCount;
    
    // Nationalities
    nationalities[c.nationality] = (nationalities[c.nationality] || 0) + c.passengerCount;
    
    // Origins
    origins[c.origin] = (origins[c.origin] || 0) + c.passengerCount;
    
    // Monthly
    const month = c.date.substring(0, 7);
    monthlyStats[month] = (monthlyStats[month] || 0) + c.passengerCount;
  });

  return {
    totalCases,
    totalPassengers,
    fraudTypes,
    destinations,
    nationalities,
    origins,
    monthlyStats,
    maleCount: fraudCases.filter(c => c.sex === 'M').reduce((acc, c) => acc + c.passengerCount, 0),
    femaleCount: fraudCases.filter(c => c.sex === 'F').reduce((acc, c) => acc + c.passengerCount, 0),
  };
};

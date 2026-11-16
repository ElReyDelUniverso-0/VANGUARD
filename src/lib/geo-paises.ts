// ═══════════════════════════════════════════════════════════════════
// v405.9 · EL CENSO GEOGRÁFICO — la tabla que une todo lo demás.
//
// El problema real que resuelve: la casa habla de países en cuatro idiomas
// distintos — Natural Earth los llama «Spain», el Banco Mundial los llama
// «ESP», las banderas de la casa usan «es» y los acontecimientos del núcleo
// guardan «es». Sin una tabla de identidad, cada capa del mapa tendría que
// adivinar, y adivinar es inventar.
//
// FUENTE: mledoze/countries (ISO 3166-1 + coordenadas + nombre en español),
// datos públicos de la ISO; se cita aquí y viaja generado, no escrito a mano.
// Solo se guarda lo que se usa: iso2 · iso3 · numérico · nombre en español ·
// región · subregión · [lat, lng] del centro del país.
// ═══════════════════════════════════════════════════════════════════

export interface PaisGeo {
  /** ISO 3166-1 alfa-2 en minúsculas (la clave de las banderas y de world-data) */
  iso2: string;
  /** ISO 3166-1 alfa-3 (la clave del Banco Mundial y de poder-data) */
  iso3: string;
  /** ISO 3166-1 numérico como texto (la clave `id` de Natural Earth / world-atlas) */
  num: string;
  nombre: string;
  region: string;
  subregion: string;
  lat: number;
  lng: number;
}

export const PAISES_GEO: PaisGeo[] = [
  { iso2: "af", iso3: "AFG", num: "004", nombre: "Afganistán", region: "Asia", subregion: "Southern Asia", lat: 33, lng: 65 },
  { iso2: "ax", iso3: "ALA", num: "248", nombre: "Alandia", region: "Europe", subregion: "Northern Europe", lat: 60.116667, lng: 19.9 },
  { iso2: "al", iso3: "ALB", num: "008", nombre: "Albania", region: "Europe", subregion: "Southeast Europe", lat: 41, lng: 20 },
  { iso2: "de", iso3: "DEU", num: "276", nombre: "Alemania", region: "Europe", subregion: "Western Europe", lat: 51, lng: 9 },
  { iso2: "ad", iso3: "AND", num: "020", nombre: "Andorra", region: "Europe", subregion: "Southern Europe", lat: 42.5, lng: 1.5 },
  { iso2: "ao", iso3: "AGO", num: "024", nombre: "Angola", region: "Africa", subregion: "Middle Africa", lat: -12.5, lng: 18.5 },
  { iso2: "ai", iso3: "AIA", num: "660", nombre: "Anguilla", region: "Americas", subregion: "Caribbean", lat: 18.25, lng: -63.16666666 },
  { iso2: "ag", iso3: "ATG", num: "028", nombre: "Antigua y Barbuda", region: "Americas", subregion: "Caribbean", lat: 17.05, lng: -61.8 },
  { iso2: "aq", iso3: "ATA", num: "010", nombre: "Antártida", region: "Antarctic", subregion: "", lat: -90, lng: 0 },
  { iso2: "sa", iso3: "SAU", num: "682", nombre: "Arabia Saudí", region: "Asia", subregion: "Western Asia", lat: 25, lng: 45 },
  { iso2: "dz", iso3: "DZA", num: "012", nombre: "Argelia", region: "Africa", subregion: "Northern Africa", lat: 28, lng: 3 },
  { iso2: "ar", iso3: "ARG", num: "032", nombre: "Argentina", region: "Americas", subregion: "South America", lat: -34, lng: -64 },
  { iso2: "am", iso3: "ARM", num: "051", nombre: "Armenia", region: "Asia", subregion: "Western Asia", lat: 40, lng: 45 },
  { iso2: "aw", iso3: "ABW", num: "533", nombre: "Aruba", region: "Americas", subregion: "Caribbean", lat: 12.5, lng: -69.96666666 },
  { iso2: "au", iso3: "AUS", num: "036", nombre: "Australia", region: "Oceania", subregion: "Australia and New Zealand", lat: -27, lng: 133 },
  { iso2: "at", iso3: "AUT", num: "040", nombre: "Austria", region: "Europe", subregion: "Central Europe", lat: 47.33333333, lng: 13.33333333 },
  { iso2: "az", iso3: "AZE", num: "031", nombre: "Azerbaiyán", region: "Asia", subregion: "Western Asia", lat: 40.5, lng: 47.5 },
  { iso2: "bs", iso3: "BHS", num: "044", nombre: "Bahamas", region: "Americas", subregion: "Caribbean", lat: 24.25, lng: -76 },
  { iso2: "bh", iso3: "BHR", num: "048", nombre: "Bahrein", region: "Asia", subregion: "Western Asia", lat: 26, lng: 50.55 },
  { iso2: "bd", iso3: "BGD", num: "050", nombre: "Bangladesh", region: "Asia", subregion: "Southern Asia", lat: 24, lng: 90 },
  { iso2: "bb", iso3: "BRB", num: "052", nombre: "Barbados", region: "Americas", subregion: "Caribbean", lat: 13.16666666, lng: -59.53333333 },
  { iso2: "bz", iso3: "BLZ", num: "084", nombre: "Belice", region: "Americas", subregion: "Central America", lat: 17.25, lng: -88.75 },
  { iso2: "bj", iso3: "BEN", num: "204", nombre: "Benín", region: "Africa", subregion: "Western Africa", lat: 9.5, lng: 2.25 },
  { iso2: "bm", iso3: "BMU", num: "060", nombre: "Bermudas", region: "Americas", subregion: "North America", lat: 32.33333333, lng: -64.75 },
  { iso2: "by", iso3: "BLR", num: "112", nombre: "Bielorrusia", region: "Europe", subregion: "Eastern Europe", lat: 53, lng: 28 },
  { iso2: "bo", iso3: "BOL", num: "068", nombre: "Bolivia", region: "Americas", subregion: "South America", lat: -17, lng: -65 },
  { iso2: "ba", iso3: "BIH", num: "070", nombre: "Bosnia y Herzegovina", region: "Europe", subregion: "Southeast Europe", lat: 44, lng: 18 },
  { iso2: "bw", iso3: "BWA", num: "072", nombre: "Botswana", region: "Africa", subregion: "Southern Africa", lat: -22, lng: 24 },
  { iso2: "br", iso3: "BRA", num: "076", nombre: "Brasil", region: "Americas", subregion: "South America", lat: -10, lng: -55 },
  { iso2: "bn", iso3: "BRN", num: "096", nombre: "Brunei", region: "Asia", subregion: "South-Eastern Asia", lat: 4.5, lng: 114.66666666 },
  { iso2: "bg", iso3: "BGR", num: "100", nombre: "Bulgaria", region: "Europe", subregion: "Southeast Europe", lat: 43, lng: 25 },
  { iso2: "bf", iso3: "BFA", num: "854", nombre: "Burkina Faso", region: "Africa", subregion: "Western Africa", lat: 13, lng: -2 },
  { iso2: "bi", iso3: "BDI", num: "108", nombre: "Burundi", region: "Africa", subregion: "Eastern Africa", lat: -3.5, lng: 30 },
  { iso2: "bt", iso3: "BTN", num: "064", nombre: "Bután", region: "Asia", subregion: "Southern Asia", lat: 27.5, lng: 90.5 },
  { iso2: "be", iso3: "BEL", num: "056", nombre: "Bélgica", region: "Europe", subregion: "Western Europe", lat: 50.83333333, lng: 4 },
  { iso2: "cv", iso3: "CPV", num: "132", nombre: "Cabo Verde", region: "Africa", subregion: "Western Africa", lat: 16, lng: -24 },
  { iso2: "kh", iso3: "KHM", num: "116", nombre: "Camboya", region: "Asia", subregion: "South-Eastern Asia", lat: 13, lng: 105 },
  { iso2: "cm", iso3: "CMR", num: "120", nombre: "Camerún", region: "Africa", subregion: "Middle Africa", lat: 6, lng: 12 },
  { iso2: "ca", iso3: "CAN", num: "124", nombre: "Canadá", region: "Americas", subregion: "North America", lat: 60, lng: -95 },
  { iso2: "bq", iso3: "BES", num: "535", nombre: "Caribe Neerlandés", region: "Americas", subregion: "Caribbean", lat: 12.18, lng: -68.25 },
  { iso2: "qa", iso3: "QAT", num: "634", nombre: "Catar", region: "Asia", subregion: "Western Asia", lat: 25.5, lng: 51.25 },
  { iso2: "td", iso3: "TCD", num: "148", nombre: "Chad", region: "Africa", subregion: "Middle Africa", lat: 15, lng: 19 },
  { iso2: "cz", iso3: "CZE", num: "203", nombre: "Chequia", region: "Europe", subregion: "Central Europe", lat: 49.75, lng: 15.5 },
  { iso2: "cl", iso3: "CHL", num: "152", nombre: "Chile", region: "Americas", subregion: "South America", lat: -30, lng: -71 },
  { iso2: "cn", iso3: "CHN", num: "156", nombre: "China", region: "Asia", subregion: "Eastern Asia", lat: 35, lng: 105 },
  { iso2: "cy", iso3: "CYP", num: "196", nombre: "Chipre", region: "Europe", subregion: "Southern Europe", lat: 35, lng: 33 },
  { iso2: "va", iso3: "VAT", num: "336", nombre: "Ciudad del Vaticano", region: "Europe", subregion: "Southern Europe", lat: 41.9, lng: 12.45 },
  { iso2: "co", iso3: "COL", num: "170", nombre: "Colombia", region: "Americas", subregion: "South America", lat: 4, lng: -72 },
  { iso2: "km", iso3: "COM", num: "174", nombre: "Comoras", region: "Africa", subregion: "Eastern Africa", lat: -12.16666666, lng: 44.25 },
  { iso2: "cg", iso3: "COG", num: "178", nombre: "Congo", region: "Africa", subregion: "Middle Africa", lat: -1, lng: 15 },
  { iso2: "cd", iso3: "COD", num: "180", nombre: "Congo (Rep. Dem.)", region: "Africa", subregion: "Middle Africa", lat: 0, lng: 25 },
  { iso2: "kp", iso3: "PRK", num: "408", nombre: "Corea del Norte", region: "Asia", subregion: "Eastern Asia", lat: 40, lng: 127 },
  { iso2: "kr", iso3: "KOR", num: "410", nombre: "Corea del Sur", region: "Asia", subregion: "Eastern Asia", lat: 37, lng: 127.5 },
  { iso2: "cr", iso3: "CRI", num: "188", nombre: "Costa Rica", region: "Americas", subregion: "Central America", lat: 10, lng: -84 },
  { iso2: "ci", iso3: "CIV", num: "384", nombre: "Costa de Marfil", region: "Africa", subregion: "Western Africa", lat: 8, lng: -5 },
  { iso2: "hr", iso3: "HRV", num: "191", nombre: "Croacia", region: "Europe", subregion: "Southeast Europe", lat: 45.16666666, lng: 15.5 },
  { iso2: "cu", iso3: "CUB", num: "192", nombre: "Cuba", region: "Americas", subregion: "Caribbean", lat: 21.5, lng: -80 },
  { iso2: "cw", iso3: "CUW", num: "531", nombre: "Curazao", region: "Americas", subregion: "Caribbean", lat: 12.116667, lng: -68.933333 },
  { iso2: "dk", iso3: "DNK", num: "208", nombre: "Dinamarca", region: "Europe", subregion: "Northern Europe", lat: 56, lng: 10 },
  { iso2: "dj", iso3: "DJI", num: "262", nombre: "Djibouti", region: "Africa", subregion: "Eastern Africa", lat: 11.5, lng: 43 },
  { iso2: "dm", iso3: "DMA", num: "212", nombre: "Dominica", region: "Americas", subregion: "Caribbean", lat: 15.41666666, lng: -61.33333333 },
  { iso2: "ec", iso3: "ECU", num: "218", nombre: "Ecuador", region: "Americas", subregion: "South America", lat: -2, lng: -77.5 },
  { iso2: "eg", iso3: "EGY", num: "818", nombre: "Egipto", region: "Africa", subregion: "Northern Africa", lat: 27, lng: 30 },
  { iso2: "sv", iso3: "SLV", num: "222", nombre: "El Salvador", region: "Americas", subregion: "Central America", lat: 13.83333333, lng: -88.91666666 },
  { iso2: "ae", iso3: "ARE", num: "784", nombre: "Emiratos Árabes Unidos", region: "Asia", subregion: "Western Asia", lat: 24, lng: 54 },
  { iso2: "er", iso3: "ERI", num: "232", nombre: "Eritrea", region: "Africa", subregion: "Eastern Africa", lat: 15, lng: 39 },
  { iso2: "sk", iso3: "SVK", num: "703", nombre: "Eslovaquia", region: "Europe", subregion: "Central Europe", lat: 48.66666666, lng: 19.5 },
  { iso2: "si", iso3: "SVN", num: "705", nombre: "Eslovenia", region: "Europe", subregion: "Central Europe", lat: 46.11666666, lng: 14.81666666 },
  { iso2: "es", iso3: "ESP", num: "724", nombre: "España", region: "Europe", subregion: "Southern Europe", lat: 40, lng: -4 },
  { iso2: "us", iso3: "USA", num: "840", nombre: "Estados Unidos", region: "Americas", subregion: "North America", lat: 38, lng: -97 },
  { iso2: "ee", iso3: "EST", num: "233", nombre: "Estonia", region: "Europe", subregion: "Northern Europe", lat: 59, lng: 26 },
  { iso2: "sz", iso3: "SWZ", num: "748", nombre: "Esuatini", region: "Africa", subregion: "Southern Africa", lat: -26.5, lng: 31.5 },
  { iso2: "et", iso3: "ETH", num: "231", nombre: "Etiopía", region: "Africa", subregion: "Eastern Africa", lat: 8, lng: 38 },
  { iso2: "ph", iso3: "PHL", num: "608", nombre: "Filipinas", region: "Asia", subregion: "South-Eastern Asia", lat: 13, lng: 122 },
  { iso2: "fi", iso3: "FIN", num: "246", nombre: "Finlandia", region: "Europe", subregion: "Northern Europe", lat: 64, lng: 26 },
  { iso2: "fj", iso3: "FJI", num: "242", nombre: "Fiyi", region: "Oceania", subregion: "Melanesia", lat: -18, lng: 175 },
  { iso2: "fr", iso3: "FRA", num: "250", nombre: "Francia", region: "Europe", subregion: "Western Europe", lat: 46, lng: 2 },
  { iso2: "ga", iso3: "GAB", num: "266", nombre: "Gabón", region: "Africa", subregion: "Middle Africa", lat: -1, lng: 11.75 },
  { iso2: "gm", iso3: "GMB", num: "270", nombre: "Gambia", region: "Africa", subregion: "Western Africa", lat: 13.46666666, lng: -16.56666666 },
  { iso2: "ge", iso3: "GEO", num: "268", nombre: "Georgia", region: "Asia", subregion: "Western Asia", lat: 42, lng: 43.5 },
  { iso2: "gh", iso3: "GHA", num: "288", nombre: "Ghana", region: "Africa", subregion: "Western Africa", lat: 8, lng: -2 },
  { iso2: "gi", iso3: "GIB", num: "292", nombre: "Gibraltar", region: "Europe", subregion: "Southern Europe", lat: 36.13333333, lng: -5.35 },
  { iso2: "gr", iso3: "GRC", num: "300", nombre: "Grecia", region: "Europe", subregion: "Southern Europe", lat: 39, lng: 22 },
  { iso2: "gd", iso3: "GRD", num: "308", nombre: "Grenada", region: "Americas", subregion: "Caribbean", lat: 12.11666666, lng: -61.66666666 },
  { iso2: "gl", iso3: "GRL", num: "304", nombre: "Groenlandia", region: "Americas", subregion: "North America", lat: 72, lng: -40 },
  { iso2: "gp", iso3: "GLP", num: "312", nombre: "Guadalupe", region: "Americas", subregion: "Caribbean", lat: 16.25, lng: -61.583333 },
  { iso2: "gu", iso3: "GUM", num: "316", nombre: "Guam", region: "Oceania", subregion: "Micronesia", lat: 13.46666666, lng: 144.78333333 },
  { iso2: "gt", iso3: "GTM", num: "320", nombre: "Guatemala", region: "Americas", subregion: "Central America", lat: 15.5, lng: -90.25 },
  { iso2: "gf", iso3: "GUF", num: "254", nombre: "Guayana Francesa", region: "Americas", subregion: "South America", lat: 4, lng: -53 },
  { iso2: "gg", iso3: "GGY", num: "831", nombre: "Guernsey", region: "Europe", subregion: "Northern Europe", lat: 49.46666666, lng: -2.58333333 },
  { iso2: "gn", iso3: "GIN", num: "324", nombre: "Guinea", region: "Africa", subregion: "Western Africa", lat: 11, lng: -10 },
  { iso2: "gq", iso3: "GNQ", num: "226", nombre: "Guinea Ecuatorial", region: "Africa", subregion: "Middle Africa", lat: 2, lng: 10 },
  { iso2: "gw", iso3: "GNB", num: "624", nombre: "Guinea-Bisáu", region: "Africa", subregion: "Western Africa", lat: 12, lng: -15 },
  { iso2: "gy", iso3: "GUY", num: "328", nombre: "Guyana", region: "Americas", subregion: "South America", lat: 5, lng: -59 },
  { iso2: "ht", iso3: "HTI", num: "332", nombre: "Haití", region: "Americas", subregion: "Caribbean", lat: 19, lng: -72.41666666 },
  { iso2: "hn", iso3: "HND", num: "340", nombre: "Honduras", region: "Americas", subregion: "Central America", lat: 15, lng: -86.5 },
  { iso2: "hk", iso3: "HKG", num: "344", nombre: "Hong Kong", region: "Asia", subregion: "Eastern Asia", lat: 22.267, lng: 114.188 },
  { iso2: "hu", iso3: "HUN", num: "348", nombre: "Hungría", region: "Europe", subregion: "Central Europe", lat: 47, lng: 20 },
  { iso2: "in", iso3: "IND", num: "356", nombre: "India", region: "Asia", subregion: "Southern Asia", lat: 20, lng: 77 },
  { iso2: "id", iso3: "IDN", num: "360", nombre: "Indonesia", region: "Asia", subregion: "South-Eastern Asia", lat: -5, lng: 120 },
  { iso2: "iq", iso3: "IRQ", num: "368", nombre: "Irak", region: "Asia", subregion: "Western Asia", lat: 33, lng: 44 },
  { iso2: "ir", iso3: "IRN", num: "364", nombre: "Iran", region: "Asia", subregion: "Southern Asia", lat: 32, lng: 53 },
  { iso2: "ie", iso3: "IRL", num: "372", nombre: "Irlanda", region: "Europe", subregion: "Northern Europe", lat: 53, lng: -8 },
  { iso2: "bv", iso3: "BVT", num: "074", nombre: "Isla Bouvet", region: "Antarctic", subregion: "", lat: -54.43333333, lng: 3.4 },
  { iso2: "im", iso3: "IMN", num: "833", nombre: "Isla de Man", region: "Europe", subregion: "Northern Europe", lat: 54.25, lng: -4.5 },
  { iso2: "cx", iso3: "CXR", num: "162", nombre: "Isla de Navidad", region: "Oceania", subregion: "Australia and New Zealand", lat: -10.5, lng: 105.66666666 },
  { iso2: "nf", iso3: "NFK", num: "574", nombre: "Isla de Norfolk", region: "Oceania", subregion: "Australia and New Zealand", lat: -29.03333333, lng: 167.95 },
  { iso2: "is", iso3: "ISL", num: "352", nombre: "Islandia", region: "Europe", subregion: "Northern Europe", lat: 65, lng: -18 },
  { iso2: "ky", iso3: "CYM", num: "136", nombre: "Islas Caimán", region: "Americas", subregion: "Caribbean", lat: 19.5, lng: -80.5 },
  { iso2: "cc", iso3: "CCK", num: "166", nombre: "Islas Cocos o Islas Keeling", region: "Oceania", subregion: "Australia and New Zealand", lat: -12.5, lng: 96.83333333 },
  { iso2: "ck", iso3: "COK", num: "184", nombre: "Islas Cook", region: "Oceania", subregion: "Polynesia", lat: -21.23333333, lng: -159.76666666 },
  { iso2: "fo", iso3: "FRO", num: "234", nombre: "Islas Faroe", region: "Europe", subregion: "Northern Europe", lat: 62, lng: -7 },
  { iso2: "gs", iso3: "SGS", num: "239", nombre: "Islas Georgias del Sur y Sandwich del Sur", region: "Antarctic", subregion: "", lat: -54.5, lng: -37 },
  { iso2: "hm", iso3: "HMD", num: "334", nombre: "Islas Heard y McDonald", region: "Antarctic", subregion: "", lat: -53.1, lng: 72.51666666 },
  { iso2: "fk", iso3: "FLK", num: "238", nombre: "Islas Malvinas", region: "Americas", subregion: "South America", lat: -51.75, lng: -59 },
  { iso2: "mp", iso3: "MNP", num: "580", nombre: "Islas Marianas del Norte", region: "Oceania", subregion: "Micronesia", lat: 15.2, lng: 145.75 },
  { iso2: "mh", iso3: "MHL", num: "584", nombre: "Islas Marshall", region: "Oceania", subregion: "Micronesia", lat: 9, lng: 168 },
  { iso2: "pn", iso3: "PCN", num: "612", nombre: "Islas Pitcairn", region: "Oceania", subregion: "Polynesia", lat: -25.06666666, lng: -130.1 },
  { iso2: "sb", iso3: "SLB", num: "090", nombre: "Islas Salomón", region: "Oceania", subregion: "Melanesia", lat: -8, lng: 159 },
  { iso2: "sj", iso3: "SJM", num: "744", nombre: "Islas Svalbard y Jan Mayen", region: "Europe", subregion: "Northern Europe", lat: 78, lng: 20 },
  { iso2: "tk", iso3: "TKL", num: "772", nombre: "Islas Tokelau", region: "Oceania", subregion: "Polynesia", lat: -9, lng: -172 },
  { iso2: "tc", iso3: "TCA", num: "796", nombre: "Islas Turks y Caicos", region: "Americas", subregion: "Caribbean", lat: 21.75, lng: -71.58333333 },
  { iso2: "um", iso3: "UMI", num: "581", nombre: "Islas Ultramarinas Menores de Estados Unidos", region: "Americas", subregion: "North America", lat: 19.3, lng: 166.633333 },
  { iso2: "vi", iso3: "VIR", num: "850", nombre: "Islas Vírgenes de los Estados Unidos", region: "Americas", subregion: "Caribbean", lat: 18.35, lng: -64.933333 },
  { iso2: "vg", iso3: "VGB", num: "092", nombre: "Islas Vírgenes del Reino Unido", region: "Americas", subregion: "Caribbean", lat: 18.431383, lng: -64.62305 },
  { iso2: "il", iso3: "ISR", num: "376", nombre: "Israel", region: "Asia", subregion: "Western Asia", lat: 31.47, lng: 35.13 },
  { iso2: "it", iso3: "ITA", num: "380", nombre: "Italia", region: "Europe", subregion: "Southern Europe", lat: 42.83333333, lng: 12.83333333 },
  { iso2: "jm", iso3: "JAM", num: "388", nombre: "Jamaica", region: "Americas", subregion: "Caribbean", lat: 18.25, lng: -77.5 },
  { iso2: "jp", iso3: "JPN", num: "392", nombre: "Japón", region: "Asia", subregion: "Eastern Asia", lat: 36, lng: 138 },
  { iso2: "je", iso3: "JEY", num: "832", nombre: "Jersey", region: "Europe", subregion: "Northern Europe", lat: 49.25, lng: -2.16666666 },
  { iso2: "jo", iso3: "JOR", num: "400", nombre: "Jordania", region: "Asia", subregion: "Western Asia", lat: 31, lng: 36 },
  { iso2: "kz", iso3: "KAZ", num: "398", nombre: "Kazajistán", region: "Asia", subregion: "Central Asia", lat: 48, lng: 68 },
  { iso2: "ke", iso3: "KEN", num: "404", nombre: "Kenia", region: "Africa", subregion: "Eastern Africa", lat: 1, lng: 38 },
  { iso2: "kg", iso3: "KGZ", num: "417", nombre: "Kirguizistán", region: "Asia", subregion: "Central Asia", lat: 41, lng: 75 },
  { iso2: "ki", iso3: "KIR", num: "296", nombre: "Kiribati", region: "Oceania", subregion: "Micronesia", lat: 1.41666666, lng: 173 },
  { iso2: "kw", iso3: "KWT", num: "414", nombre: "Kuwait", region: "Asia", subregion: "Western Asia", lat: 29.5, lng: 45.75 },
  { iso2: "la", iso3: "LAO", num: "418", nombre: "Laos", region: "Asia", subregion: "South-Eastern Asia", lat: 18, lng: 105 },
  { iso2: "ls", iso3: "LSO", num: "426", nombre: "Lesotho", region: "Africa", subregion: "Southern Africa", lat: -29.5, lng: 28.5 },
  { iso2: "lv", iso3: "LVA", num: "428", nombre: "Letonia", region: "Europe", subregion: "Northern Europe", lat: 57, lng: 25 },
  { iso2: "lr", iso3: "LBR", num: "430", nombre: "Liberia", region: "Africa", subregion: "Western Africa", lat: 6.5, lng: -9.5 },
  { iso2: "ly", iso3: "LBY", num: "434", nombre: "Libia", region: "Africa", subregion: "Northern Africa", lat: 25, lng: 17 },
  { iso2: "li", iso3: "LIE", num: "438", nombre: "Liechtenstein", region: "Europe", subregion: "Western Europe", lat: 47.26666666, lng: 9.53333333 },
  { iso2: "lt", iso3: "LTU", num: "440", nombre: "Lituania", region: "Europe", subregion: "Northern Europe", lat: 56, lng: 24 },
  { iso2: "lu", iso3: "LUX", num: "442", nombre: "Luxemburgo", region: "Europe", subregion: "Western Europe", lat: 49.75, lng: 6.16666666 },
  { iso2: "lb", iso3: "LBN", num: "422", nombre: "Líbano", region: "Asia", subregion: "Western Asia", lat: 33.83333333, lng: 35.83333333 },
  { iso2: "mo", iso3: "MAC", num: "446", nombre: "Macao", region: "Asia", subregion: "Eastern Asia", lat: 22.16666666, lng: 113.55 },
  { iso2: "mk", iso3: "MKD", num: "807", nombre: "Macedonia del Norte", region: "Europe", subregion: "Southeast Europe", lat: 41.83333333, lng: 22 },
  { iso2: "mg", iso3: "MDG", num: "450", nombre: "Madagascar", region: "Africa", subregion: "Eastern Africa", lat: -20, lng: 47 },
  { iso2: "my", iso3: "MYS", num: "458", nombre: "Malasia", region: "Asia", subregion: "South-Eastern Asia", lat: 2.5, lng: 112.5 },
  { iso2: "mw", iso3: "MWI", num: "454", nombre: "Malawi", region: "Africa", subregion: "Eastern Africa", lat: -13.5, lng: 34 },
  { iso2: "mv", iso3: "MDV", num: "462", nombre: "Maldivas", region: "Asia", subregion: "Southern Asia", lat: 3.25, lng: 73 },
  { iso2: "ml", iso3: "MLI", num: "466", nombre: "Mali", region: "Africa", subregion: "Western Africa", lat: 17, lng: -4 },
  { iso2: "mt", iso3: "MLT", num: "470", nombre: "Malta", region: "Europe", subregion: "Southern Europe", lat: 35.83333333, lng: 14.58333333 },
  { iso2: "ma", iso3: "MAR", num: "504", nombre: "Marruecos", region: "Africa", subregion: "Northern Africa", lat: 32, lng: -5 },
  { iso2: "mq", iso3: "MTQ", num: "474", nombre: "Martinica", region: "Americas", subregion: "Caribbean", lat: 14.666667, lng: -61 },
  { iso2: "mu", iso3: "MUS", num: "480", nombre: "Mauricio", region: "Africa", subregion: "Eastern Africa", lat: -20.28333333, lng: 57.55 },
  { iso2: "mr", iso3: "MRT", num: "478", nombre: "Mauritania", region: "Africa", subregion: "Western Africa", lat: 20, lng: -12 },
  { iso2: "yt", iso3: "MYT", num: "175", nombre: "Mayotte", region: "Africa", subregion: "Eastern Africa", lat: -12.83333333, lng: 45.16666666 },
  { iso2: "fm", iso3: "FSM", num: "583", nombre: "Micronesia", region: "Oceania", subregion: "Micronesia", lat: 6.91666666, lng: 158.25 },
  { iso2: "md", iso3: "MDA", num: "498", nombre: "Moldavia", region: "Europe", subregion: "Eastern Europe", lat: 47, lng: 29 },
  { iso2: "mn", iso3: "MNG", num: "496", nombre: "Mongolia", region: "Asia", subregion: "Eastern Asia", lat: 46, lng: 105 },
  { iso2: "me", iso3: "MNE", num: "499", nombre: "Montenegro", region: "Europe", subregion: "Southeast Europe", lat: 42.5, lng: 19.3 },
  { iso2: "ms", iso3: "MSR", num: "500", nombre: "Montserrat", region: "Americas", subregion: "Caribbean", lat: 16.75, lng: -62.2 },
  { iso2: "mz", iso3: "MOZ", num: "508", nombre: "Mozambique", region: "Africa", subregion: "Eastern Africa", lat: -18.25, lng: 35 },
  { iso2: "mm", iso3: "MMR", num: "104", nombre: "Myanmar", region: "Asia", subregion: "South-Eastern Asia", lat: 22, lng: 98 },
  { iso2: "mx", iso3: "MEX", num: "484", nombre: "México", region: "Americas", subregion: "North America", lat: 23, lng: -102 },
  { iso2: "mc", iso3: "MCO", num: "492", nombre: "Mónaco", region: "Europe", subregion: "Western Europe", lat: 43.73333333, lng: 7.4 },
  { iso2: "na", iso3: "NAM", num: "516", nombre: "Namibia", region: "Africa", subregion: "Southern Africa", lat: -22, lng: 17 },
  { iso2: "nr", iso3: "NRU", num: "520", nombre: "Nauru", region: "Oceania", subregion: "Micronesia", lat: -0.53333333, lng: 166.91666666 },
  { iso2: "np", iso3: "NPL", num: "524", nombre: "Nepal", region: "Asia", subregion: "Southern Asia", lat: 28, lng: 84 },
  { iso2: "ni", iso3: "NIC", num: "558", nombre: "Nicaragua", region: "Americas", subregion: "Central America", lat: 13, lng: -85 },
  { iso2: "ng", iso3: "NGA", num: "566", nombre: "Nigeria", region: "Africa", subregion: "Western Africa", lat: 10, lng: 8 },
  { iso2: "nu", iso3: "NIU", num: "570", nombre: "Niue", region: "Oceania", subregion: "Polynesia", lat: -19.03333333, lng: -169.86666666 },
  { iso2: "no", iso3: "NOR", num: "578", nombre: "Noruega", region: "Europe", subregion: "Northern Europe", lat: 62, lng: 10 },
  { iso2: "nc", iso3: "NCL", num: "540", nombre: "Nueva Caledonia", region: "Oceania", subregion: "Melanesia", lat: -21.5, lng: 165.5 },
  { iso2: "nz", iso3: "NZL", num: "554", nombre: "Nueva Zelanda", region: "Oceania", subregion: "Australia and New Zealand", lat: -41, lng: 174 },
  { iso2: "ne", iso3: "NER", num: "562", nombre: "Níger", region: "Africa", subregion: "Western Africa", lat: 16, lng: 8 },
  { iso2: "om", iso3: "OMN", num: "512", nombre: "Omán", region: "Asia", subregion: "Western Asia", lat: 21, lng: 57 },
  { iso2: "pk", iso3: "PAK", num: "586", nombre: "Pakistán", region: "Asia", subregion: "Southern Asia", lat: 30, lng: 70 },
  { iso2: "pw", iso3: "PLW", num: "585", nombre: "Palau", region: "Oceania", subregion: "Micronesia", lat: 7.5, lng: 134.5 },
  { iso2: "ps", iso3: "PSE", num: "275", nombre: "Palestina", region: "Asia", subregion: "Western Asia", lat: 31.9, lng: 35.2 },
  { iso2: "pa", iso3: "PAN", num: "591", nombre: "Panamá", region: "Americas", subregion: "Central America", lat: 9, lng: -80 },
  { iso2: "pg", iso3: "PNG", num: "598", nombre: "Papúa Nueva Guinea", region: "Oceania", subregion: "Melanesia", lat: -6, lng: 147 },
  { iso2: "py", iso3: "PRY", num: "600", nombre: "Paraguay", region: "Americas", subregion: "South America", lat: -23, lng: -58 },
  { iso2: "nl", iso3: "NLD", num: "528", nombre: "Países Bajos", region: "Europe", subregion: "Western Europe", lat: 52.5, lng: 5.75 },
  { iso2: "pe", iso3: "PER", num: "604", nombre: "Perú", region: "Americas", subregion: "South America", lat: -10, lng: -76 },
  { iso2: "pf", iso3: "PYF", num: "258", nombre: "Polinesia Francesa", region: "Oceania", subregion: "Polynesia", lat: -15, lng: -140 },
  { iso2: "pl", iso3: "POL", num: "616", nombre: "Polonia", region: "Europe", subregion: "Central Europe", lat: 52, lng: 20 },
  { iso2: "pt", iso3: "PRT", num: "620", nombre: "Portugal", region: "Europe", subregion: "Southern Europe", lat: 39.5, lng: -8 },
  { iso2: "pr", iso3: "PRI", num: "630", nombre: "Puerto Rico", region: "Americas", subregion: "Caribbean", lat: 18.25, lng: -66.5 },
  { iso2: "gb", iso3: "GBR", num: "826", nombre: "Reino Unido", region: "Europe", subregion: "Northern Europe", lat: 54, lng: -2 },
  { iso2: "cf", iso3: "CAF", num: "140", nombre: "República Centroafricana", region: "Africa", subregion: "Middle Africa", lat: 7, lng: 21 },
  { iso2: "do", iso3: "DOM", num: "214", nombre: "República Dominicana", region: "Americas", subregion: "Caribbean", lat: 19, lng: -70.66666666 },
  { iso2: "re", iso3: "REU", num: "638", nombre: "Reunión", region: "Africa", subregion: "Eastern Africa", lat: -21.15, lng: 55.5 },
  { iso2: "rw", iso3: "RWA", num: "646", nombre: "Ruanda", region: "Africa", subregion: "Eastern Africa", lat: -2, lng: 30 },
  { iso2: "ro", iso3: "ROU", num: "642", nombre: "Rumania", region: "Europe", subregion: "Southeast Europe", lat: 46, lng: 25 },
  { iso2: "ru", iso3: "RUS", num: "643", nombre: "Rusia", region: "Europe", subregion: "Eastern Europe", lat: 60, lng: 100 },
  { iso2: "eh", iso3: "ESH", num: "732", nombre: "Sahara Occidental", region: "Africa", subregion: "Northern Africa", lat: 24.5, lng: -13 },
  { iso2: "mf", iso3: "MAF", num: "663", nombre: "Saint Martin", region: "Americas", subregion: "Caribbean", lat: 18.08333333, lng: -63.95 },
  { iso2: "ws", iso3: "WSM", num: "882", nombre: "Samoa", region: "Oceania", subregion: "Polynesia", lat: -13.58333333, lng: -172.33333333 },
  { iso2: "as", iso3: "ASM", num: "016", nombre: "Samoa Americana", region: "Oceania", subregion: "Polynesia", lat: -14.33333333, lng: -170 },
  { iso2: "bl", iso3: "BLM", num: "652", nombre: "San Bartolomé", region: "Americas", subregion: "Caribbean", lat: 18.5, lng: -63.41666666 },
  { iso2: "kn", iso3: "KNA", num: "659", nombre: "San Cristóbal y Nieves", region: "Americas", subregion: "Caribbean", lat: 17.33333333, lng: -62.75 },
  { iso2: "sm", iso3: "SMR", num: "674", nombre: "San Marino", region: "Europe", subregion: "Southern Europe", lat: 43.76666666, lng: 12.41666666 },
  { iso2: "pm", iso3: "SPM", num: "666", nombre: "San Pedro y Miquelón", region: "Americas", subregion: "North America", lat: 46.83333333, lng: -56.33333333 },
  { iso2: "vc", iso3: "VCT", num: "670", nombre: "San Vicente y Granadinas", region: "Americas", subregion: "Caribbean", lat: 13.25, lng: -61.2 },
  { iso2: "sh", iso3: "SHN", num: "654", nombre: "Santa Elena, Ascensión y Tristán de Acuña", region: "Africa", subregion: "Western Africa", lat: -15.95, lng: -5.72 },
  { iso2: "lc", iso3: "LCA", num: "662", nombre: "Santa Lucía", region: "Americas", subregion: "Caribbean", lat: 13.88333333, lng: -60.96666666 },
  { iso2: "st", iso3: "STP", num: "678", nombre: "Santo Tomé y Príncipe", region: "Africa", subregion: "Middle Africa", lat: 1, lng: 7 },
  { iso2: "sn", iso3: "SEN", num: "686", nombre: "Senegal", region: "Africa", subregion: "Western Africa", lat: 14, lng: -14 },
  { iso2: "rs", iso3: "SRB", num: "688", nombre: "Serbia", region: "Europe", subregion: "Southeast Europe", lat: 44, lng: 21 },
  { iso2: "sc", iso3: "SYC", num: "690", nombre: "Seychelles", region: "Africa", subregion: "Eastern Africa", lat: -4.58333333, lng: 55.66666666 },
  { iso2: "sl", iso3: "SLE", num: "694", nombre: "Sierra Leone", region: "Africa", subregion: "Western Africa", lat: 8.5, lng: -11.5 },
  { iso2: "sg", iso3: "SGP", num: "702", nombre: "Singapur", region: "Asia", subregion: "South-Eastern Asia", lat: 1.36666666, lng: 103.8 },
  { iso2: "sx", iso3: "SXM", num: "534", nombre: "Sint Maarten", region: "Americas", subregion: "Caribbean", lat: 18.033333, lng: -63.05 },
  { iso2: "sy", iso3: "SYR", num: "760", nombre: "Siria", region: "Asia", subregion: "Western Asia", lat: 35, lng: 38 },
  { iso2: "so", iso3: "SOM", num: "706", nombre: "Somalia", region: "Africa", subregion: "Eastern Africa", lat: 10, lng: 49 },
  { iso2: "lk", iso3: "LKA", num: "144", nombre: "Sri Lanka", region: "Asia", subregion: "Southern Asia", lat: 7, lng: 81 },
  { iso2: "za", iso3: "ZAF", num: "710", nombre: "Sudáfrica", region: "Africa", subregion: "Southern Africa", lat: -29, lng: 24 },
  { iso2: "sd", iso3: "SDN", num: "729", nombre: "Sudán", region: "Africa", subregion: "Northern Africa", lat: 15, lng: 30 },
  { iso2: "ss", iso3: "SSD", num: "728", nombre: "Sudán del Sur", region: "Africa", subregion: "Middle Africa", lat: 7, lng: 30 },
  { iso2: "se", iso3: "SWE", num: "752", nombre: "Suecia", region: "Europe", subregion: "Northern Europe", lat: 62, lng: 15 },
  { iso2: "ch", iso3: "CHE", num: "756", nombre: "Suiza", region: "Europe", subregion: "Western Europe", lat: 47, lng: 8 },
  { iso2: "sr", iso3: "SUR", num: "740", nombre: "Surinam", region: "Americas", subregion: "South America", lat: 4, lng: -56 },
  { iso2: "th", iso3: "THA", num: "764", nombre: "Tailandia", region: "Asia", subregion: "South-Eastern Asia", lat: 15, lng: 100 },
  { iso2: "tw", iso3: "TWN", num: "158", nombre: "Taiwán", region: "Asia", subregion: "Eastern Asia", lat: 23.5, lng: 121 },
  { iso2: "tz", iso3: "TZA", num: "834", nombre: "Tanzania", region: "Africa", subregion: "Eastern Africa", lat: -6, lng: 35 },
  { iso2: "tj", iso3: "TJK", num: "762", nombre: "Tayikistán", region: "Asia", subregion: "Central Asia", lat: 39, lng: 71 },
  { iso2: "io", iso3: "IOT", num: "086", nombre: "Territorio Británico del Océano Índico", region: "Africa", subregion: "Eastern Africa", lat: -6, lng: 71.5 },
  { iso2: "tf", iso3: "ATF", num: "260", nombre: "Tierras Australes y Antárticas Francesas", region: "Antarctic", subregion: "", lat: -49.25, lng: 69.167 },
  { iso2: "tl", iso3: "TLS", num: "626", nombre: "Timor Oriental", region: "Asia", subregion: "South-Eastern Asia", lat: -8.83333333, lng: 125.91666666 },
  { iso2: "tg", iso3: "TGO", num: "768", nombre: "Togo", region: "Africa", subregion: "Western Africa", lat: 8, lng: 1.16666666 },
  { iso2: "to", iso3: "TON", num: "776", nombre: "Tonga", region: "Oceania", subregion: "Polynesia", lat: -20, lng: -175 },
  { iso2: "tt", iso3: "TTO", num: "780", nombre: "Trinidad y Tobago", region: "Americas", subregion: "Caribbean", lat: 11, lng: -61 },
  { iso2: "tm", iso3: "TKM", num: "795", nombre: "Turkmenistán", region: "Asia", subregion: "Central Asia", lat: 40, lng: 60 },
  { iso2: "tr", iso3: "TUR", num: "792", nombre: "Turquía", region: "Asia", subregion: "Western Asia", lat: 39, lng: 35 },
  { iso2: "tv", iso3: "TUV", num: "798", nombre: "Tuvalu", region: "Oceania", subregion: "Polynesia", lat: -8, lng: 178 },
  { iso2: "tn", iso3: "TUN", num: "788", nombre: "Túnez", region: "Africa", subregion: "Northern Africa", lat: 34, lng: 9 },
  { iso2: "ua", iso3: "UKR", num: "804", nombre: "Ucrania", region: "Europe", subregion: "Eastern Europe", lat: 49, lng: 32 },
  { iso2: "ug", iso3: "UGA", num: "800", nombre: "Uganda", region: "Africa", subregion: "Eastern Africa", lat: 1, lng: 32 },
  { iso2: "uy", iso3: "URY", num: "858", nombre: "Uruguay", region: "Americas", subregion: "South America", lat: -33, lng: -56 },
  { iso2: "uz", iso3: "UZB", num: "860", nombre: "Uzbekistán", region: "Asia", subregion: "Central Asia", lat: 41, lng: 64 },
  { iso2: "vu", iso3: "VUT", num: "548", nombre: "Vanuatu", region: "Oceania", subregion: "Melanesia", lat: -16, lng: 167 },
  { iso2: "ve", iso3: "VEN", num: "862", nombre: "Venezuela", region: "Americas", subregion: "South America", lat: 8, lng: -66 },
  { iso2: "vn", iso3: "VNM", num: "704", nombre: "Vietnam", region: "Asia", subregion: "South-Eastern Asia", lat: 16.16666666, lng: 107.83333333 },
  { iso2: "wf", iso3: "WLF", num: "876", nombre: "Wallis y Futuna", region: "Oceania", subregion: "Polynesia", lat: -13.3, lng: -176.2 },
  { iso2: "ye", iso3: "YEM", num: "887", nombre: "Yemen", region: "Asia", subregion: "Western Asia", lat: 15, lng: 48 },
  { iso2: "zm", iso3: "ZMB", num: "894", nombre: "Zambia", region: "Africa", subregion: "Eastern Africa", lat: -15, lng: 30 },
  { iso2: "zw", iso3: "ZWE", num: "716", nombre: "Zimbabue", region: "Africa", subregion: "Eastern Africa", lat: -20, lng: 30 },
];

/** Índices O(1) por cada una de las tres claves — se construyen una vez. */
export const POR_ISO2 = new Map(PAISES_GEO.map((p) => [p.iso2, p]));
export const POR_ISO3 = new Map(PAISES_GEO.map((p) => [p.iso3, p]));
export const POR_NUM = new Map(PAISES_GEO.map((p) => [p.num, p]));

/** El país de una feature de Natural Earth (su `id` es el numérico ISO). */
export function paisDeFeature(id: string | number | undefined | null): PaisGeo | null {
  if (id === undefined || id === null) return null;
  const num = String(id).padStart(3, "0");
  return POR_NUM.get(num) ?? null;
}

/** Buscador por nombre en español, sin acentos ni mayúsculas (para el buscador del mapa). */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buscarPaises(consulta: string, limite = 8): PaisGeo[] {
  const q = normalizar(consulta);
  if (q.length < 2) return [];
  const empiezan: PaisGeo[] = [];
  const contienen: PaisGeo[] = [];
  for (const p of PAISES_GEO) {
    const n = normalizar(p.nombre);
    if (n.startsWith(q)) empiezan.push(p);
    else if (n.includes(q)) contienen.push(p);
    if (empiezan.length >= limite) break;
  }
  return [...empiezan, ...contienen].slice(0, limite);
}

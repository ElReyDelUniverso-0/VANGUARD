// ============================================================
// CENSO MAESTRO DE LAS 100 PLATAFORMAS GLOBALES DE REFERENCIA (v423.0)
//
// Mapeo exhaustivo de 100 plataformas líderes de análisis geopolítico,
// OSINT, seguimiento cinético, modelado macro y telemetría global.
// ============================================================

export interface PlataformaReferencia {
  id: string;
  nombre: string;
  categoria:
    | "osint_cinetico"
    | "satelital_espacial"
    | "macro_financiero"
    | "defensa_orden_batalla"
    | "geoint_maritimo_aereo"
    | "modelado_predictivo"
    | "ciber_infraestructura"
    | "diplomacia_tratados";
  paisOrigen: string;
  urlReferencia: string;
  enfoqueClave: string;
  analogiaVanguard: string;
}

export const PLATAFORMAS_100: PlataformaReferencia[] = [
  // 1. OSINT Cinético & Conflictos
  { id: "liveuamap", nombre: "Liveuamap", categoria: "osint_cinetico", paisOrigen: "Ucrania", urlReferencia: "https://liveuamap.com", enfoqueClave: "Mapeo georreferenciado de incidentes en tiempo real", analogiaVanguard: "/guerra-hoy y /en-vivo" },
  { id: "acled", nombre: "ACLED Data", categoria: "osint_cinetico", paisOrigen: "EE.UU. / Global", urlReferencia: "https://acleddata.com", enfoqueClave: "Base de datos empírica de eventos violentos y protestas", analogiaVanguard: "/conflictos y /datos-mundiales" },
  { id: "isw", nombre: "Institute for the Study of War (ISW)", categoria: "osint_cinetico", paisOrigen: "EE.UU.", urlReferencia: "https://understandingwar.org", enfoqueClave: "Evaluaciones diarias de teatros de operaciones militares", analogiaVanguard: "/cronica y /editorial" },
  { id: "bellingcat", nombre: "Bellingcat", categoria: "osint_cinetico", paisOrigen: "Países Bajos", urlReferencia: "https://bellingcat.com", enfoqueClave: "Investigación forense por satélite y redes abiertas", analogiaVanguard: "/investigacion y /verdad-cruda" },
  { id: "oryx", nombre: "Oryxspioenkop", categoria: "osint_cinetico", paisOrigen: "Alemania / Global", urlReferencia: "https://oryxspioenkop.com", enfoqueClave: "Pérdidas de material bélico verificadas fotográficamente", analogiaVanguard: "/armeria y /verdad-cruda" },
  { id: "critical-threats", nombre: "Critical Threats Project (AEI)", categoria: "osint_cinetico", paisOrigen: "EE.UU.", urlReferencia: "https://criticalthreats.org", enfoqueClave: "Monitoreo de insurgencias y amenazas en Oriente Medio y África", analogiaVanguard: "/regiones y /conflictos" },
  { id: "crisis-group", nombre: "International Crisis Group", categoria: "osint_cinetico", paisOrigen: "Bélgica", urlReferencia: "https://crisisgroup.org", enfoqueClave: "Alertas tempranas y análisis preventivo de conflictos", analogiaVanguard: "/centinela y /vertigo" },
  { id: "syrian-observatory", nombre: "SOHR", categoria: "osint_cinetico", paisOrigen: "Reino Unido / Siria", urlReferencia: "https://syriahr.com", enfoqueClave: "Red de informantes sobre bajas y ataques locales", analogiaVanguard: "/cronica" },
  { id: "ucdp", nombre: "Uppsala Conflict Data Program (UCDP)", categoria: "osint_cinetico", paisOrigen: "Suecia", urlReferencia: "https://ucdp.uu.se", enfoqueClave: "Registro histórico de conflictos armados desde 1946", analogiaVanguard: "/historia y /archivo-mundial" },
  { id: "intel-sky", nombre: "IntelSky", categoria: "osint_cinetico", paisOrigen: "Global", urlReferencia: "https://intelsky.net", enfoqueClave: "Seguimiento de incidentes aéreos en zonas calientes", analogiaVanguard: "/espacio y /en-vivo" },
  { id: "deepstate-ua", nombre: "DeepStateMap.Live", categoria: "osint_cinetico", paisOrigen: "Ucrania", urlReferencia: "https://deepstatemap.live", enfoqueClave: "Líneas de contacto y zonas grises actualizadas a diario", analogiaVanguard: "/zona-cero y /ver-guerra" },
  { id: "soar-earth", nombre: "Soar.Earth", categoria: "osint_cinetico", paisOrigen: "Australia", urlReferencia: "https://soar.earth", enfoqueClave: "Mapeo comunitario de fuentes satelitales y drones", analogiaVanguard: "/mapas" },

  // 2. Satelital & Espacial
  { id: "sentinel-hub", nombre: "Copernicus Sentinel Hub", categoria: "satelital_espacial", paisOrigen: "Unión Europea", urlReferencia: "https://browser.dataspace.copernicus.eu", enfoqueClave: "Imágenes multiespectrales ópticas y radar SAR", analogiaVanguard: "/espacio y /mapas" },
  { id: "planet-labs", nombre: "Planet Labs Insights", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://planet.com", enfoqueClave: "Monitoreo orbital diario a escala planetaria de 3 metros", analogiaVanguard: "/mundo" },
  { id: "nasa-firms", nombre: "NASA FIRMS", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://firms.modaps.eosdis.nasa.gov", enfoqueClave: "Anomalías térmicas para detección de fuegos e incendios cinéticos", analogiaVanguard: "/datos y /pulso-mundial" },
  { id: "maxar-geoint", nombre: "Maxar Geospatial", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://maxar.com", enfoqueClave: "Alta resolución sub-métrica para evaluación de daños de combate", analogiaVanguard: "/investigacion" },
  { id: "capella-space", nombre: "Capella Space SAR", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://capellaspace.com", enfoqueClave: "Radar de apertura sintética nocturna y a través de nubes", analogiaVanguard: "/espia" },
  { id: "n2yo", nombre: "N2YO Satellite Tracker", categoria: "satelital_espacial", paisOrigen: "Global", urlReferencia: "https://n2yo.com", enfoqueClave: "Órbitas en tiempo real y pases de satélites espía y comerciales", analogiaVanguard: "/espacio y /teatro-3d" },
  { id: "space-track", nombre: "Space-Track (US Space Command)", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://space-track.org", enfoqueClave: "Catálogo de elementos orbitales TLE y basura espacial", analogiaVanguard: "/espacio" },
  { id: "esa-earth", nombre: "ESA Earth Online", categoria: "satelital_espacial", paisOrigen: "Europa", urlReferencia: "https://earth.esa.int", enfoqueClave: "Ciencia climática, criosfera y modelos de elevación", analogiaVanguard: "/ciencia y /tierra" },
  { id: "descartes-labs", nombre: "Descartes Labs", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://descarteslabs.com", enfoqueClave: "Plataforma geoespacial basada en modelos predictivos", analogiaVanguard: "/datos" },
  { id: "celes-trak", nombre: "CelesTrak", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://celestrak.org", enfoqueClave: "Parámetros orbitales y efemérides analíticas abiertas", analogiaVanguard: "/espacio" },
  { id: "blacksky", nombre: "BlackSky Spectra", categoria: "satelital_espacial", paisOrigen: "EE.UU.", urlReferencia: "https://blacksky.com", enfoqueClave: "Inteligencia táctica de satélites pequeños con baja latencia", analogiaVanguard: "/centinela" },
  { id: "geointel-hub", nombre: "EO Browser", categoria: "satelital_espacial", paisOrigen: "Alemania", urlReferencia: "https://apps.sentinel-hub.com/eo-browser", enfoqueClave: "Comparador de firmas espectrales infrarrojas", analogiaVanguard: "/mapas" },

  // 3. GEOINT Marítimo & Aéreo
  { id: "marinetraffic", nombre: "MarineTraffic", categoria: "geoint_maritimo_aereo", paisOrigen: "Grecia / Global", urlReferencia: "https://marinetraffic.com", enfoqueClave: "AIS de buques mercantes, petroleros y rutas de cabotaje", analogiaVanguard: "/datos y /mapas" },
  { id: "flightradar24", nombre: "Flightradar24", categoria: "geoint_maritimo_aereo", paisOrigen: "Suecia", urlReferencia: "https://flightradar24.com", enfoqueClave: "ADS-B en vivo de tráfico comercial y repostadores", analogiaVanguard: "/datos y /espacio" },
  { id: "adsb-exchange", nombre: "ADS-B Exchange", categoria: "geoint_maritimo_aereo", paisOrigen: "EE.UU.", urlReferencia: "https://adsbexchange.com", enfoqueClave: "Tráfico de aviones militares sin censura ni filtrado comercial", analogiaVanguard: "/armeria y /espia" },
  { id: "vesselfinder", nombre: "VesselFinder", categoria: "geoint_maritimo_aereo", paisOrigen: "Bulgaria", urlReferencia: "https://vesselfinder.com", enfoqueClave: "Posicionamiento satelital de flotas y petroleros", analogiaVanguard: "/datos" },
  { id: "fleetmon", nombre: "FleetMon", categoria: "geoint_maritimo_aereo", paisOrigen: "Alemania", urlReferencia: "https://fleetmon.com", enfoqueClave: "Análisis de congestión en chokepoints navales estratégicos", analogiaVanguard: "/regiones" },
  { id: "radarbox", nombre: "RadarBox", categoria: "geoint_maritimo_aereo", paisOrigen: "EE.UU.", urlReferencia: "https://radarbox.com", enfoqueClave: "Red terrestre y satelital de telemetría aeronáutica", analogiaVanguard: "/datos" },
  { id: "tankertrackers", nombre: "TankerTrackers", categoria: "geoint_maritimo_aereo", paisOrigen: "Suecia", urlReferencia: "https://tankertrackers.com", enfoqueClave: "Rastreo de buques fantasmas y exportaciones de crudo sancionado", analogiaVanguard: "/divisas y /servicios" },
  { id: "global-fishing-watch", nombre: "Global Fishing Watch", categoria: "geoint_maritimo_aereo", paisOrigen: "Internacional", urlReferencia: "https://globalfishingwatch.org", enfoqueClave: "Pesca ilegal y presencia de milicias marítimas en ZEE", analogiaVanguard: "/mapas y /planeta" },
  { id: "opensky-network", nombre: "The OpenSky Network", categoria: "geoint_maritimo_aereo", paisOrigen: "Suiza", urlReferencia: "https://opensky-network.org", enfoqueClave: "Conjunto de datos abiertos ADS-B para investigación académica", analogiaVanguard: "/academia y /ciencia" },
  { id: "shipmap-org", nombre: "Shipmap.org", categoria: "geoint_maritimo_aereo", paisOrigen: "Reino Unido", urlReferencia: "https://shipmap.org", enfoqueClave: "Visualización animada del flujo del comercio marítimo mundial", analogiaVanguard: "/mundo y /tierra" },
  { id: "windy", nombre: "Windy.com", categoria: "geoint_maritimo_aereo", paisOrigen: "República Checa", urlReferencia: "https://windy.com", enfoqueClave: "Capas de vientos, presión de frentes meteorológicos y oleaje", analogiaVanguard: "/mapas" },
  { id: "lightningmaps", nombre: "LightningMaps.org", categoria: "geoint_maritimo_aereo", paisOrigen: "Alemania", urlReferencia: "https://lightningmaps.org", enfoqueClave: "Red comunitaria de descargas atmosféricas con baja latencia", analogiaVanguard: "/datos" },

  // 4. Macroeconomía & Finanzas Geopolíticas
  { id: "world-bank-data", nombre: "Banco Mundial Open Data", categoria: "macro_financiero", paisOrigen: "Global", urlReferencia: "https://data.worldbank.org", enfoqueClave: "Series temporales de PIB, deuda externa, demografía y salud", analogiaVanguard: "/datos-mundiales y /demografia" },
  { id: "imf-elibrary", nombre: "Fondo Monetario Internacional (FMI)", categoria: "macro_financiero", paisOrigen: "Global", urlReferencia: "https://imf.org/data", enfoqueClave: "Perspectivas de la economía mundial y balanzas de pagos", analogiaVanguard: "/divisas y /rankings" },
  { id: "bis-stats", nombre: "Bank for International Settlements (BIS)", categoria: "macro_financiero", paisOrigen: "Suiza", urlReferencia: "https://bis.org/statistics", enfoqueClave: "Banca central, tipos de cambio y derivados financieros", analogiaVanguard: "/divisas" },
  { id: "oecd-data", nombre: "OECD Data Portal", categoria: "macro_financiero", paisOrigen: "Francia", urlReferencia: "https://data.oecd.org", enfoqueClave: "Indicadores compuestos líderes y productividad comparada", analogiaVanguard: "/comparador" },
  { id: "trading-economics", nombre: "Trading Economics", categoria: "macro_financiero", paisOrigen: "EE.UU.", urlReferencia: "https://tradingeconomics.com", enfoqueClave: "Tipos de interés, inflación y rendimientos de bonos a 10 años", analogiaVanguard: "/divisas y /pulso-mundial" },
  { id: "atlas-economic-complexity", nombre: "Atlas of Economic Complexity (Harvard)", categoria: "macro_financiero", paisOrigen: "EE.UU.", urlReferencia: "https://atlas.cid.harvard.edu", enfoqueClave: "Espacio de productos y resiliencia de la canasta exportadora", analogiaVanguard: "/conocimiento y /organizaciones" },
  { id: "un-comtrade", nombre: "UN Comtrade", categoria: "macro_financiero", paisOrigen: "ONU", urlReferencia: "https://comtradeplus.un.org", enfoqueClave: "Estadísticas detalladas de importación y exportación de bienes", analogiaVanguard: "/datos-mundiales" },
  { id: "wto-stats", nombre: "OMC Statistics Portal", categoria: "macro_financiero", paisOrigen: "Suiza", urlReferencia: "https://stats.wto.org", enfoqueClave: "Aranceles globales, barreras técnicas y disputas comerciales", analogiaVanguard: "/organizaciones" },
  { id: "fred-stlouis", nombre: "FRED St. Louis Federal Reserve", categoria: "macro_financiero", paisOrigen: "EE.UU.", urlReferencia: "https://fred.stlouisfed.org", enfoqueClave: "Series macroeconómicas de alta fidelidad y liquidez global", analogiaVanguard: "/datos" },
  { id: "iif-data", nombre: "Institute of International Finance (IIF)", categoria: "macro_financiero", paisOrigen: "EE.UU.", urlReferencia: "https://iif.com", enfoqueClave: "Rastreo de deuda soberana y flujos de capital hacia emergentes", analogiaVanguard: "/divisas" },
  { id: "bloomberg-terminal", nombre: "Bloomberg Intelligence Index", categoria: "macro_financiero", paisOrigen: "EE.UU.", urlReferencia: "https://bloomberg.com", enfoqueClave: "Precios de materias primas críticas (uranio, litio, gas TTF)", analogiaVanguard: "/pulso-mundial" },
  { id: "eia-energy", nombre: "EIA Energy Information Administration", categoria: "macro_financiero", paisOrigen: "EE.UU.", urlReferencia: "https://eia.gov", enfoqueClave: "Reservas estratégicas de petróleo e infraestructura de refinación", analogiaVanguard: "/infraestructura" },

  // 5. Defensa & Orden de Batalla
  { id: "sipri", nombre: "SIPRI Arms & Military Expenditure", categoria: "defensa_orden_batalla", paisOrigen: "Suecia", urlReferencia: "https://sipri.org", enfoqueClave: "Transferencias internacionales de armas y gasto militar anual", analogiaVanguard: "/armeria y /verdad-cruda" },
  { id: "iiss-military-balance", nombre: "IISS Military Balance+", categoria: "defensa_orden_batalla", paisOrigen: "Reino Unido", urlReferencia: "https://iiss.org", enfoqueClave: "Inventarios de equipo bélico y tropas por estado soberano", analogiaVanguard: "/armeria y /sala/warsim" },
  { id: "global-firepower", nombre: "Global Firepower (GFP)", categoria: "defensa_orden_batalla", paisOrigen: "EE.UU.", urlReferencia: "https://globalfirepower.com", enfoqueClave: "Índice PwrIndx de fuerza convencional comparativa", analogiaVanguard: "/rankings y /comparador" },
  { id: "janes-defence", nombre: "Janes Information Services", categoria: "defensa_orden_batalla", paisOrigen: "Reino Unido", urlReferencia: "https://janes.com", enfoqueClave: "Especificaciones técnicas de blindados, radares y misiles", analogiaVanguard: "/armeria" },
  { id: "csis-missile-threat", nombre: "CSIS Missile Threat", categoria: "defensa_orden_batalla", paisOrigen: "EE.UU.", urlReferencia: "https://missilethreat.csis.org", enfoqueClave: "Sistemas de defensa antiaérea y balística intercontinental", analogiaVanguard: "/armeria y /espia" },
  { id: "fas-nuclear-notebook", nombre: "Federation of American Scientists (FAS)", categoria: "defensa_orden_batalla", paisOrigen: "EE.UU.", urlReferencia: "https://fas.org", enfoqueClave: "Estimación de cabezas nucleares desplegadas y en reserva", analogiaVanguard: "/armeria y /secretos" },
  { id: "arms-control-assoc", nombre: "Arms Control Association", categoria: "defensa_orden_batalla", paisOrigen: "EE.UU.", urlReferencia: "https://armscontrol.org", enfoqueClave: "Tratados de no proliferación (START, INF, TNP)", analogiaVanguard: "/organizaciones" },
  { id: "defence-iq", nombre: "Defence IQ", categoria: "defensa_orden_batalla", paisOrigen: "Reino Unido", urlReferencia: "https://defenceiq.com", enfoqueClave: "Tendencias de adquisición de sistemas no tripulados", analogiaVanguard: "/ciencia" },
  { id: "shephard-media", nombre: "Shephard Defence Insight", categoria: "defensa_orden_batalla", paisOrigen: "Reino Unido", urlReferencia: "https://shephardmedia.com", enfoqueClave: "Mercado y pedidos de vehículos de combate y helicópteros", analogiaVanguard: "/armeria" },
  { id: "naval-analyses", nombre: "Naval Analyses", categoria: "defensa_orden_batalla", paisOrigen: "Grecia", urlReferencia: "https://navalanalyses.com", enfoqueClave: "Infografías y siluetas de flotas navales de combate", analogiaVanguard: "/armeria" },
  { id: "c4isrnet", nombre: "C4ISRNET", categoria: "defensa_orden_batalla", paisOrigen: "EE.UU.", urlReferencia: "https://c4isrnet.com", enfoqueClave: "Guerra electrónica, satélites militares e inteligencia de redes", analogiaVanguard: "/escudo y /espia" },
  { id: "war-on-the-rocks", nombre: "War on the Rocks", categoria: "defensa_orden_batalla", paisOrigen: "EE.UU.", urlReferencia: "https://warontherocks.com", enfoqueClave: "Estrategia operacional escrita por oficiales e investigadores", analogiaVanguard: "/editorial" },

  // 6. Modelado Predictivo & Superforecasting
  { id: "metaculus", nombre: "Metaculus", categoria: "modelado_predictivo", paisOrigen: "Global", urlReferencia: "https://metaculus.com", enfoqueClave: "Pronósticos probabilísticos calibrados con Brier score", analogiaVanguard: "/sala/warsim y /escenarios" },
  { id: "good-judgment", nombre: "Good Judgment Open", categoria: "modelado_predictivo", paisOrigen: "EE.UU.", urlReferencia: "https://gjopen.com", enfoqueClave: "Metodología de Superforecasting de Tetlock aplicada a crisis", analogiaVanguard: "/escenarios" },
  { id: "manifold-markets", nombre: "Manifold Markets", categoria: "modelado_predictivo", paisOrigen: "EE.UU.", urlReferencia: "https://manifold.markets", enfoqueClave: "Mercados de predicción de código abierto para eventos globales", analogiaVanguard: "/cuartel" },
  { id: "polymarket", nombre: "Polymarket", categoria: "modelado_predictivo", paisOrigen: "EE.UU. / Global", urlReferencia: "https://polymarket.com", enfoqueClave: "Probabilidades implícitas en mercados financieros en cadena", analogiaVanguard: "/pulso-mundial" },
  { id: "swift-centre", nombre: "Swift Centre for Applied Prediction", categoria: "modelado_predictivo", paisOrigen: "Reino Unido", urlReferencia: "https://swiftcentre.org", enfoqueClave: "Pronósticos geopolíticos rigurosos para tomadores de decisiones", analogiaVanguard: "/investigacion" },
  { id: "our-world-in-data", nombre: "Our World in Data (Oxford)", categoria: "modelado_predictivo", paisOrigen: "Reino Unido", urlReferencia: "https://ourworldindata.org", enfoqueClave: "Tendencias a largo plazo de pobreza, energía y guerras", analogiaVanguard: "/demografia y /ciencia" },
  { id: "gapminder", nombre: "Gapminder (Hans Rosling Foundation)", categoria: "modelado_predictivo", paisOrigen: "Suecia", urlReferencia: "https://gapminder.org", enfoqueClave: "Desmontaje de mitos con datos de desarrollo humano", analogiaVanguard: "/conocimiento y /academia" },
  { id: "future-of-humanity", nombre: "Future of Humanity Institute (FHI)", categoria: "modelado_predictivo", paisOrigen: "Reino Unido", urlReferencia: "https://fhi.ox.ac.uk", enfoqueClave: "Riesgos existenciales y modelado de catástrofes globales", analogiaVanguard: "/resiliencia y /ciencia" },
  { id: "rand-corporation", nombre: "RAND Corporation Modeling", categoria: "modelado_predictivo", paisOrigen: "EE.UU.", urlReferencia: "https://rand.org", enfoqueClave: "Juegos de guerra y análisis sistémico de contingencias", analogiaVanguard: "/escenarios" },
  { id: "cset-georgetown", nombre: "CSET Georgetown", categoria: "modelado_predictivo", paisOrigen: "EE.UU.", urlReferencia: "https://cset.georgetown.edu", enfoqueClave: "Modelos de talento e inversión en chips e inteligencia artificial", analogiaVanguard: "/ciencia" },
  { id: "carnegie-endowment", nombre: "Carnegie Endowment for International Peace", categoria: "modelado_predictivo", paisOrigen: "EE.UU.", urlReferencia: "https://carnegieendowment.org", enfoqueClave: "Estrategias de disuasión y estabilidad estratégica nuclear", analogiaVanguard: "/editorial" },
  { id: "stimson-center", nombre: "Stimson Center", categoria: "modelado_predictivo", paisOrigen: "EE.UU.", urlReferencia: "https://stimson.org", enfoqueClave: "Monitoreo de cuencas de ríos (Mekong Dam Monitor) y seguridad", analogiaVanguard: "/planeta" },

  // 7. Ciberseguridad & Infraestructura Crítica
  { id: "submarine-cable-map", nombre: "Submarine Cable Map (TeleGeography)", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://submarinecablemap.com", enfoqueClave: "Red mundial de cables submarinos de fibra óptica", analogiaVanguard: "/infraestructura y /mapas" },
  { id: "internet-outage-oracle", nombre: "NetBlocks Internet Outages", categoria: "ciber_infraestructura", paisOrigen: "Reino Unido", urlReferencia: "https://netblocks.org", enfoqueClave: "Cortes deliberados de internet por regímenes y ataques cinéticos", analogiaVanguard: "/escudo y /datos" },
  { id: "bgpview", nombre: "BGPView", categoria: "ciber_infraestructura", paisOrigen: "Global", urlReferencia: "https://bgpview.io", enfoqueClave: "Rutas de enrutamiento autónomo BGP y secuestros de prefijos", analogiaVanguard: "/infraestructura" },
  { id: "shodan", nombre: "Shodan", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://shodan.io", enfoqueClave: "Motor de búsqueda para dispositivos SCADA e IoT expuestos", analogiaVanguard: "/escudo y /espia" },
  { id: "censys", nombre: "Censys Search", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://censys.io", enfoqueClave: "Superficie de ataque en internet y certificados de host", analogiaVanguard: "/escudo" },
  { id: "virustotal", nombre: "VirusTotal (Chronicle)", categoria: "ciber_infraestructura", paisOrigen: "España / EE.UU.", urlReferencia: "https://virustotal.com", enfoqueClave: "Firmas de amenazas y atribución de APTs estatales", analogiaVanguard: "/servicios y /escudo" },
  { id: "talos-intelligence", nombre: "Cisco Talos Intelligence", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://talosintelligence.com", enfoqueClave: "Vectores de propagación de malware y spam geolocalizado", analogiaVanguard: "/escudo" },
  { id: "mandiant-threat", nombre: "Mandiant Advantage", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://mandiant.com", enfoqueClave: "Informes de espionaje cibernético militar (Rusia, China, Irán)", analogiaVanguard: "/servicios" },
  { id: "crowdstrike-adversary", nombre: "CrowdStrike Adversary Universe", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://adversary.crowdstrike.com", enfoqueClave: "Perfiles de grupos APT: Fancy Bear, Lazarus, Volt Typhoon", analogiaVanguard: "/servicios y /secretos" },
  { id: "global-grid-map", nombre: "OpenGridMap", categoria: "ciber_infraestructura", paisOrigen: "Alemania", urlReferencia: "https://opengridmap.com", enfoqueClave: "Redes de transmisión eléctrica y subestaciones de alto voltaje", analogiaVanguard: "/infraestructura" },
  { id: "pipeline-data", nombre: "Global Energy Monitor (GEM Pipelines)", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://globalenergymonitor.org", enfoqueClave: "Gasoductos, oleoductos y terminales GNL en el mundo", analogiaVanguard: "/infraestructura" },
  { id: "cloudflare-radar", nombre: "Cloudflare Radar", categoria: "ciber_infraestructura", paisOrigen: "EE.UU.", urlReferencia: "https://radar.cloudflare.com", enfoqueClave: "Patrones de tráfico de internet, ataques DDoS e interrupciones", analogiaVanguard: "/pulso-mundial" },

  // 8. Diplomacia, Tratados & Ley Internacional
  { id: "icj-cij", nombre: "Corte Internacional de Justicia (CIJ)", categoria: "diplomacia_tratados", paisOrigen: "Países Bajos", urlReferencia: "https://icj-cij.org", enfoqueClave: "Fallos de disputas territoriales y de delimitación marítima", analogiaVanguard: "/organizaciones y /mundos" },
  { id: "icc-cpi", nombre: "Corte Penal Internacional (CPI)", categoria: "diplomacia_tratados", paisOrigen: "Países Bajos", urlReferencia: "https://icc-cpi.int", enfoqueClave: "Órdenes de captura por crímenes de guerra y lesa humanidad", analogiaVanguard: "/verdad-cruda" },
  { id: "un-treaty-collection", nombre: "Colección de Tratados de la ONU (UNTC)", categoria: "diplomacia_tratados", paisOrigen: "ONU", urlReferencia: "https://treaties.un.org", enfoqueClave: "Textos y firmas de convenciones multilaterales", analogiaVanguard: "/organizaciones" },
  { id: "un-security-council", nombre: "Resoluciones del Consejo de Seguridad de la ONU", categoria: "diplomacia_tratados", paisOrigen: "ONU", urlReferencia: "https://un.org/securitycouncil", enfoqueClave: "Sanciones, mandatos de cascos azules y vetos de potencias", analogiaVanguard: "/organizaciones y /rostros" },
  { id: "osce-polcom", nombre: "OSCE Documents & Decisions", categoria: "diplomacia_tratados", paisOrigen: "Austria", urlReferencia: "https://osce.org", enfoqueClave: "Medidas de fomento de la confianza y misiones de observación", analogiaVanguard: "/organizaciones" },
  { id: "nato-declass", nombre: "NATO Archives Online", categoria: "diplomacia_tratados", paisOrigen: "Bélgica", urlReferencia: "https://nato.int/cps/en/natohq/declassified.htm", enfoqueClave: "Documentos desclasificados y doctrina del Artículo 5", analogiaVanguard: "/organizaciones y /secretos" },
  { id: "eu-sanctions-map", nombre: "EU Sanctions Map", categoria: "diplomacia_tratados", paisOrigen: "Unión Europea", urlReferencia: "https://sanctionsmap.eu", enfoqueClave: "Regímenes de sanciones económicas y personas congeladas", analogiaVanguard: "/divisas y /rostros" },
  { id: "us-ofac-sdn", nombre: "US Treasury OFAC Sanctions List", categoria: "diplomacia_tratados", paisOrigen: "EE.UU.", urlReferencia: "https://ofac.treasury.gov", enfoqueClave: "Lista SDN de terrorismo global, narcotráfico y evasión", analogiaVanguard: "/servicios y /divisas" },
  { id: "iaea-pris", nombre: "IAEA Power Reactor Information System (PRIS)", categoria: "diplomacia_tratados", paisOrigen: "Austria", urlReferencia: "https://pris.iaea.org", enfoqueClave: "Monitoreo de reactores nucleares civiles y salvaguardias", analogiaVanguard: "/infraestructura y /ciencia" },
  { id: "who-disease-outbreak", nombre: "WHO Disease Outbreak News (DONs)", categoria: "diplomacia_tratados", paisOrigen: "Suiza", urlReferencia: "https://who.int/emergencies/disease-outbreak-news", enfoqueClave: "Alertas epidemiológicas y bioamenazas transfronterizas", analogiaVanguard: "/resiliencia" },
  { id: "ilo-normlex", nombre: "ILO NORMLEX", categoria: "diplomacia_tratados", paisOrigen: "Suiza", urlReferencia: "https://ilo.org/normlex", enfoqueClave: "Estándares y ratificaciones laborales internacionales", analogiaVanguard: "/organizaciones" },
  { id: "wipo-lex", nombre: "WIPO Lex", categoria: "diplomacia_tratados", paisOrigen: "Suiza", urlReferencia: "https://wipolex.wipo.int", enfoqueClave: "Leyes y tratados de propiedad intelectual e invención técnica", analogiaVanguard: "/ciencia" },
  { id: "chatham-house", nombre: "Chatham House (RIIA)", categoria: "diplomacia_tratados", paisOrigen: "Reino Unido", urlReferencia: "https://chathamhouse.org", enfoqueClave: "Regla Chatham House para debates francos y diplomacia de vía 2", analogiaVanguard: "/editorial" },
  { id: "cfr-org", nombre: "Council on Foreign Relations (CFR)", categoria: "diplomacia_tratados", paisOrigen: "EE.UU.", urlReferencia: "https://cfr.org", enfoqueClave: "Global Conflict Tracker y análisis de política exterior de EE.UU.", analogiaVanguard: "/conflictos" },
  { id: "valdai-club", nombre: "Valdai Discussion Club", categoria: "diplomacia_tratados", paisOrigen: "Rusia", urlReferencia: "https://valdaiclub.com", enfoqueClave: "Perspectivas multipolares y discursos doctrinales de Eurasia", analogiaVanguard: "/editorial" },
  { id: "ciis-china", nombre: "CIIS China Institute of International Studies", categoria: "diplomacia_tratados", paisOrigen: "China", urlReferencia: "https://ciis.org.cn", enfoqueClave: "Iniciativa de la Franja y la Ruta y doctrina diplomática de Pekín", analogiaVanguard: "/editorial" },
];

export const CATEGORIAS_CENSO: { id: PlataformaReferencia["categoria"]; label: string; icono: string }[] = [
  { id: "osint_cinetico", label: "OSINT Cinético", icono: "⚔️" },
  { id: "satelital_espacial", label: "Satelital & Espacial", icono: "🛰️" },
  { id: "geoint_maritimo_aereo", label: "GEOINT Marítimo & Aéreo", icono: "⚓" },
  { id: "macro_financiero", label: "Macro & Finanzas", icono: "📈" },
  { id: "defensa_orden_batalla", label: "Defensa & Orden de Batalla", icono: "🛡️" },
  { id: "modelado_predictivo", label: "Modelado Predictivo", icono: "🎲" },
  { id: "ciber_infraestructura", label: "Ciber & Redes Críticas", icono: "⚡" },
  { id: "diplomacia_tratados", label: "Diplomacia & Tratados", icono: "📜" },
];

export function obtenerPlataformasPorCategoria(cat?: string): PlataformaReferencia[] {
  if (!cat || cat === "todas") return PLATAFORMAS_100;
  return PLATAFORMAS_100.filter((p) => p.categoria === cat);
}

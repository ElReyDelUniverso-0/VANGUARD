# Atribución y Licencias Abiertas — Assets 3D Reales de VANGUARD

VANGUARD integra exclusivamente modelos `.glb`, entornos HDRI, texturas planetarias y motores geoespaciales reales de código abierto con licencias verificadas.

## Motores Open Source Compilados e Integrados
- **MapLibre GL JS** (`maplibre-gl@^6.13.0`, BSD-3-Clause): Motor cartográfico WebGL 3D con soporte de elevación DEM en tiempo real.
- **Terrarium Global DEM** (AWS Open Data / Mapzen, datos públicos SRTM/ASTER/GEBCO): Malla altimétrica real global.
- **ESRI World Imagery & Carto Basemaps / OpenStreetMap**: Cartografía satelital y nocturna para visualización contextual en vivo.
- **Globe.gl & Three-Globe** (`globe.gl@^2.46.2`, MIT): Globo terrestre WebGL interactivo con topología, atmósfera, arcos y anillos tácticos.
- **Three.js + Postprocessing PBR** (`three@0.185.1`, MIT): `GLTFLoader`, `RGBELoader`, `RoomEnvironment`, `Sky`, `Water`, `EffectComposer`, `UnrealBloomPass`, `OutputPass`, `SkeletonUtils`.

## Modelos 3D `.glb` Locales (`/public/assets/models/`)
- `soldier.glb`, `xbot.glb` — **Three.js Examples** (`mrdoob/three.js`, MIT). Operadores humanos y exoesqueletos articulados con esqueleto (`Idle`, `Walk`, `Run`, `TPose`).
- `damaged-helmet.glb` — **KhronosGroup/glTF-Sample-Assets** (CC-BY 4.0, The Khronos Group / Leonard Daly). Casco de combate PBR con mapas Albedo, Normal, Roughness/Metalness, AO y Emissive.
- `ak47.glb`, `m590a1.glb`, `scout-drone.glb`, `breach-spider.glb`, `recon-tablet.glb` — **ThatsALotOfBees2/gunmodls** (repositorio público Three.js/glTF con mallas nombradas por pieza y clips mecánicos reales).
- `awp-sniper.glb` — **GarbajYT/godot-sniper-rifle** (`AWP.glb`, MIT). Rifle de precisión real.
- `tank.glb` — **Quaternius / JunchenMeteor/tankquest-academy** (CC0 1.0 Public Domain Dedication). Carro de combate principal con casco, orugas, blindaje aplicado, torreta y cañón separados.
- `f15.glb`, `helicopter.glb`, `drone.glb`, `atlas-v.glb`, `cubesat.glb`, `buoy.glb` — **srcejon/sdrangel-3d-models** (CC-BY 4.0): McDonnell Douglas F-15 Eagle (PolyDucky), Helicopter AW101 (Gigantic Burger), S9 Mini Drone (BlueMesh), Atlas V 401 (yuvi45554), Space Club CUBESAT (Tabbs), Buoy (OzzyDan).
- `naval-vessel.glb`, `usv-boat.glb` — **abdulkadrtr/usv-simulation-ros2** (repositorio público ROS2 USV) & **ship-vessel.glb** — **Kenney Watercraft Kit** (CC0 1.0 Public Domain Dedication).
- `jwst.glb` — **NASA 3D Resources** (`nasa/NASA-3D-Resources`, Dominio Público EE. UU. / NASA).

## Entornos HDRI y Texturas Planetarias (`/public/assets/env/`)
- `earth-blue-marble.jpg`, `earth-night.jpg`, `earth-topology.png`, `earth-water.png` — **NASA Visible Earth / Natural Earth** (via `vasturiano/three-globe`, Dominio Público / MIT).
- `studio.hdr` (`ferndale_studio_04_1k.hdr`), `outdoor.hdr` (`quarry_01_1k.hdr`), `waternormals.jpg` — **Poly Haven / Three.js** (CC0 1.0 / MIT).

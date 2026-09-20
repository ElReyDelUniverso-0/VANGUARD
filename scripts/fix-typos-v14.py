#!/usr/bin/env python3
"""v14 — corrección de errores de letra (acentos) en cadenas visibles."""
import pathlib

ROOT = pathlib.Path("/home/z/my-project/src")

FIXES = {
    "lib/game-data.ts": [
        ('question: "Que region disputada es la línea mediana del estrecho de Taiwán?"',
         'question: "¿Qué región disputada marca la línea mediana del estrecho de Taiwán?"'),
        ('"Linea mediana del estrecho"', '"Línea mediana del estrecho"'),
        ('explanation: "La línea mediana es la linea de control informal en el estrecho de Taiwán."',
         'explanation: "La línea mediana es la línea de control informal en el estrecho de Taiwán."'),
        ('question: "Que es la estrategia \'gray zone\' (zona gris)?"',
         'question: "¿Qué es la estrategia \'gray zone\' (zona gris)?"'),
        ('"Negociacion diplomatica"', '"Negociación diplomática"'),
        ('question: "Que mision de paz de la ONU opero en Congo hasta 2024?"',
         'question: "¿Qué misión de paz de la ONU operó en el Congo hasta 2024?"'),
        ('explanation: "MONUSCO (Mision de la ONU en R.D. Congo) comenzo su retirada en 2024 tras 25 anos."',
         'explanation: "MONUSCO (Misión de la ONU en R.D. Congo) comenzó su retirada en 2024 tras 25 años."'),
        ('"Ingresos de camaras x2, 3 gemas diarias, 15% de descuento en camaras y credencial ELITE."',
         '"Ingresos de cámaras x2, 3 gemas diarias, 15% de descuento en cámaras y credencial ELITE."'),
        ('title: "Sabado — Botin del comando"', 'title: "Sábado — Botín del comando"'),
        ('source: "Galeria OSINT"', 'source: "Galería OSINT"'),
        ('¡Foto publicada en la galeria!', '¡Foto publicada en la galería!'),
        ('"Unidades abandonan posicion en formacion dispersa. Equipamiento dejado atras."',
         '"Unidades abandonan posición en formación dispersa. Equipamiento dejado atrás."'),
        ('"Senal de navegacion degradada 80 por ciento durante 12 minutos. Jamming direccional."',
         '"Señal de navegación degradada al 80 por ciento durante 12 minutos. Jamming direccional."'),
        ('"Trabaje en un cruce parecido. Se subestima la logistica de los peajes humanitarios."',
         '"Trabajé en un cruce parecido. Se subestima la logística de los peajes humanitarios."'),
        ('"Serie B = reasignacion logistica. No emocionense, no es primera linea."',
         '"Serie B = reasignación logística. No se emocionen, no es primera línea."'),
        ('"Puerta logistica de Europa. ASML inside."', '"Puerta logística de Europa. ASML inside."'),
        ('"Recorrido de camara sobre una columna de tanques REAL captada por la red OSINT. Identificacion de chasis, orden de marcha y carga logistica."',
         '"Recorrido de cámara sobre una columna de tanques REAL captada por la red OSINT. Identificación de chasis, orden de marcha y carga logística."'),
        ('"Sistema de dron en posicion — imagen real de campo."',
         '"Sistema de dron en posición — imagen real de campo."'),
        ('"Puesto militar en la region del Liptako-Gourma."',
         '"Puesto militar en la región del Liptako-Gourma."'),
        ('"Publica tu primera foto en la galeria."', '"Publica tu primera foto en la galería."'),
        ('"Recauda 2000 monedas con tu red de camaras."', '"Recauda 2000 monedas con tu red de cámaras."'),
        ('"Posicion defensiva en la linea de contacto."', '"Posición defensiva en la línea de contacto."'),
    ],
    "lib/camera-data.ts": [
        ('"Suscripcion de comando: ingresos de camaras x2, 3 gemas diarias reclamables, 15% de descuento en todas las camaras y credito ELITE en tu expediente."',
         '"Suscripción de comando: ingresos de cámaras x2, 3 gemas diarias reclamables, 15% de descuento en todas las cámaras y crédito ELITE en tu expediente."'),
    ],
    "lib/social-data.ts": [
        ('{ label: "Quiz geopolitico", baseVotes: 866 }', '{ label: "Quiz geopolítico", baseVotes: 866 }'),
        ('las camaras del frente oriental', 'las cámaras del frente oriental'),
        ('"[MEGAHILO] Todas las camaras del canal, rankeadas por azar de captura"',
         '"[MEGAHILO] Todas las cámaras del canal, rankeadas por azar de captura"'),
        ('"SALAS SOCIALES (seccion SOCIAL)', '"SALAS SOCIALES (sección SOCIAL)'),
        ('usen la galeria OSINT para geolocalizar el angulo exacto de cada camara',
         'usen la galería OSINT para geolocalizar el ángulo exacto de cada cámara'),
        ('Sincronizamos cuatro camaras de seguridad', 'Sincronizamos cuatro cámaras de seguridad'),
        ('"Tutorial paso a paso: sombras -> angulo solar -> lineas electricas -> vegetacion -> tipografia de senales -> cruce con terreno. Con ejemplos usando las fotos de la galeria de la app. Nivel: principiante."',
         '"Tutorial paso a paso: sombras -> ángulo solar -> líneas eléctricas -> vegetación -> tipografía de señales -> cruce con terreno. Con ejemplos usando las fotos de la galería de la app. Nivel: principiante."'),
    ],
    "lib/age-engine.ts": [
        ('Tu nacion ha sido borrada del mapa', 'Tu nación ha sido borrada del mapa'),
    ],
    "components/vanguard/panels/hooks-panel.tsx": [
        ('` · 1 cajon ${t.free.crate}`', '` · 1 cajón ${t.free.crate}`'),
    ],
    "lib/game-store.ts": [
        ('`+${qty} cajon ${tier} gratuito`', '`+${qty} cajón ${tier} gratuito`'),
    ],
    "components/vanguard/panels/cameras-panel.tsx": [
        ('Ingresos de camaras x2 · ', 'Ingresos de cámaras x2 · '),
        ('% descuento en camaras · credencial de comando', '% descuento en cámaras · credencial de comando'),
    ],
}

total = 0
for rel, pairs in FIXES.items():
    p = ROOT / rel
    s = p.read_text(encoding="utf-8")
    for old, new in pairs:
        if old in s:
            s = s.replace(old, new)
            total += 1
            print(f"OK   {rel}: {old[:58]}...")
        else:
            print(f"SKIP {rel}: {old[:58]}...")
    p.write_text(s, encoding="utf-8")

print(f"\n{total} reemplazos aplicados")

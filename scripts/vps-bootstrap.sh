#!/usr/bin/env bash
# ==================================================================
#  VANGUARD — INSTALADOR AUTOMÁTICO DE SERVIDOR (Ubuntu 22.04/24.04)
#
#  Instala todo y deja la página + multijugador EN LÍNEA con
#  auto-reinicio y HTTPS automático.
#
#  USO (conectado a tu servidor, como usuario normal):
#    bash vps-bootstrap.sh https://github.com/TUUSUARIO/vanguard.git tudominio.com
#
#  - El dominio es OPCIONAL: sin dominio funciona por http://IP-DEL-SERVIDOR
#  - Si no pasas el repo, asume que ya clonaste el código en ~/vanguard
# ==================================================================
set -euo pipefail

REPO="${1:-}"
DOMINIO="${2:-}"
DIR="$HOME/vanguard"

echo "==> 1/7 Instalando paquetes base (git, unzip, caddy)…"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y -qq
sudo apt-get install -y -qq git curl unzip caddy

echo "==> 2/7 Instalando Bun (motor de VANGUARD)…"
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
fi
export PATH="$HOME/.bun/bin:$PATH"

echo "==> 3/7 Descargando el código…"
if [ -n "$REPO" ] && [ ! -d "$DIR" ]; then
  git clone "$REPO" "$DIR"
fi
cd "$DIR"

echo "==> 4/7 Configurando variables de entorno…"
{
  echo "DATABASE_URL=file:$DIR/db/custom.db"
  [ -n "$DOMINIO" ] && echo "NEXT_PUBLIC_SITE_URL=https://$DOMINIO"
} > .env

echo "==> 5/7 Instalando dependencias y compilando (tarda varios minutos)…"
bun install
bunx prisma generate
bun run build

echo "==> 6/7 Creando servicios de arranque automático (systemd)…"
BUN_BIN="$HOME/.bun/bin/bun"
sudo tee /etc/systemd/system/vanguard-web.service > /dev/null <<EOF
[Unit]
Description=VANGUARD web :3000 (supervisor con auto-reinicio)
After=network.target

[Service]
WorkingDirectory=$DIR
ExecStart=$BUN_BIN scripts/serve.mjs --prod
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/vanguard-games.service > /dev/null <<EOF
[Unit]
Description=VANGUARD multijugador en vivo :3003
After=network.target

[Service]
WorkingDirectory=$DIR
ExecStart=$BUN_BIN mini-services/game-service/index.ts
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now vanguard-web vanguard-games

echo "==> 7/7 Configurando Caddy (puertos 80/443 + candado SSL automático)…"
HOSTBLOCK="${DOMINIO:-:80}"
sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
$HOSTBLOCK {
    @transform_port_query {
        query XTransformPort=*
    }
    handle @transform_port_query {
        reverse_proxy localhost:{query.XTransformPort} {
            header_up Host {host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Real-IP {remote_host}
        }
    }
    handle {
        reverse_proxy localhost:3000 {
            header_up Host {host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Real-IP {remote_host}
        }
    }
}
EOF
sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy

# Firewall (si ufw está activo)
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 22/tcp 2>/dev/null || true
  sudo ufw allow 80/tcp 2>/dev/null || true
  sudo ufw allow 443/tcp 2>/dev/null || true
fi

IP=$(curl -s --max-time 5 ifconfig.me || echo "LA-IP-DE-TU-SERVIDOR")
echo ""
echo "=============================================="
echo "   VANGUARD ESTÁ EN LÍNEA"
if [ -n "$DOMINIO" ]; then
  echo "   → https://$DOMINIO"
  echo "   (el candado verde aparece en ~2 minutos;"
  echo "    antes: apunta el DNS del dominio a esta IP: $IP)"
else
  echo "   → http://$IP"
  echo "   (cuando tengas dominio, apúntalo a esta IP con un"
  echo "    registro A y vuelve a correr: bash scripts/vps-bootstrap.sh \"\" tudominio.com)"
fi
echo "   Estado:   systemctl status vanguard-web vanguard-games"
echo "   Actualizar la página: cd $DIR && git pull && bun run build && sudo systemctl restart vanguard-web"
echo "=============================================="

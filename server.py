#!/usr/bin/env python3
"""
Servidor HTTP para la aplicación Cifrado Web.
- Sirve archivos estáticos (HTML, CSS, JS, imágenes).
- Endpoint /api/visita (POST): Registra un visitante en dades.json.
- Endpoint /api/visites (GET): Devuelve el contador y estadísticas en tiempo real.
- Ruta /dades: Muestra el panel visual con la tabla de todos los visitantes registrados.
- Ruta /dades.json: Descarga directamente el archivo JSON con los datos.
"""

import http.server
import socketserver
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime

PORT = 8000
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dades.json")


def comprovar_permisos():
    """Comprova si el servidor té permisos d'escriptura per desar dades."""
    dir_path = os.path.dirname(os.path.abspath(DATA_FILE))
    usuari_execucio = os.getenv("USER") or os.getenv("USERNAME") or "desconegut"

    if not os.access(dir_path, os.W_OK):
        print(f"⚠️  [ALERTA DE PERMISOS]: L'usuari '{usuari_execucio}' no té permís d'escriptura a la carpeta '{dir_path}'!", file=sys.stderr)
        print(f"    👉 Solució al servidor: sudo chown -R {usuari_execucio}:{usuari_execucio} {dir_path}", file=sys.stderr)
        print(f"    👉 Permisos recomanats:  sudo chmod 775 {dir_path}", file=sys.stderr)
        return False
    elif os.path.exists(DATA_FILE) and not os.access(DATA_FILE, os.W_OK):
        print(f"⚠️  [ALERTA DE PERMISOS]: L'usuari '{usuari_execucio}' no pot escriure al fitxer '{DATA_FILE}'!", file=sys.stderr)
        print(f"    👉 Solució al servidor: sudo chown {usuari_execucio}:{usuari_execucio} {DATA_FILE}", file=sys.stderr)
        print(f"    👉 Permisos recomanats:  sudo chmod 664 {DATA_FILE}", file=sys.stderr)
        return False
    return True


def carregar_dades():
    """Carga la lista de visitas desde dades.json."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            contingut = f.read().strip()
            if not contingut:
                return []
            return json.loads(contingut)
    except Exception as e:
        print(f"[Error carregar_dades]: {e}", file=sys.stderr)
        return []


def desar_dades(dades):
    """Guarda la lista de visitas en dades.json de forma segura."""
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(dades, f, ensure_ascii=False, indent=2)
        return True
    except PermissionError as e:
        dir_path = os.path.dirname(os.path.abspath(DATA_FILE))
        print(f"❌ [Error de Permisos a desar_dades]: No es pot escriure a '{DATA_FILE}': {e}", file=sys.stderr)
        print(f"    👉 Executa al servidor: sudo chown -R $USER:$USER {dir_path} && sudo chmod 664 {DATA_FILE}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"❌ [Error desar_dades]: {e}", file=sys.stderr)
        return False


def generar_html_dades(visites):
    """Genera la página HTML del panel /dades con diseño Cyber-Dark."""
    total = len(visites)
    paisos_unics = len(set(v.get("pais", "Desconocido") for v in visites if v.get("pais")))
    usuaris_unics = len(set(v.get("usuari", "Anónimo") for v in visites if v.get("usuari")))
    darrera = visites[-1]["data_hora"] if visites else "Ninguna visita registrada"

    files_html = []
    # Mostramos las visitas de la más reciente a la más antigua
    for i, v in enumerate(reversed(visites), 1):
        idx = total - i + 1
        usuari = v.get("usuari", "Anónimo")
        pais = v.get("pais", "Desconocido")
        regio = v.get("regio", "Desconocida")
        ciutat = v.get("ciutat", "Desconocida")
        data_hora = v.get("data_hora", "-")
        ip = v.get("ip", "127.0.0.1")

        files_html.append(f"""
        <tr>
          <td class="col-num">{idx}</td>
          <td class="col-user"><strong>{usuari}</strong></td>
          <td class="col-pais"><span class="badge-tag">{pais}</span></td>
          <td class="col-geo">{regio}</td>
          <td class="col-geo">{ciutat}</td>
          <td class="col-time code-font">{data_hora}</td>
          <td class="col-meta code-font">{ip}</td>
        </tr>
        """)

    taula_contingut = "\n".join(files_html) if files_html else """
      <tr>
        <td colspan="7" class="empty-state">Aún no se ha registrado ninguna visita.</td>
      </tr>
    """

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#090d16">
  <title>Registro de Visitas (/dades) | Cifrado Web</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <style>
    .dades-container {{
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }}
    .dades-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }}
    .dades-title {{
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
    }}
    .dades-subtitle {{
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.2rem;
    }}
    .metrics-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }}
    .metric-card {{
      background: var(--bg-surface-2);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }}
    .metric-val {{
      font-size: 2rem;
      font-weight: 800;
      color: var(--cyan-neon);
      font-family: 'JetBrains Mono', monospace;
    }}
    .metric-label {{
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .table-card {{
      background: var(--bg-surface-1);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      backdrop-filter: blur(20px);
    }}
    .table-toolbar {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: rgba(0, 0, 0, 0.25);
      border-bottom: 1px solid var(--border-subtle);
      flex-wrap: wrap;
      gap: 0.75rem;
    }}
    .table-wrapper {{
      overflow-x: auto;
    }}
    .custom-table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }}
    .custom-table th {{
      background: rgba(0, 0, 0, 0.4);
      padding: 0.9rem 1.2rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border-subtle);
    }}
    .custom-table td {{
      padding: 1rem 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-main);
    }}
    .custom-table tr:hover td {{
      background: rgba(0, 229, 255, 0.03);
    }}
    .badge-tag {{
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      background: rgba(168, 85, 247, 0.15);
      color: var(--purple-neon);
      border: 1px solid rgba(168, 85, 247, 0.3);
      font-weight: 600;
      font-size: 0.78rem;
    }}
    .empty-state {{
      text-align: center;
      padding: 3rem 1rem !important;
      color: var(--text-dim);
    }}
    .btn-return {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }}
    .live-pulse-dot {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--emerald-neon);
      box-shadow: 0 0 10px var(--emerald-neon);
      display: inline-block;
      margin-right: 0.4rem;
      animation: pulseLive 2s infinite;
    }}
    @keyframes pulseLive {{
      0%, 100% {{ opacity: 1; transform: scale(1); }}
      50% {{ opacity: 0.4; transform: scale(0.85); }}
    }}
  </style>
</head>
<body>
  <div class="glow-orb orb-1"></div>
  <div class="glow-orb orb-2"></div>

  <div class="dades-container">
    <div class="dades-header">
      <div>
        <h1 class="dades-title">Registro de <span class="gradient-text">Visitas</span></h1>
        <p class="dades-subtitle">Datos en tiempo real registrados en el archivo <code>dades.json</code></p>
      </div>
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <a href="/" class="btn btn-secondary btn-return">
          ← Volver a la Web
        </a>
        <a href="/dades.json" download="dades.json" class="btn btn-primary">
          💾 Descargar JSON
        </a>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Total Visitas</span>
        <span class="metric-val">{total}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Visitantes Únicos</span>
        <span class="metric-val">{usuaris_unics}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Países Detectados</span>
        <span class="metric-val">{paisos_unics}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Última Visita</span>
        <span class="metric-val" style="font-size:1.15rem; color:#fff;">{darrera}</span>
      </div>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <div>
          <span class="live-pulse-dot"></span>
          <strong style="color:#fff;">Listado de Visitas en Tiempo Real</strong>
          <span style="color:var(--text-dim); font-size:0.8rem; margin-left:0.5rem;">({total} registros)</span>
        </div>
        <button onclick="location.reload()" class="btn-chip" title="Actualizar">
          🔄 Actualizar Ahora
        </button>
      </div>

      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>País</th>
              <th>Región</th>
              <th>Ciudad</th>
              <th>Fecha y Hora Exacta</th>
              <th>Dirección IP</th>
            </tr>
          </thead>
          <tbody>
            {taula_contingut}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    // Auto-recarga cada 10 segundos para mantener el panel actualizado
    setTimeout(() => location.reload(), 10000);
  </script>
</body>
</html>"""


class CifratgeRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador personalizado de peticiones HTTP."""

    def __init__(self, *args, **kwargs):
        # Asegurar que el directorio base es el del proyecto
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def do_GET(self):
        url_parsed = urllib.parse.urlparse(self.path)
        path = url_parsed.path

        # Ruta 1: /dades -> Tabla interactiva de datos de visitantes
        if path in ("/dades", "/dades/", "/dades.html"):
            visites = carregar_dades()
            html = generar_html_dades(visites)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))
            return

        # Ruta 2: /dades.json -> Descarga directa del archivo JSON
        elif path == "/dades.json":
            visites = carregar_dades()
            json_bytes = json.dumps(visites, ensure_ascii=False, indent=2).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="dades.json"')
            self.end_headers()
            self.wfile.write(json_bytes)
            return

        # Ruta 3: /api/visites -> Devuelve estadísticas y recuento en tiempo real
        elif path == "/api/visites":
            visites = carregar_dades()
            resp = {
                "total_visites": len(visites),
                "ultimes": visites[-10:] if visites else []
            }
            json_bytes = json.dumps(resp, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(json_bytes)
            return

        # Cualquier otro archivo estático (HTML, CSS, JS, etc.)
        return super().do_GET()

    def do_POST(self):
        url_parsed = urllib.parse.urlparse(self.path)
        path = url_parsed.path

        # Ruta 4: /api/visita -> Registra cada nuevo visitante en dades.json
        if path == "/api/visita":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            try:
                body = json.loads(post_data.decode("utf-8")) if post_data else {}
            except Exception:
                body = {}

            # IP del client (compatibilitat directa, Apache mod_proxy, Nginx i Cloudflare)
            client_ip = (
                self.headers.get("CF-Connecting-IP") or
                (self.headers.get("X-Forwarded-For") or "").split(",")[0].strip() or
                self.headers.get("X-Real-IP") or
                self.client_address[0]
            )

            # Fecha y hora exacta
            ara = datetime.now()
            data_hora_formatada = ara.strftime("%Y-%m-%d %H:%M:%S")

            # Metadatos de la visita
            nou_registre = {
                "id": None,
                "usuari": body.get("usuari", f"Visitante-{int(ara.timestamp()) % 10000:04d}"),
                "pais": body.get("pais", "España"),
                "regio": body.get("regio", "Madrid"),
                "ciutat": body.get("ciutat", "Madrid"),
                "data_hora": data_hora_formatada,
                "ip": client_ip,
                "dispositiu": body.get("dispositiu", self.headers.get("User-Agent", "Navegador Web"))
            }

            # Guardar en el archivo dades.json
            visites = carregar_dades()
            nou_registre["id"] = len(visites) + 1
            visites.append(nou_registre)
            exit_guardar = desar_dades(visites)

            if not exit_guardar:
                print(f"❌ [ERROR CRÍTIC]: No s'ha pogut desar la visita a '{DATA_FILE}'. Comprova els permisos d'escriptura!", file=sys.stderr)
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                resp = {
                    "status": "error",
                    "message": f"Error de permisos al servidor: no es pot escriure a '{DATA_FILE}'. Revisa els permisos del fitxer (chown)."
                }
                self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
                return

            resp = {
                "status": "success",
                "message": "Visita registrada correctamente",
                "total_visites": len(visites),
                "registre": nou_registre
            }
            json_bytes = json.dumps(resp, ensure_ascii=False).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json_bytes)
            return

        self.send_error(404, "Ruta no encontrada")

    def do_OPTIONS(self):
        """Permitir CORS si fuera necesario."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def iniciar_servidor():
    """Inicia el servidor HTTP a PORT."""
    # Verificar permisos d'escriptura per a dades.json
    permisos_ok = comprovar_permisos()

    # Inicialitzar dades.json si no existeix
    if not os.path.exists(DATA_FILE):
        if permisos_ok:
            desar_dades([])
        else:
            print(f"⚠️  No s'ha pogut crear '{DATA_FILE}' inicialment a causa dels permisos.", file=sys.stderr)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CifratgeRequestHandler) as httpd:
        usuari = os.getenv("USER") or os.getenv("USERNAME") or "sistema"
        print("=" * 60)
        print("🚀 SERVIDOR WEB DE CIFRADO EN FUNCIONAMIENTO")
        print("=" * 60)
        print(f"👉 Aplicació Web:          http://localhost:{PORT}")
        print(f"👉 Registre de Dades:      http://localhost:{PORT}/dades")
        print(f"👉 Fitxer JSON de dades:   {DATA_FILE}")
        print(f"👉 Usuari del procés:      {usuari}")
        print(f"👉 Estat dels permisos:    {'✅ Lectura/Escriptura OK' if permisos_ok else '❌ SENSE PERMÍS D ESCRIPTURA'}")
        print("=" * 60)
        print("Pulsa Ctrl+C para detener el servidor.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nDeteniendo el servidor. ¡Hasta pronto!")
            httpd.server_close()


if __name__ == "__main__":
    iniciar_servidor()

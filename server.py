#!/usr/bin/env python3
"""
Servidor HTTP per a l'aplicació Cifratge Web.
- Serveix fitxers estàtics (HTML, CSS, JS, imatges).
- Endpoint /api/visita (POST): Registra un visitant a dades.json.
- Endpoint /api/visites (GET): Retorna el comptador i estadístiques en temps real.
- Ruta /dades: Mostra el panell visual amb la taula de tots els visitants registrats.
- Ruta /dades.json: Descarrega directament el fitxer JSON amb les dades.
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


def carregar_dades():
    """Carrega la llista de visites des de dades.json."""
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
    """Guarda la llista de visites a dades.json de forma segura."""
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(dades, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"[Error desar_dades]: {e}", file=sys.stderr)
        return False


def generar_html_dades(visites):
    """Genera la pàgina HTML del panell /dades amb disseny Cyber-Dark."""
    total = len(visites)
    paisos_unics = len(set(v.get("pais", "Desconegut") for v in visites if v.get("pais")))
    usuaris_unics = len(set(v.get("usuari", "Anònim") for v in visites if v.get("usuari")))
    darrera = visites[-1]["data_hora"] if visites else "Cap visita registrada"

    files_html = []
    # Mostrem les visites de la més recent a la més antiga
    for i, v in enumerate(reversed(visites), 1):
        idx = total - i + 1
        usuari = v.get("usuari", "Anònim")
        pais = v.get("pais", "Desconegut")
        regio = v.get("regio", "Desconeguda")
        ciutat = v.get("ciutat", "Desconeguda")
        data_hora = v.get("data_hora", "-")
        ip = v.get("ip", "127.0.0.1")
        dispositiu = v.get("dispositiu", "-")

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
        <td colspan="7" class="empty-state">Encara no s'ha registrat cap visita.</td>
      </tr>
    """

    return f"""<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#090d16">
  <title>Registre de Visites (/dades) | Cifratge Web</title>
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
        <h1 class="dades-title">Registre de <span class="gradient-text">Visites</span></h1>
        <p class="dades-subtitle">Dades en temps real enregistrades al fitxer <code>dades.json</code></p>
      </div>
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <a href="/" class="btn btn-secondary btn-return">
          ← Tornar a la Web
        </a>
        <a href="/dades.json" download="dades.json" class="btn btn-primary">
          💾 Descarregar JSON
        </a>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Total Visites</span>
        <span class="metric-val">{total}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Visitants Únics</span>
        <span class="metric-val">{usuaris_unics}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Països Detectats</span>
        <span class="metric-val">{paisos_unics}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Darrera Visita</span>
        <span class="metric-val" style="font-size:1.15rem; color:#fff;">{darrera}</span>
      </div>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <div>
          <span class="live-pulse-dot"></span>
          <strong style="color:#fff;">Llistat de Visites en Temps Real</strong>
          <span style="color:var(--text-dim); font-size:0.8rem; margin-left:0.5rem;">({total} registres)</span>
        </div>
        <button onclick="location.reload()" class="btn-chip" title="Actualitzar">
          🔄 Actualitzar Ara
        </button>
      </div>

      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuari</th>
              <th>País</th>
              <th>Regió</th>
              <th>Ciutat</th>
              <th>Data i Hora Exacta</th>
              <th>Adreça IP</th>
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
    // Auto-recàrrega cada 10 segons per mantenir el panell actualitzat
    setTimeout(() => location.reload(), 10000);
  </script>
</body>
</html>"""


class CifratgeRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador personalitzat de peticions HTTP."""

    def __init__(self, *args, **kwargs):
        # Assegurar que el directori base és el del projecte
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def do_GET(self):
        url_parsed = urllib.parse.urlparse(self.path)
        path = url_parsed.path

        # Ruta 1: /dades -> Taula interactiva de dades de visitants
        if path == "/dades":
            visites = carregar_dades()
            html = generar_html_dades(visites)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))
            return

        # Ruta 2: /dades.json -> Descarrega directa del fitxer JSON
        elif path == "/dades.json":
            visites = carregar_dades()
            json_bytes = json.dumps(visites, ensure_ascii=False, indent=2).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="dades.json"')
            self.end_headers()
            self.wfile.write(json_bytes)
            return

        # Ruta 3: /api/visites -> Retorna estadístiques i recompte en temps real
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

        # Qualsevol altre fitxer estàtic (HTML, CSS, JS, etc.)
        return super().do_GET()

    def do_POST(self):
        url_parsed = urllib.parse.urlparse(self.path)
        path = url_parsed.path

        # Ruta 4: /api/visita -> Registra cada nou visitant a dades.json
        if path == "/api/visita":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            try:
                body = json.loads(post_data.decode("utf-8")) if post_data else {}
            except Exception:
                body = {}

            # IP del client
            client_ip = self.client_address[0]
            if "x-forwarded-for" in self.headers:
                client_ip = self.headers["x-forwarded-for"].split(",")[0].strip()

            # Data i hora exacta
            ara = datetime.now()
            data_hora_formatada = ara.strftime("%Y-%m-%d %H:%M:%S")

            # Metadades de la visita
            nou_registre = {
                "id": None,
                "usuari": body.get("usuari", f"Visitant-{int(ara.timestamp()) % 10000:04d}"),
                "pais": body.get("pais", "Espanya"),
                "regio": body.get("regio", "Catalunya"),
                "ciutat": body.get("ciutat", "Barcelona"),
                "data_hora": data_hora_formatada,
                "ip": client_ip,
                "dispositiu": body.get("dispositiu", self.headers.get("User-Agent", "Navegador Web"))
            }

            # Guardar al fitxer dades.json
            visites = carregar_dades()
            nou_registre["id"] = len(visites) + 1
            visites.append(nou_registre)
            desar_dades(visites)

            resp = {
                "status": "success",
                "message": "Visita registrada correctament",
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

        self.send_error(404, "Ruta no trobada")

    def do_OPTIONS(self):
        """Permetre CORS si fos necessari."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def iniciar_servidor():
    """Inicia el servidor HTTP a PORT."""
    # Inicialitzar dades.json si no existeix
    if not os.path.exists(DATA_FILE):
        desar_dades([])

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CifratgeRequestHandler) as httpd:
        print("=" * 60)
        print("🚀 SERVIDOR WEB CIFRATGE EN FUNCIONAMENT")
        print("=" * 60)
        print(f"👉 Aplicació Web:          http://localhost:{PORT}")
        print(f"👉 Registre de Dades:      http://localhost:{PORT}/dades")
        print(f"👉 Fitxer JSON de dades:   {DATA_FILE}")
        print("=" * 60)
        print("Prem Ctrl+C per aturar el servidor.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nAturant el servidor. Fins aviat!")
            httpd.server_close()


if __name__ == "__main__":
    iniciar_servidor()

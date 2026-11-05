# Cifratge de Missatges

Programa senzill i modular en Python que permet **xifrar** i **desxifrar** textos utilitzant tres algoritmes clàssics:
1. **Inversió de text**
2. **Xifratge Cèsar**
3. **Codi Morse**

El projecte està implementat únicament amb la llibreria estàndard de Python, de manera que no requereix cap instal·lació de paquets addicionals.

---

## Com funciona cada algoritme

### 1. Inversió de text
* **Què fa?** Inverteix completament l'ordre dels caràcters de la cadena de text.
* **Com funciona?** Utilitza l'operador d'eslicing de Python `text[::-1]`.
* **Desxifratge:** Com que la inversió és una operació involutiva (aplicar-la dues vegades retorna al text original, $f(f(x)) = x$), el procés de desxifrar és exactament el mateix que el de xifrar.
* **Exemple:**
  * Original: `Hola mon`
  * Xifrat: `nom aloH`
  * Desxifrat: `Hola mon`

---

### 2. Xifratge Cèsar
* **Què fa?** És un algoritme clàssic de substitució monoalfabètica on cada lletra del text és substituïda per una altra lletra que es troba un nombre fix de posicions més endavant a l'abecedari.
* **Com funciona?**
  * Utilitza aritmètica modular sobre l'alfabet de 26 lletres (A-Z):
    $$\text{Xifratge: } C = (P + k) \pmod{26}$$
    $$\text{Desxifratge: } P = (C - k) \pmod{26}$$
    on $P$ és la posició de la lletra original, $k$ és el desplaçament (per defecte $3$), i $C$ és la posició resultant.
  * Manté les majúscules i minúscules en la seva forma corresponent.
  * Els espais, números i signes de puntuació es mantenen intactes sense modificar.
* **Exemple (desplaçament = 3):**
  * Original: `Hola, mon!`
  * Xifrat: `Krod, prq!`
  * Desxifrat: `Hola, mon!`

---

### 3. Codi Morse
* **Què fa?** Representa lletres, números i signes de puntuació mitjançant seqüències de senyals curts (punts `.`) i llargs (ratlles `-`).
* **Com funciona?**
  * **Normalització de caràcters:** Abans de convertir a Morse, el text es normalitza utilitzant la descomposició Unicode NFKD per eliminar accents i diacrítics (per exemple, `à` $\rightarrow$ `A`, `é` $\rightarrow$ `E`), garantint que paraules amb accents es puguin codificar sense errors.
  * **Separació:** Les lletres d'una mateixa paraula es separen per un espai (` `), i les paraules es separen per una barra inclinada (` / `).
  * **Desxifratge:** El programa llegeix les barres per separar paraules i els espais per separar cada lletra, cercant cada seqüència de punts i ratlles en un diccionari invers.
* **Exemple:**
  * Original: `SOS MON`
  * Xifrat: `... --- ... / -- --- -.`
  * Desxifrat: `SOS MON`

---

## Requisits

* Python 3.6 o superior instal·lat al sistema.

---

## Instruccions d'ús

### 1. Aplicació Web (Navegador) 🌐

L'aplicació compta amb una interfície web moderna i interactiva, accessible directament des de qualsevol navegador web (Chrome, Firefox, Safari, Edge) sense necessitat de servidors ni dependències externes.

* **Com executar el servidor amb registre de visites:**
  * Executa el servidor Python integrat:
    ```bash
    python server.py
    ```
  * Obre el teu navegador a:
    * **Aplicació Web:** [http://localhost:8000](http://localhost:8000)
    * **Panell de Dades de Visitants:** [http://localhost:8000/dades](http://localhost:8000/dades)
    * **Fitxer JSON directe:** [http://localhost:8000/dades.json](http://localhost:8000/dades.json)

* **Característiques de la versió Web i Servidor:**
  * **Comptador de visites en temps real:** Situat a la capçalera superior de la web, s'actualitza en viu.
  * **Registre de dades (`dades.json`):** Desa automàticament cada visitant amb el seu identificador d'usuari, país, regió, ciutat, data i hora exacta d'accés, i adreça IP.
  * **Panell `/dades`:** Visualització gràfica de les visites, mètriques (visites totals, usuaris únics, països) i botó de descàrrega directa del fitxer `.json`.
  * **Interfície Gràfica Moderna:** Disseny Cyber-Dark amb estil glassmorphism i transicions suaus.
  * **Xifratge en Temps Real:** Conversió automàtica instantània mentre escrius.
  * **Xifratge Cèsar:** Slider interactiu de desplaçament ($k \in [1, 25]$), botó ROT-13, visualitzador dinàmic de l'abecedari i **Desxifrador per Força Bruta** (mostra els 25 desplaçaments possibles alhora).
  * **Codi Morse Interactiu:** Reproducció d'àudio sintetitzat mitjançant la **Web Audio API** amb velocitat (WPM) i to (Hz) configurables, indicador lluminós de transmissió (LED òptic) i taula de referència completa.
  * **Multixifratge:** Panell comparatiu per visualitzar els 3 algoritmes alhora.
  * **Utilitats:** Botó per intercanviar entrada/sortida (Swap), copiar al porta-retalls en un clic, descarregar el resultat en fitxer `.txt` i historial local de conversions.

---

### 2. Execució interactiva (Consola de terminal) 💻

Executa el fitxer principal des del terminal:

```bash
python cifratge.py
```

S'obrirà un menú interactiu:

```text
=============================================
          EINA DE XIFRATGE I DESXIFRATGE     
=============================================
1. Inversió de text
2. Xifratge Cèsar
3. Codi Morse
4. Sortir
=============================================
Tria una opció (1-4):
```

1. Tria l'algoritme (1, 2 o 3).
2. Tria si vols **xifrar** (1) o **desxifrar** (2).
3. Introdueix el text quan se't demani (i el nombre de desplaçament si has triat Cèsar).
4. El resultat es mostrarà immediatament per pantalla.

---

### 3. Ús com a mòdul de Python

També pots importar les funcions directament als teus propis scripts de Python:

```python
from cifratge import (
    xifrar_inversio, desxifrar_inversio,
    xifrar_cesar, desxifrar_cesar,
    xifrar_morse, desxifrar_morse
)

# Inversió
print(xifrar_inversio("Antigravity"))    # "ytivarginA"
print(desxifrar_inversio("ytivarginA"))  # "Antigravity"

# Cèsar (desplaçament personalitzat, ex: 5)
text_xifrat = xifrar_cesar("Missatge secret", 5)
print(text_xifrat)                       # "Rnxxfylj xjhwjy"
print(desxifrar_cesar(text_xifrat, 5))   # "Missatge secret"

# Codi Morse
morse = xifrar_morse("Bon dia")
print(morse)                             # "-... --- -. / -.. .. .-"
print(desxifrar_morse(morse))            # "BON DIA"
```

---

## 4. Desplegament i Configuració en Servidor Remot (Linux / Apache / systemd) 🚀

Aquesta guia explica pas a pas com configurar correctament l'aplicació en un servidor remot Linux (Ubuntu/Debian) amb servei de fons `systemd`, proxy invers `Apache` i domini propi (`cifratgeweb.nescolam.com`).

### ⚠️ Diagnòstic del problema: Per què marcava 0 o 1 visites i no llistava res?

Si en entrar a la web el comptador de visites marcava `0` o `1` i a `/dades` no sortia cap registre:
1. **Permís d'escriptura a Linux (Causa principal):** El servei systemd s'executa amb l'usuari `User=romanov`. Si la carpeta `/var/www/Cifraje` o el fitxer `dades.json` es van crear com a `root` (per exemple amb `git clone` o `sudo`), l'usuari `romanov` **no té permisos d'escriptura** sobre el fitxer ni sobre la carpeta. Quan un visitant entrava, `server.py` intentava escriure a disc, fallava amb un error de permisos (`PermissionError`), i les dades mai no es persistien a disc.
2. **Desincronització de memòria vs disc:** Quan fallava l'escriptura, `server.py` responia temporalment amb `1` visita en memòria a la petició POST. Però al cap de 4 segons el navegador consultava `GET /api/visites`, el servidor rellegia el fitxer buit de disc, i el comptador tornava a caure a `0`.
3. **Mòduls de proxy d'Apache:** Sense els mòduls `proxy`, `proxy_http` i `headers` habilitats a Apache, les peticions POST i les capçaleres de l'adreça IP del client no es transmeten correctament.

---

### Pas 1: Configurar els permisos d'usuari a `/var/www/Cifraje`

Assegura que l'usuari configurat al servei (`romanov`) sigui el propietari de la carpeta del projecte i tingui permisos complets de lectura i escriptura:

```bash
# Assignar l'usuari i grup romanov a tota la carpeta del projecte
sudo chown -R romanov:romanov /var/www/Cifraje

# Donar permisos d'execució i escriptura als directoris
sudo chmod -R 775 /var/www/Cifraje

# Assegurar que dades.json té permís d'escriptura
if [ -f /var/www/Cifraje/dades.json ]; then
    sudo chmod 664 /var/www/Cifraje/dades.json
fi
```

---

### Pas 2: Configurar el servei de fons amb `systemd`

Crea o edita el fitxer de servei a `/etc/systemd/system/cifratgeweb.service`:

```bash
sudo nano /etc/systemd/system/cifratgeweb.service
```

Enganxa la següent configuració recomanada:

```ini
[Unit]
Description=Servidor Python Cifratge Web
After=network.target

[Service]
User=romanov
Group=romanov
WorkingDirectory=/var/www/Cifraje
# El paràmetre -u força Python a no utilitzar buffer, mostrant els logs en directe
ExecStart=/usr/bin/python3 -u server.py
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

A continuació, recarrega systemd, activa el servei perquè arrenqui automàticament a l'inici del sistema i inicia'l:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cifratgeweb
sudo systemctl restart cifratgeweb
sudo systemctl status cifratgeweb
```

> **Consell:** Si vols veure la sortida i missatges del servidor Python en temps real, executa:
> ```bash
> journalctl -u cifratgeweb.service -f
> ```
> El servidor inclou una comprovació automàtica a l'arrencada que t'indicarà amb un missatge clar si els permisos de `dades.json` són correctes o si hi ha cap problema.

---

### Pas 3: Habilitar els mòduls de proxy a Apache

Perquè Apache pugui redirigir el trànsit cap al port intern `8000` de Python i reenviar la IP real del client, cal activar els mòduls corresponents:

```bash
sudo a2enmod proxy proxy_http headers rewrite
sudo systemctl restart apache2
```

---

### Pas 4: Configurar el VirtualHost d'Apache

Crea o edita el fitxer de configuració del lloc a `/etc/apache2/sites-available/cifratgeweb.conf`:

```bash
sudo nano /etc/apache2/sites-available/cifratgeweb.conf
```

Afegeix la configuració del VirtualHost:

```apache
<VirtualHost *:80>
    ServerName cifratgeweb.nescolam.com
    ServerAlias www.cifratgeweb.nescolam.com

    # Manté el nom de host original de la petició
    ProxyPreserveHost On

    # Envia la capçalera amb el protocol utilitzat (http/https)
    RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}

    # Redirecció cap al servidor Python intern al port 8000
    ProxyPass / http://127.0.0.1:8000/
    ProxyPassReverse / http://127.0.0.1:8000/

    # Fitxers de registre d'Apache
    ErrorLog ${APACHE_LOG_DIR}/cifratgeweb_error.log
    CustomLog ${APACHE_LOG_DIR}/cifratgeweb_access.log combined
</VirtualHost>
```

Activa el lloc web i recarrega Apache:

```bash
sudo a2ensite cifratgeweb.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

### Pas 5: Activar certificat SSL / HTTPS gratuït amb Certbot (Let's Encrypt)

És molt recomanable habilitar HTTPS perquè les peticions al navegador no quedin bloquejades per regles de contingut mixt ni polítiques de seguretat modernes:

```bash
# Instal·lar Certbot per a Apache si no el tens
sudo apt update
sudo apt install -y certbot python3-certbot-apache

# Obtenir el certificat i configurar automàticament el VirtualHost SSL (port 443)
sudo certbot --apache -d cifratgeweb.nescolam.com -d www.cifratgeweb.nescolam.com
```

Certbot crearà automàticament el fitxer `/etc/apache2/sites-available/cifratgeweb-le-ssl.conf` copiant les directives `ProxyPass` i redirigirà tot el trànsit HTTP cap a HTTPS de forma segura.

---

### Pas 6: Comprovació i Diagnòstic de Funcionament

Pots comprovar ràpidament que tot el flux funciona executant aquestes comandes al terminal del servidor remot:

1. **Comprovar que el servei Python respon localment:**
   ```bash
   curl -i http://127.0.0.1:8000/api/visites
   ```
   *(Hauria de retornar un codi HTTP 200 amb el JSON de visites)*

2. **Simular el registre d'una visita manual:**
   ```bash
   curl -i -X POST http://127.0.0.1:8000/api/visita \
     -H "Content-Type: application/json" \
     -d '{"usuari": "Verificacio-Servidor", "pais": "Catalunya", "ciutat": "Barcelona"}'
   ```
   *(Hauria de retornar `"status": "success"` i `"total_visites"` incrementat)*

3. **Verificar el contingut del fitxer `dades.json`:**
   ```bash
   cat /var/www/Cifraje/dades.json
   ```

4. **Monitorar logs si es produeix qualsevol incidència:**
   ```bash
   # Logs del servei Python en viu:
   journalctl -u cifratgeweb.service -f

   # Logs d'Apache:
   sudo tail -f /var/log/apache2/cifratgeweb_error.log
   sudo tail -f /var/log/apache2/cifratgeweb_access.log
   ```


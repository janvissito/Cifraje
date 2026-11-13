# Cifrado de Mensajes

Programa sencillo y modular en Python que permite **cifrar** y **descifrar** textos utilizando tres algoritmos clásicos:
1. **Inversión de texto**
2. **Cifrado César**
3. **Código Morse**

El proyecto está implementado únicamente con la librería estándar de Python, por lo que no requiere ninguna instalación de paquetes adicionales.

---

## Cómo funciona cada algoritmo

### 1. Inversión de texto
* **¿Qué hace?** Invierte completamente el orden de los caracteres de la cadena de texto.
* **¿Cómo funciona?** Utiliza el operador de slicing de Python `text[::-1]`.
* **Descifrado:** Dado que la inversión es una operación involutiva (aplicarla dos veces devuelve al texto original, $f(f(x)) = x$), el proceso de descifrar es exactamente el mismo que el de cifrar.
* **Ejemplo:**
  * Original: `Hola mundo`
  * Cifrado: `odnum aloH`
  * Descifrado: `Hola mundo`

---

### 2. Cifrado César
* **¿Qué hace?** Es un algoritmo clásico de sustitución monoalfabética donde cada letra del texto es sustituida por otra letra que se encuentra un número fijo de posiciones más adelante en el abecedario.
* **¿Cómo funciona?**
  * Utiliza aritmética modular sobre el alfabeto de 26 letras (A-Z):
    $$\text{Cifrado: } C = (P + k) \pmod{26}$$
    $$\text{Descifrado: } P = (C - k) \pmod{26}$$
    donde $P$ es la posición de la letra original, $k$ es el desplazamiento (por defecto $3$), y $C$ es la posición resultante.
  * Mantiene las mayúsculas y minúsculas en su forma correspondiente.
  * Los espacios, números y signos de puntuación se mantienen intactos sin modificar.
* **Ejemplo (desplazamiento = 3):**
  * Original: `¡Hola, mundo!`
  * Cifrado: `¡Krod, pxqgr!`
  * Descifrado: `¡Hola, mundo!`

---

### 3. Código Morse
* **¿Qué hace?** Representa letras, números y signos de puntuación mediante secuencias de señales cortas (puntos `.`) y largas (rayas `-`).
* **¿Cómo funciona?**
  * **Normalización de caracteres:** Antes de convertir a Morse, el texto se normaliza utilizando la descomposición Unicode NFKD para eliminar acentos y diacríticos (por ejemplo, `á` $\rightarrow$ `A`, `é` $\rightarrow$ `E`), garantizando que palabras con acentos se puedan codificar sin errores.
  * **Separación:** Las letras de una misma palabra se separan por un espacio (` `), y las palabras se separan por una barra inclinada (` / `).
  * **Descifrado:** El programa lee las barras para separar palabras y los espacios para separar cada letra, buscando cada secuencia de puntos y rayas en un diccionario inverso.
* **Ejemplo:**
  * Original: `SOS MUNDO`
  * Cifrado: `... --- ... / -- ..- -. -.. ---`
  * Descifrado: `SOS MUNDO`

---

## Requisitos

* Python 3.6 o superior instalado en el sistema.

---

## Instrucciones de uso

### 1. Aplicación Web (Navegador) 🌐

La aplicación cuenta con una interfaz web moderna e interactiva, accesible directamente desde cualquier navegador web (Chrome, Firefox, Safari, Edge) sin necesidad de dependencias externas.

* **Cómo ejecutar el servidor con registro de visitas:**
  * Ejecuta el servidor Python integrado:
    ```bash
    python server.py
    ```
  * Abre tu navegador en:
    * **Aplicación Web:** [http://localhost:8000](http://localhost:8000)
    * **Panel de Datos de Visitantes:** [http://localhost:8000/dades](http://localhost:8000/dades)
    * **Archivo JSON directo:** [http://localhost:8000/dades.json](http://localhost:8000/dades.json)

* **Características de la versión Web y Servidor:**
  * **Contador de visitas en tiempo real:** Situado en la cabecera superior de la web, se actualiza en vivo.
  * **Registro de datos (`dades.json`):** Guarda automáticamente cada visitante con su identificador de usuario, país, región, ciudad, fecha y hora exacta de acceso, y dirección IP.
  * **Panel `/dades`:** Visualización gráfica de las visitas, métricas (visitas totales, usuarios únicos, países) y botón de descarga directa del archivo `.json`.
  * **Interfaz Gráfica Moderna:** Diseño Cyber-Dark con estilo glassmorphism y transiciones suaves.
  * **Cifrado en Tiempo Real:** Conversión automática instantánea mientras escribes.
  * **Cifrado César:** Slider interactivo de desplazamiento ($k \in [1, 25]$), botón ROT-13, visualizador dinámico del abecedario y **Descifrador por Fuerza Bruta** (muestra los 25 desplazamientos posibles al mismo tiempo).
  * **Código Morse Interactivo:** Reproducción de audio sintetizado mediante la **Web Audio API** con velocidad (WPM) y tono (Hz) configurables, indicador luminoso de transmisión (LED óptico) y tabla de referencia completa.
  * **Utilidades:** Botón para intercambiar entrada/salida (Swap), copiar al portapapeles en un clic, descargar el resultado en archivo `.txt` e historial local de conversiones.

---

### 2. Ejecución interactiva (Consola de terminal) 💻

Ejecuta el archivo principal desde el terminal:

```bash
python cifratge.py
```

Se abrirá un menú interactivo:

```text
=============================================
          HERRAMIENTA DE CIFRADO Y DESCIFRADO     
=============================================
1. Inversión de texto
2. Cifrado César
3. Código Morse
4. Salir
=============================================
Elige una opción (1-4):
```

1. Elige el algoritmo (1, 2 o 3).
2. Elige si quieres **cifrar** (1) o **descifrar** (2).
3. Introduce el texto cuando se te pida (y el número de desplazamiento si has elegido César).
4. El resultado se mostrará inmediatamente por pantalla.

---

### 3. Uso como módulo de Python

También puedes importar las funciones directamente en tus propios scripts de Python:

```python
from cifratge import (
    xifrar_inversio, desxifrar_inversio,
    xifrar_cesar, desxifrar_cesar,
    xifrar_morse, desxifrar_morse
)

# Inversión
print(xifrar_inversio("Antigravity"))    # "ytivarginA"
print(desxifrar_inversio("ytivarginA"))  # "Antigravity"

# César (desplazamiento personalizado, ej: 5)
texto_cifrado = xifrar_cesar("Mensaje secreto", 5)
print(texto_cifrado)                     # "Rjsxfoj xjhwjyt"
print(desxifrar_cesar(texto_cifrado, 5)) # "Mensaje secreto"

# Código Morse
morse = xifrar_morse("Buenos dias")
print(morse)                             # "-... ..- . -. --- ... / -.. .. .- ..."
print(desxifrar_morse(morse))            # "BUENOS DIAS"
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


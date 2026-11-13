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

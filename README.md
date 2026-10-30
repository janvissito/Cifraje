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

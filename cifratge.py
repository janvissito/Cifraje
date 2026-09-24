#!/usr/bin/env python3
"""
Mòdul de xifratge i desxifratge de textos.
Algoritmes inclosos:
  1. Inversió de text (Reverse)
  2. Xifratge Cèsar (Caesar Cipher)
  3. Codi Morse (Morse Code)
"""

import unicodedata

# -----------------------------------------------------------------------------
# 1. INVERSIÓ DE TEXT
# -----------------------------------------------------------------------------

def xifrar_inversio(text: str) -> str:
    """Inverteix l'ordre dels caràcters del text."""
    return text[::-1]


def desxifrar_inversio(text: str) -> str:
    """Desxifra un text invertit (la inversió és reversible per ella mateixa)."""
    return text[::-1]


# -----------------------------------------------------------------------------
# 2. XIFRATGE CÈSAR
# -----------------------------------------------------------------------------

def xifrar_cesar(text: str, desplacament: int = 3) -> str:
    """
    Aplica el xifratge Cèsar desplaçant cada lletra de l'alfabet
    un nombre determinat de posicions. Manté majúscules/minúscules
    i caràcters que no siguin lletres.
    """
    resultat = []
    for car in text:
        if 'a' <= car <= 'z':
            nou_car = chr((ord(car) - ord('a') + desplacament) % 26 + ord('a'))
            resultat.append(nou_car)
        elif 'A' <= car <= 'Z':
            nou_car = chr((ord(car) - ord('A') + desplacament) % 26 + ord('A'))
            resultat.append(nou_car)
        else:
            resultat.append(car)
    return ''.join(resultat)


def desxifrar_cesar(text: str, desplacament: int = 3) -> str:
    """Desxifra un text xifrat amb Cèsar aplicant el desplaçament en sentit invers."""
    return xifrar_cesar(text, -desplacament)


# -----------------------------------------------------------------------------
# 3. CODI MORSE
# -----------------------------------------------------------------------------

DICCIONARI_MORSE = {
    'A': '.-',     'B': '-...',   'C': '-.-.',   'D': '-..',    'E': '.',
    'F': '..-.',   'G': '--.',    'H': '....',   'I': '..',     'J': '.---',
    'K': '-.-',    'L': '.-..',   'M': '--',     'N': '-.',     'O': '---',
    'P': '.--.',   'Q': '--.-',   'R': '.-.',    'S': '...',    'T': '-',
    'U': '..-',    'V': '...-',   'W': '.--',    'X': '-..-',   'Y': '-.--',
    'Z': '--..',
    '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',  '4': '....-',
    '5': '.....',  '6': '-....',  '7': '--...',  '8': '---..',  '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.',  '(': '-.--.',  ')': '-.--.-', '&': '.-...',  ':': '---...',
    ';': '-.-.-.', '=': '-...-',  '+': '.-.-.',  '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
}

# Diccionari invers per desxifrar (Morse -> Text)
DICCIONARI_MORSE_INVERS = {codi: lletra for lletra, codi in DICCIONARI_MORSE.items()}


def normalitzar_text_morse(text: str) -> str:
    """Elimina accents i diacrítics per facilitar la conversió a codi Morse."""
    descomposat = unicodedata.normalize('NFKD', text)
    sense_accents = ''.join(c for c in descomposat if not unicodedata.combining(c))
    return sense_accents.upper()


def xifrar_morse(text: str) -> str:
    """
    Converteix un text a codi Morse.
    Les lletres es separen amb un espai (' ') i les paraules amb una barra (' / ').
    """
    text_preparat = normalitzar_text_morse(text)
    paraules = text_preparat.split(' ')
    paraules_morse = []

    for paraula in paraules:
        lletres_morse = [DICCIONARI_MORSE.get(car, car) for car in paraula]
        paraules_morse.append(' '.join(lletres_morse))

    return ' / '.join(paraules_morse)


def desxifrar_morse(codi_morse: str) -> str:
    """
    Converteix codi Morse a text alfanumèric.
    Accepta ' / ' com a separador de paraules i ' ' com a separador de lletres.
    """
    codi_net = codi_morse.strip()
    
    # Gestionar separador de paraules (' / ' o triple espai)
    if ' / ' in codi_net:
        paraules = codi_net.split(' / ')
    elif '/' in codi_net:
        paraules = codi_net.split('/')
    elif '   ' in codi_net:
        paraules = codi_net.split('   ')
    else:
        paraules = [codi_net]

    paraules_text = []
    for paraula in paraules:
        simbols = paraula.strip().split(' ')
        lletres = [DICCIONARI_MORSE_INVERS.get(simbol, simbol) for simbol in simbols if simbol]
        paraules_text.append(''.join(lletres))

    return ' '.join(paraules_text)


# -----------------------------------------------------------------------------
# MENÚ INTERACTIU
# -----------------------------------------------------------------------------

def menu_principal():
    """Interfície de línia de comandes per provar els algoritmes."""
    while True:
        print("\n" + "=" * 45)
        print("          EINA DE XIFRATGE I DESXIFRATGE     ")
        print("=" * 45)
        print("1. Inversió de text")
        print("2. Xifratge Cèsar")
        print("3. Codi Morse")
        print("4. Sortir")
        print("=" * 45)

        opcio = input("Tria una opció (1-4): ").strip()

        if opcio == "4":
            print("Fins aviat!")
            break

        if opcio not in ("1", "2", "3"):
            print("Opció no vàlida. Torna-ho a provar.")
            continue

        print("\n--- Acció ---")
        print("1. Xifrar")
        print("2. Desxifrar")
        accio = input("Tria una acció (1-2): ").strip()

        if accio not in ("1", "2"):
            print("Acció no vàlida.")
            continue

        text = input("\nIntrodueix el text: ")

        if opcio == "1":
            if accio == "1":
                res = xifrar_inversio(text)
                print(f"\n[Resultat Xifrat]: {res}")
            else:
                res = desxifrar_inversio(text)
                print(f"\n[Resultat Desxifrat]: {res}")

        elif opcio == "2":
            desp_str = input("Introdueix el desplaçament (per defecte 3): ").strip()
            desplacament = int(desp_str) if desp_str.isdigit() or (desp_str.startswith('-') and desp_str[1:].isdigit()) else 3

            if accio == "1":
                res = xifrar_cesar(text, desplacament)
                print(f"\n[Resultat Xifrat (Cèsar +{desplacament})]: {res}")
            else:
                res = desxifrar_cesar(text, desplacament)
                print(f"\n[Resultat Desxifrat (Cèsar -{desplacament})]: {res}")

        elif opcio == "3":
            if accio == "1":
                res = xifrar_morse(text)
                print(f"\n[Resultat Morse]: {res}")
            else:
                res = desxifrar_morse(text)
                print(f"\n[Resultat Desxifrat]: {res}")


if __name__ == "__main__":
    menu_principal()

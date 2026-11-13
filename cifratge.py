#!/usr/bin/env python3
"""
Módulo de cifrado y descifrado de textos.
Algoritmos incluidos:
  1. Inversión de texto (Reverse)
  2. Cifrado César (Caesar Cipher)
  3. Código Morse (Morse Code)
"""

import unicodedata

# -----------------------------------------------------------------------------
# 1. INVERSIÓN DE TEXTO
# -----------------------------------------------------------------------------

def xifrar_inversio(text: str) -> str:
    """Invierte el orden de los caracteres del texto."""
    return text[::-1]


def desxifrar_inversio(text: str) -> str:
    """Descifra un texto invertido (la inversión es reversible por sí misma)."""
    return text[::-1]


# -----------------------------------------------------------------------------
# 2. CIFRADO CÉSAR
# -----------------------------------------------------------------------------

def xifrar_cesar(text: str, desplacament: int = 3) -> str:
    """
    Aplica el cifrado César desplazando cada letra del alfabeto
    un número determinado de posiciones. Mantiene mayúsculas/minúsculas
    y caracteres que no sean letras.
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
    """Descifra un texto cifrado con César aplicando el desplazamiento en sentido inverso."""
    return xifrar_cesar(text, -desplacament)


# -----------------------------------------------------------------------------
# 3. CÓDIGO MORSE
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

# Diccionario inverso para descifrar (Morse -> Texto)
DICCIONARI_MORSE_INVERS = {codi: lletra for lletra, codi in DICCIONARI_MORSE.items()}


def normalitzar_text_morse(text: str) -> str:
    """Elimina acentos y diacríticos para facilitar la conversión a código Morse."""
    descomposat = unicodedata.normalize('NFKD', text)
    sense_accents = ''.join(c for c in descomposat if not unicodedata.combining(c))
    return sense_accents.upper()


def xifrar_morse(text: str) -> str:
    """
    Convierte un texto a código Morse.
    Las letras se separan con un espacio (' ') y las palabras con una barra (' / ').
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
    Convierte código Morse a texto alfanumérico.
    Acepta ' / ' como separador de palabras y ' ' como separador de letras.
    """
    codi_net = codi_morse.strip()
    
    # Gestionar separador de palabras (' / ' o triple espacio)
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
# MENÚ INTERACTIVO
# -----------------------------------------------------------------------------

def menu_principal():
    """Interfaz de línea de comandos para probar los algoritmos."""
    while True:
        print("\n" + "=" * 45)
        print("          HERRAMIENTA DE CIFRADO Y DESCIFRADO     ")
        print("=" * 45)
        print("1. Inversión de texto")
        print("2. Cifrado César")
        print("3. Código Morse")
        print("4. Salir")
        print("=" * 45)

        opcio = input("Elige una opción (1-4): ").strip()

        if opcio == "4":
            print("¡Hasta pronto!")
            break

        if opcio not in ("1", "2", "3"):
            print("Opción no válida. Inténtalo de nuevo.")
            continue

        print("\n--- Acción ---")
        print("1. Cifrar")
        print("2. Descifrar")
        accio = input("Elige una acción (1-2): ").strip()

        if accio not in ("1", "2"):
            print("Acción no válida.")
            continue

        text = input("\nIntroduce el texto: ")

        if opcio == "1":
            if accio == "1":
                res = xifrar_inversio(text)
                print(f"\n[Resultado Cifrado]: {res}")
            else:
                res = desxifrar_inversio(text)
                print(f"\n[Resultado Descifrado]: {res}")

        elif opcio == "2":
            desp_str = input("Introduce el desplazamiento (por defecto 3): ").strip()
            desplacament = int(desp_str) if desp_str.isdigit() or (desp_str.startswith('-') and desp_str[1:].isdigit()) else 3

            if accio == "1":
                res = xifrar_cesar(text, desplacament)
                print(f"\n[Resultado Cifrado (César +{desplacament})]: {res}")
            else:
                res = desxifrar_cesar(text, desplacament)
                print(f"\n[Resultado Descifrado (César -{desplacament})]: {res}")

        elif opcio == "3":
            if accio == "1":
                res = xifrar_morse(text)
                print(f"\n[Resultado Morse]: {res}")
            else:
                res = desxifrar_morse(text)
                print(f"\n[Resultado Descifrado]: {res}")


if __name__ == "__main__":
    menu_principal()

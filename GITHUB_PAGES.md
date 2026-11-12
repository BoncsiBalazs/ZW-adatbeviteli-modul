# ZeroWaste Entry 5.0 – GitHub Pages telepítés

1. A jelenlegi repozitóriumról készítsen biztonsági mentést; az Entry böngészőjében az adatokat JSON-ba mentse.
2. Csomagolja ki a `ZeroWaste_Entry_5_0_teljes_GitHub.zip` csomagot.
3. A **ZIP tartalmát** töltse fel a GitHub `BoncsiBalazs/ZW-adatbeviteli-modul` repozitóriumának gyökerébe, **nem** magát a ZIP-et.
4. A régi azonos nevű fájlokat írja felül, a `sensory-v5-config.js` új fájl kerüljön melléjük.
5. Az `index.html` most `v=5.0.0` erőforrásverziókat használ, a `sw-public-anon-v4.js` gyorsítótárának új neve `adatrögzítő-modul-v5-0-anon`.
6. Az oldal frissítése után tesztelje az ételszintű CATA-t, a komponensminősítést, a választható JAR-t és a négy alapíz intenzitását.
7. A döntéstámogatónak szánt adatcsomaghoz a ZIP-exportot használja, nem az egyfájlos CSV/XLSX-et.

**Frissített alkalmazásfájlok:** `index.html`, `app-public-anon-v4.js`, `styles-public-anon-v4.css`, `sw-public-anon-v4.js`, **új** `sensory-v5-config.js`.

A korábbi, `app.js`, `sw.js`, `data.js` fájlok nem az aktuális `index.html` által meghívott nyilvános 5.0-s alkalmazásfájlok; a teljes csomagban megmaradtak, de a funkciók ezekben nincsenek párhuzamosan átvezetve.

Az új komponensfelismerő szabályok és JAR-listák pilotkoncepciók, szakértői ellenőrzés szükséges.

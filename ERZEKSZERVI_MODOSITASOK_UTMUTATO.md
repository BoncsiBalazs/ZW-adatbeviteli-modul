> **Korábbi, 4.1-es útmutató:** a 4.2-es ételtörzsalapú bővítés jegyzéke az `UJ_TULAJDONSAGOK_ETELLISTA_ALAPJAN.md` fájlban található. A pontos aktuális darabszámok és verziók ott szerepelnek.

# ZeroWaste Entry 4.1 – érzékszervi tulajdonságlista pilot

## Mi változott?

- A levesek és a második fogások külön CATA-tulajdonságlistával rendelkeznek.
- A négy részdimenzió (külső megjelenés, illat, íz, állomány) továbbra is 1–5 ponttal és kötelező CATA-jellemzővel rögzíthető.
- Az összkedveltség önálló 1–5 pontos skála, leíró tulajdonság nélkül.
- A megfelelő (5 pontos) válasz nem jelölhető egyszerre hibajellemzőkkel.
- Az eredeti exportmezők változatlanok, az `*_osszkedv_megj` oszlop új rekordok esetén üres. Egyetlen új exportoszlop az `sensory_list_version`; értéke új rekordoknál `cata-pilot-2026-11-v1`, korábbi rekordoknál `legacy-v4`.
- Az app és a service worker cache-verziója frissült, és az eredeti ZIP-ből hiányzó ikonokat nem próbálja meg előtölteni.

## GitHubon melyik fájlokat cseréld?

A repo gyökerében lévő fájlok közül mind a négyet töltsd fel együtt, majd commitold:

1. `data-public-anon-v4.js` – az új tulajdonságlisták
2. `app-public-anon-v4.js` – külön leves/főétel CATA és önálló összkedveltség
3. `index.html` – fájlverzió és gyorsítótár-váltás
4. `sw-public-anon-v4.js` – service worker frissítés

Minden más fájl maradhat változatlan. A `data.js` és `app.js` régi, az oldal ezeket nem tölti be.

## Hol szerkesztheted később a listákat?

`data-public-anon-v4.js` → `sensoryDescriptors` mező.
Egy bejegyzés struktúrája:

```js
{
  "course": "Leves",
  "attribute": "Íz",
  "descriptor": "Túl sós",
  "polarity": "negative"
}
```

`course`: `Leves` vagy `Második fogás`.
`attribute`: `Külső megjelenés`, `Illat`, `Íz` vagy `Állomány`.
`polarity`: `negative` vagy `appropriate` (utóbbi a `Megfelelő` jellemzőhöz).

## Ellenőrző lista

1. Nyisd meg GitHub Pages-en, frissíts `Ctrl+Shift+R` billentyűkkel.
2. A leves íz listájában legyen például `Túl sós`, de a főételspecifikus állományjelzők közül ne legyen `Rágós`.
3. A második fogás állományánál legyen `Rágós` és `Túl kemény`.
4. Összkedveltségnél csak 1–5 pont jelenjen meg, és ne kérjen CATA-t.
5. 1–4 pontos részdimenziónál ne engedje hozzáadni a `Megfelelő` jellemzőt.
6. Rögzíts próbaeseményt, majd teszteld a CSV, XLSX és ZIP exportot.
7. Exportáld a korábbi rekordokat is a verzióváltás előtt; az IndexedDB-név nem változott, a korábbi adatok nem törlődnek automatikusan.

## Kutatásmódszertani figyelmeztetés

A listák szakmai kiinduló tervezetek, **nem validált skálák**. A pilot előtt javasolt 5–8 élelmezésvezetővel/dolgozóval szakértői érthetőségi vizsgálatot, majd kis mintán tesztelést végezni. A kategóriákban több ételspecifikus hibaleíró csak az adott ételnél releváns. A kötelező negatív leíró 1–4 pont mellett továbbra is az eredeti alkalmazás szabálya; ezt egy későbbi módszertani iterációban érdemes külön felülvizsgálni.

# ZeroWaste Entry 4.3 – Ételcsoport-specifikus CATA-ajánlások

**Státusz:** kutatási pilot, nem validált szakértői deszkriptor- és profilrendszer. Ezt a változatot először tesztkörnyezetben próbálja ki. Az éles kutatási adatfelvétel előtt szakértői felülvizsgálat szükséges.

## Röviden: mit tud?

- A 4.2-es adatbázis **181 CATA-leíróját változatlanul megőrzi** (79 leves, 102 második fogás).
- A törzsben található **104 leveshez és 78 második fogáshoz** külön, szerkeszthető csoport-hozzárendelés tartozik.
- A kiválasztott étel(ek) csoportjai alapján **ajánlott jellemzők** jelennek meg a külső megjelenés / illat / íz / állomány dimenziókban.
- Az egyes csoportokon túl az ételnév egyes elemei (pl. krémleves, burgonyapüré, rakott, gőzgombóc) is hozzájárulhatnak **célzottabb ajánláshoz**.
- Az **összes többi leíró** továbbra is megkereshető a „Teljes tulajdonságlista keresése” lenyitható részben, illetve „Egyéb tulajdonság” is megadható.
- A többkomponensű fogások több csoportba tartozhatnak: például `FRIED_MEAT + FISH + POTATO_SIDE`.
- Az egyes csoportok kézzel módosíthatók; új ételnél a rendszer nem találgat besorolást, és kéri az ételcsoport megjelölését.
- **Az ételnév változtatása törli az előző ételhez tartozó érzékszervi válaszokat**. Ez megelőzi az adatok hibás ételhez rendelését.
- A meglévő exportoszlopok megmaradnak. **Hat új auditmező** került az export végére: a CATA-ajánlás verziója, a leves/második fogás csoportja, valamint a kézi besorolás jelzése.

## GitHub-frissítés

**A biztos megoldás:** ha nem tudja, hogy a 4.2-es bővített, 181 jellemzős változat már fent van-e, a `ZW_Entry_4_3_teljes_GitHub.zip` tartalmát töltse fel a GitHub-repozitórium **gyökerébe** (`main` branch). A régi fájlokat azonos néven írja felül. Az `index.html`, a `data-public-anon-v4.js`, a `cata-profiles-v4-3.js`, az `app-public-anon-v4.js`, a `styles-public-anon-v4.css` és a `sw-public-anon-v4.js` legyen feltöltve. A ZIP-et ne egyetlen fájlként töltse fel.

**Ha a 4.2 verzió már aktív**, elég az öt változott fájlt felülírni / hozzáadni:

1. `app-public-anon-v4.js`
2. `styles-public-anon-v4.css`
3. `index.html`
4. `sw-public-anon-v4.js`
5. **Új:** `cata-profiles-v4-3.js`

Az öt fájlt **együtt** kell frissíteni. A GitHub Pages publikációt követően a régi PWA-verzió gyorsítótára miatt néha frissítés vagy újraindítás szükséges. A 4.3 állományok cache-kulcsa `v=4.3.0`.

## Hol és mit szerkesszen?

**`cata-profiles-v4-3.js`**: az ételcsoportokkal kapcsolatos összes kutatási konfiguráció:

- `dishGroups["Leves"]` vagy `["Második fogás"]`: egyes ételnevekhez tartozó csoportazonosítók.
- `courseGroups`: a felületen látható csoportnevek.
- `baseDescriptors`: minden ételnél általánosan ajánlott kifejezések.
- `groupDescriptors`: ételcsoport-specifikus kifejezések.
- `featureDescriptors`: az ételnév részleteihez kötődő finomabb kifejezések.
- `reviewDishNames`: a pilotban szakmai ellenőrzésre váró elnevezések.

**`data-public-anon-v4.js`**: a teljes CATA-tulajdonságlista (`sensoryDescriptors`) és az ételtörzs (`dishes`). A 4.3 ehhez a listához nem ad vagy vesz el elemet; csak szűrt ajánlásokat ad a tetejére. Ha új kifejezés kerül a teljes listába, érdemes az ajánlások között is elhelyezni.

**`app-public-anon-v4.js`**: megjelenítés és működés; a 4.3 speciális része a `cataRecommended`, `setCataDish`, `renderSensory` és `cataContext` függvények/objektumok.

## Vizsgálati forgatókönyvek

1. Leves: `Brokkolikrémleves`. Elvárt csoport `CREAM_SOUP`. Az ajánlások közt `Krémleves nem kellően sima`.
2. Leves: `Gyümölcsleves`. Elvárt csoport `FRUIT_SOUP`. A bővített javaslatok között `Gyümölcsdarabok szétfőttek`.
3. Második fogás: `Rántott halfilé, majonézes burgonyasaláta`. Elvárt csoportok többek között `FRIED_MEAT` és `FISH`; ajánlott `Panír nem ropogós` és `Halhús túl száraz`.
4. Leves: a `Húsdarabok rágósak` nem ajánlott krémlevesnél, de a **teljes, az adott fogástípusra érvényes** állománylistából mégis kereshető.
5. Ételváltás: a pontozás nem maradhat meg az előző ételről.
6. Kézi csoportválasztás: több csoport összevonható; új ételnél is megadható.
7. Export: ellenőrizze az eredeti oszlopokat és az új `*_cata_csoportok`, `*_cata_csoport_kezi` metaadatmezőket.

## Megfontolandó szakmai döntések

1. Néhány elnevezés önmagában nem árulja el a technológiát. Felülvizsgálandó példák: `Sósleves`, `Tejfölös leves`, `Vajraguleves`, `Ananászos csirke`, `Bolognai`, `Budapest szelet, tört burgonya`, `Gyros tészta`, `Gőzgombóc`, `Lucskos káposzta`, `Nudli`.
2. A kategóriák jelenleg **előzetes ajánlások**, nem automatikus szakértői ítéletek. A „Megfelelő” besorolás értékelési konvenció, nem klasszikus leíró.
3. A kiválasztott csoportokat exportáljuk, de a 4.3-as prototípus nem végzett külső R-feldolgozó-integrációs tesztet. Új oszlopokat **hozzáad**, a meglévők nevét nem módosítja.
4. A meglévő 1–5 értékelési és CATA-szabályok továbbra is érvényben vannak; ez a fejlesztés a **felkínált lista relevanciáját** javítja, nem validálja a skálát.

**Tesztelés:** JavaScript-szintaxisellenőrzés és Chromium DOM-alapú integrációs tesztek (többkomponensű és új étel, ajánlás és teljes lista, adatváltás, exportoszlopok) sikeresek. A teljes hálózati GitHub Pages/PWA-telepítési folyamatot és az R-feldolgozóval való együttműködést még külön ellenőrizni kell.

# Entry 5.0 – adatmodell és konyhai tesztterv

## A. Adatmodell és kapcsolatok

**Esemény:** `entry_event_id` (a korábbi `submissionId`), fogás: `course` (`Leves`, `Második fogás`), ételnév: `dish_name`.

**Komponens:** `entry_event_id + course + component_id` kulcs az adott étkezési eseményen belül. A komponens neve (`component_name`) és típusa (`component_type`) külön mező; az automatikus / manuális forrás (`component_source`) azonosítható. Az öt dimenzió `appearance_score`, `smell_score`, `taste_score`, `texture_score`, `overall_score` mezőn szerepel. Ezekhez a kiválasztott CATA-leírók `*_cata` oszlopokban, ` | ` elválasztóval tartoznak. A különböző komponensek ugyanazon ételen belül is eltérő tulajdonságokat kaphatnak.

**Skálaadat:** `entry_event_id + course + scope + component_id + scale_type + property`. A `scope` értéke `full_dish` vagy `component`; a `component_id` csak utóbbinál töltött. JAR esetén a `scale_type` = `JAR`, 1–5, a 3 optimális. Intenzitásnál `BASIC_TASTE_INTENSITY`, 0–5, és csak négy `property` engedélyezett: `sweet`, `salty`, `sour`, `bitter`. Az umami nincs a skálák között. Az értékelés hiánya **nem** egyenlő a nullás intenzitással.

**Változat:** `method_version = sensory-components-jar-basic4-2026-11-v1`, `manifest.schema_version = 2`.

**Megőrzött állomány:** az `entry_events.csv` az eddigi oszlopokat használja. A régi R Shiny szabályok változatlanul működhetnek a klasszikus mezőkön; az új táblák automatikus DSS-elemzése **még nincs bevezetve**.

## B. Javasolt működési ellenőrzés

1. Válasszon egy egyszerű levest (Brokkolikrémleves); ellenőrizze a „Krémleves” komponenst.
2. Válasszon „Csirkepaprikás galuskával” ételt; ellenőrizze a hús, galuska, mártás komponensajánlást, majd módosítsa manuálisan.
3. A teljes ételen adja meg a meglévő 1–5 pontokat és CATA-jellemzőket.
4. Minden megtartott komponensnél adjon 1–5 összminősítést. Próbálja ki egy részletes dimenzió CATA-listáját és teljes keresését.
5. Válasszon JAR-tulajdonságot, adjon 3-at; a nem pontozott, de hozzáadott JAR jelezzen hiányt a beküldésnél.
6. Édes, sós, savanyú, keserű intenzitásból egynek adjon 0 értéket, egynek 5-öt, a másik kettőt hagyja értékeletlenül. Umami-nevezésű intenzitásvezérlő ne legyen.
7. Váltson másik ételre; az előző komponensadatok és skálaértékek törlődjenek.
8. Mentse az eseményt. ZIP-exportban ellenőrizze az `entry_sensory_components.csv` és `entry_sensory_scales.csv` táblát.
9. Az `entry_events.csv` teljes oszloplistáját hasonlítsa össze egy régebbi, 4.3-as mintával; a DSS-hez szükséges mezők megmaradnak.
10. Pilothelyszínen ellenőrizze a használhatóságot és a 3–5 perces célidőt; ez még **nem validált**.

## C. Korlátozások és továbbfejlesztés

- A jelenlegi R Shiny döntéstámogató csak a régi esemény- és médiatáblákat olvassa; a két új táblához később import és összegző modell szükséges.
- A CSV/XLSX egyfájlos export csak az ételszintű régi sémát adja vissza; a teljes új érzékszervi exporthoz a ZIP-et használja.
- A v5 nem módosítja a régi hulladék- és hőmérsékletadat-beviteli logikát, sem a szakmai minősítés konstrukcióját.
- A komponensjelölések ételnév alapján történő felismerése hibázhat; a konyhai dolgozónak ellenőriznie kell a tényleges ételösszetételt.
- A CATA/JAR/kategórialisták szakértői felülvizsgálatra és későbbi empirikus validációra várnak.
- Ha a böngésző helyi adatai törlődnek, a még nem exportált események elveszhetnek: használja rendszeresen a ZIP-exportot és a JSON biztonsági mentést.

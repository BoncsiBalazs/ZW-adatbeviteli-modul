# ZeroWaste Entry 5.1 – változások

## 1. Komponensértékelés választható

Mindkét fogás érzékszervi részében a teljes étel értékelését követően megjelenik a kérdés: **„Szeretné külön értékelni a komponenseket?”**

- **Igen:** megjelennek az automatikusan ajánlott (módosítható) komponensek. Minden megtartott komponens összminősítését (1–5) rögzíteni kell. A CATA-, JAR- és alapíz-intenzitás vizsgálat választható.
- **Nem:** a komponensértékelés nem jelenik meg és nem kötelező. A teljes étel értékelése megmarad. Ha korábban már bevitt komponensadatokat, a rendszer törlés előtt megerősítést kér.
- A választás mindkét fogáshoz külön történik. Ételváltáskor újra választani kell.
- A válasz megadása a továbblépéshez szükséges.

## 2. Exportkompatibilitás

A korábbi `entry_events.csv` és `entry_media.csv` szerkezete változatlan. Az új ZIP-ben:
- `entry_sensory_components.csv`: csak akkor tartalmaz komponensértékelési sorokat, ha a felhasználó az **Igen** lehetőséget választotta, és kitöltötte azokat.
- `entry_sensory_scales.csv`: a teljes étel választható JAR- és alapízintenzitás-adatait, illetve Igen esetén a komponensek skálaadatait tartalmazza.
- **ÚJ:** `entry_sensory_component_status.csv`: minden étkezési eseményhez külön sorban rögzíti a leves és a második fogás `yes` / `no` választását. A korábbi 5.0-s adatok ismeretlen választását `legacy_unknown` jelöli.

Az R Shiny döntéstámogató az új státusztáblát még nem elemzi; a régi eseményadat-importot ez nem érinti.

## 3. Szövegezés

A hosszú magyarázó bekezdések helyett rövid, közérthető utasítások szerepelnek. A két érzékszervi lépés, a komponensértékelés, a CATA-ajánlások és a JAR-/intenzitásmezők kísérőszövege egyszerűsödött.

## Telepítés

A **teljes** csomag fájljait a fejlesztési GitHub-repozitórium gyökerébe másolja; az azonos nevűeket cserélje le. A szakdolgozati repozitóriumot ne módosítsa.

A böngészőben helyben tárolt adatok nem kerülnek automatikusan a GitHubra. Frissítés előtt a régi verzióból készítsen ZIP-exportot. A GitHub Pages önálló közzététele külön beállítást igényel.

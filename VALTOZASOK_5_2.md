# ZeroWaste Entry 5.2 – JAR és komponensajánlások

## JAR (ötfokozatú)
A felületen mindegyik kiválasztott JAR-jellemzőnél ezek a válaszok szerepelnek:

1. Egyáltalán nem intenzív
2. Inkább nem intenzív
3. Pont jó
4. Inkább intenzív
5. Nagyon intenzív

A numerikus értékek és az `entry_sensory_scales.csv` `JAR` rekordjainak 1–5 kódolása változatlan. A 0–5 pontos **alapíz-intenzitás** továbbra is külön módszer (édes, sós, savanyú, keserű; umami nincs).

**Módszertani megjegyzés:** a választott megfogalmazás közepén megfelelőségi ("Pont jó") kategória van, míg a két széle intenzitásjelző. Ez a klasszikus *túl kevés / pont jó / túl sok* JAR-tól eltérő válaszskála. A kutatásban a skáladefiníciót dokumentálni és dolgozói kognitív előteszttel ellenőrizni kell, különösen nem intenzitás jellegű dimenzióknál (pl. keménység, sűrűség). A korábbi és az új JAR-skála eredményeit közvetlenül nem célszerű egy adatállományként elemezni a skálaverzió figyelembevétele nélkül.

## Ételenként javasolt komponensek
- A törzsben szereplő **104 leveshez és 78 második fogáshoz** külön, ellenőrizhető komponensprofil tartozik a `sensory-v5-config.js` `dishComponentProfiles` részében.
- A leveseknél megkülönböztethető a lé, a zöldség/gyümölcs, a tészta/betét, a kenyérkocka és az explicit megnevezett hús vagy hal.
- A második fogásoknál külön profil kezel például hús + mártás + köret, rántott hal + panír + burgonyasaláta, valamint főzelék + feltét és édes főétel + öntet összeállításokat.
- A saláta/savanyúság, burgonyasaláta, virsli/kolbász, pirított kenyérkocka és tojásbetét új komponenskategória.
- Ismeretlen ételnél vagy kézzel módosított ételcsoportnál óvatos, szerkeszthető alapajánlás jelenik meg.
- Az ajánlások **nem receptúra-igazolások**: az értékelő módosíthatja a komponenseket és teljesen ki is hagyhatja a komponensértékelést.

## Kompatibilitás
A meglévő `entry_events.csv`, `entry_media.csv` és az 5.1-ben kialakított új CSV-táblák mezőnevei megmaradnak. A metódusverzió az új rekordokban változik. A jelenlegi R Shiny a külön komponens- és JAR-adatokat még nem elemzi automatikusan.

## Közzététel
A szakdolgozati repozitórium változatlanul marad; a fejlesztést a `ZW-adatbeviteli-modul` repozitóriumba kell feltölteni. Verzióváltás előtt az alkalmazásban tárolt adatokról ZIP-export ajánlott.

/* ZeroWaste Entry 5.0: kutatási pilot, szakértői validációra váró komponens- és skálakonfiguráció. */
window.ZW_SENSORY_V5 = {
  version: "sensory-components-jar5-curated-2026-11-v3",
  componentTypes: [
    { id:"salad", label:"Saláta / savanyúság", descriptors:{"Külső megjelenés":["Elszíneződött","Nem étvágygerjesztő"],"Íz":["Túl savanyú","Túl édes"],"Állomány":["Túl puha","Túl kemény"]}, jar:["acidity","firmness"] },
    { id:"potato_salad", label:"Burgonyasaláta", descriptors:{"Külső megjelenés":["Nem étvágygerjesztő"],"Íz":["Túl savanyú","Túl sós"],"Állomány":["Túl puha","Túl kemény","Széteső"]}, jar:["acidity","firmness"] },
    { id:"sausage", label:"Virsli / kolbász", descriptors:{"Külső megjelenés":["Megégett részeket tartalmaz"],"Íz":["Túl sós"],"Állomány":["Túl kemény","Rágós"]}, jar:["saltiness","firmness"] },
    { id:"croutons", label:"Pirított kenyérkocka", descriptors:{"Állomány":["Pirított kenyérkocka elázott","Túl kemény"]}, jar:["crispness"] },
    { id:"egg", label:"Tojás / tojásbetét", descriptors:{"Állomány":["Túl kemény","Túl puha"]}, jar:["firmness"] },
    { id:"soup_liquid", label:"Leveslé / alap", descriptors:{"Külső megjelenés":["Túl zavaros","Túl zsíros felszínű"],"Íz":["Ízetlen","Túl sós","Sótlan"],"Állomány":["Túl híg","Túl sűrű"]}, jar:["saltiness","spiciness","thickness"]},
    { id:"cream_soup", label:"Krémleves", descriptors:{"Külső megjelenés":["Szétvált krémleves","Kicsapódott habarású"],"Állomány":["Krémleves nem kellően sima","Túl híg","Túl sűrű"]}, jar:["saltiness","thickness","spiciness"]},
    { id:"fruit_liquid", label:"Gyümölcsleves leve", descriptors:{"Íz":["Túl édes","Túl savanyú","Nem eléggé édes","Nem eléggé savanyú"],"Állomány":["Túl híg","Túl sűrű"]}, jar:["sweetness","acidity","thickness"]},
    { id:"soup_insert", label:"Levesbetét", descriptors:{"Külső megjelenés":["Túl kevés betétet tartalmaz","Túl sok betétet tartalmaz"],"Állomány":["Levesbetét túl kemény","Levesbetét túl puha","Levesbetét összetapadt","Levesbetét szétesett"]}, jar:["firmness","softness"]},
    { id:"vegetables", label:"Zöldség / gyümölcsdarab", descriptors:{"Külső megjelenés":["Szétfőtt hatású"],"Állomány":["Zöldségdarabok túl kemények","Gyümölcsdarabok szétfőttek","Szétfőtt"]}, jar:["firmness","softness"]},
    { id:"meat", label:"Hús / feltét", descriptors:{"Külső megjelenés":["Kiszáradt","Megégett részeket tartalmaz"],"Íz":["Gyenge húsízű","Túl sós"],"Állomány":["Rágós","Hús inas","Hús túl rostos","Túl száraz"]}, jar:["juiciness","firmness","saltiness"]},
    { id:"fish", label:"Hal", descriptors:{"Külső megjelenés":["Kiszáradt"],"Íz":["Túl sós","Olajos ízű"],"Állomány":["Halhús túl száraz","Túl puha"]}, jar:["juiciness","saltiness"]},
    { id:"coating", label:"Panír / bunda", descriptors:{"Külső megjelenés":["Panír levált","Panír átázott"],"Állomány":["Panír nem ropogós","Panír túl kemény"]}, jar:["crispness","firmness"]},
    { id:"stew", label:"Főzelék", descriptors:{"Állomány":["Főzelék túl híg","Főzelék túl sűrű","Főzelék csomós","Főzelék lisztes szájérzetű"]}, jar:["thickness","saltiness"]},
    { id:"sauce", label:"Mártás / szaft", descriptors:{"Külső megjelenés":["Mártás szétvált"],"Állomány":["Mártás túl híg","Mártás túl sűrű","Mártás csomós"]}, jar:["thickness","saltiness","spiciness"]},
    { id:"pasta", label:"Tészta / galuska", descriptors:{"Állomány":["Tészta összetapadt","Tészta szétfőtt","Ragacsos","Túl kemény"]}, jar:["firmness","softness"]},
    { id:"rice", label:"Rizs / gabonaköret", descriptors:{"Állomány":["Rizs túl kemény","Rizs ragacsos","Köret kiszáradt"]}, jar:["firmness","softness"]},
    { id:"potato", label:"Burgonyaköret", descriptors:{"Állomány":["Burgonyapüré csomós","Köret kiszáradt","Túl kemény"]}, jar:["firmness","softness"]},
    { id:"main", label:"Főkomponens / egytálétel", descriptors:{"Külső megjelenés":["Kiszáradt","Szétesett"],"Íz":["Túl sós","Ízetlen"],"Állomány":["Túl száraz","Túl kemény","Túl puha"]}, jar:["saltiness","spiciness"]},
    { id:"sweet", label:"Édes főétel", descriptors:{"Íz":["Túl édes","Nem eléggé édes"],"Állomány":["Gőzgombóc tömör","Sütemény száraz","Pépes"]}, jar:["sweetness","softness"]},
    { id:"topping", label:"Öntet / szórat / feltét", descriptors:{"Külső megjelenés":["Kevés öntetet tartalmaz"],"Állomány":["Öntet túl híg","Öntet túl sűrű"]}, jar:["sweetness","thickness"]}
  ],
  // Kutatási pilot: név alapján javasolt komponensek, nem helyettesítik a receptúra-ellenőrzést.
  // A teljes ételtörzs ismert neveihez készített, kézzel módosítható profilok.
  dishComponentProfiles: {
  "Leves": {
    "Alföldi betyárleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Alföldi gulyásleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Alföldi gulyásleves csipetkével": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Csipetke",
        "kind": "soup_insert"
      }
    ],
    "Alföldi zöldségleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Almaleves": [
      {
        "name": "Gyümölcsleves leve",
        "kind": "fruit_liquid"
      },
      {
        "name": "Gyümölcsdarabok",
        "kind": "vegetables"
      }
    ],
    "Babgulyás": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Bableves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Bableves füstölt hússal": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      },
      {
        "name": "Húsdarabok",
        "kind": "meat"
      }
    ],
    "Bakonyi pandúrleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Bazsalikomos fűszeres paradicsomleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Betyárleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Borsókrémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Borsóleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Borsós zöldségleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Brokkolikrémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Burgonya leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Burgonyagulyás": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Burgonyaleves tejfölös kolbásszal": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Burgonya",
        "kind": "vegetables"
      },
      {
        "name": "Kolbász",
        "kind": "sausage"
      }
    ],
    "Csirkeaprólék leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Húsdarabok",
        "kind": "meat"
      }
    ],
    "Csirkebecsinált leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Húsdarabok",
        "kind": "meat"
      }
    ],
    "Csirkeragu leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Húsdarabok",
        "kind": "meat"
      }
    ],
    "Csont leves cérnametélttel": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Cérnametélt",
        "kind": "soup_insert"
      }
    ],
    "Csontleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Csontleves csigatésztával": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Csigatészta",
        "kind": "soup_insert"
      }
    ],
    "Csontleves cérnametélt": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Cérnametélt",
        "kind": "soup_insert"
      }
    ],
    "Csurgatott tojásleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Csurgatott tojás",
        "kind": "egg"
      }
    ],
    "Daragaluska leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Daragaluska",
        "kind": "soup_insert"
      }
    ],
    "Fokhagymakrémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Francia hagymaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Frankfurti leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Kelkáposzta",
        "kind": "vegetables"
      },
      {
        "name": "Virsli",
        "kind": "sausage"
      }
    ],
    "Galuskaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Galuska",
        "kind": "soup_insert"
      }
    ],
    "Gombakrémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Gombakrémleves pirított kenyérkockával": [
      {
        "name": "Gombakrémleves",
        "kind": "cream_soup"
      },
      {
        "name": "Pirított kenyérkocka",
        "kind": "croutons"
      }
    ],
    "Gombakrémleves,pirított kocka": [
      {
        "name": "Gombakrémleves",
        "kind": "cream_soup"
      },
      {
        "name": "Pirított kenyérkocka",
        "kind": "croutons"
      }
    ],
    "Gombaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Gombaleves zöldséggel": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Grízgaluska leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Grízgaluska",
        "kind": "soup_insert"
      }
    ],
    "Gulyásleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Gulyásleves csipetkével": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Csipetke",
        "kind": "soup_insert"
      }
    ],
    "Gyümölcsleves": [
      {
        "name": "Gyümölcsleves leve",
        "kind": "fruit_liquid"
      },
      {
        "name": "Gyümölcsdarabok",
        "kind": "vegetables"
      }
    ],
    "Hagyma krémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Halászlé": [
      {
        "name": "Halászlé leve",
        "kind": "soup_liquid"
      },
      {
        "name": "Halhús",
        "kind": "fish"
      }
    ],
    "Hamis betyárleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Hamis gulyásleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldségek",
        "kind": "vegetables"
      }
    ],
    "Hús leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Húsgombócleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Húsgombóc",
        "kind": "soup_insert"
      }
    ],
    "Jókai bableves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Karalábéleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Karfiolleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Kelkáposztaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Kertészleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Krumplileves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Köménymag leves pirított kenyérkockával": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Pirított kenyérkocka",
        "kind": "croutons"
      }
    ],
    "Köménymagleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Lebbencsleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Lebbenc",
        "kind": "soup_insert"
      }
    ],
    "Lencsegulyás": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Lencseleves virslivel": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      },
      {
        "name": "Virsli / kolbász",
        "kind": "sausage"
      }
    ],
    "Lencseleves zöldségesen": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Magyaros burgonya leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Magyaros karfiol leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Magyaros zöldbab leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Minestrone leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Májgaluska leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Májgaluska",
        "kind": "soup_insert"
      }
    ],
    "Májgombócleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Májgombóc",
        "kind": "soup_insert"
      }
    ],
    "Nyirségi gombócleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Gombóc",
        "kind": "soup_insert"
      }
    ],
    "Palócleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Paradicsomleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Pirított tésztaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Tészta",
        "kind": "soup_insert"
      }
    ],
    "Pulykaraguleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Húsdarabok",
        "kind": "meat"
      }
    ],
    "Raguleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Reszelttészta leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Reszelt tészta",
        "kind": "soup_insert"
      }
    ],
    "Rántott leves kenyérkockával": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Pirított kenyérkocka",
        "kind": "croutons"
      }
    ],
    "Sajtkrémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Sertésraguleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Húsdarabok",
        "kind": "meat"
      }
    ],
    "Szárnyasragúleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Sárgaborsó krémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Sárgaborsóleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Sóskaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Sósleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Tarhonyaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Tarhonya",
        "kind": "soup_insert"
      }
    ],
    "Tejfölös burgonyaleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Burgonyadarabok",
        "kind": "vegetables"
      }
    ],
    "Tejfölös karalábé leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Tejfölös karfiolleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Tejfölös leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Tejfölös zöldbableves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Tojásleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Tojásleves köménymagos": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Tyúkhúsleves cérnametélttel": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Cérnametélt",
        "kind": "soup_insert"
      }
    ],
    "Tárkonyos raguleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Tárkonyos zöldségleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Vajgaluska leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Vajgaluska",
        "kind": "soup_insert"
      }
    ],
    "Vajraguleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      }
    ],
    "Vegyes gyümölcsleves": [
      {
        "name": "Gyümölcsleves leve",
        "kind": "fruit_liquid"
      },
      {
        "name": "Gyümölcsdarabok",
        "kind": "vegetables"
      }
    ],
    "Vöröslencse krémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Zellerkrémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Zellerleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Zöldbableves tejföllel": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Zöldborsó leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Zöldborsóleves zöldséges galuskával": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      },
      {
        "name": "Galuska",
        "kind": "soup_insert"
      }
    ],
    "Zöldségkrémleves": [
      {
        "name": "Krémleves",
        "kind": "cream_soup"
      }
    ],
    "Zöldségleves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ],
    "Zöldségleves (galuskás)": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      },
      {
        "name": "Galuska",
        "kind": "soup_insert"
      }
    ],
    "Zöldségleves eperlevéllel": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      },
      {
        "name": "Tészta",
        "kind": "soup_insert"
      }
    ],
    "Árpakása leves": [
      {
        "name": "Leveslé",
        "kind": "soup_liquid"
      },
      {
        "name": "Zöldség / hüvelyes",
        "kind": "vegetables"
      }
    ]
  },
  "Második fogás": {
    "Ananászos csirke": [
      {
        "name": "Ananászos csirke",
        "kind": "main"
      }
    ],
    "Ananászos csirkemell, párolt rizs": [
      {
        "name": "Ananászos csirkemell",
        "kind": "meat"
      },
      {
        "name": "Párolt rizs",
        "kind": "rice"
      }
    ],
    "Ananászos csirkemell, párolt rizzsel": [
      {
        "name": "Ananászos csirkemell",
        "kind": "meat"
      },
      {
        "name": "Párolt rizs",
        "kind": "rice"
      }
    ],
    "Babfőzelék pörkölttel": [
      {
        "name": "Babfőzelék",
        "kind": "stew"
      },
      {
        "name": "Pörkölt",
        "kind": "meat"
      },
      {
        "name": "Pörkölt szaftja",
        "kind": "sauce"
      }
    ],
    "Babfőzelék, sertés apró": [
      {
        "name": "Babfőzelék",
        "kind": "stew"
      },
      {
        "name": "Sertésapró",
        "kind": "meat"
      }
    ],
    "Babfőzelék, vagdalt": [
      {
        "name": "Babfőzelék",
        "kind": "stew"
      },
      {
        "name": "Vagdalt",
        "kind": "meat"
      }
    ],
    "Bolognai": [
      {
        "name": "Spagetti / tészta",
        "kind": "pasta"
      },
      {
        "name": "Bolognai ragu",
        "kind": "sauce"
      }
    ],
    "Bolognai spagetti": [
      {
        "name": "Spagetti",
        "kind": "pasta"
      },
      {
        "name": "Bolognai ragu",
        "kind": "sauce"
      }
    ],
    "Borsos tokány, párolt rizs, csemege uborka": [
      {
        "name": "Borsos tokány",
        "kind": "meat"
      },
      {
        "name": "Tokány szaftja",
        "kind": "sauce"
      },
      {
        "name": "Párolt rizs",
        "kind": "rice"
      },
      {
        "name": "Csemege uborka",
        "kind": "salad"
      }
    ],
    "Budapest szelet, tört burgonya": [
      {
        "name": "Budapest szelet",
        "kind": "meat"
      },
      {
        "name": "Ragu / mártás",
        "kind": "sauce"
      },
      {
        "name": "Tört burgonya",
        "kind": "potato"
      }
    ],
    "Budapesti ragu, párolt rizs": [
      {
        "name": "Budapesti ragu",
        "kind": "meat"
      },
      {
        "name": "Párolt rizs",
        "kind": "rice"
      }
    ],
    "Burgonyafőzelék, vagdalt": [
      {
        "name": "Burgonyafőzelék",
        "kind": "stew"
      },
      {
        "name": "Vagdalt",
        "kind": "meat"
      }
    ],
    "Bácskai tarhonyás hús, csemege uborka": [
      {
        "name": "Tarhonyás hús",
        "kind": "main"
      },
      {
        "name": "Csemege uborka",
        "kind": "salad"
      }
    ],
    "Csirkemell Orly módra, sült burgonya, savanyúság": [
      {
        "name": "Csirkemell",
        "kind": "meat"
      },
      {
        "name": "Orly-bunda",
        "kind": "coating"
      },
      {
        "name": "Sült burgonya",
        "kind": "potato"
      },
      {
        "name": "Savanyúság",
        "kind": "salad"
      }
    ],
    "Csirkemellfilé grill, burgonyapüré": [
      {
        "name": "Grillezett csirkemell",
        "kind": "meat"
      },
      {
        "name": "Burgonyapüré",
        "kind": "potato"
      }
    ],
    "Csirkepaprikás, tészta": [
      {
        "name": "Csirkehús",
        "kind": "meat"
      },
      {
        "name": "Paprikás mártás",
        "kind": "sauce"
      },
      {
        "name": "Tészta",
        "kind": "pasta"
      }
    ],
    "Csirkepaprikás, tésztával": [
      {
        "name": "Csirkehús",
        "kind": "meat"
      },
      {
        "name": "Paprikás mártás",
        "kind": "sauce"
      },
      {
        "name": "Tészta",
        "kind": "pasta"
      }
    ],
    "Finomfőzelék vagdalttal": [
      {
        "name": "Finomfőzelék",
        "kind": "stew"
      },
      {
        "name": "Vagdalt",
        "kind": "meat"
      }
    ],
    "Finomfőzelék, vagdalt": [
      {
        "name": "Finomfőzelék",
        "kind": "stew"
      },
      {
        "name": "Vagdalt",
        "kind": "meat"
      }
    ],
    "Grízes metélt lekvárral": [
      {
        "name": "Grízes metélt",
        "kind": "sweet"
      },
      {
        "name": "Lekvár",
        "kind": "topping"
      }
    ],
    "Gyros tészta": [
      {
        "name": "Gyros hús",
        "kind": "meat"
      },
      {
        "name": "Tészta",
        "kind": "pasta"
      }
    ],
    "Gőzgombóc": [
      {
        "name": "Gőzgombóc",
        "kind": "sweet"
      }
    ],
    "Halpaprikás, sült burgonya": [
      {
        "name": "Hal",
        "kind": "fish"
      },
      {
        "name": "Paprikás mártás",
        "kind": "sauce"
      },
      {
        "name": "Sült burgonya",
        "kind": "potato"
      }
    ],
    "Halpaprikás, tésztaköret": [
      {
        "name": "Hal",
        "kind": "fish"
      },
      {
        "name": "Paprikás mártás",
        "kind": "sauce"
      },
      {
        "name": "Tésztaköret",
        "kind": "pasta"
      }
    ],
    "Harcsapaprikás, tészta": [
      {
        "name": "Harcsa",
        "kind": "fish"
      },
      {
        "name": "Paprikás mártás",
        "kind": "sauce"
      },
      {
        "name": "Tészta",
        "kind": "pasta"
      }
    ],
    "Hentestokány, sült burgonya": [
      {
        "name": "Hentestokány",
        "kind": "meat"
      },
      {
        "name": "Tokány szaftja",
        "kind": "sauce"
      },
      {
        "name": "Sült burgonya",
        "kind": "potato"
      }
    ],
    "Húsgombóc, paradicsommártással": [
      {
        "name": "Húsgombóc",
        "kind": "meat"
      },
      {
        "name": "Paradicsommártás",
        "kind": "sauce"
      }
    ],
    "Húsos rakott tészta": [
      {
        "name": "Húsos rakott tészta",
        "kind": "main"
      }
    ],
    "Krumplis tészta": [
      {
        "name": "Krumplis tészta",
        "kind": "main"
      }
    ],
    "Káposztás tészta": [
      {
        "name": "Káposztás tészta",
        "kind": "main"
      }
    ],
    "Lekváros bukta": [
      {
        "name": "Lekváros bukta",
        "kind": "sweet"
      }
    ],
    "Lencsefőzelék pörkölttel": [
      {
        "name": "Lencsefőzelék",
        "kind": "stew"
      },
      {
        "name": "Pörkölt",
        "kind": "meat"
      },
      {
        "name": "Pörkölt szaftja",
        "kind": "sauce"
      }
    ],
    "Lucskos káposzta": [
      {
        "name": "Lucskos káposzta",
        "kind": "main"
      }
    ],
    "Mexikói csirkemell, bulgur": [
      {
        "name": "Mexikói csirkemell",
        "kind": "meat"
      },
      {
        "name": "Bulgur",
        "kind": "rice"
      }
    ],
    "Mákos guba, vaníliasodóval": [
      {
        "name": "Mákos guba",
        "kind": "sweet"
      },
      {
        "name": "Vaníliasodó",
        "kind": "topping"
      }
    ],
    "Nudli": [
      {
        "name": "Nudli",
        "kind": "sweet"
      }
    ],
    "Paprikás burgonya kolbásszal, savanyúság": [
      {
        "name": "Paprikás burgonya",
        "kind": "main"
      },
      {
        "name": "Kolbász",
        "kind": "sausage"
      },
      {
        "name": "Savanyúság",
        "kind": "salad"
      }
    ],
    "Paradicsomos húsgombóc": [
      {
        "name": "Húsgombóc",
        "kind": "meat"
      },
      {
        "name": "Paradicsommártás",
        "kind": "sauce"
      }
    ],
    "Paradicsomos húsgombóc főtt burgonyával": [
      {
        "name": "Húsgombóc",
        "kind": "meat"
      },
      {
        "name": "Paradicsommártás",
        "kind": "sauce"
      },
      {
        "name": "Főtt burgonya",
        "kind": "potato"
      }
    ],
    "Paradicsomos káposztafőzelék, sertés apró": [
      {
        "name": "Paradicsomos káposztafőzelék",
        "kind": "stew"
      },
      {
        "name": "Sertésapró",
        "kind": "meat"
      }
    ],
    "Pulykamell, petrezselymes burgonya": [
      {
        "name": "Pulykamell",
        "kind": "meat"
      },
      {
        "name": "Petrezselymes burgonya",
        "kind": "potato"
      }
    ],
    "Pulykaragu, párolt rizs": [
      {
        "name": "Pulykaragu",
        "kind": "meat"
      },
      {
        "name": "Ragu szaftja",
        "kind": "sauce"
      },
      {
        "name": "Párolt rizs",
        "kind": "rice"
      }
    ],
    "Pásztortarhonya": [
      {
        "name": "Pásztortarhonya",
        "kind": "main"
      }
    ],
    "Rakott brokkoli bulgurral": [
      {
        "name": "Rakott brokkoli bulgurral",
        "kind": "main"
      }
    ],
    "Rakott karfiol": [
      {
        "name": "Rakott karfiol",
        "kind": "main"
      }
    ],
    "Rakott kelkáposzta": [
      {
        "name": "Rakott kelkáposzta",
        "kind": "main"
      }
    ],
    "Rizseshús, cékla befőtt": [
      {
        "name": "Rizseshús",
        "kind": "main"
      },
      {
        "name": "Cékla",
        "kind": "salad"
      }
    ],
    "Rántott csirke, petrezselymes burgonya": [
      {
        "name": "Rántott csirke",
        "kind": "meat"
      },
      {
        "name": "Panír",
        "kind": "coating"
      },
      {
        "name": "Petrezselymes burgonya",
        "kind": "potato"
      }
    ],
    "Rántott csirke, petrezselymes burgonya, káposztasaláta": [
      {
        "name": "Rántott csirke",
        "kind": "meat"
      },
      {
        "name": "Panír",
        "kind": "coating"
      },
      {
        "name": "Petrezselymes burgonya",
        "kind": "potato"
      },
      {
        "name": "Káposztasaláta",
        "kind": "salad"
      }
    ],
    "Rántott csirkemell, burgonyapüré": [
      {
        "name": "Rántott csirkemell",
        "kind": "meat"
      },
      {
        "name": "Panír",
        "kind": "coating"
      },
      {
        "name": "Burgonyapüré",
        "kind": "potato"
      }
    ],
    "Rántott hal, petrezselymes burgonya": [
      {
        "name": "Rántott hal",
        "kind": "fish"
      },
      {
        "name": "Panír",
        "kind": "coating"
      },
      {
        "name": "Petrezselymes burgonya",
        "kind": "potato"
      }
    ],
    "Rántott halfilé, majonézes burgonyasaláta": [
      {
        "name": "Rántott halfilé",
        "kind": "fish"
      },
      {
        "name": "Panír",
        "kind": "coating"
      },
      {
        "name": "Majonézes burgonyasaláta",
        "kind": "potato_salad"
      }
    ],
    "Rántott halfilé, majonézes kukorica": [
      {
        "name": "Rántott halfilé",
        "kind": "fish"
      },
      {
        "name": "Panír",
        "kind": "coating"
      },
      {
        "name": "Majonézes kukorica",
        "kind": "salad"
      }
    ],
    "Sajtos csirkemell, kukoricás rizs": [
      {
        "name": "Sajtos csirkemell",
        "kind": "meat"
      },
      {
        "name": "Kukoricás rizs",
        "kind": "rice"
      }
    ],
    "Sajtos csirkemell, petrezselymes burgonya": [
      {
        "name": "Sajtos csirkemell",
        "kind": "meat"
      },
      {
        "name": "Petrezselymes burgonya",
        "kind": "potato"
      }
    ],
    "Sajtos tészta": [
      {
        "name": "Sajtos tészta",
        "kind": "main"
      }
    ],
    "Sertéspörkölt, tésztaköret, csemege uborka": [
      {
        "name": "Sertéspörkölt",
        "kind": "meat"
      },
      {
        "name": "Pörkölt szaftja",
        "kind": "sauce"
      },
      {
        "name": "Tésztaköret",
        "kind": "pasta"
      },
      {
        "name": "Csemege uborka",
        "kind": "salad"
      }
    ],
    "Szerb rizseshús, céklasaláta": [
      {
        "name": "Szerb rizseshús",
        "kind": "main"
      },
      {
        "name": "Céklasaláta",
        "kind": "salad"
      }
    ],
    "Székelykáposzta": [
      {
        "name": "Székelykáposzta",
        "kind": "main"
      }
    ],
    "Sárgaborsó főzelék, lecsókolbásszal": [
      {
        "name": "Sárgaborsófőzelék",
        "kind": "stew"
      },
      {
        "name": "Lecsókolbász",
        "kind": "sausage"
      }
    ],
    "Sárgaborsó-főzelék, sertéssült": [
      {
        "name": "Sárgaborsófőzelék",
        "kind": "stew"
      },
      {
        "name": "Sertéssült",
        "kind": "meat"
      }
    ],
    "Sült csirke, káposztás tészta, burgonya": [
      {
        "name": "Sült csirke",
        "kind": "meat"
      },
      {
        "name": "Káposztás tészta",
        "kind": "pasta"
      },
      {
        "name": "Burgonya",
        "kind": "potato"
      }
    ],
    "Sült csirkecomb hagymás burgonya": [
      {
        "name": "Sült csirkecomb",
        "kind": "meat"
      },
      {
        "name": "Hagymás burgonya",
        "kind": "potato"
      }
    ],
    "Sült csirkemell, hagymás tört burgonya": [
      {
        "name": "Sült csirkemell",
        "kind": "meat"
      },
      {
        "name": "Hagymás tört burgonya",
        "kind": "potato"
      }
    ],
    "Tarhonyás hús, csemege uborka": [
      {
        "name": "Tarhonyás hús",
        "kind": "main"
      },
      {
        "name": "Csemege uborka",
        "kind": "salad"
      }
    ],
    "Tarhonyás hús, savanyúság": [
      {
        "name": "Tarhonyás hús",
        "kind": "main"
      },
      {
        "name": "Savanyúság",
        "kind": "salad"
      }
    ],
    "Tavaszi sertésszelet, tört burgonya": [
      {
        "name": "Tavaszi sertésszelet",
        "kind": "meat"
      },
      {
        "name": "Tört burgonya",
        "kind": "potato"
      }
    ],
    "Tejberizs, gyümölcsöntettel": [
      {
        "name": "Tejberizs",
        "kind": "sweet"
      },
      {
        "name": "Gyümölcsöntet",
        "kind": "topping"
      }
    ],
    "Tejfölös zöldbabfőzelék, sertéspörkölt": [
      {
        "name": "Zöldbabfőzelék",
        "kind": "stew"
      },
      {
        "name": "Sertéspörkölt",
        "kind": "meat"
      },
      {
        "name": "Pörkölt szaftja",
        "kind": "sauce"
      }
    ],
    "Tojásos galuska, céklasaláta": [
      {
        "name": "Tojásos galuska",
        "kind": "main"
      },
      {
        "name": "Céklasaláta",
        "kind": "salad"
      }
    ],
    "Tökfőzelék pörkölttel": [
      {
        "name": "Tökfőzelék",
        "kind": "stew"
      },
      {
        "name": "Pörkölt",
        "kind": "meat"
      },
      {
        "name": "Pörkölt szaftja",
        "kind": "sauce"
      }
    ],
    "Tökfőzelék, sült virsli": [
      {
        "name": "Tökfőzelék",
        "kind": "stew"
      },
      {
        "name": "Sült virsli",
        "kind": "sausage"
      }
    ],
    "Túrós tészta": [
      {
        "name": "Túrós tészta",
        "kind": "sweet"
      }
    ],
    "Zöldborsófőzelék, nuggets": [
      {
        "name": "Zöldborsófőzelék",
        "kind": "stew"
      },
      {
        "name": "Nuggets",
        "kind": "meat"
      },
      {
        "name": "Panír / bunda",
        "kind": "coating"
      }
    ],
    "Zöldborsófőzelék, sertéssült": [
      {
        "name": "Zöldborsófőzelék",
        "kind": "stew"
      },
      {
        "name": "Sertéssült",
        "kind": "meat"
      }
    ],
    "Zöldborsófőzelék, sült virsli": [
      {
        "name": "Zöldborsófőzelék",
        "kind": "stew"
      },
      {
        "name": "Sült virsli",
        "kind": "sausage"
      }
    ],
    "Édeskáposzta főzelék": [
      {
        "name": "Édeskáposzta-főzelék",
        "kind": "stew"
      }
    ],
    "Óvári csirkemell, burgonyapüré": [
      {
        "name": "Óvári csirkemell",
        "kind": "meat"
      },
      {
        "name": "Burgonyapüré",
        "kind": "potato"
      }
    ]
  }
},
  jarScaleLabels: ["Egyáltalán nem intenzív", "Inkább nem intenzív", "Pont jó", "Inkább intenzív", "Nagyon intenzív"],
  jarProperties: [
    {id:"saltiness",label:"Sósság",low:"Túl kevéssé sós",high:"Túl sós"},
    {id:"sweetness",label:"Édesség",low:"Túl kevéssé édes",high:"Túl édes"},
    {id:"acidity",label:"Savanyúság",low:"Túl kevéssé savanyú",high:"Túl savanyú"},
    {id:"bitterness",label:"Keserűség",low:"Túl kevéssé keserű",high:"Túl keserű"},
    {id:"spiciness",label:"Fűszeresség",low:"Túl enyhe",high:"Túl fűszeres"},
    {id:"thickness",label:"Sűrűség",low:"Túl híg",high:"Túl sűrű"},
    {id:"firmness",label:"Keménység",low:"Túl puha",high:"Túl kemény"},
    {id:"softness",label:"Puhaság",low:"Túl kemény",high:"Túl puha"},
    {id:"juiciness",label:"Szaftosság",low:"Túl száraz",high:"Túl szaftos"},
    {id:"crispness",label:"Ropogósság",low:"Nem elég ropogós",high:"Túl ropogós"}
  ],
  basicTastes: [
    {id:"sweet",label:"Édes"},
    {id:"salty",label:"Sós"},
    {id:"sour",label:"Savanyú"},
    {id:"bitter",label:"Keserű"}
  ]
};

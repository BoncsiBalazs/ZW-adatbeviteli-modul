/* ZeroWaste Entry 5.0: kutatási pilot, szakértői validációra váró komponens- és skálakonfiguráció. */
window.ZW_SENSORY_V5 = {
  version: "sensory-components-jar-basic4-2026-11-v1",
  componentTypes: [
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

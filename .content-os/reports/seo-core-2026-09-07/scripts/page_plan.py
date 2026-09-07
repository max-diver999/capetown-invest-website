# -*- coding: utf-8 -*-
"""Page-by-page plan for capetown-invest.com. One row per existing URL.
action: keep | rewrite | merge | close | create
Evidence: Semrush za/uk/us/de volumes 2026-09-07 + XMLRiver top-10 + GSC 90d."""
import csv,collections,io
R=[]
def add(url,coll,action,target,vol,note,wave):
    R.append(dict(url=url,collection=coll,action=action,target=target,demand=vol,note=note,wave=wave))

AREAS={"durbanville":10090,"paarl":8780,"somerset-west":8020,"hermanus":7380,"rondebosch":3070,"hout-bay":2920,
"newlands":1990,"sea-point":1970,"franschhoek":1760,"claremont":1710,"clifton":1420,"milnerton":1310,"camps-bay":1300,
"constantia":1210,"kalk-bay-false-bay":1020,"woodstock":940,"tamboerskloof":830,"bantry-bay":820,"blouberg":690,
"table-view":690,"fresnaye":610,"llandudno":590,"green-point":230,"gardens":150,"v-and-a-waterfront":40,"de-waterkant":20}
MERGE_AREA={"gardens":"/areas/city-bowl/","de-waterkant":"/areas/city-bowl/","v-and-a-waterfront":"/areas/atlantic-seaboard/"}
for s,v in AREAS.items():
    if s in MERGE_AREA:
        add(f"/areas/{s}-property-investment/","areas","merge",MERGE_AREA[s],v,
            "цель «{X} property investment» = 0; собственного спроса тоже нет","2")
    else:
        add(f"/areas/{s}-property-investment/","areas","rewrite",
            f"«property for sale in {s.replace('-',' ')}» + «{s.replace('-',' ')} property»",v,
            "URL и H1 под investment-фрейм с нулём спроса; переписать в профиль пригорода с ценами","1")

COMPARE={"cape-town-vs-johannesburg-property-investment":170,"cape-town-vs-durban-property-investment":50,
"paarl-vs-stellenbosch-property-investment":30,"cape-town-vs-dubai-property-investment":0,
"cape-town-vs-stellenbosch-property":0,"sea-point-vs-camps-bay-investment":0,"century-city-vs-durbanville-investment":0,
"century-city-vs-sea-point-investment":0,"somerset-west-vs-constantia-investment":0,
"atlantic-seaboard-vs-winelands-investment":0,"off-plan-vs-resale-cape-town-investment":0,
"western-cape-vs-gauteng-property-investment":0,"cape-town-vs-lisbon-property-investment":0,
"cape-town-vs-portugal-property-investment":0,"cape-town-vs-mauritius-property-investment":0}
for s,v in COMPARE.items():
    if v>0: add(f"/compare/{s}/","compare","rewrite",f"«{s.replace('-property-investment','').replace('-',' ')}»",v,"заголовок под реальную фразу без хвоста «property investment»","2")
    else: add(f"/compare/{s}/","compare","merge","/areas/ (сравнительная таблица в хабе)",0,"целевая фраза = 0 показов в za","2")

DEV={"rabie-property-developers":590,"devmco-group":320,"amdec-property-investments":320,
"growthpoint-waterfront":2400,"val-de-vie-estate":6600,"blok-urban-developers":90,"prospekt-property-development":20}
for s,v in DEV.items():
    act="rewrite" if s=="devmco-group" else "keep"
    note="в GSC 36 показов на своём же бренде при позиции 30-41: страница не отвечает на «who is devmco group»" if s=="devmco-group" else "бренд с реальным спросом, страница ранжируется"
    add(f"/developers/{s}/","developers",act,f"«{s.replace('-',' ')}»",v,note,"2" if act=="rewrite" else "-")

PROJ=["acacia-house-woodstock","amdec-hout-bay-project","azure-camps-bay-beach","camps-bay-infinity",
"chestercourt-redevelopment","foreshore-place-cape-town","granger-bay-waterfront","green-village-val-de-vie",
"harbour-arch-amdec-foreshore","infinity-milnerton","makers-landing-waterfront","nine-palms-century-city",
"nineons-green-point","observatory-green","on-park-century-city","onehundredonm-sea-point","oneonr-de-waterkant",
"pearl-valley-nova","rhapsody-burgundy-estate","rockwell-tower-cape-town","silo-district-residences",
"skywater-century-city","the-charlotte-cape-town","the-ridge-clifton","three43onb-sea-point","two-oceans-beach",
"venice-house-cbd","zero2one-sea-point"]
for s in PROJ:
    add(f"/projects/{s}/","projects","keep","имя проекта",None,"лучший по CTR раздел сайта: 15% на the-ridge-clifton, 8% на silo-district","-")

SEG={"uk-buyers-cape-town-property":"Британия","us-buyers-cape-town-property":"США",
"german-buyers-cape-town-property":"Германия","cape-town-property-for-uk-retirees":"Британия, пенсионеры"}
for s,c in SEG.items():
    add(f"/segments/{s}/","segments","rewrite",f"визы, право и деньги для покупателя из {c}",None,
        "«{страна} buyers cape town property» = 0 показов; переписать под визовый и правовой кластер этой страны","2")

GUIDES_KEEP={"cape-town-rates-taxes-property":"«city of cape town rates» 390 + «rates and taxes cape town» 140",
"short-term-rental-rules-cape-town":"STR-байлоу, 535 показов в GSC",
"cape-town-property-market-data-lightstone":"«lightstone» 6 600 + «lightstone property report» 260",
"cape-town-property-prices-by-suburb-2026":"«cape town property prices» 140 + suburb-хвост",
"cape-town-property-market-forecast-2026-2027":"293 показа, позиция 7,7",
"cape-town-semigration-property-guide":"«semigration» 210 + «best place to live in south africa» 390",
"south-africa-transfer-duty-explained":"«transfer duty south africa» 880",
"highest-rental-yield-suburbs-cape-town":"«best rental yield suburbs cape town», выдача редакционная",
"cape-town-rental-yield-guide":"«cape town rental yield», выдача редакционная",
"can-foreigners-buy-property-south-africa":"uk 20 + us 50 + za 140, выдача без порталов",
"retirement-visa-south-africa-property":"«south africa retirement visa» us 170 + uk 70 + za 70",
"financially-independent-visa-south-africa":"визовый кластер, выдача из иммиграционных консультантов",
"does-buying-property-give-residency-south-africa":"92 показа, позиция 11",
"south-africa-capital-gains-tax-property":"налоговый кластер",
"section-35a-withholding-tax-explained":"уникальный для нерезидента вопрос",
"fica-requirements-foreign-property-buyers":"70 показов, GSC подтверждает запросы",
"power-of-attorney-property-south-africa":"57 показов, позиция 34,6, есть что чинить",
"conveyancing-fees-cape-town":"«conveyancing fees calculator» 90 + «conveyancing fees south africa» 70",
"nhbrc-warranty-south-africa-new-build":"67 показов",
"cape-town-str-bylaw-2026-registration":"49 показов, позиция 6,1",
"airbnb-investment-cape-town-guide":"83 показа",
"airbnb-yields-by-suburb-cape-town":"21 показ",
"century-city-property-investment-guide":"4 клика, CTR 4,5%",
"stellenbosch-property-investment-guide":"«property for sale in stellenbosch» 2 400 + «houses for sale in stellenbosch» 2 900",
"atlantic-seaboard-property-investment-guide":"«atlantic seaboard» 590",
"southern-suburbs-cape-town-property":"«southern suburbs cape town» 5 400",
"cape-town-city-bowl-property-investment":"«city bowl cape town» 480",
"cape-town-municipal-valuation-objection-gv":"«property valuation cape town» 480",
"cape-town-vacancy-rates-rental":"12,5% CTR",
"long-term-rental-cape-town-guide":"«long term rentals cape town» в GSC",
"non-resident-rental-income-tax-south-africa":"42 показа",
"uk-tax-south-africa-rental-property":"британский налоговый угол",
"south-africa-exchange-control-property":"валютный контроль",
"repatriating-property-sale-proceeds":"вывод денег после продажи",
"selling-property-south-africa-non-resident":"продажа нерезидентом",
"cape-town-digital-nomad-property-guide":"«south africa digital nomad visa» us 140 + uk 70",
"cape-town-remote-work-visa-property":"тот же кластер",
"returning-south-african-expat-property":"«returning to south africa» au 20, ниша",
"foreigner-property-tax-south-africa-hub":"хаб налогов для иностранца",
"sectional-title-vs-freehold-cape-town":"«sectional title vs freehold» 20",
"sectional-title-levies-cape-town":"«sectional title levies» 20",
"body-corporate-due-diligence-cape-town":"21 показ, позиция 4,4",
"body-corporate-airbnb-ban-rules":"STR-кластер",
"cost-of-buying-property-cape-town":"стоимость покупки",
"cost-of-selling-compliance-certificates":"сертификаты соответствия, «electrical compliance certificate cape town» 40",
"property-transfer-timeline-delays":"сроки передачи",
"due-diligence-cape-town-property":"процесс",
"how-to-buy-property-cape-town-step-by-step":"опорная процессная",
"buy-cape-town-property-remotely":"дистанционная покупка",
"buy-cape-town-property-foreigner":"иностранный покупатель",
"snagging-inspection-new-build-cape-town":"30 показов",
"off-plan-property-cape-town-guide":"офф-план",
"new-developments-cape-town-2026":"«new developments cape town» 1 600, но позиция 61",
"property-management-cape-town-cost":"«property management cape town» 320",
"cape-town-utilities-costs-owners-2026":"стоимость владения",
"load-shedding-property-cape-town":"«load shedding cape town» 1 000",
"cape-town-water-security-property":"водный риск",
"security-estates-cape-town-foreign-buyers":"охраняемые эстейты",
"cape-town-property-scams-avoid":"мошенничество",
"buy-to-let-cape-town-mortgage":"«buy to let cape town» 20",
"non-resident-mortgage-cape-town":"позиция 55,9, есть что чинить",
"eu-citizens-buying-cape-town-property":"европейский покупатель",
"cape-town-property-under-500k-usd":"ценовой порог",
"gross-vs-net-yield-cape-town":"методология доходности",
"best-areas-invest-cape-town-2026":"«best areas to invest in cape town» = 0",
"is-cape-town-property-good-investment-2026":"«is cape town property a good investment» = 0",
"cape-town-property-investment-guide":"«cape town property investment» = 0",
"cape-town-property-investment-checklist":"чек-лист, спроса нет",
}
GUIDE_ZERO={"best-areas-invest-cape-town-2026","is-cape-town-property-good-investment-2026",
"cape-town-property-investment-guide","cape-town-property-investment-checklist"}
GUIDE_REWRITE={"new-developments-cape-town-2026","power-of-attorney-property-south-africa",
"non-resident-mortgage-cape-town","south-africa-transfer-duty-explained","cape-town-municipal-valuation-objection-gv"}
for s,n in GUIDES_KEEP.items():
    if s in GUIDE_ZERO: add(f"/guides/{s}/","guides","merge","/guides/how-to-buy-property-cape-town-step-by-step/",0,n+"; склеить в опорную процессную","3")
    elif s in GUIDE_REWRITE: add(f"/guides/{s}/","guides","rewrite",n,None,"ранжируется ниже 30 при живом спросе","1")
    else: add(f"/guides/{s}/","guides","keep",n,None,"кластер подтверждён выдачей или GSC","-")

for s in ["cape-town-interest-rates-property-2026","cape-town-luxury-sales-record-2025","foreign-buyers-atlantic-seaboard-2025","va-waterfront-granger-bay-development","western-cape-property-forecast-2026"]:
    add(f"/news/{s}/","news","keep","новостной поток",None,"ссылочная поддержка кластеров, отдельного спроса нет","-")

for u,note in [("/","«cape town property» 1 600 / «property cape town» 1 600; сейчас позиция 48 при 20 показах"),
               ("/areas/","«cape town suburb map» 1 000; сейчас позиция 34,2 при 44 показах"),
               ("/guides/","95 показов, позиция 42,9"),
               ("/compare/","39 показов, позиция 66,4"),
               ("/projects/","18 показов"),
               ("/segments/","4 показа, позиция 65,2"),
               ("/developers/","9 показов, позиция 33,7")]:
    add(u,"index","rewrite","хаб раздела",None,note,"1")

CREATE=[
("/new-developments/","хаб","«new developments cape town» 1 600 + «new developments in cape town» 1 600 + «property developments cape town» 260 + «new developments western cape» 170",3630,"в топ-10 нет ни одного портала: newdevelopments.co.za, balwin.co.za, insideguide.co.za, riverlands.capetown","1"),
("/areas/southern-suburbs/","хаб макрорайона","«southern suburbs cape town» 5 400 + «property for sale in southern suburbs cape town» 1 000",6400,"в топ-10 Wikipedia #1, Property24 #2, privateproperty /neighbourhoods/ #3: редакционный формат берёт места","1"),
("/areas/northern-suburbs/","хаб макрорайона","«northern suburbs cape town» 2 900 + «property for sale in northern suburbs cape town» 210",3110,"Property24 #1, дальше sa-venues, Wikipedia, reddit","1"),
("/areas/atlantic-seaboard/","хаб макрорайона","«atlantic seaboard» 590 + «atlantic seaboard property for sale» 210",800,"Property24 #1, capetown.travel #2: наполовину туристическая, брать нижнюю половину","2"),
("/areas/city-bowl/","хаб макрорайона","«city bowl cape town» 480",480,"поглощает gardens и de waterkant","2"),
("/guides/cape-town-suburb-map/","инструмент","«cape town suburb map» 1 000 + «safest suburbs in cape town» 170 + «is woodstock cape town safe» 170 + «is muizenberg safe» 90",1600,"нет ни одной страницы под навигационный запрос по пригородам","1"),

("/guides/transfer-duty-calculator/","калькулятор","«transfer duty calculator» 2 400 + «bond costs calculator» 720 + «transfer cost calculator south africa» 20",3140,"калькулятор, а не текст; сейчас есть только объяснительная статья на позиции 34","1"),
("/guides/holiday-home-cape-town/","статья","«holiday home cape town» 1 000 + «buying a holiday home in south africa» 20",1020,"коммерческое намерение, отдельной страницы нет","2"),
("/guides/buy-a-house-in-cape-town/","статья","«buy a house in cape town» 390 + «cape town homes for sale» 480",870,"перехват общего покупательского запроса под редакционный формат","2"),
("/guides/farm-and-land-western-cape/","статья","«farm for sale western cape» 4 400 + «plot for sale cape town» 880 + «land for sale cape town» 720 + «wine farm for sale western cape» 170",6170,"выдача листинговая, но покупка фермы это процесс, которого никто не объясняет","2"),
("/guides/property-valuation-cape-town/","статья","«property valuation cape town» 480 + «how much is my house worth south africa»",480,"в GSC уже 5 показов на «cape town property valuations» при позиции 59","2"),
("/guides/retirement-village-cape-town/","статья","«retirement village cape town» 320",320,"пересекается с визовым кластером для британских пенсионеров","3"),
("/guides/moving-to-south-africa-from-uk/","статья","«moving to south africa from uk» 260 + «moving to south africa» uk 320 + «relocating to south africa» uk 70",650,"в топе reddit, gov.uk, перевозчики; ни одного агентства недвижимости","2"),
("/guides/moving-to-south-africa-from-usa/","статья","«moving to south africa» us 210 + «retire in south africa» us 50 + «relocating to south africa» us 90",350,"тот же паттерн для США","3"),
("/guides/cape-town-vs-johannesburg/","сравнение","«cape town vs johannesburg» 170 + «cape town or johannesburg» 20 + «best place to live in south africa» 390",580,"поглощает 12 склеенных страниц /compare/","2"),
("/guides/commercial-property-cape-town/","статья","«commercial property for sale cape town» 590",590,"смежный актив, страницы нет","3"),
("/developers/balwin-properties/","застройщик","«balwin properties» 5 400",5400,"в топ-10 по «new developments cape town» и «off plan property cape town» стоит вторым; своей страницы у нас нет","2"),
("/developers/berman-brothers/","застройщик","«berman brothers» 210",210,"встречается в выдаче по правовому кластеру","3"),
("/guides/cape-town-property-prices-per-square-metre/","данные","«average house price cape town» 20 + хвост по пригородам",None,"кормит все 23 переписанные страницы пригородов ценовой таблицей","3"),
]
for u,t,tgt,v,note,w in CREATE: add(u,"NEW","create",tgt,v,note,w)

# ---- output
buf=io.StringIO(); w=csv.DictWriter(buf,fieldnames=["wave","action","url","collection","target","demand","note"]);w.writeheader()
for r in sorted(R,key=lambda x:(x["wave"],x["action"],x["url"])): w.writerow({k:r[k] for k in w.fieldnames})
open('page-plan.csv','w',encoding='utf-8').write(buf.getvalue())
c=collections.Counter(r["action"] for r in R)
print("=== PAGE PLAN ===")
for k,v in c.most_common(): print(f"  {k:<8} {v}")
print("  TOTAL rows",len(R))
print("\n=== by wave ===")
wv=collections.Counter((r["wave"],r["action"]) for r in R)
for k in sorted(wv): print(f"  волна {k[0]}  {k[1]:<8} {wv[k]}")
print("\n=== by collection ===")
cc=collections.defaultdict(collections.Counter)
for r in R: cc[r["collection"]][r["action"]]+=1
for k in sorted(cc): print(f"  {k:<12} {dict(cc[k])}")

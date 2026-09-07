#!/usr/bin/env python3
"""Top-10 Google snapshots for capetown-invest.com priority queries, via XMLRiver.
0.025 RUB per request. Country ids are ISO-3166 numeric + 2000."""
import urllib.request, urllib.parse, json, os, ssl, re, time, html, sys

ctx = ssl.create_default_context()
U = os.environ['XMLRIVER_USER']; K = os.environ['XMLRIVER_KEY']
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'serp_snapshot.json')
CC = {'za': 2710, 'uk': 2826, 'us': 2840, 'de': 2276}
LANG = {'za': 'en', 'uk': 'en', 'us': 'en', 'de': 'de'}

QUERIES = [
 # --- ZA: commercial head
 ("houses for sale in cape town","za","commercial-metro"),
 ("apartments for sale cape town","za","commercial-metro"),
 ("property for sale cape town","za","commercial-metro"),
 ("cape town property","za","commercial-metro"),
 ("cape town apartments","za","commercial-metro"),
 ("cape town property prices","za","price"),
 ("new developments cape town","za","newbuild"),
 ("off plan property cape town","za","newbuild"),
 ("property developments cape town","za","newbuild"),
 # --- ZA: suburb "for sale"
 ("property for sale in durbanville","za","suburb-forsale"),
 ("houses for sale in durbanville","za","suburb-forsale"),
 ("property for sale in hermanus","za","suburb-forsale"),
 ("houses for sale in somerset west","za","suburb-forsale"),
 ("property for sale in stellenbosch","za","suburb-forsale"),
 ("property for sale in muizenberg","za","suburb-forsale"),
 ("apartments for sale in sea point","za","suburb-forsale"),
 ("property for sale in camps bay","za","suburb-forsale"),
 ("property for sale in constantia","za","suburb-forsale"),
 ("houses for sale in claremont","za","suburb-forsale"),
 ("property for sale in woodstock","za","suburb-forsale"),
 ("property for sale in langebaan","za","suburb-forsale"),
 ("property for sale in fish hoek","za","suburb-forsale"),
 ("property for sale in century city","za","suburb-forsale"),
 # --- ZA: bare suburb names (tourism / homonym check)
 ("camps bay","za","suburb-bare"),
 ("sea point","za","suburb-bare"),
 ("constantia","za","suburb-bare"),
 ("century city","za","suburb-bare"),
 ("stellenbosch","za","suburb-bare"),
 ("hout bay","za","suburb-bare"),
 ("durbanville","za","suburb-bare"),
 ("woodstock cape town","za","suburb-bare"),
 ("claremont","za","suburb-bare"),
 ("hermanus","za","suburb-bare"),
 ("v&a waterfront","za","suburb-bare"),
 ("muizenberg","za","suburb-bare"),
 # --- ZA: macro geography
 ("southern suburbs cape town","za","macro"),
 ("northern suburbs cape town","za","macro"),
 ("atlantic seaboard","za","macro"),
 ("western cape property for sale","za","region"),
 ("houses for sale western cape","za","region"),
 ("houses for sale in south africa","za","country"),
 # --- ZA: legal / money / process
 ("transfer duty south africa","za","legal"),
 ("city of cape town rates","za","legal"),
 ("can foreigners buy property in south africa","za","legal-foreign"),
 ("conveyancing fees calculator","za","legal"),
 ("sectional title vs freehold","za","legal"),
 # --- ZA: investment frame + rental
 ("south africa property investment","za","investment"),
 ("property investment cape town","za","investment"),
 ("cape town rental yield","za","yield"),
 ("airbnb cape town","za","str"),
 ("best rental yield suburbs cape town","za","yield"),
 # --- ZA: adjacent asset types
 ("farm for sale western cape","za","asset-farm"),
 ("plot for sale cape town","za","asset-land"),
 ("commercial property for sale cape town","za","asset-commercial"),
 ("retirement village cape town","za","asset-retirement"),
 ("wine farm for sale western cape","za","asset-farm"),
 # --- ZA: projects / developers
 ("silo district","za","project"),
 ("harbour arch cape town","za","project"),
 ("val de vie","za","project"),
 ("pearl valley","za","project"),
 ("rabie property group","za","developer"),
 ("balwin properties","za","developer"),
 # --- UK
 ("houses for sale in cape town","uk","commercial-metro"),
 ("cape town property for sale","uk","commercial-metro"),
 ("property for sale in south africa","uk","country"),
 ("houses for sale in south africa","uk","country"),
 ("south africa property for sale","uk","country"),
 ("cape town property","uk","commercial-metro"),
 ("is cape town safe","uk","life"),
 ("moving to south africa from uk","uk","relocation"),
 ("moving to south africa","uk","relocation"),
 ("south africa retirement visa","uk","visa"),
 ("financially independent person visa south africa","uk","visa"),
 ("south africa visa requirements","uk","visa"),
 ("can foreigners buy property in south africa","uk","legal-foreign"),
 ("buying property in south africa as a foreigner","uk","legal-foreign"),
 ("hermanus property for sale","uk","suburb-forsale"),
 ("franschhoek property for sale","uk","suburb-forsale"),
 ("camps bay property for sale","uk","suburb-forsale"),
 ("cost of living south africa","uk","life"),
 ("cape town property investment","uk","investment"),
 ("transfer duty south africa","uk","legal"),
 # --- US
 ("houses for sale in south africa","us","country"),
 ("cape town real estate","us","commercial-metro"),
 ("south africa real estate","us","country"),
 ("houses for sale in cape town","us","commercial-metro"),
 ("cape town property for sale","us","commercial-metro"),
 ("is cape town safe","us","life"),
 ("south africa retirement visa","us","visa"),
 ("south africa digital nomad visa","us","visa"),
 ("can foreigners buy property in south africa","us","legal-foreign"),
 ("moving to south africa","us","relocation"),
 ("retire in south africa","us","relocation"),
 ("property investment south africa","us","investment"),
 # --- DE
 ("haus kaufen kapstadt","de","commercial-metro"),
 ("immobilien kapstadt","de","commercial-metro"),
 ("immobilien südafrika","de","country"),
 ("haus kaufen südafrika","de","country"),
 ("auswandern südafrika","de","relocation"),
 ("ist kapstadt sicher","de","life"),
 ("kapstadt wohnung kaufen","de","commercial-metro"),
]

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=90, context=ctx).read().decode('utf-8','ignore')

def parse(xml):
    out=[]
    for m in re.finditer(r'<doc>(.*?)</doc>', xml, re.S):
        b=m.group(1)
        u=re.search(r'<url>(.*?)</url>',b,re.S); t=re.search(r'<title>(.*?)</title>',b,re.S)
        p=re.search(r'<passage>(.*?)</passage>',b,re.S)
        if not u: continue
        url=html.unescape(re.sub('<[^>]+>','',u.group(1))).strip()
        out.append({'url':url,'domain':urllib.parse.urlparse(url).netloc.replace('www.',''),
            'title':html.unescape(re.sub('<[^>]+>','',t.group(1))).strip() if t else '',
            'snippet':html.unescape(re.sub('<[^>]+>','',p.group(1))).strip()[:200] if p else ''})
    return out

def gurl(q,db):
    return 'https://xmlriver.com/search/xml?'+urllib.parse.urlencode({
        'user':U,'key':K,'query':q,'groupby':10,'country':CC[db],'lr':LANG[db],'device':'desktop','ai':1})

if __name__=='__main__':
    res=json.load(open(OUT,encoding='utf-8')) if os.path.exists(OUT) else {}
    t0=time.time(); n=0
    for q,db,cl in QUERIES:
        key=f"{db}|{q}"
        if key in res and res[key].get('serp'): continue
        try:
            xml=fetch(gurl(q,db)); items=parse(xml)
            res[key]={'query':q,'db':db,'cluster':cl,
                      'ai_block':'<ai><present>1</present>' in xml or '<ai>' in xml,
                      'serp':[dict(pos=i+1,**it) for i,it in enumerate(items)]}
            n+=1
        except Exception as e:
            res[key]={'query':q,'db':db,'cluster':cl,'serp':[],'error':str(e)[:120]}
        json.dump(res,open(OUT,'w',encoding='utf-8'),ensure_ascii=False)
        ours=[x['pos'] for x in res[key].get('serp',[]) if 'capetown-invest' in x['url']]
        print(f"[{int(time.time()-t0):>4}s] {db} {q:<45} n={len(res[key].get('serp',[])):>2} ours={ours or '-'}",flush=True)
    print(f"DONE {len(res)} queries, {n} new requests, cost ~{n*0.025:.2f} RUB")

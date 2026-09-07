# -*- coding: utf-8 -*-
"""Кто держит топ-10 по кластерам. Вердикт: наш кластер или нет."""
import json,collections
d=json.load(open('serp_snapshot.json'))
PORTAL={'property24.com','privateproperty.co.za','myproperty.co.za','myroof.co.za','gumtree.co.za','rightmove.co.uk',
'zoopla.co.uk','realtor.com','zillow.com','propertyfinder.ae','properstar.co.uk','just.property','propertycoza.com',
'sahometraders.co.za','property.co.za','realestate.com.au','properties.lefigaro.com','luxuryestate.com','jamesedition.com','search.savills.com'}
AGENCY={'pamgolding.co.za','seeff.com','remax.co.za','remaxliving.co.za','greeff.co.za','engelvoelkers.com',
'sothebysrealty.co.za','sothebysrealty.com','harcourts.co.za','chaseveritt.co.za','tysonprop.co.za','jawitz.co.za',
'rawson.co.za','fineandcountry.co.za','knightfrank.com','savills.com','leapfrog.co.za','quay1.co.za','dgproperties.co.za',
'onlyrealty.co.za','lcproperties.co.za','hermanuspropertysales.co.za','hermanus.seeff.com','wallettandfinch.com',
'rolixrealestate.co.za','redzproperties.co.za','dogongroup.co.za','atlanticpacific.co.za','eazi.com','trafalgar.co.za'}
TRAVEL={'tripadvisor.com','tripadvisor.co.za','booking.com','airbnb.com','airbnb.co.za','lonelyplanet.com','capetown.travel',
'expedia.com','hotels.com','viator.com','getyourguide.com','sa-venues.com','wheretostay.co.za','timeout.com','agoda.com',
'afristay.com','travelground.com','capetownmagazine.com','perfecthideaways.co.za','cntraveler.com','southafrica.net',
'visitstellenbosch.org','hermanus-tourism.co.za','houtbaytourism.com','capepointroute.co.za','thebrokebackpacker.com',
'wandercapetown.com','bestofsouthafricatravel.com','newkingshotel.co.za','pearlvalleyhotel.com','top100golfcourses.com','skyscanner.net'}
MEDIA={'en.wikipedia.org','wikipedia.org','businesstech.co.za','news24.com','iol.co.za','moneyweb.co.za','bizcommunity.com',
'dailymaverick.co.za','timeslive.co.za','fin24.com','theguardian.com','bbc.com','reddit.com','quora.com','youtube.com',
'facebook.com','instagram.com','tiktok.com','linkedin.com','medium.com','numbeo.com','expatarrivals.com','internations.org',
'expatica.com','nomadlist.com','independent.co.uk','expatistan.com','sahistory.org.za','insideguide.co.za'}
GOV={'capetown.gov.za','sars.gov.za','gov.za','dha.gov.za','westerncape.gov.za','csos.org.za','nhbrc.org.za','ppra.org.za',
'resbank.co.za','home-affairs.gov.za','stellenbosch.gov.za','gov.uk','dirco.gov.za','su.ac.za'}
def cls(dom):
    dl=dom.lower().replace('www.','')
    if dl in PORTAL: return 'портал'
    if dl in AGENCY: return 'агентство'
    if dl in TRAVEL: return 'travel'
    if dl in MEDIA: return 'медиа/UGC'
    if dl in GOV or dl.endswith('.gov.za') or dl.endswith('.gov.uk'): return 'гос'
    return 'редакция/прочее'
agg=collections.defaultdict(lambda: collections.Counter()); n=collections.Counter(); dom=collections.defaultdict(collections.Counter)
for k,v in d.items():
    s=v.get('serp')
    if not s: continue
    key=(v['db'],v['cluster']); n[key]+=1
    for x in s[:10]:
        agg[key][cls(x['domain'])]+=1
        dom[key][x['domain'].replace('www.','')]+=1
print(f"{'db':<3} {'кластер':<20} {'зпр':>4} | доля топ-10 по типу | вердикт")
VERD={}
for key in sorted(agg,key=lambda k:(k[0],k[1])):
    c=agg[key]; tot=sum(c.values())
    pf=100*(c['портал']+c['агентство'])/tot; tr=100*(c['travel'])/tot; ed=100*(c['редакция/прочее']+c['медиа/UGC']+c['гос'])/tot
    if tr>=35: v="НЕ НАШ: туризм"
    elif pf>=60: v="ЗАКРЫТ: нужен листинг"
    elif pf>=35: v="частично: нижняя половина топа"
    else: v="НАШ: редакционная выдача"
    VERD[key]=(round(pf),round(tr),round(ed),v,n[key],dom[key].most_common(4))
    parts=" ".join(f"{k} {100*x//tot}%" for k,x in c.most_common() if x)
    print(f"{key[0]:<3} {key[1]:<20} {n[key]:>4} | {parts:<58} | {v}")
json.dump({f"{k[0]}|{k[1]}":v for k,v in VERD.items()},open('serp_verdict.json','w'),ensure_ascii=False,indent=1)

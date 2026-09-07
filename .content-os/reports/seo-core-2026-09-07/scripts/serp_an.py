import json,collections,re,sys
d=json.load(open('serp_snapshot.json'))
PORTAL={'property24.com','privateproperty.co.za','myproperty.co.za','property.co.za','gumtree.co.za','olx.co.za','rightmove.co.uk','zoopla.co.uk','realtor.com','zillow.com','idealista.com','tranio.com','propertyfinder.ae','a-place-in-the-sun.com','primelocation.com','themovechannel.com','propertyguides.com','kyero.com','listglobally.com','jamesedition.com','luxuryestate.com','africa-property.com','propertywheel.co.za','realestate.com.au'}
AGENCY={'pamgolding.co.za','seeff.com','remax.co.za','greeff.co.za','engelvoelkers.com','sothebysrealty.co.za','harcourts.co.za','chaseveritt.co.za','tyson-properties.co.za','jawitz.co.za','rawson.co.za','dogonGroup.co.za','dogongroup.co.za','fineandcountry.co.za','knightfrank.com','savills.com','christiesrealestate.com','leapfrog.co.za','claremart.co.za','capetownproperty.co.za','atlanticpacific.co.za','horizon.co.za','pinnacleproperty.co.za','onlyrealty.co.za','lewandco.co.za','rennie.co.za'}
TRAVEL={'tripadvisor.com','tripadvisor.co.za','booking.com','airbnb.com','airbnb.co.za','lonelyplanet.com','capetown.travel','expedia.com','hotels.com','viator.com','getyourguide.com','sa-venues.com','wheretostay.co.za','timeout.com','agoda.com','nightsbridge.co.za','afristay.com','travelground.com','capetownmagazine.com','secretcapetown.co.za'}
MEDIA={'wikipedia.org','businesstech.co.za','news24.com','iol.co.za','moneyweb.co.za','bizcommunity.com','dailymaverick.co.za','timeslive.co.za','sundaytimes.co.za','fin24.com','theguardian.com','bbc.com','reddit.com','quora.com','youtube.com','facebook.com','instagram.com','tiktok.com','linkedin.com','medium.com','numbeo.com','expatarrivals.com','internations.org','expatica.com','nomadlist.com'}
GOV={'capetown.gov.za','sars.gov.za','gov.za','dha.gov.za','westerncape.gov.za','csos.org.za','nhbrc.org.za','ppra.org.za','resbank.co.za','home-affairs.gov.za'}
RENT={'airbnb.com','booking.com'}
def cls(dom):
    dl=dom.lower()
    if dl in PORTAL: return 'portal'
    if dl in AGENCY: return 'agency'
    if dl in TRAVEL: return 'travel'
    if dl in MEDIA: return 'media'
    if dl in GOV: return 'gov'
    if dl.endswith('.gov.za'): return 'gov'
    if 'law' in dl or 'attorney' in dl or 'inc.co.za' in dl or dl in {'stbb.co.za','cliffedekkerhofmeyr.com','werksmans.com','schindlers.co.za','snymans.com','miltons.law.za'}: return 'legal'
    if dl.endswith('.co.za') or dl.endswith('.com'): return 'other'
    return 'other'
rows=[]
for k,v in d.items():
    s=v.get('serp',[])
    if not s: rows.append((v['db'],v['cluster'],v['query'],'NO DATA','','')); continue
    cats=collections.Counter(cls(x['domain']) for x in s[:10])
    top=[f"{x['pos']}.{x['domain']}" for x in s[:6]]
    ours=[x['pos'] for x in s if 'capetown-invest' in x['url']]
    rows.append((v['db'],v['cluster'],v['query'],dict(cats),' '.join(top),ours))
rows.sort(key=lambda r:(r[0],r[1]))
for r in rows:
    print(f"{r[0]} | {r[1]:<22} | {r[2][:44]:<44} | {r[3]}\n      {r[4]}  ours={r[5] or '-'}")

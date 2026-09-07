# -*- coding: utf-8 -*-
"""Ёмкость рынка после трёх фильтров: туризм, чужое, выдача."""
import importlib.util,collections,json
spec=importlib.util.spec_from_file_location('d','demand.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
V=json.load(open('serp_verdict.json'))
D=[r for r in m.D if not r[0].startswith('{')]
MAP={('commercial','metro'):'commercial-metro',('commercial','suburb'):'suburb-forsale',
('commercial','country'):'country',('commercial','region'):'region',('commercial','macro'):'macro',
('newbuild',None):'newbuild',('legal',None):'legal',('money',None):'legal',('legal-foreign',None):'legal-foreign',
('visa',None):'visa',('relocation',None):'relocation',('life',None):'life',('choice',None):'macro',
('investment',None):'investment',('yield',None):'yield',('management',None):'yield',('market',None):'yield',
('str',None):'str',('project',None):'project',('developer',None):'developer',('price',None):'price',
('asset-farm',None):'asset-farm',('asset-land',None):'asset-land',('asset-commercial',None):'asset-commercial',
('asset-retirement',None):'asset-retirement',('place',None):'suburb-bare',('navigational-place',None):'suburb-bare',
('rental',None):'str',('navigational-portal',None):'__other__',('navigational-agency',None):'__other__'}
def serpcl(cl,geo):
    return MAP.get((cl,geo)) or MAP.get((cl,None))
def verdict(db,sc):
    for k in (f"{db}|{sc}", f"za|{sc}", f"uk|{sc}", f"us|{sc}"):
        if k in V: return V[k][3]
    return None
buckets=collections.defaultdict(lambda:[0,0])
rows=[]
for kw,db,vol,cpc,intent,cl,geo in D:
    if vol<=0 or cl.endswith('ZERO'): continue
    sc=serpcl(cl,geo)
    if sc=='__other__': b='чужой бренд (портал/агентство)'
    else:
        vd=verdict(db,sc)
        b = vd or 'не снята выдача'
    buckets[b][0]+=vol; buckets[b][1]+=1
    rows.append((kw,db,vol,cl,sc,b))
tot=sum(v[0] for v in buckets.values())
print(f"ВЕСЬ СПРОС (нефильтрованный): {tot:,}/мес\n")
order=['НАШ: редакционная выдача','частично: нижняя половина топа','ЗАКРЫТ: нужен листинг','НЕ НАШ: туризм','чужой бренд (портал/агентство)','не снята выдача']
for b in order:
    if b in buckets: print(f"  {b:<34} {buckets[b][0]:>9,}  {100*buckets[b][0]/tot:>5.1f}%   ({buckets[b][1]} фраз)")
ours=buckets['НАШ: редакционная выдача'][0]; part=buckets['частично: нижняя половина топа'][0]
print(f"\nАДРЕСУЕМО БЕЗ ЛИСТИНГА: {ours:,} полностью + {part:,} частично = {ours+part:,}/мес ({100*(ours+part)/tot:.1f}%)")
# breakdown of addressable by cluster and db
print("\n--- адресуемое по кластеру ---")
ac=collections.Counter(); an=collections.Counter()
for kw,db,vol,cl,sc,b in rows:
    if b.startswith('НАШ') or b.startswith('частично'): ac[sc]+=vol; an[sc]+=1
for k,v in ac.most_common(): print(f"  {k:<20} {v:>8,}  ({an[k]} фраз)")
print("\n--- адресуемое по базе ---")
ad=collections.Counter()
for kw,db,vol,cl,sc,b in rows:
    if b.startswith('НАШ') or b.startswith('частично'): ad[db]+=vol
for k,v in ad.most_common(): print(f"  {k:<4} {v:>8,}")
json.dump(rows,open('capacity_rows.json','w'),ensure_ascii=False)

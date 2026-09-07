# Demand behind each existing /areas/ page, ZA database, Semrush 2026-09-07
S={ # suburb: {pattern: volume}
"bantry-bay":{"property for sale in":320,"houses for sale in":480,"X property":20,"apartments for sale in":0},
"blouberg":{"property for sale in":0,"houses for sale in":480,"X property":210,"apartments for sale in":0},
"camps-bay":{"property for sale in":170,"houses for sale in":480,"X property":260,"apartments for sale in":390},
"claremont":{"property for sale in":390,"houses for sale in":1300,"X property":20,"apartments for sale in":0},
"clifton":{"property for sale in":390,"houses for sale in":1000,"X property":30,"apartments for sale in":0},
"constantia":{"property for sale in":170,"houses for sale in":720,"X property":320,"apartments for sale in":0},
"de-waterkant":{"property for sale in":0,"houses for sale in":0,"X property":20,"apartments for sale in":0},
"durbanville":{"property for sale in":2900,"houses for sale in":6600,"X property":590,"apartments for sale in":0},
"franschhoek":{"property for sale in":1000,"houses for sale in":720,"X property":40,"apartments for sale in":0},
"fresnaye":{"property for sale in":0,"houses for sale in":590,"X property":20,"apartments for sale in":0},
"gardens":{"property for sale in":0,"houses for sale in":140,"X property":10,"apartments for sale in":0},
"green-point":{"property for sale in":0,"houses for sale in":40,"X property":20,"apartments for sale in":170},
"hermanus":{"property for sale in":3600,"houses for sale in":2900,"X property":880,"apartments for sale in":0},
"hout-bay":{"property for sale in":1300,"houses for sale in":1300,"X property":320,"apartments for sale in":0},
"kalk-bay-false-bay":{"property for sale in":590,"houses for sale in":320,"X property":110,"apartments for sale in":0},
"llandudno":{"property for sale in":170,"houses for sale in":390,"X property":30,"apartments for sale in":0},
"milnerton":{"property for sale in":720,"houses for sale in":480,"X property":110,"apartments for sale in":0},
"newlands":{"property for sale in":390,"houses for sale in":1600,"X property":0,"apartments for sale in":0},
"paarl":{"property for sale in":2900,"houses for sale in":5400,"X property":480,"apartments for sale in":0},
"rondebosch":{"property for sale in":1000,"houses for sale in":1900,"X property":170,"apartments for sale in":0},
"sea-point":{"property for sale in":210,"houses for sale in":590,"X property":170,"apartments for sale in":1000},
"somerset-west":{"property for sale in":2900,"houses for sale in":4400,"X property":720,"apartments for sale in":0},
"table-view":{"property for sale in":480,"houses for sale in":210,"X property":0,"apartments for sale in":0},
"tamboerskloof":{"property for sale in":480,"houses for sale in":260,"X property":90,"apartments for sale in":0},
"v-and-a-waterfront":{"property for sale in":0,"houses for sale in":0,"X property":20,"apartments for sale in":20},
"woodstock":{"property for sale in":320,"houses for sale in":590,"X property":30,"apartments for sale in":0},
}
rows=sorted(((k,sum(v.values())) for k,v in S.items()),key=lambda x:-x[1])
tot=sum(r[1] for r in rows)
print(f"{'suburb':<22} {'demand/mo':>9}  verdict")
KEEP=[];MERGE=[]
for k,v in rows:
    verdict = "переделать" if v>=500 else ("переделать (тонко)" if v>=200 else "склеить в хаб")
    (KEEP if v>=200 else MERGE).append(k)
    print(f"{k:<22} {v:>9,}  {verdict}")
print(f"{'TOTAL':<22} {tot:>9,}")
print("\nпеределать:",len(KEEP),"| склеить:",len(MERGE),MERGE)

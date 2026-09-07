# GSC query rows, capetown-invest.com, 2026-06-09..2026-09-04
G=[("vivante village val de vie",2,4,15.8),("500000",0,1,2),("a place to live",0,1,5),("about devmco",0,15,41.6),
("airbnb income cape town",0,2,83),("airbnb regulations south africa",0,1,63),("best areas in cape town to invest in property",0,1,22),
("buy to rent",0,1,1),("can a foreigner buy property in south africa",0,1,61),("cape town airbnb regulations",0,1,60),
("cape town municipal rates",0,1,10),("cape town property prices 2026",0,1,9),("cape town property valuations",0,5,59.4),
("cape town property values",0,1,51),("cape town rates",0,1,10),("cape town real estate investment",0,2,78.5),
("cape town short term rental",0,1,61),("cape town tax",0,1,28),("cape town vs dubai",0,1,36),
("city of cape town airbnb regulations",0,1,54),("city of cape town property rates",0,1,7),("city of cape town rates and taxes",0,1,20),
("compare estate investment options",0,5,54.8),("council tax band",0,2,9),("council tax band checker",0,1,10),
("devmco",0,2,30.5),("devmco group",0,3,32.7),("devmco group projects",0,3,29),
("distance between stellenbosch and cape town",0,1,2),("distance to stellenbosch",0,1,2),("foreshore",0,1,62),
("foreshore cape town",0,1,54),("how much can my airbnb earn cape town",0,2,89),("how to get poa",0,1,88),
("how to obtain power of attorney in south africa",0,1,78),("international home loans",0,2,91),("international mortgage",0,1,89),
("invest cape town",0,3,42.7),("invest durbanville",0,1,17),("investec val de vie",0,1,61),
("investment property cape town",0,1,71),("latest housing market trends northern suburbs cape town 2025 2026",0,1,18),
("long term rentals cape town",0,3,38.3),("new property developments cape town 2026",0,37,68.5),("on park century city",0,1,38),
("overseas landlord tax *",0,5,90.4),("power of attorney form south africa",0,1,78),("power of attorney in south africa",0,2,89),
("power of attorney south africa",0,1,95),("properties built by devmco group",0,3,40),("property investment cape town",0,7,73.7),
("property rates cape town",0,1,10),("prospekt",0,1,6),("rabie property developers",0,1,10),
("rabie property developers reviews",0,3,8.3),("rates cape town",0,1,27),("rates city of cape town",0,1,10),
("rates on property",0,1,11),("resident rate",0,1,45),("retired person visa",0,4,79),
("retirement visa south africa",0,3,82),("rhapsody burgundy estate",0,2,12),("rhapsody estate",0,3,11),
("setting up an airbnb cape town",0,3,66.3),("short term rental bylaw",0,1,9),("sibaya developers",0,3,53.7),
("silo district",0,1,56),("skywater",0,1,29),("skywater apartments",0,1,8),("skywater century city",0,6,11.3),
("south africa power of attorney",0,2,84.5),("south african power of attorney",0,1,88),("special power of attorney",0,1,90),
("special power of authority",0,1,93),("stellenbosch",0,2,2),("stellenbosch population",0,1,2),
("stellenbosch to cape town",0,1,2),("the charlotte apartments",0,1,8),("the charlotte cape town",0,1,9),
("val de vie south africa",0,1,61),("vivante village",0,1,15),("what documents are needed for fica",0,1,68),
("what documents are required for fica",0,1,64),("what does devmco group offer",0,3,39),("who is devmco group",0,12,34.1)]
import re,collections
CL=[('brand-project',r'devmco|rabie|prospekt|sibaya|vivante|val de vie|investec|skywater|rhapsody|charlotte|silo district|on park|foreshore'),
 ('legal-poa',r'power of attorney|poa|special power'),
 ('legal-fica',r'fica'),
 ('legal-rates',r'rates|council tax|municipal|resident rate|tax\b|valuation'),
 ('str',r'airbnb|short term rental|short-term'),
 ('rental',r'long term rental|buy to rent|rentals'),
 ('visa',r'visa|retired person'),
 ('money',r'mortgage|home loan|international'),
 ('investment',r'invest|investment'),
 ('newbuild',r'new property development|new development'),
 ('price-market',r'price|market|values'),
 ('choice',r'best areas|compare|vs '),
 ('geo-info',r'stellenbosch|distance|foreshore|place to live'),
]
def cl(q):
    for n,p in CL:
        if re.search(p,q): return n
    return 'other'
agg=collections.defaultdict(lambda:[0,0,0,[]])
for q,c,i,p in G:
    k=cl(q); agg[k][0]+=c; agg[k][1]+=i; agg[k][2]+=1; agg[k][3].append((i,q,p))
print(f"{'cluster':<16} {'clicks':>6} {'impr':>6} {'queries':>7}  top")
tot_c=tot_i=0
for k,(c,i,n,lst) in sorted(agg.items(),key=lambda x:-x[1][1]):
    tot_c+=c; tot_i+=i
    lst.sort(reverse=True)
    print(f"{k:<16} {c:>6} {i:>6} {n:>7}  " + "; ".join(f"{q}({ii}@{pp})" for ii,q,pp in lst[:3]))
print(f"{'TOTAL':<16} {tot_c:>6} {tot_i:>6} {len(G):>7}")

"""User-authorized exact PNG crops. Sources stay unchanged; no resampling/repainting."""
from pathlib import Path
from PIL import Image
import json,re

root=Path(__file__).resolve().parents[1]
assets=root/'public/assets'
scene=(root/'src/game/WorldScene.ts').read_text(encoding='utf-8')
groups={
 'cozy':('world/cozy-atlas-v1.png',{'grass':[27,30,257,252],'stone':[342,31,255,252],'wood':[656,31,255,252],'sand':[974,31,251,252],'wall':[17,350,282,246],'roof':[335,373,273,215],'door':[682,349,231,253],'window':[963,383,271,199],'tree':[17,648,280,286],'fence':[341,731,260,137],'gate':[666,721,237,193],'shrub':[967,721,267,193],'bench':[17,1007,281,202],'desk':[336,993,276,210],'chair':[688,984,194,229],'planter':[1000,980,214,238]}),
 'lucia':('characters/lucia-v1.png',{'standing':[140,75,390,1090],'seated':[750,155,335,1010]}),
 'yoon':('characters/yoon-v1.png',{'front':[195,10,215,495],'left':[660,15,205,490],'right':[1120,15,230,490],'back':[195,520,215,490],'sitFront':[650,575,230,430],'sitBack':[1100,575,270,420]}),
 'capybaras':('characters/capybaras-v1.png',{'mochi':[10,80,650,1020],'lilito':[740,350,480,750]}),
 'storefronts':('buildings/storefronts-v1.png',{'store':[10,410,590,550],'grocery':[603,345,642,615]}),
 'faith':('buildings/faith-v1.png',{'church':[61,13,503,611],'mosque':[658,18,538,608],'synagogue':[34,704,559,504],'gurdwara':[656,654,549,560]}),
 'parkWater':('objects/park-water-v1.png',{'lake':[14,219,791,505]}),
 'onsen':('objects/onsen-v1.png',{'pool':[40,230,1160,800]}),
 'living':('objects/living-v1.png',{'tv':[105,180,680,600],'sofa':[840,180,910,585]}),
 'home':('objects/home-furniture-v1.png',{'bed':[60,20,500,590],'bath':[645,75,585,480],'bookcase':[85,650,460,580],'workDesk':[630,700,600,500]}),
 'office':('objects/office-bath-v1.png',{'frontDesk':[20,440,625,610],'shower':[685,220,530,850]}),
 'kitchen':('objects/kitchen-v1.png',{'sink':[10,20,610,580],'stove':[710,30,460,560],'fridge':[125,630,375,600],'diningTable':[630,650,610,580]}),
}
output=assets/'single';output.mkdir(exist_ok=True)
manifest={};audit=[]
for group,(source,frames) in groups.items():
 im=Image.open(assets/source).convert('RGBA')
 for name,(x,y,w,h) in frames.items():
  assert x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,(group,name,im.size)
  target=f'single/{group}-{name}.png';crop=im.crop((x,y,x+w,y+h));
  if not (assets/target).exists():crop.save(assets/target)
  manifest[f'{group}.{name}']=target;audit.append({'key':f'{group}.{name}','source':source,'crop':[x,y,w,h],'output':target})
(root/'art/crop-manifest.json').write_text(json.dumps(audit,indent=2)+'\n',encoding='utf-8')
existing=root/'src/world/standaloneAssets.ts'
if existing.exists():manifest={**manifest,**json.loads(existing.read_text(encoding='utf-8').split('=',1)[1].strip().rstrip(';'))}
(root/'src/world/standaloneAssets.ts').write_text('export const standaloneAssets:Record<string,string>='+json.dumps(manifest,indent=2)+';\n',encoding='utf-8')

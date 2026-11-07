import { NpcRuntime } from '../world/npcRuntime';
import { supabase } from '../services/supabase';
import { activityTargets,chooseActivitySlot,advanceTrack,routeIndexForPoint } from '../world/activities';
import { villageBuildings,buildingApproach } from '../world/buildings';
import { park } from '../world/park';
import { worldNpcs } from '../world/npcs';
import { bathingTargets,freeBathSlot,onsen } from '../world/bathing';
import { updateLocation,setNpcLocation } from '../world/updateLocations';
import { planningPlots, requestBoard } from '../world/planning';
import { homeLayout, homeRooms, homeProps, studyDesk } from '../world/home';
import { unreadUpdates,updateEvents } from '../services/worldUpdates';
import type { RemotePlayer } from '../services/sharedWorld';
import { gameEvents } from './bridge';
import Phaser from 'phaser';
import { controls, interact, publish, resetControls, logActivity } from './bridge';
import { maps, move, nearby, portalAt, canStand, type MapId, type Point } from '../world/model';

export class WorldScene extends Phaser.Scene {
  private npcRuntime=new NpcRuntime();
  private npcViews=new Map<string,{image:Phaser.GameObjects.Image;name:Phaser.GameObjects.Text;cue:Phaser.GameObjects.Text;notice:Phaser.GameObjects.Text;water:Phaser.GameObjects.Graphics;immersed:boolean}>();
  private unreadNpcIds=new Set<string>();
  private heldNpc:string|undefined;
  private talkNpc(id:string){this.heldNpc=id;gameEvents.dispatchEvent(new CustomEvent('talk-npc',{detail:id}));}
  private remotePlayers:RemotePlayer[]=[];
  private remoteActors=new Map<string,{actor:Phaser.GameObjects.Container;seated:boolean;bathing:boolean}>();
  private worldNotices:Phaser.GameObjects.Text[]=[];
  private npcCues=new Map<string,Phaser.GameObjects.Text>();
  private npcNotices=new Map<string,Phaser.GameObjects.Text>();
  private refreshNotice=()=>{
    this.unreadNpcIds=new Set(unreadUpdates().filter(update=>update.target==='npc').map(update=>update.targetId));
    for(const [id,notice] of this.npcNotices){const unread=unreadUpdates().some(update=>update.target==='npc'&&update.targetId===id);notice.setVisible(unread);this.npcCues.get(id)?.setVisible(!unread);}
    for(const marker of this.worldNotices)marker.destroy();this.worldNotices=[];
    const updates=[...new Map(unreadUpdates().filter(u=>u.target==='world').map(u=>[u.targetId,u])).values()];
    for(const update of updates){const location=updateLocation(update);if(location&&location.map===this.mapId)this.worldNotices.push(this.label(location.x,location.y-45,'!','#ffe6a1',24).setBackgroundColor('#4c6248').setPadding(7,1));}
  };
  private mapId: MapId='garden';
  private position: Point={...maps.garden.spawn};
  private actor!: Phaser.GameObjects.Container;
  private keys!: Record<string,Phaser.Input.Keyboard.Key>;
  private lastState='';
  private tick=0;
  private seated=false;
  private bathingTargetId:string|null=null;
  private bathingSlotId:string|null=null;
  private actionTargetId:string|null=null;
  private actionSlotId:string|null=null;
  private actionRouteIndex=0;
  private facing:'front'|'back'|'left'|'right'='front';
  private highlight!: Phaser.GameObjects.Graphics;
  constructor() { super('world'); }
  preload() {
    const cx=this.scale.width/2,cy=this.scale.height/2;
    const loading=this.add.text(cx,cy-28,'Opening our little world…',{fontFamily:'monospace',fontSize:'15px',color:'#3e563e'}).setOrigin(.5);
    const progress=this.add.graphics();
    const showProgress=(value:number)=>{progress.clear();progress.fillStyle(0xe9e7cf);progress.fillRoundedRect(cx-130,cy,260,10,5);progress.fillStyle(0x718e64);progress.fillRoundedRect(cx-130,cy,260*value,10,5);};
    this.load.on('progress',showProgress);this.load.once('complete',()=>{this.load.off('progress',showProgress);progress.destroy();loading.destroy();});
    this.load.image('living',`${import.meta.env.BASE_URL}assets/objects/living-v1.png`);
    this.load.image('quietGrass',`${import.meta.env.BASE_URL}assets/tiles/quiet-grass-v2.png`);
    this.load.image('beachV2',`${import.meta.env.BASE_URL}assets/objects/beach-v2.png`);
    this.load.image('leaders',`${import.meta.env.BASE_URL}assets/characters/faith-leaders-v1.png`);
    this.load.image('storefronts',`${import.meta.env.BASE_URL}assets/buildings/storefronts-v1.png`);
    this.load.image('faith',`${import.meta.env.BASE_URL}assets/buildings/faith-v1.png`);
    this.load.image('parkWater',`${import.meta.env.BASE_URL}assets/objects/park-water-v1.png`);
    this.load.image('yoon',`${import.meta.env.BASE_URL}assets/characters/yoon-v1.png`);
    this.load.image('capybaras',`${import.meta.env.BASE_URL}assets/characters/capybaras-v1.png`);
    this.load.image('onsen',`${import.meta.env.BASE_URL}assets/objects/onsen-v1.png`);
    this.load.image('requestBoard',`${import.meta.env.BASE_URL}assets/objects/request-board-v1.png`);
    this.load.image('cozy',`${import.meta.env.BASE_URL}assets/world/cozy-atlas-v1.png`);
    this.load.image('lucia',`${import.meta.env.BASE_URL}assets/characters/lucia-v1.png`);
    this.load.image('office',`${import.meta.env.BASE_URL}assets/objects/office-bath-v1.png`);
    this.load.image('kitchen',`${import.meta.env.BASE_URL}assets/objects/kitchen-v1.png`);
    this.load.image('home',`${import.meta.env.BASE_URL}assets/objects/home-furniture-v1.png`);
  }
  create() {
    const atlas=this.textures.get('cozy');
    const frames:Record<string,number[]>={grass:[27,30,257,252],stone:[342,31,255,252],wood:[656,31,255,252],sand:[974,31,251,252],wall:[17,350,282,246],roof:[335,373,273,215],door:[682,349,231,253],window:[963,383,271,199],tree:[17,648,280,286],fence:[341,731,260,137],gate:[666,721,237,193],shrub:[967,721,267,193],bench:[17,1007,281,202],desk:[336,993,276,210],chair:[688,984,194,229],planter:[1000,980,214,238]};
    for(const [name,[x,y,w,h]] of Object.entries(frames))atlas.add(name,0,x,y,w,h);
    atlas.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const character=this.textures.get('lucia');
    character.add('standing',0,140,75,390,1090);
    character.add('seated',0,750,155,335,1010);
    character.setFilter(Phaser.Textures.FilterMode.LINEAR);
    for(const [key,frames] of Object.entries({storefronts:{store:[12,412,615,545],grocery:[627,347,616,608]},faith:{church:[61,13,503,611],mosque:[658,18,538,608],synagogue:[34,704,559,504],gurdwara:[656,654,549,560]},parkWater:{lake:[14,219,791,505],beach:[821,265,797,453]}})){for(const [name,[x,y,w,h]] of Object.entries(frames))this.textures.get(key).add(name,0,x,y,w,h);this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);}
    for(const [name,[x,y,w,h]] of Object.entries({cait:[200,21,246,581],samir:[798,20,251,582],eli:[196,644,262,593],harjit:[796,638,253,599]}))this.textures.get('leaders').add(name,0,x,y,w,h);
    this.textures.get('leaders').setFilter(Phaser.Textures.FilterMode.LINEAR);
    const yoon=this.textures.get('yoon');
    for(const [name,[x,y,w,h]] of Object.entries({front:[195,10,215,495],left:[660,15,205,490],right:[1120,15,230,490],back:[195,520,215,490],sitFront:[650,575,230,430],sitBack:[1100,575,270,420]}))yoon.add(name,0,x,y,w,h);
    yoon.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const capybaras=this.textures.get('capybaras');capybaras.add('mochi',0,10,80,650,1020);capybaras.add('lilito',0,740,350,480,750);capybaras.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('onsen').add('pool',0,40,230,1160,800);
    const furnitureFrames:Record<string,Record<string,number[]>>={
      living:{tv:[105,180,680,600],sofa:[840,180,910,585]},
      home:{bed:[60,20,500,590],bath:[650,80,580,470],bookcase:[85,650,460,580],workDesk:[635,710,595,480]},
      office:{frontDesk:[20,440,625,610],shower:[685,220,530,850]},
      kitchen:{sink:[10,20,610,580],stove:[710,30,460,560],fridge:[125,630,375,600],diningTable:[630,650,610,580]},
    };
    for(const [key,frames] of Object.entries(furnitureFrames)){
      const texture=this.textures.get(key);
      for(const [name,[x,y,w,h]] of Object.entries(frames))texture.add(name,0,x,y,w,h);
      texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,SHIFT',false) as Record<string,Phaser.Input.Keyboard.Key>;
    this.paint();
    updateEvents.addEventListener('change',this.refreshNotice);
    window.addEventListener('storage',this.refreshNotice);
    this.events.once('shutdown',()=>{updateEvents.removeEventListener('change',this.refreshNotice);window.removeEventListener('storage',this.refreshNotice);});
    const remote=(event:Event)=>{this.remotePlayers=(event as CustomEvent<RemotePlayer[]>).detail;};
    const restore=(event:Event)=>{const saved=(event as CustomEvent<RemotePlayer>).detail;if(saved.map_id!=='garden'&&saved.map_id!=='cottage')return;if(!Number.isFinite(saved.x)||!Number.isFinite(saved.y))return;this.mapId=saved.map_id;this.seated=saved.map_id==='cottage'&&saved.activity==='sitting';const bath=bathingTargets.find(target=>target.id===saved.activity_target&&target.map===saved.map_id);const slot=bath?.slots.find(slot=>slot.id===saved.activity_slot&&!slot.reservedFor);this.bathingTargetId=saved.activity==='bathing'&&slot?bath!.id:null;this.bathingSlotId=this.bathingTargetId?slot!.id:null;const action=activityTargets.find(target=>target.id===saved.activity_target&&target.map===saved.map_id&&target.activity===saved.activity);const actionSlot=action?.slots.find(slot=>slot.id===saved.activity_slot);this.actionTargetId=actionSlot?action!.id:null;this.actionSlotId=actionSlot?.id||null;this.position=canStand(maps[this.mapId],saved)?{x:saved.x,y:saved.y}:{...maps[this.mapId].spawn};if(this.seated)this.position={...studyDesk.seat};if(this.bathingTargetId)this.position={...slot!.point};if(actionSlot&&action?.activity!=='running')this.position={...actionSlot.point};if(action?.route){if(canStand(maps[this.mapId],saved))this.actionRouteIndex=routeIndexForPoint(action.route,this.position);else{this.actionTargetId=null;this.actionSlotId=null;}}this.paint();};
    gameEvents.addEventListener('remote-players',remote);
    gameEvents.addEventListener('restore-player',restore);
    this.events.once('shutdown',()=>{gameEvents.removeEventListener('remote-players',remote);gameEvents.removeEventListener('restore-player',restore);});
    this.scale.on(Phaser.Scale.Events.RESIZE,this.resizeWorld,this);
    const blur=()=>{resetControls(); this.input.keyboard?.resetKeys();};
    window.addEventListener('blur',blur);
    const visibility=()=>{if(document.hidden)blur();};
    document.addEventListener('visibilitychange',visibility);
    this.events.once('shutdown',()=>{this.scale.off(Phaser.Scale.Events.RESIZE,this.resizeWorld,this);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);resetControls();});
  }
  private resizeWorld() {
    const map=maps[this.mapId];
    const camera=this.cameras.main;
    // Keep world units at native size instead of magnifying the map to cover the viewport.
    camera.setZoom(1);
    camera.setBounds(0,0,map.width,map.height);
    camera.centerOn(this.position.x,this.position.y);
  }
  private rect(g: Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,c:number) {g.fillStyle(c,1);g.fillRect(x,y,w,h);}
  private label(x:number,y:number,text:string,color='#f9f2dc',size=13) {
    return this.add.text(x,y,text,{fontFamily:'monospace',fontSize:size,color,align:'center'}).setResolution(2).setOrigin(.5).setDepth(10000);
  }
  // Shared nameplate for every NPC, including future character definitions.
  private nameplate(x:number,y:number,name:string){return this.label(x,y,name,'#4f4149',12).setBackgroundColor('rgba(255,247,226,0.9)').setPadding(5,2);}
  private sprite(frame:string,x:number,y:number,w:number,h:number,depth=0) {return this.add.image(x,y,'cozy',frame).setDisplaySize(w,h).setDepth(depth);}
  private terrain(frame:string,x:number,y:number,w:number,h:number) {return this.add.tileSprite(x,y,w,h,'cozy',frame).setOrigin(0).setTileScale(.25).setDepth(-5);}
  private tree(_g:Phaser.GameObjects.Graphics,x:number,y:number,size=1) {this.sprite('tree',x,y-15*size,90*size,100*size,y+35*size);}
  private person(x:number,y:number,coat:number,seated=false,bathing=false) {
    const p=this.add.container(x,y);
    const g=this.add.graphics();
    g.fillStyle(0x273d32,.22);g.fillEllipse(0,1,25,10);
    this.rect(g,-8,-11,6,12,0x39483e);this.rect(g,2,-11,6,12,0x39483e);
    this.rect(g,-11,-27,22,19,coat);this.rect(g,-15,-25,5,13,0xe3b888);this.rect(g,10,-25,5,13,0xe3b888);
    this.rect(g,-9,-41,18,17,0xe3b888);this.rect(g,-11,-44,22,8,0x554139);this.rect(g,-11,-37,5,9,0x554139);
    this.rect(g,3,-35,3,3,0x29392f);
    if(seated){g.clear();g.fillStyle(0x273d32,.22);g.fillEllipse(0,1,28,10);this.rect(g,-12,-8,9,7,0x39483e);this.rect(g,3,-8,9,7,0x39483e);this.rect(g,-11,-24,22,17,coat);this.rect(g,-15,-24,5,11,0xe3b888);this.rect(g,10,-24,5,11,0xe3b888);this.rect(g,-9,-38,18,16,0xe3b888);this.rect(g,-11,-41,22,8,0x554139);this.rect(g,-5,-32,3,3,0x29392f);this.rect(g,3,-32,3,3,0x29392f);}
    if(bathing){g.clear();this.rect(g,-11,-27,22,9,coat);this.rect(g,-9,-41,18,17,0xe3b888);this.rect(g,-11,-44,22,8,0x554139);this.rect(g,-11,-37,5,9,0x554139);this.rect(g,-5,-32,3,3,0x29392f);this.rect(g,3,-32,3,3,0x29392f);}
    p.add(g);if(bathing)p.add(this.waterline(0,-18,30,0x8cbeb3));return p;
  }
  private immerse(image:Phaser.GameObjects.Image,visibleFraction:number){image.setCrop(0,0,image.frame.width,Math.floor(image.frame.height*visibleFraction));}
  private waterline(x:number,y:number,width:number,color:number){const water=this.add.graphics();water.fillStyle(color,.8);water.fillEllipse(x,y,width,6);water.lineStyle(1,0xd6eece,.8);water.strokeEllipse(x,y,width+4,6);return water;}
  private playerAvatar(x:number,y:number,seated=false){
    const actor=this.add.container(x,y);
    const shadow=this.add.graphics();shadow.fillStyle(0x273d32,.18);shadow.fillEllipse(0,0,25,8);
    const action=activityTargets.find(target=>target.id===this.actionTargetId);
    const image=this.add.image(0,0,'yoon',this.bathingTargetId?'front':action&&action.activity!=='running'?action.pose:seated?'sitFront':this.facing).setOrigin(.5,1).setScale(64/495);
    actor.add([shadow,image]);actor.setData('avatar',image);
    const target=bathingTargets.find(target=>target.id===this.bathingTargetId);
    if(target){shadow.setVisible(false);this.immerse(image,target.visibleFraction);actor.add(this.waterline(0,-image.displayHeight*(1-target.visibleFraction),image.displayWidth+5,target.waterColor));}
    if(action){const props=this.add.graphics();actor.add(props);actor.setData('activity-props',props);}
    return actor;
  }
  private paint() {
    this.npcViews.clear();
    this.npcNotices.clear();
    this.npcCues.clear();
    this.worldNotices=[];
    this.remoteActors.clear();
    this.children.removeAll(true);
    const g=this.add.graphics();
    if(this.mapId==='garden')this.garden(g);else this.cottage(g);
    this.paintNpcs();
    this.actor=this.playerAvatar(this.position.x,this.position.y,this.seated);
    this.highlight=this.add.graphics().setDepth(9000);
    this.lastState='';
    this.resizeWorld();
  }
  private garden(g:Phaser.GameObjects.Graphics) {
    this.add.tileSprite(0,0,2560,2080,'quietGrass').setOrigin(0).setTileScale(.35).setDepth(-5);
    this.terrain('sand',436,320,60,780);
    this.terrain('stone',300,665,680,60);
    this.terrain('stone',930,400,1540,65);
    this.terrain('stone',930,790,1540,65);
    this.terrain('stone',1120,1230,1350,65);
    this.terrain('sand',930,430,50,850);
    this.terrain('sand',1510,430,60,440);
    this.terrain('sand',1430,855,140,55);
    this.terrain('sand',1430,855,50,1010);
    this.terrain('sand',1430,1810,800,55);
    this.terrain('sand',436,1060,60,650);
    this.terrain('sand',930,695,60,330);
    [[80,140,1.2],[120,420,1.1],[80,710,1.2],[680,100,1.2],[1330,310,.9],[1330,880,1.1],[340,970,1.1]].forEach(([x,y,size])=>this.tree(g,x,y,size));
    this.sprite('wall',464,231,244,194,160);
    this.sprite('roof',464,159,286,120,161);
    this.sprite('window',392,254,48,42,162);this.sprite('window',536,254,48,42,162);
    this.sprite('door',464,296,42,64,163);
    this.label(464,217,'OUR HOME','#715c45',12).setBackgroundColor('#fff2d7').setPadding(4,2);
    this.label(464,366,'Enter our home · E / Space','#455e43',11).setBackgroundColor('#fff2d7').setPadding(5,3);
    for(const plot of planningPlots){
      const {x,y,w,h}=plot.bounds;
      const outline=this.add.graphics().setDepth(0);
      outline.fillStyle(0xd9c6a0,.25);outline.fillRoundedRect(x,y,w,h,6);
      outline.lineStyle(2,0xf4e4b6,.85);outline.strokeRoundedRect(x,y,w,h,6);
      for(const [px,py] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){outline.fillStyle(0x8b6949);outline.fillRect(px-3,py-10,6,18);}
      this.label(x+w/2,y+h/2-9,plot.name,'#3c543b',13);
      this.label(x+w/2,y+h/2+13,`${plot.size} · open plot`,'#506348',11);
      this.label(plot.approach.x,plot.approach.y+20,'Plan something here','#3c543b',11);
    }
    this.add.image(requestBoard.x,requestBoard.y,'requestBoard').setDisplaySize(190,190).setDepth(945);
    this.label(requestBoard.x,requestBoard.y-118,'✦ REQUEST BOARD ✦','#34533d',16).setBackgroundColor('#fff1cc').setPadding(10,6);
    this.label(requestBoard.x,requestBoard.y+108,'Buildings · objects · neighbors','#34533d',12).setBackgroundColor('#f7edcf').setPadding(7,4);
    this.add.image(onsen.x,onsen.y,'onsen','pool').setDisplaySize(360,250).setDepth(800);
    this.label(onsen.x,720,'ORANGE SPRING ONSEN','#445c40',14).setBackgroundColor('#fff2d7').setPadding(6,3);
    this.label(onsen.x,1032,'Mochi & Lilito usually relax here','#445c40',11).setBackgroundColor('#fff2d7').setPadding(5,2);
    this.terrain('stone',120,980,280,44);
    this.label(780,690,'The village commons','#3e5b3c',18);
    this.paintDistricts();
    this.paintPark();
    this.refreshNotice();
  }
  private paintDistricts(){
    this.label(1700,75,'THE STRIP MALL','#3d563d',18).setBackgroundColor('#fff3d8').setPadding(10,5);
    this.label(1760,855,'FAITH & COMMUNITY','#3d563d',18).setBackgroundColor('#fff3d8').setPadding(10,5);
    for(const building of villageBuildings){
      const {x,y}=building.position;
      const image=this.add.image(x,y,building.texture,building.frame);
      image.setScale(Math.min(building.width/image.frame.width,building.height/image.frame.height)).setDepth(y+building.height/2);
      const labelY=building.district==='faith'?y-building.height/2-22:y-building.height*.2;
      const title=this.label(x,labelY,building.name,'#4b5741',building.district==='faith'?13:12);
      if(building.district==='faith')title.setBackgroundColor('#fff3dc').setPadding(5,3);
      const doorY=y+building.height*(building.district==='faith'?.29:.25),depth=y+building.height/2+1;
      // The same closed-door frame and lock marker are reused for every unfinished interior.
      this.sprite('door',x,doorY,46,66,depth);
      const lock=this.add.graphics().setDepth(depth+1);lock.lineStyle(2,0xffe0a0);lock.strokeRoundedRect(x-5,doorY-3,10,12,5);lock.fillStyle(0xd8b36b);lock.fillRoundedRect(x-8,doorY+3,16,13,3);lock.fillStyle(0x695335);lock.fillCircle(x,doorY+9,2);
      const approach=buildingApproach(building);
      this.label(approach.x,approach.y-8,'LOCKED · COMING SOON','#674f40',10).setBackgroundColor('#f4ddbc').setPadding(6,3);
    }
  }
  private paintPark(){
    const g=this.add.graphics().setDepth(-2),court=park.court,track=park.track;
    g.fillStyle(0x9bb08b);g.fillRoundedRect(court.x-12,court.y-12,court.w+24,court.h+24,12);
    g.fillStyle(0x6e9583);g.fillRect(court.x,court.y,court.w,court.h);g.lineStyle(2,0xf5edd4,.9);g.strokeRect(court.x+18,court.y+18,court.w-36,court.h-36);
    g.lineBetween(court.x+court.w/2,court.y+18,court.x+court.w/2,court.y+court.h-18);
    g.lineBetween(court.x+18,court.y+court.h/2,court.x+court.w-18,court.y+court.h/2);
    for(const x of [court.x+court.w*.35,court.x+court.w*.65])g.lineBetween(x,court.y+18,x,court.y+court.h-18);
    g.lineStyle(5,0x586c5e);g.lineBetween(court.x+court.w/2,court.y+8,court.x+court.w/2,court.y+court.h-8);
    g.fillStyle(0xc19679);g.fillRoundedRect(track.x,track.y,track.w,track.h,track.h/2);
    g.fillStyle(0x91aa7f);g.fillRoundedRect(track.x+42,track.y+42,track.w-84,track.h-84,(track.h-84)/2);
    g.lineStyle(1,0xf3e3c7,.85);for(const inset of [8,20,32])g.strokeRoundedRect(track.x+inset,track.y+inset,track.w-inset*2,track.h-inset*2,track.h/2-inset);
    this.label(court.x+court.w/2,court.y-32,'PICKLEBALL','#3e563e',14).setBackgroundColor('#fff2d7').setPadding(6,3);
    this.label(track.x+track.w/2,track.y-25,'RUNNING TRACK','#3e563e',14).setBackgroundColor('#fff2d7').setPadding(6,3);
    this.add.image(park.lake.x,park.lake.y,'parkWater','lake').setDisplaySize(park.lake.w,park.lake.h).setDepth(1440);
    this.label(park.lake.x,1390,'FISHING LAKE','#3e563e',14).setBackgroundColor('#fff2d7').setPadding(6,3);
    const beach=this.add.image(park.beach.x,park.beach.y,'beachV2').setDisplaySize(park.beach.w,park.beach.h).setDepth(1660);
    const beachMask=this.make.graphics({x:0,y:0},false),left=park.beach.x-park.beach.w/2,top=park.beach.y-park.beach.h/2;
    const edge=[[0,.11],[.08,.13],[.18,.02],[.28,.1],[.4,.12],[.5,.02],[.62,.1],[.75,.07],[.85,.12],[1,.02],[1,1],[0,1]].map(([x,y])=>new Phaser.Math.Vector2(left+x*park.beach.w,top+y*park.beach.h));
    beachMask.fillStyle(0xffffff);beachMask.fillPoints(edge,true);beach.setMask(beachMask.createGeometryMask());beach.once('destroy',()=>beachMask.destroy());
    this.label(park.beach.x,1630,'A LITTLE BEACH','#3e563e',15).setBackgroundColor('#fff2d7').setPadding(6,3);
    this.label(740,1100,park.name,'#3e563e',19).setBackgroundColor('#fff2d7').setPadding(8,4);
    this.sprite('bench',760,1600,112,75,1640);this.sprite('bench',1900,1880,112,75,1920);
  }
  private paintNpcs(){
    for(const npc of worldNpcs){
      const state=this.npcRuntime.get(npc.id),position=state.position;
      const image=this.add.image(position.x,position.y,npc.texture,npc.frame).setOrigin(.5,1).setDisplaySize(npc.width,npc.height);
      image.setInteractive({useHandCursor:true}).on('pointerdown',()=>{if(!controls.blocked&&state.map===this.mapId&&nearby(this.position,this.npcRuntime.approach(npc.id),65))this.talkNpc(npc.id);});
      const cue=this.label(0,0,'...','#4d5d49',11).setBackgroundColor('#fff6df').setPadding(4,1);
      const name=this.nameplate(0,0,npc.name);
      const notice=this.label(0,0,'!','#ffe6a1',24).setBackgroundColor('#4c6248').setPadding(7,1);
      const water=this.waterline(0,0,npc.width+4,0x8cbeb3);
      this.npcViews.set(npc.id,{image,name,cue,notice,water,immersed:false});
      this.npcCues.set(npc.id,cue);this.npcNotices.set(npc.id,notice);
    }
    this.refreshNotice();this.positionNpcs();
  }
  private positionNpcs(){
    for(const npc of worldNpcs){const state=this.npcRuntime.get(npc.id),view=this.npcViews.get(npc.id);if(!view)continue;
      setNpcLocation(npc.id,state.map,this.npcRuntime.approach(npc.id));
      const visible=state.map===this.mapId,position=state.position,immersed=!!npc.bathing&&state.home;
      if(npc.id==='lucia')view.image.setFrame(state.home?'seated':'standing').setDisplaySize(npc.width,npc.height);
      if(immersed)this.immerse(view.image,.62);else view.image.setCrop();
      view.image.setPosition(position.x,position.y).setDepth(position.y).setVisible(visible);
      view.name.setPosition(position.x,position.y-npc.height-13).setVisible(visible);
      const x=position.x+Math.max(24,npc.width/2,npc.name.length*3.6)+20,y=position.y-npc.height-13;
      const unread=this.unreadNpcIds.has(npc.id);
      view.cue.setPosition(x,y).setVisible(visible&&!unread);view.notice.setPosition(x,y).setVisible(visible&&unread);
      view.water.setPosition(position.x,position.y-npc.height*.38).setDepth(position.y+1).setVisible(visible&&immersed);
    }
  }
  private cottage(g:Phaser.GameObjects.Graphics) {
    g.setDepth(-4);
    this.rect(g,0,0,1200,960,0x344d42);
    this.rect(g,154,126,892,730,0x795d49);
    this.terrain('wood',170,160,860,680).setTileScale(.6).setDepth(-3);
    for(const room of homeLayout){
      const definition=homeRooms[room.definition];
      if(definition.floor==='ceramic'){
        const floor=this.add.graphics().setDepth(-3);
        floor.fillStyle(0xe5dfcc);floor.fillRect(room.x,room.y,definition.width,definition.height);
        floor.lineStyle(1,0xc9c8b4,.65);
        for(let x=room.x+54;x<room.x+definition.width;x+=54){floor.lineBetween(x,room.y,x,room.y+definition.height);}
        for(let y=room.y+54;y<room.y+definition.height;y+=54){floor.lineBetween(room.x,y,room.x+definition.width,y);}
      }else this.terrain('wood',room.x,room.y,definition.width,definition.height).setTileScale(.6).setDepth(-3);
      const walls=this.add.graphics().setDepth(450);
      for(const wall of definition.walls){
        this.rect(walls,room.x+wall.x,room.y+wall.y,wall.w,wall.h,0xb79a76);
      }
      this.label(room.x+definition.width/2,room.y+20,definition.name,'#6b5742',14);
      for(const prop of definition.props){
        const asset=homeProps[prop.definition];
        const x=room.x+prop.x,y=room.y+prop.y;
        const depth=prop.definition==='chair'?y-30:y+asset.height/2;
        this.add.image(x,y,asset.atlas,asset.frame).setDisplaySize(asset.width,asset.height).setDepth(depth);
      }
    }
    const welcome=this.add.graphics().setDepth(1);
    welcome.fillStyle(0xc7a6a1);welcome.fillRoundedRect(544,780,112,55,9);
    this.rect(g,558,832,84,8,0xcbb68b);
    this.label(600,808,'EXIT','#715c43',12);
    this.label(600,103,'Our home & office','#e6d8b7',17);
  }
  update(_time:number,delta:number) {
    if(!this.actor) return;
    if(!controls.blocked)this.heldNpc=undefined;
    if(!supabase)this.npcRuntime.step(delta,new Date(),[{map:this.mapId,position:this.position},...this.remotePlayers.map(player=>({map:player.map_id as MapId,position:{x:player.x,y:player.y}}))],this.heldNpc);
    this.positionNpcs();
    const visible=this.remotePlayers.filter(player=>player.map_id===this.mapId&&Number.isFinite(player.x)&&Number.isFinite(player.y));
    const ids=new Set(visible.map(player=>player.user_id));
    for(const [id,value] of this.remoteActors){if(!ids.has(id)){value.actor.destroy();this.remoteActors.delete(id);}}
    for(const player of visible){
      let value=this.remoteActors.get(player.user_id);
      const seated=['sitting','resting','watching'].includes(player.activity),isBathing=player.activity==='bathing';
      if(value&&(value.seated!==seated||value.bathing!==isBathing)){value.actor.destroy();this.remoteActors.delete(player.user_id);value=undefined;}
      if(!value){value={actor:this.person(player.x,player.y,0x7f98c0,seated,isBathing),seated,bathing:isBathing};this.remoteActors.set(player.user_id,value);}
      const blend=1-Math.exp(-Math.min(delta,100)/100);
      value.actor.x+=(player.x-value.actor.x)*blend;value.actor.y+=(player.y-value.actor.y)*blend;value.actor.setDepth(Math.max(value.actor.y,isBathing?bathingTargets.find(target=>target.id===player.activity_target)?.foregroundDepth||0:0));
    }
    let dx=0,dy=0;
    let action=activityTargets.find(target=>target.id===this.actionTargetId);
    const rawX=Number(this.keys.D.isDown||this.keys.RIGHT.isDown||controls.right)-Number(this.keys.A.isDown||this.keys.LEFT.isDown||controls.left),rawY=Number(this.keys.S.isDown||this.keys.DOWN.isDown||controls.down)-Number(this.keys.W.isDown||this.keys.UP.isDown||controls.up);
    if(action?.activity==='running'&&!controls.blocked&&(rawX||rawY)){this.actionTargetId=null;this.actionSlotId=null;action=undefined;this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y);logActivity('You stopped running.');}
    if(!controls.blocked&&!this.seated&&!this.bathingTargetId&&!action){dx=rawX;dy=rawY;}
    if(action?.route&&!controls.blocked){const next=advanceTrack(maps[this.mapId],this.position,action.route,this.actionRouteIndex,delta);this.position=next.position;this.actionRouteIndex=next.index;this.facing=next.dy<0?'back':next.dy>0?'front':next.dx<0?'left':'right';if(next.blocked){this.actionTargetId=null;this.actionSlotId=null;this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y);logActivity('The running route was blocked; you stopped safely.');action=undefined;}}
    if(!this.seated&&!this.bathingTargetId&&!action&&(dx||dy))this.facing=dy<0?'back':dy>0?'front':dx<0?'left':'right';
    const avatar=this.actor.getData('avatar') as Phaser.GameObjects.Image;avatar?.setFrame(this.bathingTargetId?'front':action&&action.activity!=='running'?action.pose:this.seated?'sitFront':this.facing);const bathing=bathingTargets.find(target=>target.id===this.bathingTargetId);if(bathing)this.immerse(avatar,bathing.visibleFraction);
    const props=this.actor.getData('activity-props') as Phaser.GameObjects.Graphics|undefined;
    if(props){props.clear();if(action?.activity==='fishing'){props.lineStyle(2,0x9b704b);props.lineBetween(12,-30,32,-75);props.lineStyle(1,0xe9eedc);props.lineBetween(32,-75,50,-40);props.fillStyle(0xc77558);props.fillCircle(50,-40,2);}else if(action?.activity==='playing'){props.lineStyle(2,0xeadfb5);props.strokeEllipse(20,-28,13,18);props.lineBetween(17,-18,14,-11);props.fillStyle(0xe6e79d);props.fillCircle(28+Math.sin(this.tick/400)*18,-38+Math.abs(Math.sin(this.tick/400))*8,3);}else if(action?.activity==='showering'){props.fillStyle(0xb8e0d9,.17);props.fillRoundedRect(-26,-67,52,67,3);props.lineStyle(1,0x97c8d0,.85);for(let i=0;i<5;i++){const y=-64+(this.tick/30+i*11)%55;props.lineBetween(-18+i*9,y,-18+i*9,y+6);}}}
    this.position=move(maps[this.mapId],this.position,dx,dy,delta,(this.keys.SHIFT.isDown||controls.sprint)?1.8:1);
    this.cameras.main.centerOn(this.position.x,this.position.y);
    this.actor.setPosition(this.position.x,this.position.y).setDepth(Math.max(this.position.y,bathing?.foregroundDepth||0,action?.foregroundDepth||0));
    this.tick+=delta;this.actor.setScale(1,dx||dy?1+Math.sin(this.tick/75)*.025:1);
    const portal=portalAt(maps[this.mapId],this.position);
    const npc=worldNpcs.find(npc=>this.npcRuntime.get(npc.id).map===this.mapId&&nearby(this.position,this.npcRuntime.approach(npc.id),65));
    const plot=this.mapId==='garden'?planningPlots.find(plot=>nearby(this.position,plot.approach,72)):undefined;
    const board=this.mapId==='garden'&&nearby(this.position,requestBoard.approach,78);
    const build=board||!!plot;
    const actionEntry=activityTargets.find(target=>target.map===this.mapId&&nearby(this.position,target.approach,52));
    const occupiedActionSlots=new Set(this.remotePlayers.flatMap(player=>player.activity_slot?[player.activity_slot]:[]));
    const actionSlot=actionEntry?chooseActivitySlot(actionEntry,occupiedActionSlots):undefined;
    const building=this.mapId==='garden'?villageBuildings.find(building=>nearby(this.position,buildingApproach(building),60)):undefined;
    const bathEntry=bathingTargets.find(target=>target.map===this.mapId&&nearby(this.position,target.approach,50));
    const occupiedBathSlots=new Set(this.remotePlayers.filter(player=>player.activity==='bathing').flatMap(player=>player.activity_slot?[player.activity_slot]:[]));
    const bathSlot=bathEntry?freeBathSlot(bathEntry,occupiedBathSlots):undefined;
    const desk=this.mapId==='cottage'&&nearby(this.position,studyDesk.approach,55);
    this.highlight.clear();
    if(desk){this.highlight.lineStyle(2,0xffefac,.75+Math.sin(this.tick/350)*.2);this.highlight.strokeRoundedRect(studyDesk.seat.x-78,studyDesk.seat.y-50,156,98,6);}
    if(npc){const point=this.npcRuntime.get(npc.id).position;this.highlight.lineStyle(2,0xffefac,.8);this.highlight.strokeRoundedRect(point.x-42,point.y-npc.height-5,84,npc.height+15,8);}
    if(board){this.highlight.lineStyle(3,0xffefac,.8);this.highlight.strokeRoundedRect(requestBoard.x-100,requestBoard.y-100,200,200,10);}
    if(plot){const {x,y,w,h}=plot.bounds;this.highlight.lineStyle(3,0xffefac,.85);this.highlight.strokeRoundedRect(x-4,y-4,w+8,h+8,8);}
    const pending=unreadUpdates().find(update=>{const location=updateLocation(update);return update.target==='world'&&location&&location.map===this.mapId&&nearby(this.position,location,65);});
    const kind=pending?'updates':npc?'npc':build?'construction':building?'closed':null;
    const prompt=action?`Leave ${action.name}`:bathing?`Leave ${bathing.name}`:this.seated?'Stand up':portal?portal.label:pending?'Inspect changes':desk?'Sit at your desk':npc?`Talk to ${npc.name}`:bathEntry?(bathSlot?`Enter ${bathEntry.name}`:`${bathEntry.name} is full`):plot?`Plan ${plot.name}`:board?'Open the request board':actionEntry?(actionSlot?actionEntry.verb:`${actionEntry.name} is full`):building?`${building.name} · Coming soon`:'';
    const pressed=Phaser.Input.Keyboard.JustDown(this.keys.E)||Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||controls.interact;
    controls.interact=false;
    if(pressed&&!controls.blocked){if(action){this.actionTargetId=null;this.actionSlotId=null;if(action.activity!=='running')this.position={...action.exit};this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y);logActivity(`You left the ${action.name}.`);}else if(bathing){this.bathingTargetId=null;this.bathingSlotId=null;this.position={...bathing.exit};this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y);logActivity(`You left the ${bathing.name}.`);}else if(this.seated){this.seated=false;this.position={...studyDesk.stand};this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y);logActivity('You stood up from your desk.');}else if(portal){const previous=maps[this.mapId].name;this.mapId=portal.target;this.position={...portal.spawn};this.paint();logActivity(`You moved from ${previous} to ${maps[this.mapId].name}.`);}else if(pending){gameEvents.dispatchEvent(new CustomEvent('inspect-update',{detail:pending.targetId}));}else if(desk){this.seated=true;this.position={...studyDesk.seat};this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y,true);logActivity('You sat at your desk.');}else if(bathEntry&&bathSlot&&!npc){this.bathingTargetId=bathEntry.id;this.bathingSlotId=bathSlot.id;this.position={...bathSlot.point};this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y);logActivity(`You entered the ${bathEntry.name}.`);}else if(npc){this.talkNpc(npc.id);}else if(actionEntry&&actionSlot){this.actionTargetId=actionEntry.id;this.actionSlotId=actionSlot.id;this.position={...actionSlot.point};if(actionEntry.route)this.actionRouteIndex=routeIndexForPoint(actionEntry.route,this.position);this.actor.destroy();this.actor=this.playerAvatar(this.position.x,this.position.y);logActivity(`You started ${actionEntry.activity}.`);}else if(building){gameEvents.dispatchEvent(new CustomEvent('inspect-building',{detail:building.id}));}else if(kind) interact(kind);}
    const canInteract=!!(action||actionSlot||bathing||this.seated||portal||pending||desk||npc||bathSlot||plot||board||building);
    const key=`${Math.floor(_time/1000)}:${this.actionTargetId}:${this.bathingTargetId}:${this.seated}:${this.mapId}:${prompt}:${Math.round(this.position.x/8)}:${Math.round(this.position.y/8)}`;
    if(key!==this.lastState){this.lastState=key;publish({map:this.mapId,prompt,interaction:kind,x:this.position.x,y:this.position.y,plotId:plot?.id,activity:this.actionTargetId?activityTargets.find(target=>target.id===this.actionTargetId)!.activity:this.bathingTargetId?'bathing':this.seated?'sitting':'idle',activityTarget:this.actionTargetId||this.bathingTargetId||(this.seated?studyDesk.id:undefined),activitySlot:this.actionSlotId||this.bathingSlotId||(this.seated?`${studyDesk.id}.seat`:undefined),canInteract});}
  }
}

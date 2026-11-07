import { onsen,worldNpcs } from '../world/npcs';
import { updateLocation } from '../world/updateLocations';
import { planningPlots, requestBoard } from '../world/planning';
import { homeLayout, homeRooms, homeProps, studyDesk } from '../world/home';
import { unreadUpdates,updateEvents } from '../services/worldUpdates';
import type { RemotePlayer } from '../services/sharedWorld';
import { gameEvents } from './bridge';
import Phaser from 'phaser';
import { controls, interact, publish, resetControls, logActivity } from './bridge';
import { maps, move, nearby, portalAt, canStand, type MapId, type Point } from '../world/model';

export class WorldScene extends Phaser.Scene {
  private remotePlayers:RemotePlayer[]=[];
  private remoteActors=new Map<string,{actor:Phaser.GameObjects.Container;seated:boolean}>();
  private worldNotices:Phaser.GameObjects.Text[]=[];
  private npcNotices=new Map<string,Phaser.GameObjects.Text>();
  private refreshNotice=()=>{
    for(const [id,notice] of this.npcNotices)notice.setVisible(unreadUpdates().some(update=>update.target==='npc'&&update.targetId===id));
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
  private highlight!: Phaser.GameObjects.Graphics;
  constructor() { super('world'); }
  preload() {
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
    const capybaras=this.textures.get('capybaras');capybaras.add('mochi',0,10,80,650,1020);capybaras.add('lilito',0,740,350,480,750);capybaras.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.textures.get('onsen').add('pool',0,40,230,1160,800);
    const furnitureFrames:Record<string,Record<string,number[]>>={
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
    const restore=(event:Event)=>{const saved=(event as CustomEvent<RemotePlayer>).detail;if(saved.map_id!=='garden'&&saved.map_id!=='cottage')return;if(!Number.isFinite(saved.x)||!Number.isFinite(saved.y))return;this.mapId=saved.map_id;this.seated=saved.map_id==='cottage'&&saved.activity==='sitting';this.position=canStand(maps[this.mapId],saved)?{x:saved.x,y:saved.y}:{...maps[this.mapId].spawn};if(this.seated)this.position={...studyDesk.seat};this.paint();};
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
    return this.add.text(x,y,text,{fontFamily:'monospace',fontSize:size,color,align:'center'}).setResolution(2).setOrigin(.5).setDepth(1000);
  }
  // Shared nameplate for every NPC, including future character definitions.
  private nameplate(x:number,y:number,name:string){return this.label(x,y,name,'#4f4149',12).setBackgroundColor('rgba(255,247,226,0.9)').setPadding(5,2);}
  private sprite(frame:string,x:number,y:number,w:number,h:number,depth=0) {return this.add.image(x,y,'cozy',frame).setDisplaySize(w,h).setDepth(depth);}
  private terrain(frame:string,x:number,y:number,w:number,h:number) {return this.add.tileSprite(x,y,w,h,'cozy',frame).setOrigin(0).setTileScale(.25).setDepth(-5);}
  private tree(_g:Phaser.GameObjects.Graphics,x:number,y:number,size=1) {this.sprite('tree',x,y-15*size,90*size,100*size,y+35*size);}
  private person(x:number,y:number,coat:number,seated=false) {
    const p=this.add.container(x,y);
    const g=this.add.graphics();
    g.fillStyle(0x273d32,.22);g.fillEllipse(0,1,25,10);
    this.rect(g,-8,-11,6,12,0x39483e);this.rect(g,2,-11,6,12,0x39483e);
    this.rect(g,-11,-27,22,19,coat);this.rect(g,-15,-25,5,13,0xe3b888);this.rect(g,10,-25,5,13,0xe3b888);
    this.rect(g,-9,-41,18,17,0xe3b888);this.rect(g,-11,-44,22,8,0x554139);this.rect(g,-11,-37,5,9,0x554139);
    this.rect(g,3,-35,3,3,0x29392f);
    if(seated){g.clear();g.fillStyle(0x273d32,.22);g.fillEllipse(0,1,28,10);this.rect(g,-12,-8,9,7,0x39483e);this.rect(g,3,-8,9,7,0x39483e);this.rect(g,-11,-24,22,17,coat);this.rect(g,-15,-24,5,11,0xe3b888);this.rect(g,10,-24,5,11,0xe3b888);this.rect(g,-9,-38,18,16,0xe3b888);this.rect(g,-11,-41,22,8,0x554139);this.rect(g,-5,-32,3,3,0x29392f);this.rect(g,3,-32,3,3,0x29392f);}
    p.add(g); return p;
  }
  private paint() {
    this.npcNotices.clear();
    this.worldNotices=[];
    this.remoteActors.clear();
    this.children.removeAll(true);
    const g=this.add.graphics();
    if(this.mapId==='garden')this.garden(g);else this.cottage(g);
    this.paintNpcs();
    this.actor=this.person(this.position.x,this.position.y,0xd78b62,this.seated);
    this.highlight=this.add.graphics().setDepth(900);
    this.lastState='';
    this.resizeWorld();
  }
  private garden(g:Phaser.GameObjects.Graphics) {
    this.terrain('grass',0,0,1440,1120);
    this.terrain('sand',436,320,60,780);
    this.terrain('stone',300,665,970,60);
    this.terrain('sand',1120,230,60,465);
    this.terrain('sand',1150,610,60,85);
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
    this.refreshNotice();
  }
  private paintNpcs(){
    for(const npc of worldNpcs.filter(npc=>npc.map===this.mapId)){
      const position=npc.position();
      this.add.image(position.x,position.y,npc.texture,npc.frame).setOrigin(.5,1).setDisplaySize(npc.width,npc.height).setDepth(position.y);
      this.nameplate(position.x,position.y-npc.height-13,npc.name);
      const notice=this.label(position.x+35,position.y-npc.height-13,'!','#ffe6a1',24).setBackgroundColor('#4c6248').setPadding(7,1);
      notice.setVisible(unreadUpdates().some(update=>update.target==='npc'&&update.targetId===npc.id));
      this.npcNotices.set(npc.id,notice);
    }
    this.refreshNotice();
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
    const visible=this.remotePlayers.filter(player=>player.map_id===this.mapId&&Number.isFinite(player.x)&&Number.isFinite(player.y));
    const ids=new Set(visible.map(player=>player.user_id));
    for(const [id,value] of this.remoteActors){if(!ids.has(id)){value.actor.destroy();this.remoteActors.delete(id);}}
    for(const player of visible){
      let value=this.remoteActors.get(player.user_id);
      const seated=player.activity==='sitting';
      if(value&&value.seated!==seated){value.actor.destroy();this.remoteActors.delete(player.user_id);value=undefined;}
      if(!value){value={actor:this.person(player.x,player.y,0x7f98c0,seated),seated};this.remoteActors.set(player.user_id,value);}
      const blend=1-Math.exp(-Math.min(delta,100)/100);
      value.actor.x+=(player.x-value.actor.x)*blend;value.actor.y+=(player.y-value.actor.y)*blend;value.actor.setDepth(value.actor.y);
    }
    let dx=0,dy=0;
    if(!controls.blocked&&!this.seated){dx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown||controls.right)-Number(this.keys.A.isDown||this.keys.LEFT.isDown||controls.left);dy=Number(this.keys.S.isDown||this.keys.DOWN.isDown||controls.down)-Number(this.keys.W.isDown||this.keys.UP.isDown||controls.up);}
    this.position=move(maps[this.mapId],this.position,dx,dy,delta,(this.keys.SHIFT.isDown||controls.sprint)?1.8:1);
    this.cameras.main.centerOn(this.position.x,this.position.y);
    this.actor.setPosition(this.position.x,this.position.y).setDepth(this.position.y);
    this.tick+=delta;this.actor.setScale(1,dx||dy?1+Math.sin(this.tick/75)*.025:1);
    const portal=portalAt(maps[this.mapId],this.position);
    const npc=worldNpcs.find(npc=>npc.map===this.mapId&&nearby(this.position,npc.approach(),65));
    const plot=this.mapId==='garden'?planningPlots.find(plot=>nearby(this.position,plot.approach,72)):undefined;
    const board=this.mapId==='garden'&&nearby(this.position,requestBoard.approach,78);
    const build=board||!!plot;
    const desk=this.mapId==='cottage'&&nearby(this.position,studyDesk.approach,55);
    this.highlight.clear();
    if(desk){this.highlight.lineStyle(2,0xffefac,.75+Math.sin(this.tick/350)*.2);this.highlight.strokeRoundedRect(studyDesk.seat.x-78,studyDesk.seat.y-50,156,98,6);}
    if(npc){const point=npc.position();this.highlight.lineStyle(2,0xffefac,.8);this.highlight.strokeRoundedRect(point.x-42,point.y-npc.height-5,84,npc.height+15,8);}
    if(board){this.highlight.lineStyle(3,0xffefac,.8);this.highlight.strokeRoundedRect(requestBoard.x-100,requestBoard.y-100,200,200,10);}
    if(plot){const {x,y,w,h}=plot.bounds;this.highlight.lineStyle(3,0xffefac,.85);this.highlight.strokeRoundedRect(x-4,y-4,w+8,h+8,8);}
    const pending=unreadUpdates().find(update=>{const location=updateLocation(update);return update.target==='world'&&location&&location.map===this.mapId&&nearby(this.position,location,65);});
    const kind=pending?'updates':npc?'npc':build?'construction':null;
    const prompt=this.seated?'Stand up':portal?portal.label:pending?'Inspect changes':desk?'Sit at your desk':npc?`Talk to ${npc.name}`:plot?`Plan ${plot.name}`:board?'Open the request board':'';
    const pressed=Phaser.Input.Keyboard.JustDown(this.keys.E)||Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||controls.interact;
    controls.interact=false;
    if(pressed&&!controls.blocked){if(this.seated){this.seated=false;this.position={...studyDesk.stand};this.actor.destroy();this.actor=this.person(this.position.x,this.position.y,0xd78b62);logActivity('You stood up from your desk.');}else if(portal){const previous=maps[this.mapId].name;this.mapId=portal.target;this.position={...portal.spawn};this.paint();logActivity(`You moved from ${previous} to ${maps[this.mapId].name}.`);}else if(pending){gameEvents.dispatchEvent(new CustomEvent('inspect-update',{detail:pending.targetId}));}else if(desk){this.seated=true;this.position={...studyDesk.seat};this.actor.destroy();this.actor=this.person(this.position.x,this.position.y,0xd78b62,true);logActivity('You sat at your desk.');}else if(npc){gameEvents.dispatchEvent(new CustomEvent('talk-npc',{detail:npc.id}));}else if(kind) interact(kind);}
    const key=`${this.seated}:${this.mapId}:${prompt}:${Math.round(this.position.x/8)}:${Math.round(this.position.y/8)}`;
    if(key!==this.lastState){this.lastState=key;publish({map:this.mapId,prompt,interaction:kind,x:this.position.x,y:this.position.y,plotId:plot?.id});}
  }
}

import { unreadUpdates,updateEvents } from '../services/worldUpdates';
import type { RemotePlayer } from '../services/sharedWorld';
import { gameEvents } from './bridge';
import Phaser from 'phaser';
import { controls, interact, publish, resetControls, logActivity } from './bridge';
import { maps, move, nearby, portalAt, type MapId, type Point } from '../world/model';

export class WorldScene extends Phaser.Scene {
  private remotePlayers:RemotePlayer[]=[];
  private remoteActors=new Map<string,{actor:Phaser.GameObjects.Container;seated:boolean}>();
  private npcNotice?:Phaser.GameObjects.Text;
  private refreshNotice=()=>{this.npcNotice?.setVisible(unreadUpdates().some(u=>u.target==='npc'&&u.targetId==='milo'));};
  private mapId: MapId='garden';
  private position: Point={...maps.garden.spawn};
  private actor!: Phaser.GameObjects.Container;
  private keys!: Record<string,Phaser.Input.Keyboard.Key>;
  private lastState='';
  private tick=0;
  private seated=false;
  private highlight!: Phaser.GameObjects.Graphics;
  constructor() { super('world'); }
  preload() { this.load.image('cozy',`${import.meta.env.BASE_URL}assets/world/cozy-atlas-v1.png`); }
  create() {
    const atlas=this.textures.get('cozy');
    const frames:Record<string,number[]>={grass:[27,30,257,252],stone:[342,31,255,252],wood:[656,31,255,252],sand:[974,31,251,252],wall:[17,350,282,246],roof:[335,373,273,215],door:[682,349,231,253],window:[963,383,271,199],tree:[17,648,280,286],fence:[341,731,260,137],gate:[666,721,237,193],shrub:[967,721,267,193],bench:[17,1007,281,202],desk:[336,993,276,210],chair:[688,984,194,229],planter:[1000,980,214,238]};
    for(const [name,[x,y,w,h]] of Object.entries(frames))atlas.add(name,0,x,y,w,h);
    atlas.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,SHIFT',false) as Record<string,Phaser.Input.Keyboard.Key>;
    this.paint();
    updateEvents.addEventListener('change',this.refreshNotice);
    window.addEventListener('storage',this.refreshNotice);
    this.events.once('shutdown',()=>{updateEvents.removeEventListener('change',this.refreshNotice);window.removeEventListener('storage',this.refreshNotice);});
    const remote=(event:Event)=>{this.remotePlayers=(event as CustomEvent<RemotePlayer[]>).detail;};
    const restore=(event:Event)=>{const saved=(event as CustomEvent<RemotePlayer>).detail;if(saved.map_id!=='garden'&&saved.map_id!=='cottage')return;if(!Number.isFinite(saved.x)||!Number.isFinite(saved.y))return;this.mapId=saved.map_id;this.seated=saved.activity==='sitting';this.position={x:saved.x,y:saved.y};this.paint();};
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
    if(seated){g.clear();g.fillStyle(0x273d32,.22);g.fillEllipse(0,1,28,10);this.rect(g,-12,-8,9,7,0x39483e);this.rect(g,3,-8,9,7,0x39483e);this.rect(g,-11,-24,22,17,coat);this.rect(g,-15,-24,5,11,0xe3b888);this.rect(g,10,-24,5,11,0xe3b888);this.rect(g,-9,-38,18,16,0xe3b888);this.rect(g,-11,-41,22,8,0x554139);this.rect(g,3,-32,3,3,0x29392f);}
    p.add(g); return p;
  }
  private paint() {
    this.npcNotice=undefined;
    this.remoteActors.clear();
    this.children.removeAll(true);
    const g=this.add.graphics();
    if(this.mapId==='garden') this.garden(g); else this.cottage(g);
    this.actor=this.person(this.position.x,this.position.y,0xd78b62,this.seated);
    this.highlight=this.add.graphics().setDepth(900);
    this.lastState='';
    this.resizeWorld();
  }
  private garden(g:Phaser.GameObjects.Graphics) {
    this.terrain('grass',0,0,960,640);
    this.terrain('sand',436,311,60,329);
    this.terrain('stone',185,428,556,58);
    this.rect(g,80,394,180,118,0x718d61);g.fillStyle(0x6e9e9c);g.fillRoundedRect(82,381,172,118,37);
    g.fillStyle(0x89bab1);g.fillRoundedRect(91,387,153,98,33);
    for(let i=0;i<6;i++) this.rect(g,113+i*18,407+(i%3)*21,18,2,0xb3d0b5);
    g.fillStyle(0x5d8754);g.fillEllipse(120,467,25,12);g.fillEllipse(220,413,22,10);
    // Individual wall, roof, window, and door pieces retain independent transforms.
    this.sprite('wall',464,231,244,194,160);
    this.sprite('roof',464,159,286,120,161);
    this.sprite('window',392,254,48,42,162);this.sprite('window',536,254,48,42,162);
    this.sprite('door',464,296,42,64,163);
    this.rect(g,438,328,52,9,0xb09f7b);this.rect(g,432,337,64,9,0xc3b38c);
    this.label(464,216,'OUR COTTAGE','#715c45',12);
    for(let x=58;x<940;x+=76) {if(x>410&&x<520)continue;this.sprite('fence',x,599,80,40,600);}
    [[83,141,1.3],[167,102,1.1],[266,119,.9],[688,104,1.2],[857,113,1.2],[902,281,.8],[51,284,.8],[629,557,.7],[329,542,.7]].forEach(([x,y,s])=>this.tree(g,x,y,s));
    this.sprite('shrub',316,288,44,35,289);this.sprite('planter',607,308,32,37,309);
    this.rect(g,704,196,158,116,0xb29d76);
    this.rect(g,712,204,142,100,0xc9b78b);
    for(let x=704;x<870;x+=20) {this.rect(g,x,192,9,14,0x796c4d);this.rect(g,x,302,9,14,0x796c4d);}
    this.rect(g,758,235,7,42,0x776447);this.rect(g,727,222,72,38,0xf1dfb5);
    this.label(763,236,'IDEAS','#705d43',12);this.label(783,286,'under construction','#705d43',10);
    this.sprite('bench',793,451,132,88,480);
    const npc=this.person(619,389,0x7f98a0);npc.setDepth(389);this.label(619,333,'Milo','#345344',13);this.npcNotice=this.label(619,308,'!','#ffe6a1',24).setBackgroundColor('#4c6248').setPadding(7,1);this.refreshNotice();
    this.label(169,537,'Willow Pond','#46654e',12);
  }
  private cottage(g:Phaser.GameObjects.Graphics) {
    this.rect(g,0,0,960,640,0x344d42);
    this.rect(g,193,99,574,477,0x6c5545);this.rect(g,205,105,550,450,0xe8d5ab);
    this.add.tileSprite(216,136,528,412,'cozy','wood').setOrigin(0).setTileScale(.3);
    g=this.add.graphics();
    this.rect(g,216,111,528,48,0xeeddbb);this.rect(g,216,153,528,9,0x9d7a55);
    this.rect(g,442,111,76,40,0x7a8e7c);this.rect(g,449,115,62,31,0xb4c9b0);this.rect(g,478,114,4,34,0xf5e7bf);
    this.rect(g,238,180,130,98,0x8b7356);this.rect(g,243,185,120,79,0xd5c59c);this.rect(g,251,190,104,23,0xf5e7c8);this.rect(g,243,218,120,46,0x779a89);
    this.rect(g,568,169,146,105,0x8a684d);this.rect(g,562,166,157,17,0xb98d62);
    this.rect(g,579,195,51,61,0xb68c62);this.rect(g,650,195,51,61,0xb68c62);this.rect(g,621,222,4,4,0xefcf8c);this.rect(g,655,222,4,4,0xefcf8c);
    this.rect(g,598,147,15,20,0x6f8c61);this.rect(g,593,137,25,16,0x7b9b68);
    g.fillStyle(0x9b7963);g.fillRoundedRect(356,281,252,180,20);g.fillStyle(0xc7957c);g.fillRoundedRect(363,288,238,166,16);
    this.sprite('desk',482,338,115,72,374);
    this.sprite('chair',480,400,34,43,390);
    this.rect(g,446,541,68,16,0x715443);this.rect(g,441,517,78,22,0xcbb68b);
    this.label(480,527,'EXIT','#715c43',12);
    this.label(480,75,'A place to come home to.','#e6d8b7',17);
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
    const npc=this.mapId==='garden'&&nearby(this.position,{x:619,y:389});
    const build=this.mapId==='garden'&&nearby(this.position,{x:780,y:330},72);
    const desk=this.mapId==='cottage'&&nearby(this.position,{x:480,y:405},65);
    this.highlight.clear();
    if(desk){this.highlight.lineStyle(2,0xffefac,.75+Math.sin(this.tick/350)*.2);this.highlight.strokeRoundedRect(419,296,127,85,6);}
    const kind=npc?'npc':build?'construction':null;
    const prompt=this.seated?'Stand up':portal?portal.label:desk?'Sit at your desk':npc?'Talk to Milo':build?'Visit the idea board':'';
    const pressed=Phaser.Input.Keyboard.JustDown(this.keys.E)||Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||controls.interact;
    controls.interact=false;
    if(pressed&&!controls.blocked){if(this.seated){this.seated=false;this.position={x:480,y:433};this.actor.destroy();this.actor=this.person(this.position.x,this.position.y,0xd78b62);logActivity('You stood up from your desk.');}else if(portal){const previous=maps[this.mapId].name;this.mapId=portal.target;this.position={...portal.spawn};this.paint();logActivity(`You moved from ${previous} to ${maps[this.mapId].name}.`);}else if(desk){this.seated=true;this.position={x:480,y:395};this.actor.destroy();this.actor=this.person(this.position.x,this.position.y,0xd78b62,true);logActivity('You sat at your desk.');}else if(kind) interact(kind);}
    const key=`${this.seated}:${this.mapId}:${prompt}:${Math.round(this.position.x/8)}:${Math.round(this.position.y/8)}`;
    if(key!==this.lastState){this.lastState=key;publish({map:this.mapId,prompt,interaction:kind,x:this.position.x,y:this.position.y});}
  }
}

import Phaser from 'phaser';
import { controls, interact, publish, resetControls, logActivity } from './bridge';
import { maps, move, nearby, portalAt, type MapId, type Point } from '../world/model';

export class WorldScene extends Phaser.Scene {
  private mapId: MapId='garden';
  private position: Point={...maps.garden.spawn};
  private actor!: Phaser.GameObjects.Container;
  private keys!: Record<string,Phaser.Input.Keyboard.Key>;
  private lastState='';
  private tick=0;
  private seated=false;
  private highlight!: Phaser.GameObjects.Graphics;
  constructor() { super('world'); }
  create() {
    this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE',false) as Record<string,Phaser.Input.Keyboard.Key>;
    this.paint();
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
    // Fill the viewport without stretching sprites; follow the player when cropped.
    camera.setZoom(Math.max(this.scale.width/map.width,this.scale.height/map.height));
    camera.setBounds(0,0,map.width,map.height);
    camera.centerOn(this.position.x,this.position.y);
  }
  private rect(g: Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,c:number) {g.fillStyle(c,1);g.fillRect(x,y,w,h);}
  private label(x:number,y:number,text:string,color='#f9f2dc',size=13) {
    return this.add.text(x,y,text,{fontFamily:'monospace',fontSize:size,color,align:'center'}).setOrigin(.5).setDepth(1000);
  }
  private tree(g:Phaser.GameObjects.Graphics,x:number,y:number,size=1) {
    this.rect(g,x-7*size,y,14*size,35*size,0x705944);
    g.fillStyle(0x365e47);g.fillEllipse(x+5,y+23*size,74*size,22*size);
    g.fillStyle(0x457955);g.fillCircle(x,y-18*size,32*size);g.fillCircle(x-19*size,y-4*size,24*size);g.fillCircle(x+20*size,y-4*size,24*size);
    g.fillStyle(0x68905b);g.fillCircle(x-10*size,y-24*size,20*size);
  }
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
    this.children.removeAll(true);
    const g=this.add.graphics();
    if(this.mapId==='garden') this.garden(g); else this.cottage(g);
    this.actor=this.person(this.position.x,this.position.y,0xd78b62,this.seated);
    this.highlight=this.add.graphics().setDepth(900);
    this.lastState='';
    this.resizeWorld();
  }
  private garden(g:Phaser.GameObjects.Graphics) {
    this.rect(g,0,0,960,640,0x90ac72);
    for(let i=0;i<600;i++) {
      const x=(i*127+19)%940+10,y=(i*73+37)%620+10;
      this.rect(g,x,y,2+(i%3),2,i%2?0x819f65:0x9bb67d);
    }
    // Sandy lanes connect the cottage, pond, and construction plot.
    this.rect(g,436,311,60,329,0xd6c49a);this.rect(g,185,428,556,58,0xd6c49a);
    for(let i=0;i<35;i++) this.rect(g,446+(i*13)%40,350+i*8,3,2,0xc4b38e);
    this.rect(g,80,394,180,118,0x718d61);g.fillStyle(0x6e9e9c);g.fillRoundedRect(82,381,172,118,37);
    g.fillStyle(0x89bab1);g.fillRoundedRect(91,387,153,98,33);
    for(let i=0;i<6;i++) this.rect(g,113+i*18,407+(i%3)*21,18,2,0xb3d0b5);
    g.fillStyle(0x5d8754);g.fillEllipse(120,467,25,12);g.fillEllipse(220,413,22,10);
    this.rect(g,342,187,244,141,0xead8aa);this.rect(g,349,201,230,115,0xf3e1b5);
    // Roof, chimney, windows, door.
    g.fillStyle(0x654c45);g.fillTriangle(321,201,464,100,607,201);
    g.fillStyle(0xaa6c54);g.fillTriangle(329,189,464,98,599,189);
    for(let i=0;i<5;i++) this.rect(g,352+i*19,174-i*12,226-i*38,3,0xbf8162);
    this.rect(g,539,113,23,49,0x745b4b);this.rect(g,534,110,33,9,0x866954);
    [377,513].forEach(x=>{this.rect(g,x,224,37,39,0x856f51);this.rect(g,x+4,228,29,30,0x9bb7ac);this.rect(g,x+17,227,3,33,0xf7e3b1);this.rect(g,x+4,241,29,3,0xf7e3b1);this.rect(g,x-5,263,47,9,0x997650);});
    this.rect(g,445,265,39,63,0x795746);this.rect(g,452,271,25,49,0x986b50);this.rect(g,473,296,4,4,0xf4cf79);
    this.rect(g,438,328,52,9,0xb09f7b);this.rect(g,432,337,64,9,0xc3b38c);
    this.label(464,216,'OUR COTTAGE','#715c45',12);
    // Wooden fences and trees around the clearing.
    for(let x=34;x<940;x+=26) {if(x>420&&x<510) continue;this.rect(g,x,585,7,28,0xc0a97c);this.rect(g,x,593,26,5,0xd5be91);}
    [[83,141,1.3],[167,102,1.1],[266,119,.9],[688,104,1.2],[857,113,1.2],[902,281,.8],[51,284,.8],[629,557,.7],[329,542,.7]].forEach(([x,y,s])=>this.tree(g,x,y,s));
    // Flower beds.
    for(let i=0;i<22;i++) {const x=310+(i%3)*18,y=245+Math.floor(i/3)*12;this.rect(g,x,y,2,7,0x527a4c);this.rect(g,x-2,y-3,7,5,i%2?0xf1cd87:0xe3a79b);}
    this.rect(g,704,196,158,116,0xb29d76);
    this.rect(g,712,204,142,100,0xc9b78b);
    for(let x=704;x<870;x+=20) {this.rect(g,x,192,9,14,0x796c4d);this.rect(g,x,302,9,14,0x796c4d);}
    this.rect(g,758,235,7,42,0x776447);this.rect(g,727,222,72,38,0xf1dfb5);
    this.label(763,236,'IDEAS','#705d43',12);this.label(783,286,'under construction','#705d43',10);
    // Picnic table is a solid object.
    this.rect(g,739,424,109,59,0x9b7751);this.rect(g,727,413,132,18,0xc59a69);this.rect(g,727,479,132,16,0xc59a69);this.rect(g,749,408,88,5,0xdec18c);
    const npc=this.person(619,389,0x7f98a0);npc.setDepth(389);this.label(619,333,'Milo','#345344',13);
    this.label(169,537,'Willow Pond','#46654e',12);
  }
  private cottage(g:Phaser.GameObjects.Graphics) {
    this.rect(g,0,0,960,640,0x344d42);
    this.rect(g,193,99,574,477,0x6c5545);this.rect(g,205,105,550,450,0xe8d5ab);
    this.rect(g,216,136,528,412,0xc69d70);
    for(let y=143;y<550;y+=28){this.rect(g,216,y,528,2,0xb28c62);for(let x=220+(y%3)*70;x<740;x+=140)this.rect(g,x,y,2,27,0xb28c62);}
    this.rect(g,216,111,528,48,0xeeddbb);this.rect(g,216,153,528,9,0x9d7a55);
    this.rect(g,442,111,76,40,0x7a8e7c);this.rect(g,449,115,62,31,0xb4c9b0);this.rect(g,478,114,4,34,0xf5e7bf);
    this.rect(g,238,180,130,98,0x8b7356);this.rect(g,243,185,120,79,0xd5c59c);this.rect(g,251,190,104,23,0xf5e7c8);this.rect(g,243,218,120,46,0x779a89);
    this.rect(g,568,169,146,105,0x8a684d);this.rect(g,562,166,157,17,0xb98d62);
    this.rect(g,579,195,51,61,0xb68c62);this.rect(g,650,195,51,61,0xb68c62);this.rect(g,621,222,4,4,0xefcf8c);this.rect(g,655,222,4,4,0xefcf8c);
    this.rect(g,598,147,15,20,0x6f8c61);this.rect(g,593,137,25,16,0x7b9b68);
    g.fillStyle(0x9b7963);g.fillRoundedRect(356,281,252,180,20);g.fillStyle(0xc7957c);g.fillRoundedRect(363,288,238,166,16);
    this.rect(g,432,314,12,72,0x77553d);this.rect(g,521,314,12,72,0x77553d);this.rect(g,425,302,115,49,0xe3ba81);
    this.rect(g,464,385,33,9,0x765c45);this.rect(g,469,394,6,17,0x765c45);this.rect(g,488,394,6,17,0x765c45);
    this.rect(g,460,312,22,16,0xf1e0bd);this.rect(g,488,314,12,13,0x8b9f81);
    this.rect(g,446,541,68,16,0x715443);this.rect(g,441,517,78,22,0xcbb68b);
    this.label(480,527,'EXIT','#715c43',12);
    this.label(480,75,'A place to come home to.','#e6d8b7',17);
  }
  update(_time:number,delta:number) {
    if(!this.actor) return;
    let dx=0,dy=0;
    if(!controls.blocked&&!this.seated){dx=Number(this.keys.D.isDown||this.keys.RIGHT.isDown||controls.right)-Number(this.keys.A.isDown||this.keys.LEFT.isDown||controls.left);dy=Number(this.keys.S.isDown||this.keys.DOWN.isDown||controls.down)-Number(this.keys.W.isDown||this.keys.UP.isDown||controls.up);}
    this.position=move(maps[this.mapId],this.position,dx,dy,delta);
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

(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VAEngine=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const W=420,GRAVITY=1250,JUMP=530,MAX=215,HERO_W=30,HERO_H=62;
const chapters=['Vrindavan','Yamuna','Govardhan'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function rng(seed){let v=seed>>>0;return()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296}}
function level(n){n=clamp(Math.floor(n)||1,1,12);const random=rng(n*7027+81),chapter=Math.floor((n-1)/4),platforms=[],items=[],hazards=[],decor=[];let x=0,y=515,prev=null;
function add(p){p.id=platforms.length;platforms.push(p);return p}
function item(type,x,y){items.push({id:items.length,type,x,y,taken:false})}
const count=13+Math.floor((n-1)/4);
for(let i=0;i<count;i++){
 let width=i===0?242:i===count-1?244:Math.round(126+random()*72);
 if(i){let gap=36+Math.round(random()*(26+chapter*10));let delta=Math.round((random()-.5)*108);if(i%4===0)delta=-28;if(n===1&&i<=5)delta=[0,-48,32,-54,43,-36][i];let next=clamp(y+delta,360,535);if(i===count-1)next=480;
 // Ensure each mandatory jump is within the physics envelope; bridges cover selected wide gaps.
 x=prev.x+prev.w+gap;
 if(i%5===0){add({x:prev.x+prev.w-1,y:Math.max(prev.y,next),w:gap+2,kind:'bridge',main:false})}
 y=next;}
 const p=add({x,y,w:width,kind:'ground',main:true,checkpoint:i===4||i===8});prev=p;
 if(i>0&&i<count-1){item('lotus',x+width*.5,y-37);item('coin',x+width*.25,y-35);item('coin',x+width*.77,y-35);if(i%3===0)item('coin',x+width*.53,y-105)}
 if(i===3||i===9)item('feather',x+width*.77,y-70);
 if(i===6)item('pot',x+width*.22,y-38);
 if(p.checkpoint){decor.push({type:'cow',x:x+width*.2,y,p:p.id});item('seva',x+width*.27,y-42)}
 else if(i>1&&i<count-1&&i%3===1&&n>=2)hazards.push({x:x+width*.77,y:y-19,w:25,h:19});
 if(i===1||i===7||i===11){let yy=y-96;add({x:x+width*.28,y:yy,w:84,kind:'island',main:false});item('coin',x+width*.5,yy-32)}
 if(i%2===0)decor.push({type:'flowers',x:x+width*.12,y,p:p.id});
 if(i%3===2)decor.push({type:'peacock',x:x+width*.87,y,p:p.id});
}
const last=prev,lotuses=items.filter(i=>i.type==='lotus').length;return {n,chapter,name:chapters[chapter],platforms,items,hazards,decor,width:last.x+last.w,goalX:last.x+last.w-75,goalY:last.y,target:Math.min(10+chapter,lotuses),spawn:{x:65,y:platforms[0].y-HERO_H}}}
function newRun(n){let l=level(n);return {level:l,p:{x:l.spawn.x,y:l.spawn.y,vx:0,vy:0,ground:true,face:1,coyote:.12,buffer:0,inv:0,shield:0,land:0,runTime:0},checkpoint:{...l.spawn},hearts:3,lotuses:0,coins:0,seva:0,score:0,combo:0,maxCombo:0,comboTime:0,elapsed:0,status:'playing',events:[],goalHint:0}}
function emit(r,type,data={}){r.events.push({type,...data})}
function jump(r){if(r.status==='playing')r.p.buffer=.14}
function release(r){if(r.p.vy<-230)r.p.vy=-230}
function respawn(r,fall=true){const p=r.p;if(p.inv>0&&!fall)return;if(p.shield>0&&!fall){p.shield=0;p.inv=1.25;emit(r,'shield');return}
 r.hearts=Math.max(0,r.hearts-1);r.combo=0;r.comboTime=0;emit(r,'hurt',{x:p.x,y:p.y});
 if(!r.hearts){r.status='lose';emit(r,'lose');return}
 p.x=r.checkpoint.x;p.y=r.checkpoint.y;p.vx=0;p.vy=0;p.ground=true;p.inv=1.75;p.shield=0;p.coyote=.12;p.buffer=0;emit(r,'respawn',{x:p.x,y:p.y})}
function collect(r,i){if(i.taken)return;i.taken=true;r.combo=r.comboTime>0?r.combo+1:1;r.comboTime=2.2;r.maxCombo=Math.max(r.maxCombo,r.combo);let pts=0;
 switch(i.type){case'lotus':r.lotuses++;pts=100;break;case'coin':r.coins++;pts=25;break;case'feather':r.p.shield=8;pts=150;break;case'pot':r.hearts=Math.min(3,r.hearts+1);pts=100;break;case'seva':r.seva++;pts=180;break}
 pts*=1+Math.floor(Math.min(r.combo,15)/5);r.score+=pts;emit(r,'collect',{kind:i.type,x:i.x,y:i.y,pts,combo:r.combo})}
function step(r,input={},dt=1/60){if(r.status!=='playing')return;r.elapsed+=dt;const p=r.p,l=r.level;p.inv=Math.max(0,p.inv-dt);p.shield=Math.max(0,p.shield-dt);p.land=Math.max(0,p.land-dt);r.goalHint=Math.max(0,r.goalHint-dt);r.comboTime=Math.max(0,r.comboTime-dt);if(!r.comboTime)r.combo=0;
 p.buffer=Math.max(0,p.buffer-dt);p.coyote=p.ground?.12:Math.max(0,p.coyote-dt);let dir=(input.right?1:0)-(input.left?1:0);if(dir)p.face=dir;let target=dir*MAX,rate=dir?1650:1900;p.vx+=clamp(target-p.vx,-rate*dt,rate*dt);
 if(p.buffer>0&&p.coyote>0){p.vy=-JUMP;p.ground=false;p.coyote=0;p.buffer=0;emit(r,'jump',{x:p.x,y:p.y+HERO_H})}
 let oldBottom=p.y+HERO_H;p.x=clamp(p.x+p.vx*dt,15,l.width-15);p.vy+=GRAVITY*dt;p.y+=p.vy*dt;let nextBottom=p.y+HERO_H,hit=null;
 if(p.vy>=0){for(const q of l.platforms){if(p.x+HERO_W/2>q.x+1&&p.x-HERO_W/2<q.x+q.w-1&&oldBottom<=q.y+.8&&nextBottom>=q.y){if(!hit||q.y<hit.y)hit=q}}}
 if(hit){if(!p.ground&&p.vy>100){p.land=.17;emit(r,'land',{x:p.x,y:hit.y})}p.y=hit.y-HERO_H;p.vy=0;p.ground=true;if(hit.checkpoint&&r.checkpoint.x<hit.x){r.checkpoint={x:hit.x+24,y:hit.y-HERO_H};emit(r,'checkpoint',{x:hit.x+24,y:hit.y})}}
 else p.ground=false;if(p.ground&&Math.abs(p.vx)>10)p.runTime+=dt* Math.abs(p.vx)/MAX;
 for(const i of l.items){if(i.taken)continue;let y=p.y+HERO_H*.5;if(Math.abs(i.x-p.x)<(i.type==='seva'?35:27)&&Math.abs(i.y-y)<40)collect(r,i)}
 for(const h of l.hazards){if(p.inv<=0&&p.x+HERO_W/2>h.x&&p.x-HERO_W/2<h.x+h.w&&p.y+HERO_H>h.y+3&&p.y<h.y+h.h){respawn(r,false);break}}
 if(p.y>710){respawn(r,true);return}
 if(p.x>l.goalX-32&&Math.abs(p.y+HERO_H-l.goalY)<75){if(r.lotuses>=l.target){r.status='win';r.score+=500+r.hearts*100;emit(r,'win')}else if(r.goalHint<=0){r.goalHint=3;emit(r,'goalLocked',{needed:l.target-r.lotuses})}}
}
function stars(r){return r.status==='win'?(r.hearts===3&&r.lotuses>=r.level.target?3:r.hearts>=2?2:1):0}
return {level,newRun,step,jump,release,collect,respawn,stars,constants:{W,GRAVITY,JUMP,MAX,HERO_W,HERO_H},chapters};
});
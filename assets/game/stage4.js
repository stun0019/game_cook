const ART_ROOT='assets/art/stage4/';
const MANIFEST_URL=ART_ROOT+'manifest.json';
const AUDIO_MANIFEST_URL='assets/audio/stage4/audio-manifest.json';
const SAVE_KEY='stove-brawl.save.v1';
const DIRECTIONS=['e','se','s','sw','w','nw','n','ne'];
const DIRECTION_CENTER={e:0,se:45,s:90,sw:135,w:180,nw:-135,n:-90,ne:-45};
const HELD_ANCHOR={n:{x:80,y:86,layer:'back'},ne:{x:93,y:90,layer:'back'},e:{x:101,y:97,layer:'front'},se:{x:93,y:104,layer:'front'},s:{x:80,y:108,layer:'front'},sw:{x:67,y:104,layer:'front'},w:{x:59,y:97,layer:'front'},nw:{x:67,y:90,layer:'back'}};
const FOOD_NAME={bun:'麵包','tomato-raw':'生番茄','tomato-chopped':'切好番茄','meat-raw':'生肉排','meat-cooked':'熟肉排','burger-complete':'完成漢堡'};
const FOOD_PATH={bun:'food/food-bun.svg','tomato-raw':'food/food-tomato-raw.svg','tomato-chopped':'food/food-tomato-chopped.svg','meat-raw':'food/food-meat-raw.svg','meat-cooked':'food/food-meat-cooked.svg','burger-complete':'food/food-burger-complete.svg',placeholder:'food/food-placeholder.svg'};
const UI_PATH={'hud-star':'ui/ui-hud-star.svg','hud-clock':'ui/ui-hud-clock.svg',pause:'ui/ui-pause.svg','music-on':'ui/ui-music-on.svg','music-off':'ui/ui-music-off.svg','sound-on':'ui/ui-sound-on.svg','sound-off':'ui/ui-sound-off.svg','vibration-on':'ui/ui-vibration-on.svg','vibration-off':'ui/ui-vibration-off.svg','motion-on':'ui/ui-motion-on.svg','motion-reduced':'ui/ui-motion-reduced.svg',interact:'ui/ui-interact.svg',discard:'ui/ui-discard.svg','direction-arrow':'ui/ui-direction-arrow.svg','result-medal':'ui/ui-result-medal.svg'};
const STATION_PATH={bun:'kitchen/station-prep-bin.svg',tomato:'kitchen/station-prep-bin.svg',meat:'kitchen/station-prep-bin.svg',board:'kitchen/station-cutting-inset.svg',pan:'kitchen/station-pan-inset.svg','ready-tray':'kitchen/station-ready-tray.svg',assembly:'kitchen/station-assembly-inset.svg',service:'kitchen/station-service-inset.svg',disassembly:'kitchen/station-disassembly-inset.svg'};
const ORDER_SEQUENCE=[['bun','meat-cooked'],['bun','meat-cooked'],['bun','meat-cooked'],['bun','tomato-chopped'],['bun','meat-cooked']];
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];

let artPaths=new Set(),audioDefinitions={},audioContext=null,musicNodes=null,lastFrame=performance.now(),joystickPointer=null,nearCandidate=null,nearCandidateSince=0,directionCandidate=null,directionCandidateSince=0,lastVibration=0,toastTimer=0;
const defaultSettings={musicVolume:.7,sfxVolume:.8,muted:false,vibration:true,reduceMotion:'system',language:'zh-Hant'};
const defaultSave=()=>({schemaVersion:1,updatedAt:new Date().toISOString(),progress:{unlockedLevel:1,tutorialCompleted:false,levelStars:{},bestScore:{},bestCombo:{}},settings:{...defaultSettings}});
let saveData=loadSave();
let settings=saveData.settings;
const state={runId:0,mode:'TITLE',pauseReturn:'TITLE',pausedByBackground:false,running:false,ended:false,time:60,clockAccumulator:0,score:0,served:0,created:0,combo:0,maxCombo:0,fastest:Infinity,held:'none',heldRecipe:[],plate:[],orders:[],stationItems:{board:null,pan:null,readyTray:null},processes:{},pending:[],position:{x:70,y:55},keys:{},joystick:{x:0,y:0},moving:false,direction:'s',near:null,hotTime:0,firstProcessBonus:false,graceTime:0,lastRenderOrderKey:''};

function loadSave(){
  try{
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!raw||raw.schemaVersion!==1||typeof raw.settings!=='object')return defaultSave();
    const clean=defaultSave();
    clean.progress={...clean.progress,...(raw.progress||{}),levelStars:{...(raw.progress?.levelStars||{})},bestScore:{...(raw.progress?.bestScore||{})},bestCombo:{...(raw.progress?.bestCombo||{})}};
    clean.settings={...defaultSettings,...raw.settings};
    clean.settings.musicVolume=clampNumber(clean.settings.musicVolume,0,1,.7);
    clean.settings.sfxVolume=clampNumber(clean.settings.sfxVolume,0,1,.8);
    clean.settings.muted=clean.settings.muted===true;
    clean.settings.vibration=clean.settings.vibration!==false;
    clean.settings.reduceMotion=['system','on','off'].includes(clean.settings.reduceMotion)?clean.settings.reduceMotion:'system';
    return clean;
  }catch{return defaultSave()}
}
function clampNumber(value,min,max,fallback){return Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback}
function writeSave(){saveData.settings={...settings};saveData.updatedAt=new Date().toISOString();try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData))}catch{}}
function normalizeManifestPath(path){return String(path||'').replaceAll('\\','/').replace(/^\.\//,'').replace(/^assets\/art\/stage4\//,'')}
async function loadManifests(){
  try{const response=await fetch(MANIFEST_URL,{cache:'no-store'});if(response.ok){const manifest=await response.json(),entries=manifest.assets||manifest.entries||[];artPaths=new Set(entries.map(entry=>normalizeManifestPath(entry.path)).filter(Boolean))}}catch{}
  try{const response=await fetch(AUDIO_MANIFEST_URL,{cache:'no-store'});if(response.ok){const manifest=await response.json();audioDefinitions=manifest.events||{}}}catch{}
}
function asset(relative){const normalized=normalizeManifestPath(relative);return artPaths.has(normalized)?ART_ROOT+normalized:null}
function setImage(img,relative,onReady){
  const path=asset(relative);
  if(!img||!path){if(img){img.removeAttribute('src');img.hidden=true}return false}
  img.hidden=false;img.onload=()=>onReady?.(img);img.onerror=()=>{img.hidden=true;img.removeAttribute('src');onReady?.(null)};img.src=path;return true
}
function applyAssets(){
  const counterPath=asset('kitchen/kitchen-u-counter-base.svg'),counter=$('#u-counter');if(counterPath){counter.style.backgroundImage=`url("${counterPath}")`;counter.classList.add('has-art')}
  $$('.station').forEach(station=>setImage(station.querySelector('.station-sprite'),STATION_PATH[station.dataset.station]));
  $$('[data-ui]').forEach(img=>setImage(img,UI_PATH[img.dataset.ui]));
  updateChefAsset();updateHeldAsset();renderSettings();
}
function updateChefAsset(){
  const chef=$('#chef'),img=chef.querySelector('.chef-sprite'),relative=`chef/chef-shiba-${state.direction}.svg`;
  setImage(img,relative,loaded=>chef.classList.toggle('has-sprite',!!loaded));chef.dataset.direction=state.direction;
  const anchor=HELD_ANCHOR[state.direction];const held=$('#held-item');held.style.left=`${anchor.x/1.6}%`;held.style.top=`${anchor.y/1.8}%`;held.classList.toggle('is-back',anchor.layer==='back')
}
function updateHeldAsset(){
  const held=$('#held-item');held.dataset.item=state.held;held.alt=state.held==='none'?'':FOOD_NAME[state.held];if(state.held==='none'){held.removeAttribute('src');held.hidden=true;return}
  const path=asset(FOOD_PATH[state.held])||asset(FOOD_PATH.placeholder);if(path){held.hidden=false;held.src=path}else{held.hidden=true;held.removeAttribute('src')}
}
function foodMarkup(item){const path=asset(FOOD_PATH[item])||asset(FOOD_PATH.placeholder);return path?`<img src="${path}" alt="${FOOD_NAME[item]}">`:`<span>${FOOD_NAME[item]}</span>`}

function setMode(mode){state.mode=mode;$('#game').dataset.gameState=mode}
function resetRun(){
  state.runId++;Object.assign(state,{mode:'TUTORIAL_DELIVERY',pauseReturn:'TUTORIAL_DELIVERY',pausedByBackground:false,running:true,ended:false,time:60,clockAccumulator:0,score:0,served:0,created:0,combo:0,maxCombo:0,fastest:Infinity,held:'burger-complete',heldRecipe:['bun','meat-cooked'],plate:[],orders:[],stationItems:{board:null,pan:null,readyTray:null},processes:{},pending:[],position:{x:70,y:55},keys:{},joystick:{x:0,y:0},moving:false,direction:state.direction||'s',near:null,hotTime:0,firstProcessBonus:false,graceTime:0,lastRenderOrderKey:''});
  setMode('TUTORIAL_DELIVERY');hideOverlay('#title-screen');hideOverlay('#result-screen');hideOverlay('#pause-screen');clearTransient();createOrder();updateChefAsset();updateHeldAsset();detectNear(true);render(true)
}
function createOrder(){
  if(state.mode!=='TUTORIAL_DELIVERY'&&state.time<=10)return false;
  const index=state.created++,recipe=index<ORDER_SEQUENCE.length?ORDER_SEQUENCE[index]:index%2?ORDER_SEQUENCE[3]:ORDER_SEQUENCE[4];
  state.orders.push({id:`${state.runId}-${index}`,index,recipe:[...recipe],patience:100,elapsed:0,expired:false,tutorial:index===0});
  if(index===1)state.stationItems.readyTray='meat-cooked';return true
}
function ensureOrderQueue(){while(state.orders.length<(state.served>=3?2:1)&&state.time>10)if(!createOrder())break}
function activateCurrentOrder(){if(state.orders[0]?.index===1&&state.stationItems.readyTray!=='meat-cooked')state.stationItems.readyTray='meat-cooked'}
function startGame(){primeAudio();resetRun();playSound('pickup')}

function pauseGame(reason='manual'){
  if(!state.running||state.ended||state.mode==='PAUSED')return;state.pauseReturn=state.mode;state.pausedByBackground=reason!=='manual';state.moving=false;state.keys={};state.joystick={x:0,y:0};resetStick();setMode('PAUSED');$('#pause-reason').textContent=state.pausedByBackground?'切換頁面時已自動暫停，請確認後繼續。':'時間、耐心、加工與音訊都已凍結。';showOverlay('#pause-screen');stopVibration();audioContext?.suspend();renderSettings()
}
function resumeGame(){
  if(state.mode!=='PAUSED'||document.hidden)return;const runId=state.runId;$('#pause-reason').textContent='準備繼續';setTimeout(()=>{if(runId!==state.runId||document.hidden||state.mode!=='PAUSED')return;hideOverlay('#pause-screen');setMode(state.pauseReturn);state.pausedByBackground=false;lastFrame=performance.now();if(!settings.muted)audioContext?.resume().then(startMusic).catch(()=>{});render()},700)
}
function showOverlay(selector){$(selector).classList.add('is-visible')}
function hideOverlay(selector){$(selector).classList.remove('is-visible')}
function clearTransient(){$$('#toast,#success-feedback').forEach(element=>element.classList.remove('is-visible'));state.pending=[];clearTimeout(toastTimer)}
function schedule(ms,callback){state.pending.push({remaining:ms,runId:state.runId,callback})}

function quantizeDirection(x,y){const angle=Math.atan2(y,x)*180/Math.PI;if(angle>=-22.5&&angle<22.5)return'e';if(angle<67.5&&angle>=22.5)return'se';if(angle<112.5&&angle>=67.5)return's';if(angle<157.5&&angle>=112.5)return'sw';if(angle>=157.5||angle< -157.5)return'w';if(angle< -112.5)return'nw';if(angle< -67.5)return'n';return'ne'}
function angularDifference(a,b){let difference=a-b;while(difference>180)difference-=360;while(difference< -180)difference+=360;return difference}
function directionSteps(a,b){const first=DIRECTIONS.indexOf(a),second=DIRECTIONS.indexOf(b),distance=Math.abs(first-second);return Math.min(distance,8-distance)}
function updateDirection(x,y,strength,keyboard,now){
  if(strength<.18)return;const next=quantizeDirection(x,y);if(next===state.direction){directionCandidate=null;return}
  if(keyboard||(strength>=.55&&directionSteps(next,state.direction)>=2)){commitDirection(next);return}
  const currentCenter=DIRECTION_CENTER[state.direction],angle=Math.atan2(y,x)*180/Math.PI;if(Math.abs(angularDifference(angle,currentCenter))<30)return;
  if(directionCandidate!==next){directionCandidate=next;directionCandidateSince=now;return}if(now-directionCandidateSince>=60)commitDirection(next)
}
function commitDirection(direction){if(direction===state.direction)return;state.direction=direction;directionCandidate=null;updateChefAsset()}

function inputVector(){
  const right=(state.keys.ArrowRight||state.keys.d?1:0),left=(state.keys.ArrowLeft||state.keys.a?1:0),down=(state.keys.ArrowDown||state.keys.s?1:0),up=(state.keys.ArrowUp||state.keys.w?1:0),keyX=right-left,keyY=down-up,keyboard=keyX!==0||keyY!==0;
  let x=state.joystick.x+keyX,y=state.joystick.y+keyY,length=Math.hypot(x,y);if(length>1){x/=length;y/=length;length=1}return{x,y,length,keyboard}
}
function collides(x,y){const area=$('#kitchen-safe-area').getBoundingClientRect(),rx=16/area.width*100,ry=10/area.height*100;const inside=(left,right,top,bottom)=>x+rx>left&&x-rx<right&&y+ry>top&&y-ry<bottom;return inside(8,92,4,25)||inside(8,24,4,74)||inside(76,92,4,74)}
function moveChef(dt,now){
  const input=inputVector();state.moving=input.length>=.18;updateDirection(input.x,input.y,input.length,input.keyboard,now);if(!state.moving)return;
  const multiplier=state.hotTime>0?1.1:1,speedX=30*multiplier,speedY=43*multiplier,current=state.position,next={x:Math.max(8,Math.min(92,current.x+input.x*speedX*dt)),y:Math.max(26,Math.min(92,current.y+input.y*speedY*dt))};
  if(!collides(next.x,next.y))state.position=next;else if(!collides(next.x,current.y))state.position={x:next.x,y:current.y};else if(!collides(current.x,next.y))state.position={x:current.x,y:next.y}
}
function detectNear(force=false){
  const chef=$('#chef').getBoundingClientRect(),foot={x:chef.left+chef.width/2,y:chef.bottom-chef.height*.08};let best=null,bestDistance=Infinity;
  $$('.station').forEach(station=>{const rect=station.getBoundingClientRect(),nearestX=Math.max(rect.left,Math.min(foot.x,rect.right)),nearestY=Math.max(rect.top,Math.min(foot.y,rect.bottom)),distance=Math.hypot(foot.x-nearestX,foot.y-nearestY);if(distance<bestDistance){bestDistance=distance;best=station.dataset.station}});
  if(bestDistance>Math.max(64,chef.width*.72))best=null;if(force||best===state.near){state.near=best;nearCandidate=null;return}
  const old=state.near?document.querySelector(`[data-station="${state.near}"]`)?.getBoundingClientRect():null;let oldDistance=Infinity;if(old){const x=Math.max(old.left,Math.min(foot.x,old.right)),y=Math.max(old.top,Math.min(foot.y,old.bottom));oldDistance=Math.hypot(foot.x-x,foot.y-y)}
  if(best&&bestDistance+8<oldDistance){state.near=best;nearCandidate=null;return}const now=performance.now();if(nearCandidate!==best){nearCandidate=best;nearCandidateSince=now}else if(now-nearCandidateSince>=80){state.near=best;nearCandidate=null}
}

function currentOrder(){return state.orders[0]}
function requiredStation(){
  const order=currentOrder();if(!order)return null;if(state.held==='burger-complete')return'service';if(state.held==='tomato-raw')return'board';if(state.held==='meat-raw')return'pan';if(['bun','tomato-chopped','meat-cooked'].includes(state.held))return'assembly';
  if(!state.plate.includes('bun'))return'bun';if(order.recipe.includes('meat-cooked')&&!state.plate.includes('meat-cooked')){if(state.stationItems.readyTray==='meat-cooked')return'ready-tray';if(state.stationItems.pan==='meat-cooked'||state.processes.pan)return'pan';return'meat'}if(order.recipe.includes('tomato-chopped')&&!state.plate.includes('tomato-chopped')){if(state.stationItems.board==='tomato-chopped'||state.processes.board)return'board';return'tomato'}return'assembly'
}
function actionLabel(){
  if(state.mode==='PAUSED')return'已暫停';if(!state.near)return'靠近工作站';const station=state.near;if(station==='service')return state.held==='burger-complete'?'送出訂單':'需要完成漢堡';if(['bun','tomato','meat'].includes(station))return state.held==='none'?'拿取食材':'手上已有物品';if(station==='ready-tray')return state.held==='none'&&state.stationItems.readyTray?'拿取熟肉':'現成食材盤';if(station==='board')return state.processes.board?'切菜中':state.stationItems.board==='tomato-chopped'?'拿取番茄':'切番茄';if(station==='pan')return state.processes.pan?'烹調中':state.stationItems.pan==='meat-cooked'?'拿取熟肉':'煎肉排';if(station==='assembly')return state.held==='burger-complete'?'拆解漢堡':state.held!=='none'?'放入材料':'組裝台';return state.held==='burger-complete'?'拆解漢堡':'拆解台'
}
function hintText(){const target=requiredStation();if(target){const names={bun:'麵包備料盒',tomato:'番茄備料盒',meat:'生肉備料盒',board:'砧板',pan:'煎鍋','ready-tray':'現成食材盤',assembly:'組裝台',service:'出餐口'};return state.near===target?`現在按「${actionLabel()}」`:`前往黃色的${names[target]}`}return state.near?`可以按「${actionLabel()}」`:'靠近工作站後，互動鍵會顯示動作'}
function stationItemMarkup(item){const path=item&&(asset(FOOD_PATH[item])||asset(FOOD_PATH.placeholder));return path?`url("${path}")`:''}
function take(item,message){state.held=item;playSound('pickup');vibrate(10);toast(message);updateHeldAsset()}
function reject(message,station=state.near){playSound('error');vibrate([25,30,25]);toast(message);const element=document.querySelector(`[data-station="${station}"]`);element?.classList.add('is-error');schedule(650,()=>element?.classList.remove('is-error'))}
function interact(){
  if(!state.running||state.ended||state.mode==='PAUSED')return;if(state.mode==='FINAL_GRACE'&&state.near!=='service'){reject('最後上菜只能移動與出餐');return}if(!state.near){reject('再靠近工作站一點');return}
  const station=state.near;if(station==='bun'||station==='tomato'||station==='meat'){if(state.held!=='none'){reject('手上已有物品，先送到正確工作站');return}take(station==='bun'?'bun':station==='tomato'?'tomato-raw':'meat-raw',station==='bun'?'拿到麵包':station==='tomato'?'拿到番茄':'拿到生肉排');return}
  if(station==='ready-tray'){if(state.held!=='none'){reject('先放下手上的物品');return}if(!state.stationItems.readyTray){reject('現成食材盤目前是空的');return}const item=state.stationItems.readyTray;state.stationItems.readyTray=null;take(item,'拿到現成熟肉排');return}
  if(station==='board'){processStation('board','tomato-raw','tomato-chopped',700);return}if(station==='pan'){processStation('pan','meat-raw','meat-cooked',1500);return}if(station==='assembly'){useAssembly();return}if(station==='service'){serve();return}if(station==='disassembly'){disassemble();return}
}
function processStation(station,input,output,duration){
  if(state.processes[station]){reject(station==='board'?'番茄仍在切':'肉排仍在烹調',station);return}const stored=state.stationItems[station];if(state.held===input&&!stored){state.held='none';state.stationItems[station]=input;state.processes[station]={input,output,totalMs:duration,remainingMs:duration};updateHeldAsset();playSound(station==='board'?'process-cut':'process-fry');vibrate(10);toast(station==='board'?'開始切番茄':'開始煎肉排');return}if(state.held==='none'&&stored===output){state.stationItems[station]=null;take(output,station==='board'?'拿到切好番茄':'拿到熟肉排');return}reject(station==='board'?'這裡只接受生番茄':'這裡只接受生肉排',station)
}
function completeProcess(station,process){state.stationItems[station]=process.output;delete state.processes[station];if(!state.firstProcessBonus&&currentOrder()?.index===2){state.firstProcessBonus=true;state.score+=25}playSound('process-complete');vibrate(20);toast(station==='board'?'番茄切好了':'肉排煎好了')}
function useAssembly(){
  const order=currentOrder();if(!order)return;if(state.held==='burger-complete'){disassemble();return}if(state.held==='none'){reject('把訂單需要的材料帶到組裝台','assembly');return}if(!order.recipe.includes(state.held)){reject(`這一單不需要${FOOD_NAME[state.held]}`,'assembly');return}if(state.plate.includes(state.held)){reject(`已經放過${FOOD_NAME[state.held]}`,'assembly');return}
  state.plate.push(state.held);state.held='none';updateHeldAsset();playSound('place');vibrate(10);if(order.recipe.every(item=>state.plate.includes(item))&&state.plate.length===order.recipe.length){state.held='burger-complete';state.heldRecipe=[...state.plate];state.plate=[];updateHeldAsset();playSound('complete');toast('漢堡完成，送到出餐口')}else toast('材料已放上組裝台')
}
function disassemble(){if(state.held!=='burger-complete'){reject('完成漢堡才能在這裡拆解','disassembly');return}state.plate=[...state.heldRecipe];state.held='none';state.heldRecipe=[];updateHeldAsset();playSound('place');toast('漢堡已拆回材料，沒有扣分')}
function recipesMatch(a,b){return a.length===b.length&&a.every(item=>b.includes(item))}
function serve(){
  const order=currentOrder();if(state.held!=='burger-complete'){reject('先完成漢堡再出餐','service');return}if(!order||!recipesMatch(order.recipe,state.heldRecipe)){reject('配方不符，漢堡會保留在手上','service');return}
  const tutorial=order.tutorial,speed=tutorial?0:Math.round(order.patience*.5),comboBonus=state.combo===1?25:state.combo>=2?50:0,base=100+speed+comboBonus,points=state.hotTime>0?Math.round(base*1.25):base;
  state.score+=points;state.served++;state.combo++;state.maxCombo=Math.max(state.maxCombo,state.combo);state.fastest=Math.min(state.fastest,order.elapsed);state.held='none';state.heldRecipe=[];updateHeldAsset();state.orders.shift();playSound(state.combo>=2?'combo':'serve');vibrate([20,25,35]);success(points,state.combo);
  if(tutorial){setMode('PLAY_INTRO');state.time=60;state.clockAccumulator=0;toast('試吃單完成，六十秒開始')}if(state.combo>=3)state.hotTime=6;
  if(state.mode==='FINAL_GRACE'){schedule(650,finishGame);return}ensureOrderQueue();activateCurrentOrder();render(true)
}
function canFinalGrace(){return state.held==='burger-complete'||(currentOrder()&&recipesMatch(currentOrder().recipe,state.plate))}
function beginFinalGrace(){setMode('FINAL_GRACE');state.graceTime=5;state.clockAccumulator=0;state.orders.splice(1);toast('最後上菜，還有五秒');playSound('countdown')}
function finishGame(){
  if(state.ended)return;state.ended=true;state.running=false;state.pending=[];setMode('RESULT');stopMusic();stopVibration();const stars=state.score>=600?3:state.score>=350?2:state.score>=100?1:0;saveData.progress.unlockedLevel=Math.max(Number(saveData.progress.unlockedLevel)||1,state.served?2:1);saveData.progress.tutorialCompleted=saveData.progress.tutorialCompleted||state.served>0;saveData.progress.levelStars['1']=Math.max(Number(saveData.progress.levelStars['1'])||0,stars);saveData.progress.bestScore['1']=Math.max(Number(saveData.progress.bestScore['1'])||0,state.score);saveData.progress.bestCombo['1']=Math.max(Number(saveData.progress.bestCombo['1'])||0,state.maxCombo);writeSave();
  $('#result-heading').textContent=state.served?'第一關完成':'再試一次';$('#result-score').textContent=state.score;$('#result-served').textContent=state.served;$('#result-fastest').textContent=Number.isFinite(state.fastest)?`${state.fastest.toFixed(1)} 秒`:'無';$('#result-combo').textContent=state.maxCombo;$$('#result-stars i').forEach((star,index)=>star.classList.toggle('is-earned',index<stars));$('#result-stars').setAttribute('aria-label',`${stars} 星`);$('#result-tip').textContent=state.served?'已通過第一關，再玩一次挑戰更高星級。':'跟著黃色出餐口，先送出手上的漢堡。';showOverlay('#result-screen');playSound('result')
}

function updateGame(dt,now){
  if(!state.running||state.ended||state.mode==='PAUSED')return;
  for(let index=state.pending.length-1;index>=0;index--){const task=state.pending[index];task.remaining-=dt*1000;if(task.remaining<=0){state.pending.splice(index,1);if(task.runId===state.runId)task.callback()}}
  for(const [station,process] of Object.entries(state.processes)){process.remainingMs-=dt*1000;if(process.remainingMs<=0)completeProcess(station,process)}
  if(state.hotTime>0)state.hotTime=Math.max(0,state.hotTime-dt);
  const order=currentOrder();if(order){order.elapsed+=dt;if(state.served>=3&&!order.tutorial&&!order.expired){const before=order.patience;order.patience=Math.max(0,order.patience-dt*2);if(before>0&&order.patience===0){order.expired=true;state.combo=0;toast('訂單會保留，速度加分歸零')}}}
  if(state.mode==='PLAY_INTRO'||state.mode==='PLAY_ACTIVE'){state.clockAccumulator+=dt;while(state.clockAccumulator>=1&&state.time>0){state.clockAccumulator-=1;state.time--;if(state.time===10||state.time<=5){playSound('countdown');if(state.time<=3)vibrate(15)}if(state.time===0){canFinalGrace()?beginFinalGrace():finishGame();break}}if(state.served>=3&&state.mode==='PLAY_INTRO')setMode('PLAY_ACTIVE')}
  else if(state.mode==='FINAL_GRACE'){state.clockAccumulator+=dt;while(state.clockAccumulator>=1&&state.graceTime>0){state.clockAccumulator-=1;state.graceTime--;playSound('countdown');if(state.graceTime<=3)vibrate(15);if(state.graceTime===0){finishGame();break}}}
  moveChef(dt,now);detectNear();render()
}
function frame(now){const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;updateGame(dt,now);requestAnimationFrame(frame)}

function render(forceOrders=false){
  $('#score').textContent=state.score;$('#time').textContent=state.mode==='FINAL_GRACE'?`+${state.graceTime}`:state.time;const chef=$('#chef');chef.style.left=`${state.position.x}%`;chef.style.top=`${state.position.y}%`;chef.classList.toggle('is-moving',state.moving);
  const visible=state.orders.slice(0,state.served>=3?2:1),orderKey=visible.map(order=>`${order.id}:${Math.round(order.patience)}`).join('|');if(forceOrders||orderKey!==state.lastRenderOrderKey){state.lastRenderOrderKey=orderKey;$('#orders').innerHTML=visible.map((order,index)=>`<article class="order-card ${index?'waiting':''} ${order.expired?'zero':''}"><div class="order-title">${index?'下一單':order.tutorial?'試吃單':'目前訂單'}</div><div class="order-items">${foodMarkup('burger-complete')}${order.recipe.map(foodMarkup).join('')}</div><div class="patience"><i style="width:${order.patience}%"></i></div></article>`).join('')}
  const target=requiredStation();$$('.station').forEach(station=>{const name=station.dataset.station,itemKey=name==='ready-tray'?'readyTray':name,stationItem=state.stationItems[itemKey];station.classList.toggle('is-near',name===state.near);station.classList.toggle('is-guide',name===target);station.classList.toggle('is-processing',!!state.processes[name]);station.classList.toggle('is-ready',Boolean(stationItem?.includes?.('chopped')||stationItem?.includes?.('cooked')));const process=state.processes[name],bar=station.querySelector('.progress>i');if(bar&&process)bar.style.width=`${Math.max(0,Math.min(100,(1-process.remainingMs/process.totalMs)*100))}%`;const item=station.querySelector('.station-item');if(item)item.style.backgroundImage=stationItemMarkup(stationItem)});
  $('#hint').textContent=hintText();$('#primary-action span').textContent=actionLabel();$('#secondary-action span').textContent=state.held==='burger-complete'?'拆解':'保留';updateGuideArrow(target)
}
function updateGuideArrow(target){const arrow=$('#guide-arrow'),station=target&&document.querySelector(`[data-station="${target}"]`);if(!station||state.near===target){arrow.classList.remove('is-visible');return}const area=$('#kitchen-safe-area').getBoundingClientRect(),rect=station.getBoundingClientRect();arrow.style.left=`${rect.left+rect.width/2-area.left-arrow.offsetWidth/2}px`;arrow.style.top=`${Math.max(4,rect.top-area.top-arrow.offsetHeight*.7)}px`;arrow.classList.add('is-visible')}
function toast(message){const element=$('#toast');element.textContent=message;element.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove('is-visible'),1400)}
function success(points,combo){const element=$('#success-feedback');element.querySelector('span').textContent=`增加 ${points} 分${combo>1?`，${combo} 連擊`:''}`;element.classList.remove('is-visible');void element.offsetWidth;element.classList.add('is-visible');schedule(1100,()=>element.classList.remove('is-visible'))}

function primeAudio(){if(audioContext)return audioContext;const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return null;try{audioContext=new Context();audioContext.resume().then(startMusic).catch(()=>{});return audioContext}catch{return null}}
function playSound(event){if(settings.muted||state.mode==='PAUSED'||!audioContext||audioContext.state!=='running')return;const definition=audioDefinitions[event];if(!definition)return;for(const voice of definition.voices||[]){const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),start=audioContext.currentTime+(voice.delay||0),duration=Math.max(.03,voice.duration||.1);oscillator.type=voice.type||'sine';oscillator.frequency.setValueAtTime(voice.frequency||440,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,(voice.gain||.04)*settings.sfxVolume),start+.01);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);oscillator.connect(gain).connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+duration+.02)}}
function startMusic(){if(!audioContext||musicNodes||settings.muted||settings.musicVolume<=0||state.mode==='TITLE'||state.mode==='RESULT')return;const master=audioContext.createGain();master.gain.value=.018*settings.musicVolume;master.connect(audioContext.destination);const first=audioContext.createOscillator(),second=audioContext.createOscillator();first.type='sine';first.frequency.value=146.83;second.type='triangle';second.frequency.value=220;first.connect(master);second.connect(master);first.start();second.start();musicNodes={master,first,second}}
function stopMusic(){if(!musicNodes)return;try{musicNodes.first.stop();musicNodes.second.stop()}catch{}musicNodes=null}
function refreshMusic(){stopMusic();if(!settings.muted&&state.running&&state.mode!=='PAUSED')startMusic()}
function vibrate(pattern){const now=performance.now();if(!settings.vibration||document.documentElement.classList.contains('reduce-motion')||!navigator.vibrate||state.mode==='PAUSED'||now-lastVibration<120)return;lastVibration=now;navigator.vibrate(pattern)}
function stopVibration(){navigator.vibrate?.(0)}
function applyMotionSetting(){const reduced=settings.reduceMotion==='on'||(settings.reduceMotion==='system'&&matchMedia('(prefers-reduced-motion: reduce)').matches);document.documentElement.classList.toggle('reduce-motion',reduced)}
function renderSettings(){
  const set=(id,on,onKey,offKey)=>{const button=$(id),img=button?.querySelector('img');if(!button)return;button.setAttribute('aria-pressed',String(on));if(img){img.dataset.ui=on?onKey:offKey;setImage(img,UI_PATH[img.dataset.ui])}};
  set('#music-toggle',settings.musicVolume>0&&!settings.muted,'music-on','music-off');set('#sound-toggle',!settings.muted,'sound-on','sound-off');set('#vibration-toggle',settings.vibration,'vibration-on','vibration-off');set('#motion-toggle',!document.documentElement.classList.contains('reduce-motion'),'motion-on','motion-reduced');if(!navigator.vibrate)$('#vibration-toggle').hidden=true
}
function toggleMusic(){settings.musicVolume=settings.musicVolume>0?0:.7;writeSave();refreshMusic();renderSettings()}
function toggleSound(){settings.muted=!settings.muted;writeSave();if(settings.muted){stopMusic();audioContext?.suspend()}else primeAudio()?.resume().then(()=>{startMusic();playSound('pickup')}).catch(()=>{});renderSettings()}
function toggleVibration(){settings.vibration=!settings.vibration;writeSave();renderSettings();if(settings.vibration)vibrate(20)}
function toggleMotion(){settings.reduceMotion=document.documentElement.classList.contains('reduce-motion')?'off':'on';writeSave();applyMotionSetting();renderSettings()}

function joystickMove(event){const rect=$('#joystick').getBoundingClientRect(),centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2,dx=event.clientX-centerX,dy=event.clientY-centerY,max=rect.width*.31,length=Math.hypot(dx,dy)||1,scale=Math.min(1,max/length);state.joystick={x:dx/max*scale,y:dy/max*scale};$('#stick').style.transform=`translate(${dx*scale}px,${dy*scale}px)`}
function resetStick(){state.joystick={x:0,y:0};$('#stick').style.transform=''}
function bindEvents(){
  $('#start-button').addEventListener('click',startGame);$('#retry-button').addEventListener('click',()=>{hideOverlay('#result-screen');primeAudio()?.resume().then(startMusic).catch(()=>{});resetRun()});$('#next-button').addEventListener('click',()=>toast('第二天正在準備中'));
  $('#pause-button').addEventListener('click',()=>pauseGame('manual'));$('#resume-button').addEventListener('click',resumeGame);$('#music-toggle').addEventListener('click',toggleMusic);$('#sound-toggle').addEventListener('click',toggleSound);$('#vibration-toggle').addEventListener('click',toggleVibration);$('#motion-toggle').addEventListener('click',toggleMotion);
  const primary=$('#primary-action');primary.addEventListener('pointerdown',event=>{event.preventDefault();primeAudio()?.resume().then(startMusic).catch(()=>{});primary.classList.add('is-pressed');interact()});['pointerup','pointercancel','pointerleave'].forEach(type=>primary.addEventListener(type,()=>primary.classList.remove('is-pressed')));$('#secondary-action').addEventListener('click',disassemble);
  const joystick=$('#joystick');joystick.addEventListener('pointerdown',event=>{primeAudio()?.resume().then(startMusic).catch(()=>{});joystickPointer=event.pointerId;joystick.setPointerCapture(event.pointerId);joystickMove(event)});joystick.addEventListener('pointermove',event=>{if(event.pointerId===joystickPointer)joystickMove(event)});const endJoystick=event=>{if(event.pointerId!==joystickPointer)return;joystickPointer=null;resetStick()};joystick.addEventListener('pointerup',endJoystick);joystick.addEventListener('pointercancel',endJoystick);
  addEventListener('keydown',event=>{primeAudio()?.resume().then(startMusic).catch(()=>{});if((event.key==='Escape'||event.key==='p')&&state.running){event.preventDefault();state.mode==='PAUSED'?resumeGame():pauseGame('manual');return}state.keys[event.key]=true;if(event.key===' '||event.key==='Enter'){event.preventDefault();interact()}});addEventListener('keyup',event=>{state.keys[event.key]=false});
  const backgroundPause=()=>pauseGame('background');document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause()});addEventListener('pagehide',backgroundPause);addEventListener('blur',backgroundPause);addEventListener('resize',()=>{detectNear(true);render(true)});
}
async function boot(){setMode('BOOT');applyMotionSetting();bindEvents();await loadManifests();applyAssets();renderSettings();setMode('TITLE');render(true);requestAnimationFrame(frame)}
boot();

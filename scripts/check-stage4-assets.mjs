import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=path.resolve(import.meta.dirname,'..');
const artRoot=path.join(root,'assets','art','stage4');
const manifestPath=path.join(artRoot,'manifest.json');
const expected=new Map();
const add=(relative,viewBox)=>expected.set(relative,viewBox);

for(const direction of ['n','ne','e','se','s','sw','w','nw'])add(`chef/chef-shiba-${direction}.svg`,'0 0 160 180');
add('kitchen/kitchen-u-counter-base.svg','0 0 1200 620');
for(const [name,size] of Object.entries({'station-prep-bin.svg':'0 0 120 96','station-cutting-inset.svg':'0 0 160 104','station-pan-inset.svg':'0 0 160 104','station-ready-tray.svg':'0 0 140 96','station-assembly-inset.svg':'0 0 150 104','station-service-inset.svg':'0 0 150 104','station-disassembly-inset.svg':'0 0 120 96','station-focus-ring.svg':'0 0 180 120','station-progress-track.svg':'0 0 160 24'}))add(`kitchen/${name}`,size);
for(const name of ['food-bun.svg','food-tomato-raw.svg','food-tomato-chopped.svg','food-meat-raw.svg','food-meat-cooked.svg','food-burger-complete.svg','food-placeholder.svg'])add(`food/${name}`,'0 0 96 96');
for(const name of ['ui-hud-star.svg','ui-hud-clock.svg','ui-pause.svg','ui-music-on.svg','ui-music-off.svg','ui-sound-on.svg','ui-sound-off.svg','ui-vibration-on.svg','ui-vibration-off.svg','ui-motion-on.svg','ui-motion-reduced.svg','ui-interact.svg','ui-discard.svg','ui-direction-arrow.svg','ui-state-ready.svg','ui-state-error.svg','ui-screen-rotate.svg','ui-retry.svg','ui-next.svg','ui-back.svg'])add(`ui/${name}`,'0 0 64 64');
add('ui/ui-order-current.svg','0 0 240 112');add('ui/ui-order-waiting.svg','0 0 240 112');add('ui/ui-order-zero.svg','0 0 240 112');add('ui/ui-result-medal.svg','0 0 160 160');
for(const kind of ['primary','secondary'])for(const state of ['idle','focus','pressed','disabled'])add(`ui/ui-button-${kind}-${state}.svg`,'0 0 240 80');

const errors=[];
if(!fs.existsSync(manifestPath))errors.push('missing assets/art/stage4/manifest.json');
let entries=[];
if(!errors.length){
  try{const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));entries=manifest.assets||manifest.entries||[];if(!Array.isArray(entries))throw new Error('assets or entries must be an array')}catch(error){errors.push(`invalid manifest: ${error.message}`)}
}
const normalize=value=>String(value||'').replaceAll('\\','/').replace(/^\.\//,'').replace(/^assets\/art\/stage4\//,'');
const pathCount=new Map(),ids=new Set();
for(const entry of entries){const relative=normalize(entry.path);pathCount.set(relative,(pathCount.get(relative)||0)+1);if(!entry.id)errors.push(`manifest entry missing id: ${relative||'<empty path>'}`);else if(ids.has(entry.id))errors.push(`duplicate manifest id: ${entry.id}`);else ids.add(entry.id)}

for(const [relative,requiredViewBox] of expected){
  const file=path.join(artRoot,...relative.split('/')),count=pathCount.get(relative)||0;if(count!==1)errors.push(`${relative}: manifest count ${count}, expected 1`);if(!fs.existsSync(file)){errors.push(`${relative}: missing file`);continue}if(fs.statSync(file).size===0){errors.push(`${relative}: empty file`);continue}
  const source=fs.readFileSync(file,'utf8'),rootMatch=source.match(/<svg\b[^>]*>/i),viewBox=rootMatch?.[0].match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();if(viewBox!==requiredViewBox)errors.push(`${relative}: viewBox "${viewBox||'missing'}", expected "${requiredViewBox}"`);
  if(/<\s*(text|image|foreignObject)\b/i.test(source))errors.push(`${relative}: forbidden text, image, or foreignObject node`);if(/(?:href|xlink:href|src)\s*=\s*["']\s*(?:https?:|data:|javascript:)/i.test(source))errors.push(`${relative}: external or embedded resource reference`);if(/\son[a-z]+\s*=/i.test(source))errors.push(`${relative}: event handler attribute`)
}
for(const relative of pathCount.keys())if(!expected.has(relative)&&relative.endsWith('.svg')&&!relative.startsWith('previews/'))errors.push(`${relative}: unexpected formal SVG`);

const chefFiles=[...pathCount.keys()].filter(relative=>/^chef\/chef-shiba-[a-z]+\.svg$/.test(relative));const chefDirections=chefFiles.map(relative=>relative.match(/chef-shiba-([a-z]+)\.svg$/)[1]).sort();const requiredDirections=['e','n','ne','nw','s','se','sw','w'];if(JSON.stringify(chefDirections)!==JSON.stringify(requiredDirections))errors.push(`chef direction set ${chefDirections.join(',')}, expected ${requiredDirections.join(',')}`);
const buttonStates=[...pathCount.keys()].filter(relative=>/^ui\/ui-button-(primary|secondary)-(idle|focus|pressed|disabled)\.svg$/.test(relative));if(buttonStates.length!==8)errors.push(`UI button state count ${buttonStates.length}, expected 8`);

for(const file of ['index.html','assets/game/stage4.js']){
  const sourcePath=path.join(root,...file.split('/'));if(!fs.existsSync(sourcePath)){errors.push(`${file}: missing`);continue}const source=fs.readFileSync(sourcePath,'utf8');if(/chef-rig\.svg/.test(source))errors.push(`${file}: forbidden human chef reference`);for(const match of source.matchAll(/["'`]((?:chef|kitchen|food|ui)\/[a-z0-9-]+\.svg)["'`]/g))if(!pathCount.has(match[1]))errors.push(`${file}: image reference absent from manifest: ${match[1]}`)
}
const jsSource=fs.existsSync(path.join(root,'assets','game','stage4.js'))?fs.readFileSync(path.join(root,'assets','game','stage4.js'),'utf8'):'';const baseReferences=[...jsSource.matchAll(/kitchen-u-counter-base\.svg/g)].length;if(baseReferences!==1)errors.push(`kitchen base formal reference count ${baseReferences}, expected 1`);

if(errors.length){console.error(errors.map(error=>`FAIL ${error}`).join('\n'));process.exitCode=1}else{console.log(`assets ${expected.size}`);console.log(`chef directions ${chefDirections.length}`);console.log(`UI button states ${buttonStates.length}`);console.log('PASS stage4 assets complete')}

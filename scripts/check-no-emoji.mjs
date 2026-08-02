import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=path.resolve(import.meta.dirname,'..');
const forbidden=/[\p{Extended_Pictographic}\uFE0F\u20E3]/gu;
const targets=[path.join(root,'index.html'),path.join(root,'assets','game'),path.join(root,'assets','art','stage4')];
const extensions=new Set(['.html','.css','.js','.json','.svg']);

function collect(target,files=[]){
  if(!fs.existsSync(target))return files;
  const stat=fs.statSync(target);
  if(stat.isFile()){if(extensions.has(path.extname(target).toLowerCase()))files.push(target);return files}
  for(const entry of fs.readdirSync(target,{withFileTypes:true})){
    if(entry.name==='previews')continue;
    collect(path.join(target,entry.name),files);
  }
  return files;
}

const hits=[];
for(const file of targets.flatMap(target=>collect(target))){
  const text=fs.readFileSync(file,'utf8'),lines=text.split(/\r?\n/);
  lines.forEach((line,index)=>{
    forbidden.lastIndex=0;
    for(const match of line.matchAll(forbidden)){
      const codePoints=[...match[0]].map(character=>`U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}`).join(',');
      hits.push(`${path.relative(root,file).replaceAll('\\','/')}:${index+1}:${match.index+1} ${codePoints}`);
    }
  });
}

if(hits.length){
  console.error(hits.join('\n'));
  console.error(`FAIL ${hits.length} visible emoji candidate(s)`);
  process.exitCode=1;
}else console.log('PASS no visible emoji candidates');

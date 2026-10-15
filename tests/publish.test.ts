import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {publishReport,deployment,type PublishState} from '../server/publish.ts';
import {parseReport} from '../src/report.ts';
import {seed} from '../src/data.ts';
const report=()=>({schema_version:1,prepared_at:null,tasks:seed,events:[]});
test('Publication commits only report.json, pushes then waits for deployment',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'cali-publish-'));await mkdir(join(dir,'public'));
 const calls:string[][]=[],states:PublishState[]=[];
 const run=async(_cwd:string,args:string[])=>{calls.push(args);if(args[0]==='branch')return 'main';if(args[0]==='remote')return 'https://github.com/DanVela27/cali755.git';if(args[0]==='rev-parse')return 'commit-test';return '';};
 try{
  await publishReport(dir,report(),s=>states.push(s),run,async(commit,update,expected)=>{assert.equal(commit,'commit-test');assert.ok(calls.some(c=>c[0]==='push'));assert.ok(expected.prepared_at);update({phase:'success',message:'Publicado'});});
  const commit=calls.find(c=>c.includes('commit'))!;assert.ok(commit.includes('--only'));assert.equal(commit.at(-1),'public/report.json');
  assert.equal(states.at(-1)?.phase,'success');assert.equal(JSON.parse(await readFile(join(dir,'public/report.json'),'utf8')).tasks.length,28);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Push failure is never reported as published',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'cali-publish-'));await mkdir(join(dir,'public'));const states:PublishState[]=[];let deployed=false;
 const run=async(_cwd:string,args:string[])=>{if(args[0]==='branch')return 'main';if(args[0]==='remote')return 'https://github.com/DanVela27/cali755.git';if(args[0]==='push')throw Error('Sin acceso');return '';};
 try{await assert.rejects(publishReport(dir,report(),s=>states.push(s),run,async()=>{deployed=true;}));assert.equal(deployed,false);assert.ok(!states.some(s=>s.phase==='success'));}finally{await rm(dir,{recursive:true,force:true});}
});
test('Unpublished code changes prevent sending unintended commits',async()=>{
 let pushed=false;const run=async(_cwd:string,args:string[])=>{if(args[0]==='branch')return 'main';if(args[0]==='remote')return 'https://github.com/DanVela27/cali755.git';if(args[0]==='diff')return 'src/main.tsx';if(args[0]==='push')pushed=true;return '';};
 await assert.rejects(publishReport('.',report(),()=>{},run),/cambios de código/);assert.equal(pushed,false);
});
test('Success requires successful Pages workflow and matching public report',async()=>{
 const original=globalThis.fetch,expected=parseReport(report()),states:PublishState[]=[];let requests=0;
 globalThis.fetch=async()=>{requests++;return new Response(JSON.stringify(requests===1?{workflow_runs:[{path:'.github/workflows/pages.yml',status:'completed',conclusion:'success',html_url:'https://github.com/example/run'}]}:expected),{status:200});};
 try{await deployment('sha',s=>states.push(s),expected);assert.equal(requests,2);assert.equal(states.at(-1)?.phase,'success');}finally{globalThis.fetch=original;}
});
test('Failed Pages workflow is not marked successful',async()=>{
 const original=globalThis.fetch,states:PublishState[]=[];
 globalThis.fetch=async()=>new Response(JSON.stringify({workflow_runs:[{path:'.github/workflows/pages.yml',status:'completed',conclusion:'failure',html_url:'https://github.com/example/run'}]}),{status:200});
 try{await assert.rejects(deployment('sha',s=>states.push(s),parseReport(report())),/no lo publicó/);assert.ok(!states.some(s=>s.phase==='success'));}finally{globalThis.fetch=original;}
});

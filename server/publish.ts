import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parseReport, type Report } from '../src/report.ts';
const exec=promisify(execFile);
const bundled=join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe');
const executable=process.env.CALI_GIT_PATH || (existsSync(bundled)?bundled:'git');
export const siteUrl='https://danvela27.github.io/cali755/';
export type PublishState={phase:'idle'|'saving'|'uploading'|'deploying'|'success'|'error';message:string;commit?:string;runUrl?:string;report?:Report};
export async function git(cwd:string,args:string[]){try{return (await exec(executable,args,{cwd,timeout:90000,maxBuffer:1024*1024,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'}})).stdout.trim();}catch{throw Error('No se pudo ejecutar Git. Verifica la conexión y el acceso a GitHub. Si falta iniciar sesión, ejecuta conectar-github.ps1 una vez.');}}
export async function publishReport(cwd:string,input:unknown,update:(state:PublishState)=>void,run=git,waitForDeployment=deployment){
 const report=parseReport(input);
 const branch=await run(cwd,['branch','--show-current']);
 const remote=await run(cwd,['remote','get-url','origin']);
 if(branch!=='main'||!/^https:\/\/github\.com\/DanVela27\/cali755(?:\.git)?\/?$/i.test(remote))throw Error('El editor debe ejecutarse en la rama main del repositorio DanVela27/cali755.');
 update({phase:'saving',message:'Comprobando la versión de GitHub…'});
 await run(cwd,['fetch','origin','main']);
 const unpublished=await run(cwd,['diff','--name-only','origin/main..HEAD']);
 if(unpublished.split('\n').some(p=>p&&p!=='public/report.json'))throw Error('Hay cambios de código locales sin publicar. Sincroniza el repositorio antes de publicar avances.');
 await run(cwd,['merge','--ff-only','origin/main']);
 report.prepared_at=new Date().toISOString();
 const file=join(cwd,'public/report.json'),temp=join(cwd,'public/report.tmp');
 await writeFile(temp,JSON.stringify(report,null,2)+'\n');await rename(temp,file);
 await run(cwd,['-c','user.name=Responsable CALI 755','-c','user.email=cali755@users.noreply.github.com','commit','--only','-m','Actualiza avances CALI 755', '--','public/report.json']);
 const commit=await run(cwd,['rev-parse','HEAD']);
 update({phase:'uploading',message:'Subiendo el corte a GitHub…',commit,report});
 await run(cwd,['push','origin','HEAD:refs/heads/main']);
 update({phase:'deploying',message:'Corte subido. Esperando la publicación de GitHub Pages…',commit,report});
 await waitForDeployment(commit,s=>update({...s,commit,report}),report);
 return report;
}
export async function deployment(commit:string,update:(state:PublishState)=>void,expected:Report){
 for(let i=0;i<100;i++){
  const response=await fetch(`https://api.github.com/repos/DanVela27/cali755/actions/runs?head_sha=${commit}&per_page=10`,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('El corte está subido, pero no se pudo consultar el despliegue. Revisa GitHub Actions.');
  const data=await response.json() as {workflow_runs:{path:string;status:string;conclusion:string;html_url:string}[]};
  const run=data.workflow_runs.find(r=>r.path==='.github/workflows/pages.yml');
  if(run?.status==='completed'){
   if(run.conclusion!=='success')throw Error('El corte está en GitHub, pero Pages no lo publicó correctamente. Revisa GitHub Actions.');
   // Verify the live data, not only a successful workflow.
   const live=await fetch(`${siteUrl}report.json?commit=${commit}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});
   if(!live.ok)throw Error('Pages terminó, pero no se pudo comprobar el corte público.');
   const actual=parseReport(await live.json());if(JSON.stringify(actual)!==JSON.stringify(expected)){await new Promise(r=>setTimeout(r,6000));continue;}
   update({phase:'success',message:'Avances publicados correctamente.',runUrl:run.html_url});return;
  }
  update({phase:'deploying',message:'Corte subido. GitHub Pages está publicando…',runUrl:run?.html_url});
  await new Promise(r=>setTimeout(r,6000));
 }
 throw Error('El corte está subido. GitHub Pages sigue pendiente; revisa Actions antes de volver a publicar.');
}

import { defineConfig } from 'vite';
import { writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { parseReport } from './src/report';
import { publishReport, type PublishState } from './server/publish';
export default defineConfig({base:'./',server:{port:5173,strictPort:true,watch:{ignored:['**/public/report.json','**/public/report.tmp']}},plugins:[{
 name:'cali-local-publication',
 configureServer(server){
  let state:PublishState={phase:'idle',message:''};
  server.middlewares.use('/__cali',async(req,res,next)=>{
   const route=req.url?.split('?')[0];if(!['/prepare','/publish','/status'].includes(route??''))return next();
   const origin=req.headers.origin,host=req.headers.host;
   const allowed=['http://127.0.0.1:5173','http://localhost:5173'];
   if(!['127.0.0.1:5173','localhost:5173'].includes(host??'')||(origin&&!allowed.includes(origin))||(!origin&&req.headers['sec-fetch-site']!=='same-origin')){res.statusCode=403;res.end('Origen no permitido.');return;}
   res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
   if(route==='/status'&&req.method==='GET'){res.end(JSON.stringify(state));return;}
   if(req.method!=='POST'||!origin||req.headers['content-type']!=='application/json'){res.statusCode=403;res.end(JSON.stringify({message:'Solicitud no permitida.'}));return;}
   if(['saving','uploading','deploying'].includes(state.phase)){res.statusCode=409;res.end(JSON.stringify({message:'Ya hay una publicación en curso.'}));return;}
   try{
    let body='';for await(const chunk of req){body+=chunk.toString();if(Buffer.byteLength(body)>20_000_000)throw Error('Archivo demasiado grande.');}
    const report=parseReport(JSON.parse(body));
    if(route==='/publish'){
     state={phase:'saving',message:'Iniciando publicación…'};
     res.statusCode=202;res.end(JSON.stringify(state));
     void publishReport(server.config.root,report,s=>{state=s;}).catch(error=>{state={...state,phase:'error',message:error instanceof Error?error.message:'No se pudo publicar.'};});
    }else{
     report.prepared_at=new Date().toISOString();const file=join(server.config.root,'public/report.json'),temp=join(server.config.root,'public/report.tmp');
     await writeFile(temp,JSON.stringify(report,null,2)+'\n');await rename(temp,file);res.end(JSON.stringify(report));
    }
   }catch(error){res.statusCode=400;res.end(JSON.stringify({message:error instanceof Error?error.message:'No se pudo publicar.'}));}
  });
 }
}]} );

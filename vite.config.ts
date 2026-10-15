import { defineConfig } from 'vite';
import { writeFile, rename } from 'node:fs/promises';
import { parseReport } from './src/report';
export default defineConfig({ base:'./',server:{port:5173,strictPort:true}, plugins:[{
 name:'cali-local-publication',
 configureServer(server){server.middlewares.use('/__cali/prepare',async(req,res,next)=>{
  if(req.method!=='POST')return next();
  const origin=req.headers.origin;
  if(!origin || !['http://127.0.0.1:5173','http://localhost:5173'].includes(origin)||req.headers['content-type']!=='application/json') {res.statusCode=403;res.end('Origen no permitido.');return;}
  try {
   let body='';for await(const chunk of req){body+=chunk.toString();if(Buffer.byteLength(body)>20_000_000)throw Error('Archivo demasiado grande.');}
   const report=parseReport(JSON.parse(body));report.prepared_at=new Date().toISOString();
   const path=new URL('./public/report.json',import.meta.url),temporary=new URL('./public/report.tmp',import.meta.url);
   await writeFile(temporary,JSON.stringify(report,null,2)+'\n','utf8');await rename(temporary,path);
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify(report));
  }catch(e){res.statusCode=400;res.end(e instanceof Error?e.message:'No se pudo preparar el corte.');}
 });}
}]});

import { parseReport, type Report } from './report';
export const editable = import.meta.env.DEV && ['localhost','127.0.0.1','[::1]'].includes(location.hostname) && new URLSearchParams(location.search).get('vista')!=='consulta';
const key='cali755-editor-v1';
export async function publishedRead(): Promise<Report> {
 const response=await fetch(`${import.meta.env.BASE_URL}report.json`,{cache:'no-store'});
 if(!response.ok)throw Error('No se pudo cargar el corte publicado. Intenta actualizar la página.');
 return parseReport(await response.json());
}
export function localRead(fallback:Report): Report {
 const raw=localStorage.getItem(key)??localStorage.getItem('cali755-demo-v1');
 return raw?parseReport(JSON.parse(raw),true):fallback;
}
export function localWrite(report:Report) {localStorage.setItem(key,JSON.stringify(report));}
export function downloadReport(report:Report,name='cali755-respaldo.json') {
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),a=document.createElement('a');
 const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

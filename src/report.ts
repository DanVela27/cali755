import { contractors, type Task, type Event } from './data.ts';
export type Report = { schema_version: 1; prepared_at: string | null; tasks: Task[]; events: Event[] };
const furniture = ['M-01','M-02','M-03','M-04','M-05','Sin mueble'];
function object(value: unknown): Record<string,unknown> {
 if(!value || typeof value!=='object' || Array.isArray(value)) throw Error('Archivo de datos inválido.');
 return value as Record<string,unknown>;
}
function task(value: unknown): Task {
 const t=object(value);
 for(const [key,max] of [['id',100],['code',40],['title',300],['contractor',100],['furniture',40],['notes',4000]] as const){
  if(typeof t[key]!=='string'||(t[key] as string).length>max||(key!=='notes'&&!(t[key] as string).trim())) throw Error(`Actividad inválida: ${key}.`);
 }
 if(!contractors.includes(t.contractor as string)||!furniture.includes(t.furniture as string)||!['done','pending'].includes(t.status as string)||typeof t.historical!=='boolean'||!Number.isSafeInteger(t.version)||(t.version as number)<1) throw Error('Actividad con estado, frente o versión inválidos.');
 return {id:t.id as string,code:t.code as string,title:t.title as string,contractor:t.contractor as string,furniture:t.furniture as string,notes:t.notes as string,status:t.status as Task['status'],historical:t.historical as boolean,version:t.version as number};
}
function validDate(value:unknown): value is string {return typeof value==='string' && Number.isFinite(Date.parse(value));}
export function parseReport(value: unknown, legacy=false): Report {
 const r=object(value);
 if(r.schema_version!==1 && !(legacy&&r.schema_version===undefined)) throw Error('Versión de archivo no compatible.');
 if(!Array.isArray(r.tasks)||!r.tasks.length||r.tasks.length>20000||!Array.isArray(r.events)||r.events.length>100000) throw Error('Lista de actividades o historial inválida.');
 const tasks=r.tasks.map(task);
 if(new Set(tasks.map(t=>t.id)).size!==tasks.length||new Set(tasks.map(t=>t.code)).size!==tasks.length) throw Error('Hay códigos o identificadores duplicados.');
 const ids=new Set(tasks.map(t=>t.id));
 const events=r.events.map(value=>{const e=object(value);if(typeof e.id!=='string'||typeof e.task_id!=='string'||!ids.has(e.task_id)||!validDate(e.created_at)||typeof e.actor!=='string'||e.actor.length>200)throw Error('Evento de historial inválido.');const after=task(e.after_data),before=e.before_data===null?null:task(e.before_data);if(after.id!==e.task_id||(before&&before.id!==e.task_id))throw Error('Evento sin correspondencia con la actividad.');return {id:e.id,task_id:e.task_id,created_at:e.created_at,actor:e.actor,before_data:before,after_data:after} as Event;});
 if(new Set(events.map(e=>e.id)).size!==events.length)throw Error('Eventos duplicados.');
 const prepared_at=r.prepared_at??null;if(prepared_at!==null&&!validDate(prepared_at))throw Error('Fecha de corte inválida.');
 return {schema_version:1,prepared_at:prepared_at as string|null,tasks,events};
}

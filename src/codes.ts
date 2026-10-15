import type { Task, Event } from './data.ts';
export type Reservation = {code:string;task_id:string};
export const prefixes:Record<string,string> = {'Gabriel · Carpintería':'CA','Josué · General':'GE','Electricista':'EL','Pendientes generales':'PG','Limpieza':'LI','Herrero':'HE'};
export function normalizeCode(code:string){return code.trim().toUpperCase();}
export function reserveCodes(tasks:Task[],events:Event[],previous:Reservation[]=[]):Reservation[]{
 const owners=new Map<string,string>();
 const reserve=(code:string,id:string)=>{const key=normalizeCode(code);if(!key||!id)throw Error('Reserva de código inválida.');const owner=owners.get(key);if(owner&&owner!==id)throw Error(`El código ${key} ya está reservado para otra actividad.`);owners.set(key,id);};
 for(const r of previous){if(typeof r?.code!=='string'||typeof r?.task_id!=='string'||r.code.length>40||r.task_id.length>100)throw Error('Reserva de código inválida.');reserve(r.code,r.task_id);}
 for(const t of tasks)reserve(t.code,t.id);
 for(const e of events){if(e.before_data)reserve(e.before_data.code,e.before_data.id);reserve(e.after_data.code,e.after_data.id);}
 return [...owners].map(([code,task_id])=>({code,task_id}));
}
export function nextCode(contractor:string,reservations:Reservation[]):string{
 const prefix=prefixes[contractor];if(!prefix)throw Error('Frente sin prefijo de actividad.');
 let max=0;for(const r of reservations){const match=normalizeCode(r.code).match(new RegExp(`^${prefix}(\\d+)(?:\\.\\d+)*$`));if(match){const n=Number(match[1]);if(!Number.isSafeInteger(n))throw Error('Numeración fuera de rango.');max=Math.max(max,n);}}
 if(!Number.isSafeInteger(max+1))throw Error('Numeración fuera de rango.');
 return `${prefix}${max+1}`;
}

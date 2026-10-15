import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed,contractors} from '../src/data.ts';
import {nextCode,reserveCodes,normalizeCode} from '../src/codes.ts';
import {parseReport} from '../src/report.ts';
test('Automatic codes preserve existing subcodes and historical CA2',()=>{
 const reservations=reserveCodes(seed,[]);assert.equal(nextCode(contractors[0],reservations),'CA19');assert.equal(nextCode('Herrero',reservations),'HE1');
 for(const [front,prefix] of [['Josué · General','GE'],['Electricista','EL'],['Pendientes generales','PG'],['Limpieza','LI']])assert.equal(nextCode(front,reservations),prefix+'1');
 assert.equal(nextCode('Herrero',[{code:'he7.2',task_id:'a'}]),'HE8');assert.equal(normalizeCode(' ca17 '),'CA17');
});
test('Backups reject normalized duplicates and historical code reuse',()=>{
 const base={schema_version:1,prepared_at:null,tasks:seed,events:[]};
 assert.throws(()=>parseReport({...base,tasks:[...seed,{...seed[0],id:'other',code:' ca2 '}]}));
 assert.throws(()=>parseReport({...base,reserved_codes:[{code:'ca17',task_id:'other'}]}));
 const tasks=seed.map(t=>({...t,code:` ${t.code.toLowerCase()} `}));assert.equal(parseReport({...base,tasks}).tasks[0].code,'CA1.1');
});
test('Reservations survive restoring an older snapshot',()=>{
 const old=parseReport({schema_version:1,prepared_at:null,tasks:seed,events:[]});
 const reservations=reserveCodes(old.tasks,old.events,[...(old.reserved_codes??[]),{code:'HE1',task_id:'new-task'}]);
 const restored=parseReport({...old,reserved_codes:reservations});assert.equal(nextCode('Herrero',restored.reserved_codes!),'HE2');
 assert.throws(()=>reserveCodes([{...seed[0],id:'another',code:'HE1'}],[],reservations));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../src/data.ts';
import { parseReport } from '../src/report.ts';
const report=()=>({schema_version:1,prepared_at:null,tasks:structuredClone(seed),events:[]});
test('Published report and legacy backups preserve baseline and CA2',()=>{
 assert.equal(parseReport(report()).tasks.length,28);
 const legacy={tasks:seed,events:[]};assert.equal(parseReport(legacy,true).prepared_at,null);
 assert.throws(()=>parseReport(legacy));
});
test('Reject damaged files before replacing local drafts or publication',()=>{
 const duplicate=report();duplicate.tasks.push(seed[0]);assert.throws(()=>parseReport(duplicate));
 const invalid=report();invalid.tasks[0].status='unknown' as never;assert.throws(()=>parseReport(invalid));
 assert.throws(()=>parseReport({...report(),schema_version:99}));
 assert.throws(()=>parseReport({...report(),prepared_at:'yesterday'}));
 assert.throws(()=>parseReport({...report(),events:[{id:'1',task_id:'missing',created_at:new Date().toISOString(),actor:'x',before_data:null,after_data:seed[0]}]}));
});

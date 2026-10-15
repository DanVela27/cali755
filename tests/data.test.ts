import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seed,summary } from '../src/data.ts';
test('Confirmed October 14 baseline excludes CA2',()=>{
 assert.deepEqual(summary(seed),{total:27,done:8,pending:19,percent:30});
 assert.equal(seed.find(t=>t.code==='CA2')?.historical,true);
 assert.equal(new Set(seed.map(t=>t.code)).size,28);
});
test('Furniture denominators and completed counts match the source',()=>{
 for(const [m,total,done] of [['M-01',3,1],['M-02',4,2],['M-03',4,0],['M-04',4,2],['M-05',9,3],['Sin mueble',3,0]] as const){
 const s=summary(seed.filter(t=>t.furniture===m)); assert.equal(s.total,total,m);assert.equal(s.done,done,m);
 }
});
test('Completion and reopening change only the current progress',()=>{
 const modified=seed.map(t=>t.code==='CA17'?{...t,status:'done' as const}:t);
 assert.equal(summary(modified).done,9); assert.equal(summary([]).percent,0);
 assert.equal(summary(modified.map(t=>t.code==='CA17'?{...t,status:'pending' as const}:t)).done,8);
});

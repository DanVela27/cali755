import { readFileSync } from 'node:fs';
import { parseReport } from '../src/report.ts';
const report=parseReport(JSON.parse(readFileSync(new URL('../public/report.json',import.meta.url),'utf8')));
console.log(`Corte válido: ${report.tasks.length} actividades, ${report.events.length} eventos.`);

'use strict';
// Explicit import; builds use the committed snapshot and never depend on a local vault path.
const fs=require('node:fs');
const path=require('node:path');
const {validate}=require('./travel-model');
const input=process.argv[2];
if(!input) throw new Error('Usage: npm run travel:sync -- /path/to/新西兰旅行_PlanA_PlanB.json');
const raw=JSON.parse(fs.readFileSync(input,'utf8'));
const target=path.resolve(__dirname,'../source/_data/new_zealand.json');
const previous=JSON.parse(fs.readFileSync(target,'utf8'));
const keys=[...new Set(['A','B'].flatMap(id=>raw.plans[id].days.flatMap(day=>day.activity_ids)))];
const properties=[...new Set(['A','B'].flatMap(id=>raw.plans[id].stays.map(stay=>stay.property_id)))];
const data={schema_version:raw.schema_version,updated:raw.updated,
 presentation:previous.presentation || {mode:'compare',defaultPlanId:'A',selectedPlanId:null},
 assumptions:raw.assumptions,international_flights:raw.international_flights,north_options:raw.north_options || [],
 properties:Object.fromEntries(properties.map(k=>[k,raw.properties[k]])),activities:Object.fromEntries(keys.map(k=>[k,raw.activities[k]])),
 plans:{A:raw.plans.A,B:raw.plans.B}};
validate(data);
fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n');
console.log('Imported active A/B only; lodging and price records validated.');

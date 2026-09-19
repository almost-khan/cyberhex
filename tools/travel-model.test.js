 'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {model,validate}=require('./travel-model');
const data=require('../source/_data/new_zealand.json');
test('fixed lodging survives the adapter in both directions',()=>{
 const v=model(data);assert.deepEqual(v.variants.map(p=>p.id),['A','B']);
 const stays={A:['queenstown','queenstown','teanau','wanaka','cook'],B:['cook','wanaka','teanau','queenstown','queenstown']};
 for(const p of v.variants){
  assert.equal(p.days.length,12);assert.equal(p.days[0].date,'2026-09-30');
  for(let i=0;i<5;i++){const date='2026-10-0'+(i+2);assert.equal(p.stays.find(s=>s.check_in<=date&&date<s.check_out).property_id,stays[p.id][i]);}
  assert(p.bookings.some(b=>b.id===p.id+'-milford_self'));
  assert(!p.bookings.some(b=>b.links.some(l=>l[1].includes('day-trip-from'))));
 }
});
test('invalid source data fails before rendering',()=>{
 const x=structuredClone(data);x.plans.A.stays[1].nights++;assert.throws(()=>validate(x));
 const y=structuredClone(data);y.plans.B.costs[0].budget.min++;assert.throws(()=>validate(y));
});
test('comparison is not a final selection; final mode renders only selected plan',()=>{
 const x=structuredClone(data);x.presentation={mode:'final',defaultPlanId:'A',selectedPlanId:'B'};
 assert.deepEqual(model(x).variants.map(p=>p.id),['B']);
 x.presentation.selectedPlanId=null;assert.throws(()=>model(x));
});
test('both panels use unique DOM identities and dates come from their own records',()=>{
 const v=model(data);const ids=v.variants.flatMap(p=>[...p.days.map(d=>d.id),...p.bookings.map(b=>b.id)]);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(v.variants[0].bookings.find(b=>b.id==='A-milford_self').date,'10-04');
 assert.equal(v.variants[1].bookings.find(b=>b.id==='B-milford_self').date,'10-05');
});

test('north island tours replace rental and single tickets without double counting',()=>{
 for(const id of ['A','B']) {
  const p=data.plans[id];assert.equal(p.rentals.length,1);assert.equal(p.rentals[0].region,'south');
  assert.equal(p.costs.find(c=>c.id==='north_car').budget.max,0);
  assert.deepEqual(p.days.find(d=>d.date==='2026-10-09').activity_ids,['hobbiton_tour']);
  for(const day of p.days.filter(d=>d.date>='2026-10-08'&&d.date<='2026-10-10')) assert(day.driving_budget.startsWith('本人驾驶 0'));
  for(const bound of ['min','max']) assert.equal(p.days.flatMap(d=>d.activity_ids).reduce((sum,key)=>sum+(data.activities[key].price[bound]||0)*data.assumptions.adults,0),p.costs.find(c=>c.id==='activities').budget[bound]);
 }
 const v=model(data);for(const p of v.variants){assert(p.groupBudget);assert(p.personBudget);assert(p.northOptions.length);}
});

'use strict';
const assert = require('node:assert/strict');
const range = value => value[0] === value[1] ? Number(value[0]).toLocaleString('zh-CN') : value.map(n => Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 2 })).join('—');
const budget = value => value.min == null ? '已计餐饮预算' : `NZ$${range([value.min, value.max])}`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const table = (head, rows) => `<div class="table-scroll" tabindex="0" role="region" aria-label="详细信息表，可横向滚动"><table><thead><tr>${head.map(x=>`<th>${escape(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
function validate(data) {
  assert(data.plans.A && data.plans.B, 'Both A and B are required');
  assert.equal(data.assumptions.confirmed_drivers, 1, 'Preserve the confirmed single driver');
  for (const id of ['A','B']) {
    const plan = data.plans[id];
    assert.equal(plan.status, 'current_fixed_lodging_self_drive_draft');
    assert.equal(plan.stays.reduce((n,s)=>n+s.nights,0),9);
    assert.equal(plan.stays.find(s=>s.property_id==='teanau').nights,1);
    for (let i=0;i<plan.stays.length;i++) {
      const stay=plan.stays[i];
      assert(data.properties[stay.property_id], 'Unknown property');
      assert.equal((Date.parse(stay.check_out)-Date.parse(stay.check_in))/86400000,stay.nights);
      if(i) assert.equal(plan.stays[i-1].check_out,stay.check_in);
      if(stay.url.includes('airbnb.com')) {
        const u=new URL(stay.url);assert.equal(u.searchParams.get('check_in'),stay.check_in);assert.equal(u.searchParams.get('check_out'),stay.check_out);
      }
    }
    for(const day of plan.days) {
      for(const id of day.activity_ids) {assert(data.activities[id]);assert(!['milford','milford_qtn'].includes(id),'Coach rejected');}
      const stay=plan.stays.find(s=>s.check_in<=day.date && day.date<s.check_out);
      assert.equal(day.stay_id,stay?.id ?? null);
    }
    for(const [bound,index] of [['min',0],['max',1]]) {
      assert.equal(plan.costs.reduce((n,c)=>n+c.budget[bound],0),plan.totals.group_base_nzd[index]);
      assert.equal(plan.stays.reduce((n,s)=>n+s.budget[bound],0),plan.costs.find(c=>c.id==='lodging').budget[bound]);
    }
  }
  assert(['compare','final'].includes(data.presentation.mode));
  assert(['A','B'].includes(data.presentation.defaultPlanId));
  if(data.presentation.mode==='final') assert(['A','B'].includes(data.presentation.selectedPlanId));
  else assert.equal(data.presentation.selectedPlanId,null);
}
function model(data) {
  validate(data);
  const settings=data.presentation;
  const ids=settings.mode==='final'?[settings.selectedPlanId]:['A','B'];
  const variants=ids.map(id=>{
    const p=data.plans[id];
    const days=p.days.map(day=>({
      ...day,id:`${id}-day-${day.date}`,short:day.date.slice(5).replace('-','/'),place:day.route,title:day.route,stay:day.overnight,drive:day.driving_budget,
      region:day.date>'2026-10-10'?'transit':day.date>='2026-10-02'&&day.date<='2026-10-06'?'south':'north',
      warning:day.constraints,
      schedule:day.schedule.split('；').filter(Boolean).map(text=>{const m=text.match(/^((?:目标\s*|约\s*)?\d{2}:\d{2}(?:[–—-]\d{2}:\d{2})?)\s*(.*)$/);return m?{time:m[1],text:m[2]}:{time:'行程',text};})
    }));
    const first=data.international_flights[0];
    days.unshift({id:`${id}-day-${first.date}`,date:first.date,short:'09/30',title:'杭州出发，深圳转机',place:`${first.origin} → ${first.destination}`,region:'transit',stay:'转机／飞机上',drive:'机场接驳另计',warning:'首段日期沿用已确认出发日期，截图顶部日期裁切。',schedule:[{time:first.departure.slice(11),text:`${first.flight} 杭州起飞`},{time:first.arrival.slice(11),text:'深圳落地，衔接次日国际航班'}]});
    const bookings=p.days.flatMap(day=>day.activity_ids.map(key=>{
      const item=data.activities[key];
      const note=key==='rippon'?'普通品酒需预约；不含买酒。唯一司机如后续仍需驾驶则不饮酒，接送与日程见当天说明。':key==='spellbound'?'双洞约 150min，目标场次见当日日程；至少提前 20min 签到。':key==='hobbiton'?'目标场次见当日日程，提前到集合点；本票不含奥克兰接送。':item.note;
      return {id:`${id}-${key}`,date:day.date.slice(5),title:item.name,en:key.replaceAll('_',' '),priority:'计划项目',state:'未预订 · 指定日期待核',price:budget(item.price)+(item.price.min==null?'':'／'+(item.price.basis==='vehicle'?'车':'成人')),snapshot:note,facts:[['集合点',item.meeting_point],['时长',item.duration_planned],['价格口径',item.price.price_kind==='public_price'?'公开产品价，非日期订单价':'规划预算／公开参考，非日期订单价']],links:[['产品／预约入口',item.url]]};
    }));
    const stays=p.stays.map(s=>({...s,property:data.properties[s.property_id]}));
    const maps=p.days.flatMap(day=>day.activity_ids.map(key=>{
      const a=data.activities[key];const url=new URL('https://www.google.com/maps/search/');url.searchParams.set('api','1');url.searchParams.set('query',a.meeting_point+', New Zealand');return {title:day.date.slice(5)+' · '+a.name,url:String(url)};
    }));
    const sections={
      roads:table(['日期','路线','驾驶额度','说明'],p.days.map(d=>[d.date.slice(5),d.route,d.driving_budget,d.constraints])),
      flights:table(['日期','航班','航段','当地出发→到达','状态'],data.international_flights.map(f=>[f.date,f.flight,`${f.origin} → ${f.destination}`,`${f.departure.replace('T',' ')} → ${f.arrival.replace('T',' ')}`,'已出票；实际付款金额未知'])),
      budget:table(['项目','全队 NZD','人均 NZD','口径'],p.costs.map(c=>[c.name,range([c.budget.min,c.budget.max]),range([c.budget.min/data.assumptions.adults,c.budget.max/data.assumptions.adults]),c.basis_note])),
      totals:table(['合计','全队','人均'],[['基础 NZD',range(p.totals.group_base_nzd),range(p.totals.group_base_nzd.map(x=>x/data.assumptions.adults))],['含 10% 机动金 NZD',range(p.totals.group_with_10pct_nzd),range(p.totals.person_with_10pct_nzd)],['折合人民币 CNY',range(p.totals.group_with_10pct_cny),range(p.totals.person_with_10pct_cny)]])
    };
    return {id,label:`Plan ${id}`,direction:id==='A'?'皇后镇进，基督城出':'基督城进，皇后镇出',days,bookings,stays,maps,sections,source:p,routeStops:stays.map(s=>({title:s.property.area,detail:`${s.check_in.slice(5)}—${s.check_out.slice(5)} · ${s.nights} 晚` })),northOptions:data.north_options || [],groupBudget:range(p.totals.group_with_10pct_cny),personBudget:range(p.totals.person_with_10pct_cny)};
  });
  return {updated:data.updated,mode:settings.mode,defaultPlanId:settings.mode==='final'?settings.selectedPlanId:settings.defaultPlanId,variants,assumptions:data.assumptions};
}
module.exports={model,validate,budget,range};

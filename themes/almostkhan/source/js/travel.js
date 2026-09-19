'use strict';
// Pre-render both plans for no-JS reading. Enhancement selects one complete panel.
const panels=[...document.querySelectorAll('[data-plan]')];
const switches=[...document.querySelectorAll('[data-plan-link]')];
const costs=[...document.querySelectorAll('[data-plan-cost]')];
let active=null, observers=[], closedDetails=[];
function observe(panel) {
  observers.forEach(o=>o.disconnect());observers=[];
  if(!('IntersectionObserver' in window))return;
  for(const [selector,attribute] of [['.day-nav a','date'],['.section-nav a','true']]) {
    const links=[...panel.querySelectorAll(selector)].filter(a=>a.hash);
    const targets=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
    const seen=new Set();
    links.forEach(a=>a.removeAttribute('aria-current'));
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries) {if(entry.isIntersecting)seen.add(entry.target.id);else seen.delete(entry.target.id);}
      const current=targets.find(t=>seen.has(t.id));
      links.forEach(a=>{if(current&&a.hash==='#'+current.id)a.setAttribute('aria-current',attribute);else a.removeAttribute('aria-current');});
    },{rootMargin:'-15% 0px -60% 0px'});
    targets.forEach(t=>observer.observe(t));observers.push(observer);
  }
}
function select(id, update=false) {
  const panel=panels.find(p=>p.dataset.plan===id)||panels.find(p=>p.dataset.plan===document.body.dataset.defaultPlan)||panels[0];
  if(!panel)return;
  active=panel;
  panels.forEach(p=>{p.hidden=p!==panel;});
  switches.forEach(a=>{if(a.dataset.planLink===panel.dataset.plan)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
  // Both totals stay readable; the one on screen is marked. Without JS neither is.
  costs.forEach(c=>{if(c.dataset.planCost===panel.dataset.plan)c.setAttribute('data-active','');else c.removeAttribute('data-active');});
  const skip=document.querySelector('.skip');if(skip)skip.href='#'+panel.dataset.plan+'-timeline';
  const announcement=document.getElementById('plan-announcement');if(announcement)announcement.textContent='正在查看 Plan '+panel.dataset.plan+'；方案尚未选定。';
  if(update) {const url=new URL(location.href);url.searchParams.set('plan',panel.dataset.plan);url.hash='';history.pushState(null,'',url);}
  observe(panel);
}
function restore() {
  const url=new URL(location.href);
  // A shared anchor within a plan wins over a mismatching query parameter.
  const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));
  select(target?.closest('[data-plan]')?.dataset.plan || url.searchParams.get('plan'));
  if(target&&!target.closest('[hidden]'))requestAnimationFrame(()=>target.scrollIntoView());
}
switches.forEach(a=>a.addEventListener('click',e=>{
  if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();select(a.dataset.planLink,true);
}));
window.addEventListener('popstate',restore);
window.addEventListener('hashchange',restore);
restore();
const printButton=document.getElementById('print-trip');
if(printButton){printButton.hidden=false;printButton.addEventListener('click',()=>window.print());}
window.addEventListener('beforeprint',()=>{
  closedDetails=active?[...active.querySelectorAll('details:not([open])')]:[];
  closedDetails.forEach(d=>{d.open=true;});
});
window.addEventListener('afterprint',()=>{closedDetails.forEach(d=>{d.open=false;});closedDetails=[];});

(() => {
'use strict';
let generatedId=0;
const selector='input:not([type="hidden"]),select,textarea';
function associate(root){
 if(!root.querySelectorAll)return;
 root.querySelectorAll('label:not([for])').forEach(label=>{
  if(label.control)return;
  const field=label.closest('.field')||label.parentElement;
  if(!field)return;
  const control=[...field.querySelectorAll(selector)].find(el=>!el.labels||![...el.labels].includes(label));
  if(!control)return;
  if(!control.id)control.id='ledger-field-'+(++generatedId);
  label.htmlFor=control.id;
 });
 root.querySelectorAll(selector).forEach(control=>{
  if(control.labels&&control.labels.length)return;
  if(control.hasAttribute('aria-label')||control.hasAttribute('aria-labelledby'))return;
  const hint=control.getAttribute('placeholder')||control.getAttribute('title')||control.getAttribute('name');
  if(hint)control.setAttribute('aria-label',hint.replace(/([A-Z])/g,' $1').replace(/[_-]/g,' ').trim());
 });
}
const run=()=>associate(document);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
 if(node.nodeType===1)associate(node.parentElement||node);
}))).observe(document.documentElement,{childList:true,subtree:true});
})();
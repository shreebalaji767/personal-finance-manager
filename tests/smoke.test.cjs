const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const worker = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
assert.ok(scriptStart >= 0 && scriptEnd > scriptStart, 'The application script must exist');
const appScript = html.slice(scriptStart + '<script>'.length, scriptEnd);
assert.doesNotThrow(() => new Function(appScript), 'Inline application JavaScript must parse');
assert.doesNotThrow(() => new Function(worker), 'Service worker JavaScript must parse');

const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual([...new Set(duplicateIds)], [], 'HTML IDs must be unique');

const idSet = new Set(ids);
for (const match of appScript.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)) {
  assert.ok(idSet.has(match[1]) || match[1] === 'pinGate', 'Missing element referenced by getElementById: ' + match[1]);
}

const declaredFunctions = new Set([...appScript.matchAll(/function\s+([\w$]+)\s*\(/g)].map(match => match[1]));
for (const match of html.matchAll(/\bonclick=["']\s*([\w$]+)\s*\(/gi)) {
  assert.ok(declaredFunctions.has(match[1]), 'Missing inline click handler: ' + match[1]);
}

assert.equal((html.match(/\bid=["']quickAdd["']/g) || []).length, 1, 'There must be exactly one global Quick Add button');
assert.doesNotMatch(html, /id=["']floatingQuickAdd["']/, 'The duplicate floating Quick Add must remain removed');
assert.doesNotMatch(html.slice(html.indexOf('<body')), /blssnvj21/, 'SEO keyword must not appear in visible page markup');
assert.match(html.slice(0, html.indexOf('<body')), /blssnvj21/, 'SEO keyword must remain in metadata');

const seedMatch = appScript.match(/const seed=\(\)=>\(\{([\s\S]*?)\}\);/);
assert.ok(seedMatch, 'A default data model must exist');
for (const collection of ['accounts', 'trash', 'transactions', 'budgets', 'goals', 'bills', 'debts', 'assets', 'members']) {
  assert.match(seedMatch[1], new RegExp(collection + ':\\[\\]'), 'First launch must keep ' + collection + ' empty');
}

assert.equal(manifest.name, 'Ledger — Personal Finance Manager');
assert.equal(manifest.scope, './');
assert.ok(manifest.icons.some(icon => fs.existsSync(path.join(root, icon.src.replace(/^\.\//, '')))), 'Manifest icon must exist');

const shellMatch = worker.match(/const APP_SHELL\s*=\s*\[([\s\S]*?)\];/);
assert.ok(shellMatch, 'Service worker app shell must be declared');
for (const match of shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)) {
  const asset = match[1];
  assert.ok(fs.existsSync(path.join(root, asset.replace(/^\.\//, ''))), 'Missing offline app-shell asset: ' + asset);
}

assert.match(worker, /ledger-static-v\d+/, 'Service worker cache must be versioned');
assert.match(appScript, /beforeinstallprompt/, 'Custom PWA install handling must exist');
assert.match(appScript, /function normaliseData/, 'Backup and stored data must pass through validation');
assert.match(appScript, /localMonthKey/, 'Calendar month calculations must use local time');


assert.match(html, /data-page="studio"/, 'Finance Studio navigation must exist');
assert.match(html, /id="page-studio"/, 'Finance Studio page must exist');
for (const collection of ['subscriptions','customCategories','plans']) assert.ok(seedMatch[1].includes(collection + ':[]'), 'New collection must start empty: ' + collection);
for (const fn of ['previewStudioCSV','importStudioCSV','renderFinanceStudio','openStudioSubscription','openStudioPlan','exportStudioCSV']) assert.ok(appScript.includes('function ' + fn + '('), 'Missing Finance Studio feature: ' + fn);
assert.match(worker, /ledger-static-v16/, 'Finance Studio assets must use a refreshed offline cache');
assert.match(html, /class="sidebar-scrim" id="sidebarScrim"/, 'Mobile navigation must have a dismissible backdrop');
assert.match(html, /aria-controls="sidebar" aria-expanded="false"/, 'Mobile navigation toggle must expose its state accessibly');
assert.match(html, /function closeSidebar\(/, 'Sidebar must have a shared close handler');
assert.match(html, /function toggleSidebar\(/, 'Sidebar must have a shared toggle handler');
assert.match(html, /prefers-reduced-motion:reduce/, 'Navigation transitions must respect reduced-motion preferences');
assert.match(html, /\.nav button\.active/, 'Navigation must have a distinct active-page state');


assert.match(html, /data-page="planning"/, 'Planning tools navigation must exist');
assert.match(html, /id="page-planning"/, 'Planning tools page must exist');
for (const collection of ['templates','journal','settlements','reconciliations']) assert.ok(seedMatch[1].includes(collection + ':[]'), 'New planning collection must start empty: ' + collection);
for (const fn of ['renderPlanningTools','openPlanningTemplate','usePlanningTemplate','openPlanningJournal','openPlanningSettlement','savePlanningReconciliation','calculatePlanningInvest','calculatePlanningLoan','refreshPlanningStorage','checkPlanningReminders']) assert.ok(appScript.includes('function ' + fn + '('), 'Missing planning tool: ' + fn);
assert.match(appScript, /function calculatePlanningInvest\(/, 'Investment projection calculator must exist');
assert.match(appScript, /function calculatePlanningLoan\(/, 'Loan prepayment calculator must exist');
assert.match(appScript, /function renderPlanningBillReminders\(/, 'Bill reminder list must exist');
assert.match(worker, /ledger-static-v17/, 'Planning tools must use a refreshed offline cache');
assert.match(html, /name="rollover"/, 'Budgets must support optional rollover');
assert.match(html, /id="planningReconciliation"/, 'Account reconciliation history must exist');
assert.match(html, /id="planningStorage"/, 'Local storage monitor must exist');

console.log('Ledger regression checks passed.');

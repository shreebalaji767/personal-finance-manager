const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const worker = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
assert.ok(scriptStart >= 0 && scriptEnd > scriptStart, 'The application script must exist');
const appScript = html.slice(scriptStart + '<script>'.length, scriptEnd);
assert.doesNotThrow(() => new Function(appScript), 'Inline application JavaScript must parse');
assert.doesNotThrow(() => new Function(worker), 'Service worker JavaScript must parse');
const threeScene = read('three-scene.js');
const tutorialScene = read('tutorial-scene.js');
const formAccessibility = read('form-accessibility.js');
const threeRuntime = read('vendor/three.min.js');
assert.doesNotThrow(() => new Function(threeRuntime), 'Bundled Three.js runtime must parse');
assert.doesNotThrow(() => new Function(threeScene), 'Three.js scene JavaScript must parse');
assert.doesNotThrow(() => new Function(tutorialScene), '3D tutorial JavaScript must parse');
assert.doesNotThrow(() => new Function(formAccessibility), 'Form accessibility helper must parse');
assert.ok(html.includes('<script src="./form-accessibility.js" defer></script>'), 'Form accessibility helper must load');
assert.match(worker, /form-accessibility\.js/, 'Form accessibility helper must be cached offline');
assert.ok(formAccessibility.includes('label.htmlFor=control.id'), 'Unassociated labels must be linked to controls');
assert.ok(formAccessibility.includes('new MutationObserver'), 'Dynamically created forms must be handled');
assert.ok(html.includes('id="realWorkflow"'), 'Landing page must include the real application workflow demo');
assert.ok(html.includes('guidedDemo=1'), 'Workflow iframe must run in isolated demo mode');
assert.ok(html.includes('<script src="./workflow-demo.js"></script>'), 'Workflow driver must load');
assert.match(appScript, /const DEMO_MODE=.*guidedDemo/, 'Demo mode must be explicitly enabled by query parameter');
assert.match(appScript, /if\(DEMO_MODE\)\{render\(\);return true\}/, 'Demo saves must never write to persistent storage');
const workflowDemo = read('workflow-demo.js');
assert.doesNotThrow(() => new Function(workflowDemo), 'Guided workflow driver must parse');
assert.match(worker, /workflow-demo\.js/, 'Workflow driver must be cached offline');
assert.ok(!html.includes('id="ledgerTour"'), 'The removed standalone 3D tutorial must stay removed');
assert.ok(html.includes('id="watchTour"') && html.includes('See live demo'), 'Landing page CTA must lead to the real workflow demo');
assert.ok(!html.includes('<script src="./tutorial-scene.js"></script>'), 'Removed tutorial script must not load');
assert.ok(!worker.includes('tutorial-scene.js'), 'Removed tutorial script must not be cached offline');
assert.ok(fs.existsSync(path.join(root, 'vendor/three.min.js')), 'The local Three.js runtime must be bundled');
assert.match(html, /<script src="\.\/vendor\/three\.min\.js"><\/script>/, 'Three.js must load from the local bundle');
assert.match(html, /<script src="\.\/three-scene\.js"><\/script>/, 'The 3D scene script must be included');
assert.match(worker, /\.\/three-scene\.js/);
assert.match(worker, /\.\/vendor\/three\.min\.js/);

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
assert.ok(html.slice(0, html.indexOf('<body')).includes('<title>Ledger — Personal Finance Manager</title>'), 'Ledger branding must be used in metadata');

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
assert.match(worker, /ledger-static-v28/, 'Finance Studio and planning assets must use a refreshed offline cache');
assert.match(html, /class="sidebar-scrim" id="sidebarScrim"/, 'Mobile navigation must have a dismissible backdrop');
assert.match(html, /aria-controls="sidebar" aria-expanded="false"/, 'Mobile navigation toggle must expose its state accessibly');
assert.match(html, /function closeSidebar\(/, 'Sidebar must have a shared close handler');
assert.match(html, /function toggleSidebar\(/, 'Sidebar must have a shared toggle handler');
assert.match(html, /prefers-reduced-motion:reduce/, 'Navigation transitions must respect reduced-motion preferences');
assert.match(html, /\.nav button\.active/, 'Navigation must have a distinct active-page state');


assert.match(html, /data-page="planning"/, 'Planning tools navigation must exist');
assert.match(html, /id="page-planning"/, 'Planning tools page must exist');
for (const collection of ['templates','journal','settlements','reconciliations']) assert.ok(seedMatch[1].includes(collection + ':[]'), 'New planning collection must start empty: ' + collection);
for (const fn of ['renderPlanningTools','openPlanningTemplate','usePlanningTemplate','openPlanningJournal','openPlanningSettlement','savePlanningReconciliation','calculatePlanningInvest','calculatePlanningLoan','calculatePlanningRetirement','calculatePlanningDepreciation','refreshPlanningStorage','checkPlanningReminders']) assert.ok(appScript.includes('function ' + fn + '('), 'Missing planning tool: ' + fn);
assert.match(appScript, /function calculatePlanningInvest\(/, 'Investment projection calculator must exist');
assert.match(appScript, /function calculatePlanningLoan\(/, 'Loan prepayment calculator must exist');
assert.match(appScript, /function renderPlanningBillReminders\(/, 'Bill reminder list must exist');
assert.match(worker, /ledger-static-v28/, 'Planning tools must use a refreshed offline cache');
assert.match(html, /name="rollover"/, 'Budgets must support optional rollover');
assert.match(html, /id="planningReconciliation"/, 'Account reconciliation history must exist');
assert.match(html, /id="planningStorage"/, 'Local storage monitor must exist');

console.log('Ledger regression checks passed.');

assert.match(threeScene, /!window\.THREE/, 'The 3D scene must safely skip initialization if the runtime fails to load');
assert.ok(html.includes('<script src="./vendor/three.min.js"></script>'), 'The local Three.js runtime must load before the hero scene');
assert.ok(html.includes('<script src="./three-scene.js"></script>'), 'The hero 3D scene must load');
assert.ok(!html.includes('<script src="./tutorial-scene.js"></script>'), 'The removed 3D tutorial scene must not load');
assert.match(threeScene, /prefers-reduced-motion/ , 'The 3D scene must respect reduced motion');
assert.match(threeScene, /IntersectionObserver/, 'The 3D scene must pause outside the viewport');
assert.doesNotMatch(threeScene, /https?:\/\//, 'The 3D scene must not depend on a runtime CDN');

// Data-integrity regression guards.
assert.match(appScript, /const safeId=v=>typeof v==='string'/, 'Imported IDs must be restricted to a safe character set');
assert.match(appScript, /const validDate=v=>/, 'Imported dates must be validated');
assert.match(appScript, /if\(!save\(\)\)return;alert\('Backup imported successfully\.'\)/, 'Import must not report success when persistence fails');
assert.match(appScript, /normaliseData\(JSON\.parse\(target\.data\)\)/, 'Recovery snapshots must be validated before restore');
assert.match(appScript, /const v=convert\(t\.amount,t\.currency\)/, 'Calendar totals must convert transaction currencies');
assert.match(appScript, /t\.account===account&&t\.currency===/, 'CSV duplicate checks must include account and currency');
assert.doesNotMatch(html.slice(0, html.indexOf('<body')), /blssnvj21/, 'Metadata must use Ledger branding');

assert.match(appScript, /function renderFxWarning\(/, 'Missing currency rates must be shown globally');
assert.match(appScript, /data-filter-member/, 'Family-member names must not be inserted into inline JavaScript handlers');
assert.match(appScript, /if\(!save\(\)\)return;alert\('Preferences saved\./, 'Settings must not claim success when storage fails');


// Execute the data validator against real fixtures (not only source-text checks).
const currencySource = appScript.match(/const CURRENCIES=\{[\s\S]*?\};/)?.[0];
const seedSource = appScript.match(/const seed=\(\)=>\(\{[\s\S]*?\}\);/)?.[0];
const normaliseSource = appScript.match(/function normaliseData\(x\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(currencySource && seedSource && normaliseSource, 'Currency, seed and normalisation functions must be extractable for functional tests');
const dataTools = vm.runInNewContext(currencySource + ';' + seedSource + ';' + normaliseSource + ';({seed,normaliseData})');
const fixture = dataTools.seed();
fixture.accounts.push({id:'acct_test',name:'Test cash',type:'Cash',currency:'INR',opening:0});
fixture.transactions.push({id:'tx_test',date:'2026-11-09',type:'expense',amount:125,description:'Test purchase',category:'Other',account:'acct_test',currency:'INR'});
assert.ok(dataTools.normaliseData(fixture), 'A valid saved ledger with dated transactions must load');
const impossibleDate = JSON.parse(JSON.stringify(fixture));
impossibleDate.transactions[0].date = '2026-02-30';
assert.equal(dataTools.normaliseData(impossibleDate), null, 'Impossible calendar dates must be rejected');
const invalidLeapDay = JSON.parse(JSON.stringify(fixture));
invalidLeapDay.transactions[0].date = '2025-02-29';
assert.equal(dataTools.normaliseData(invalidLeapDay), null, 'Invalid leap days must be rejected');
const nonUnitBase = JSON.parse(JSON.stringify(fixture));
nonUnitBase.settings.rates.INR = 9;
assert.equal(dataTools.normaliseData(nonUnitBase).settings.rates.INR, 1, 'The selected base currency rate must always equal one');

const studioDateSource = appScript.match(/function studioDate\(v\)\{[^\n]+\}/)?.[0];
assert.ok(studioDateSource, 'CSV date normaliser must exist');
const studioDate = vm.runInNewContext(studioDateSource + ';studioDate');
assert.equal(studioDate('2026-02-30'), '', 'CSV import must reject impossible ISO dates');
assert.equal(studioDate('03/04/2026'), '', 'Ambiguous slash dates must not be silently misinterpreted');
assert.equal(studioDate('31/03/2026'), '2026-03-31', 'Unambiguous day-first CSV dates must be normalised');

assert.doesNotMatch(appScript, /\$\{esc\(m\.name\)\}|\$\{esc\(m\.id\)\}/, 'Family action attributes must interpolate actual member values');
assert.ok(appScript.includes("t.note+' '+(t.member||'')"), 'Transaction search must include the assigned family member');
assert.match(appScript, /The base currency rate is fixed at 1/, 'The exchange-rate editor must protect the base currency');
assert.ok(appScript.includes("for(const key of Object.keys(data))if(Array.isArray(data[key]))data[key]=[]"), 'Clear all records must clear every record collection');
assert.ok(appScript.includes("TEMPLATE_KEY,THEME_KEY,PIN_KEY,'ledger.finance.networth.v1'"), 'Erase all must clear app-owned preferences and local history');
assert.ok(workflowDemo.includes("new w.Event('change')"), 'Guided demo events must be created in the iframe window realm');
assert.match(workflowDemo, /const dateAfter=days=>/, 'Guided demo dates must use local calendar dates');
assert.ok(!workflowDemo.includes("toISOString().slice(0,10)"), 'Guided demo must not derive date-only values from UTC');

const invalidReceipt = JSON.parse(JSON.stringify(fixture));
invalidReceipt.transactions[0].receipt = 'https://tracking.example/pixel.png';
assert.equal(dataTools.normaliseData(invalidReceipt), null, 'Imported receipts must be local image data, not remote tracking URLs');
const malformedTrash = JSON.parse(JSON.stringify(fixture));
malformedTrash.trash.push({id:'trash_test',kind:'transactions',item:{id:"unsafe'handler"}});
assert.equal(dataTools.normaliseData(malformedTrash), null, 'Recycle-bin entries must not smuggle unsafe restored IDs');
assert.ok(appScript.includes("const candidate=JSON.parse(JSON.stringify(data));candidate[x.kind].push(x.item);const clean=normaliseData(candidate)"), 'Recycle-bin restores must validate the candidate ledger before changing it');
assert.ok(appScript.includes("file.size>25*1024*1024"), 'Oversized backup imports must be rejected before parsing');
assert.ok(appScript.includes("item.receipt.length>700000"), 'Oversized imported receipt payloads must be rejected');
assert.ok(appScript.includes("currencyOptions(currency)"), 'Exchange-rate options must be built from a non-base currency');


const guessCategorySource = appScript.match(/function studioGuessCategory\(description,type\)\{[^\n]+\}/)?.[0];
const csvParserSource = appScript.match(/function studioParseCSV\(src\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(guessCategorySource && csvParserSource, 'CSV category and parser functions must be available for functional tests');
const parseCSV = vm.runInNewContext(guessCategorySource + ';' + studioDateSource + ';' + csvParserSource + ';studioParseCSV');
const bankRows = parseCSV('Date,Narration,Debit,Credit,Category\n2026-11-01,"Grocery, market",1200,,Food & groceries\n2026-11-02,Salary,,50000,Salary');
assert.equal(bankRows.length, 2, 'CSV parser must preserve every data row');
assert.equal(bankRows[0].description, 'Grocery, market', 'Quoted commas must stay inside the description');
assert.equal(bankRows[0].type, 'expense', 'Separate debit columns must become expenses');
assert.equal(bankRows[0].amount, 1200, 'Debit amounts must be parsed correctly');
assert.equal(bankRows[1].type, 'income', 'Separate credit columns must become income');
assert.equal(bankRows[1].amount, 50000, 'Credit amounts must be parsed correctly');
assert.throws(() => parseCSV('date,description,amount,type\n2026-11-01,"unfinished,12,expense'), /unclosed quoted field/i, 'Malformed quoted CSV must be rejected');
assert.ok(appScript.includes("const seen=new Set(data.transactions.map(keyOf))"), 'CSV import must detect duplicates within the same file as well as existing records');

assert.ok(appScript.includes("if(!save())return;alert('Updated "), 'Bulk categorisation must not claim success when storage fails');
assert.ok(appScript.includes("if(!save())return;alert('Transaction split"), 'Transaction splitting must not claim success when storage fails');
assert.ok(appScript.includes("if(!save())return;alert('Statement balance saved"), 'Reconciliation must not claim success when storage fails');
assert.ok(appScript.includes("data.members.some(m=>m.name.toLowerCase()===v.name.toLowerCase())"), 'Family member names must be unique ignoring case');

assert.ok(appScript.includes("const prevKey=localMonthKey(prevDate)"), 'Month comparisons must use local calendar dates, not UTC conversion');
assert.ok(!appScript.includes("prevDate.toISOString().slice(0,10)"), 'Previous-month calculations must not shift months in positive UTC offsets');
assert.ok(appScript.includes("typeof t.id==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(t.id)"), 'Local template IDs must be validated before inline actions use them');
assert.ok(appScript.includes("if(Array.isArray(saved))history=saved.filter(x=>x&&typeof x.date==='string'&&Number.isFinite(Number(x.value)))"), 'Corrupt net-worth history must not break rendering');

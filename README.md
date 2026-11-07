# Ledger — Personal Finance Manager

A vanilla HTML/CSS/JavaScript personal finance application designed for GitHub Pages. No backend, build step, paid APIs, analytics, ads, accounts or cloud sync.

## Deploy on GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Save. The included workflow deploys the root of `main` automatically on each push.
4. Wait for the Pages deployment. The site will be available at https://shreebalaji767.github.io/personal-finance-manager/

## Branding, landing page and navigation

- **Ledger logo:** The custom blue-and-green mark identifies the app in the landing page and finance workspace. It is an SVG, so it stays sharp on high-resolution screens.
- **Transparent logo:** The SVG has no solid background, allowing it to sit cleanly on both light and dark surfaces.
- **Favicon:** The same mark is used as the browser-tab icon and bookmark icon, making the site easier to recognise.
- **PWA app icon:** The logo is also declared in the web app manifest so supported browsers can use it when the site is installed.
- **Landing page:** The landing page is the welcome screen. It introduces Ledger and provides the **Open Ledger** action to enter the actual finance workspace.
- **Always start at the landing page:** Opening the site's root URL (without a workspace-section hash) displays the landing page. This gives the site a consistent starting point.
- **Logo returns home:** Clicking the Ledger logo from inside the workspace takes you back to the landing page. It does not delete or reset any financial records.
- **Refresh keeps your place:** Workspace sections are reflected in the URL hash (for example, `#app/transactions`). Refreshing while viewing a section reloads that same section. It does not send you to the landing page or clear your data. To return to the landing page, click the logo.
- **Install app button:** On browsers that support the PWA install prompt, the button opens the browser's native installation flow. If the browser does not provide that prompt, the button explains that you can use the browser menu's **Install app** or **Add to Home Screen** option, when available. Installation adds an app-style shortcut/window; it does not create an online account or upload your records.
- **Responsive layout:** The interface adapts to desktop, tablet and phone screen sizes. Navigation, content panels, buttons and the landing page reflow to fit narrower screens. Browser zoom and device accessibility settings remain available.
- **Offline app shell:** The service worker caches the app shell, manifest and logo so the interface can open offline after it has been loaded once. Offline availability depends on the browser retaining its cache; keep JSON backups of important records.


## Search engine metadata

- The page title, description, Open Graph metadata and social preview metadata identify the site as **blssnvj21**.
- A canonical URL points search engines to the GitHub Pages home address.
- Robots directives allow indexing and following links.
- Schema.org WebApplication JSON-LD describes the app as a free personal finance web application.
- Search engines choose their own display titles and snippets; metadata helps them understand the site but cannot guarantee exact wording or immediate indexing. Search results may take time to refresh after deployment.

## Quick Add and entering records

- **Quick Add buttons:** The workspace top bar and floating **＋ Quick Add** button open the same menu from any workspace section.
- **Dashboard shortcuts:** Income, expense, transfer and account shortcuts are visible at the top of the dashboard.
- **All add options in one place:** Quick Add opens the existing forms for income, expenses, transfers, accounts, budgets, savings goals, bills, loans/EMIs, assets/investments and family labels.
- **Section-specific Add buttons:** Each relevant section keeps its own Add button, so you can add an item without opening the global menu.
- **No automatic entries:** Opening Quick Add does not create records. A record is saved only after you fill in its form and press Save. Cancel or close the form to leave your data unchanged.
- **Mobile layout:** Dashboard shortcuts and the all-options menu reflow for narrow screens. The floating Quick Add button stays within reach.

## First launch

The app starts with a completely blank workspace. No accounts, transactions, budgets, goals, bills, assets, or family members are pre-created. Add only the records you want to track. Existing browser data is preserved when the app is updated.

## Features
- Dashboard, income/expense/transfer records, accounts and search/filter.
- Multiple currencies with manually editable exchange rates and a selectable base currency.
- Budgets, savings goals, bills, loans/EMIs, assets/investments, household member labels.
- Reports, CSV export and a monthly calendar.
- JSON backup and validated restore; duplicate-transaction warning.
- Recycle bin with restore and permanent-delete controls for removed records.
- Paired account transfers: one transfer moves value out of one account and into another without inflating income or expenses.
- Automatic local recovery snapshots (last five saved states) with manual restore.
- Local browser storage and installable offline PWA.

## Privacy and data
All financial data is stored in this browser using localStorage. Nothing is uploaded or synchronized. Export JSON backups regularly. Clearing browser/site data can erase records. Exchange rates are manual estimates, not live market rates. This app does not connect to banks or provide tax/investment advice.

## Limitations
- This is a single-device ledger, not a shared multi-user service.
- Transfers update both source and destination account balances using the transaction currency and each account's currency. They remain excluded from income/expense reports.
- Bill status is tracked manually; marking a bill paid does not automatically create an expense.
- Investment values and loan balances are manually maintained.
- Browser storage is not encrypted by this app. Use a trusted device and secure browser profile.

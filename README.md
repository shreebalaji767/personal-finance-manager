# Ledger — Personal Finance Manager

A vanilla HTML/CSS/JavaScript personal finance application designed for GitHub Pages. No backend, build step, paid APIs, analytics, ads, accounts or cloud sync.

## Deploy on GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Save. The included workflow deploys the root of `main` automatically on each push.
4. Wait for the Pages deployment. The site will be available at https://shreebalaji767.github.io/personal-finance-manager/

## Branding and navigation

The site opens on a dedicated landing page. Select **Open Ledger** to enter the finance workspace. The Ledger logo returns to the landing page. Workspace navigation uses the URL hash, so refreshing while inside a section reloads that same section; opening the site root starts at the landing page. The transparent SVG brand mark is used in the header, favicon and installable app icon. The install button uses the browser's native PWA install prompt when supported.

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

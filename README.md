# Ledger — Personal Finance Manager

A vanilla HTML/CSS/JavaScript personal finance application designed for GitHub Pages. No backend, build step, paid APIs, analytics, ads, accounts or cloud sync.

## Deploy on GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Save. The included workflow deploys the root of `main` automatically on each push.
4. Wait for the Pages deployment. The site will be available at https://shreebalaji767.github.io/personal-finance-manager/

## Features
- Dashboard, income/expense/transfer records, accounts and search/filter.
- Multiple currencies with manually editable exchange rates and a selectable base currency.
- Budgets, savings goals, bills, loans/EMIs, assets/investments, household member labels.
- Reports, CSV export and a monthly calendar.
- JSON backup and validated restore; duplicate-transaction warning.
- Local browser storage and installable offline PWA.

## Privacy and data
All financial data is stored in this browser using localStorage. Nothing is uploaded or synchronized. Export JSON backups regularly. Clearing browser/site data can erase records. Exchange rates are manual estimates, not live market rates. This app does not connect to banks or provide tax/investment advice.

## Limitations
- This is a single-device ledger, not a shared multi-user service.
- Transfers are recorded as transaction entries; automatic paired-account transfer reconciliation is not yet included.
- Bill status is tracked manually; marking a bill paid does not automatically create an expense.
- Investment values and loan balances are manually maintained.
- Browser storage is not encrypted by this app. Use a trusted device and secure browser profile.

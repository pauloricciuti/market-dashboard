# Market Dashboard

A personal dashboard to follow global markets, built from scratch with HTML, CSS and JavaScript.

**Live version:** https://pauloricciuti.github.io/market-dashboard/

## What it shows

- **Markets by region:** United States, Europe, Asia, Brazil, plus Sectors, Commodities, Crypto and Forex tabs.
- **Macro indicators:** policy rates, inflation, real interest rates, GDP growth, unemployment and public debt.
- **Country comparison tables:** Europe and Asia side by side (10Y yields, real yields, growth, unemployment).
- **Daily performance overview** of the main indices, commodities and cryptocurrencies.

## How it works

- Charts are TradingView embedded widgets.
- Macro data is fetched live from public APIs: Central Bank of Brazil, IBGE, BLS, New York Fed, US Treasury, ECB, Eurostat, BIS, OECD and World Bank.
- Real interest rates are computed with the Fisher equation.
- A small browser cache (localStorage) keeps API usage within rate limits.

## Concepts practiced

`fetch` and `async/await`, JSON and CSV parsing, `Promise.all`, DOM manipulation, CSS grid and flexbox, state + render pattern, Git and GitHub Pages.

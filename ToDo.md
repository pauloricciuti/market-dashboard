# Market Dashboard — To-Do

## Next up
- [x] **Sectors tab** — new tab to watch specific sectors
  - Defense / Aerospace
  - Pharma / Healthcare
  - (see candidate symbols below)
- [x] **Commodities → "Critical Minerals" group** — less conventional commodities
  - Uranium, rare earths, lithium, etc. (see candidate symbols below)
- [x] **Bigger group titles** (Precious Metals, Stock Indices, ...) on all tabs
  - CSS rule `section h2` → raise `font-size` (currently 12px)

## Backlog
- [x] Central bank / statistics data via API (start with Brazil: Selic, IPCA, real rate)
- [x] Repeat for US (BLS), Europe (ECB), Asia (World Bank)
- [x] Confirm `BMFBOVESPA:DI1F2027` loads
- [ ] Thesis journal (localStorage)
- [ ] Simulated portfolio
- [ ] Learn Git
- [ ] Refactor challenge: generic `createWidget`
- [ ] **Looker Studio dashboard** — deeper analysis of the key assets we track
  - Correlations between assets (e.g. Gold vs BTC)
  - Investment rationale behind each asset (why people hold it)
  - Historical evolution + main causes of the most relevant moves
  - Trends
  - Data source: Google Sheets (`GOOGLEFINANCE`) → Looker Studio

## Candidate symbols (untested — check with a TEST group first)

### Sectors tab
| Group | Symbol | Label |
|---|---|---|
| Defense & Aerospace | AMEX:ITA | US Aerospace & Defense (ITA) |
| Defense & Aerospace | AMEX:XAR | US Aerospace & Defense, equal weight (XAR) |
| Defense & Aerospace | XETR:EUDF | Europe Defense (EUDF) |
| Healthcare & Pharma | AMEX:XLV | US Healthcare (XLV) |
| Healthcare & Pharma | AMEX:XPH | US Pharmaceuticals (XPH) |
| Healthcare & Pharma | AMEX:XBI | US Biotech (XBI) |
| Tech & Semiconductors | NASDAQ:SMH | Semiconductors (SMH) |
| Tech & Semiconductors | AMEX:XLK | US Technology (XLK) |
| Tech & Semiconductors | NASDAQ:CIBR | Cybersecurity (CIBR) |
| Financials & Energy | AMEX:XLF | US Financials (XLF) |
| Financials & Energy | AMEX:XLE | US Energy (XLE) |
| Financials & Energy | NASDAQ:ICLN | Clean Energy (ICLN) |

### Commodities → Critical Minerals
| Symbol | Label |
|---|---|
| AMEX:URA | Uranium Miners (URA) |
| AMEX:URNM | Uranium Miners & Physical (URNM) |
| AMEX:REMX | Rare Earths & Strategic Metals (REMX) |
| NYSE:MP | MP Materials (US rare earths) |
| AMEX:LIT | Lithium & Battery Tech (LIT) |
| OANDA:XPTUSD | Platinum (USD/oz) |
| OANDA:XPDUSD | Palladium (USD/oz) |
| AMEX:KRBN | Carbon Credits (KRBN) |

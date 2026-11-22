
// ============================================================
// MARKET DASHBOARD — app.js (behavior)
//
//  1. Tabs and groups (what the dashboard shows)
//  2. Memory (localStorage: last tab and period)
//  3. TradingView widgets (charts, quotes, lists)
//  4. Shared helpers (real rate, table cell, World Bank GDP, cache)
//  5. Data: Brazil (Central Bank, IBGE)
//  6. Data: United States (NY Fed, BLS, Treasury)
//  7. Data: Europe (ECB, Eurostat) + country table
//  8. Data: Asia (BIS, OECD) + country table
//  9. Number cards (SOURCES, getData, createIndicator)
// 10. Draw the page (render)
// 11. Buttons
// 12. Clock
// ============================================================

// 1) TABS AND GROUPS
// The tabs, in the order they appear in the top bar.
const TABS = ["Global", "United States", "Europe", "Asia", "Brazil", "Sectors", "Commodities", "Crypto", "Forex"];

// Focus PDF is named after the Friday before its Monday release: R20261113.pdf
function latestFocusUrl() {
const d = new Date();                                   // today
// getDay(): 0 = Sunday, 1 = Monday, ... 6 = Saturday
const daysSinceMonday = (d.getDay() + 6) % 7;
d.setDate(d.getDate() - daysSinceMonday - 3);           // last Monday - 3 days = Friday
const yyyy = d.getFullYear();
const mm = String(d.getMonth() + 1).padStart(2, "0");   // months start at 0 in JavaScript!
const dd = String(d.getDate()).padStart(2, "0");
return `https://www.bcb.gov.br/content/focus/focus/R${yyyy}${mm}${dd}.pdf`;
}

// Each group says which tab it belongs to ("tab").
// Each asset is ["EXCHANGE:TICKER", "Label shown on the card"].
// The prefix (OANDA:, FX:, CAPITALCOM:...) says which data source the price comes from.
const GROUPS = [

{ tab: "Global", title: "Daily Performance Overview", overview: [
["Stock Indices", [
    ["FOREXCOM:SPXUSD",        "S&P 500"],
    ["FOREXCOM:NSXUSD",        "Nasdaq 100"],
    ["CAPITALCOM:EU50",        "Euro Stoxx 50"],
    ["CAPITALCOM:CN50",        "China A50"],          
    ["CAPITALCOM:DE40",        "DAX"],
    ["FOREXCOM:UKXGBP",        "FTSE 100"],
    ["OANDA:JP225USD",         "Nikkei 225"],
    ["CAPITALCOM:HK50",        "Hang Seng"],
    ["BMFBOVESPA:IBOV",        "Ibovespa"],
]],
["Commodities", [
    ["OANDA:XAUUSD",           "Gold"],
    ["OANDA:XAGUSD",           "Silver"],
    ["CAPITALCOM:COPPER",      "Copper"],
    ["IG:IRON",                "Iron Ore"],
    ["TVC:UKOIL",              "Brent Crude"],
    ["TVC:USOIL",              "WTI Crude"],
]],
["Crypto", [
    ["BITSTAMP:BTCUSD",        "Bitcoin"],
    ["BITSTAMP:ETHUSD",        "Ethereum"],
    ["BITSTAMP:SOLUSD",        "Solana"],
    ["BITSTAMP:XRPUSD",        "XRP"],
]],   
["Alternatives & Sectors", [
    ["AMEX:URA",               "Uranium Miners"],
    ["AMEX:REMX",              "Rare Earths"],
    ["NYSE:MP",                "MP Materials"],
    ["AMEX:LIT",               "Lithium"],
    ["AMEX:ITA",               "US Defense"],
    ["AMEX:XLV",               "US Healthcare"],
    ["NASDAQ:SMH",             "Semiconductors"],
    ["NASDAQ:CIBR",            "Cybersecurity"],
]], 
]},          

{ tab: "Global", title: "World Stock Indices", assets: [
["AMEX:URTH",         "MSCI World (URTH ETF)"],
["NASDAQ:ACWI",       "MSCI ACWI (ACWI ETF)"],
]},

{ tab: "United States", title: "Rates & Inflation",
link: ["Rate Expectations: CME FedWatch ↗", "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html"],
indicators: [
    ["US_FED_FUNDS", "Fed Funds Effective Rate",                    "%"],
    ["US_REAL_RATE", "Real Interest Rate (Fed Funds vs. CPI 12m)", "%"],
    ["US_CPI",       "CPI Inflation (12 months)",                  "%"],
]},
{ tab: "United States", title: "Economy & Fiscal", indicators: [
["US_UNEMPLOYMENT", "Unemployment Rate",            "%"],
["US_GDP",          "GDP, Last Full Year", " US$ tn", 1e12],
["US_DEBT",         "Total Public Debt",   " US$ tn", 1e12],
["FRED:GFDEGDQ188S", "Total Public Debt (% GDP)"],
]},

{ tab: "United States", title: "Stock Indices", assets: [
["FOREXCOM:SPXUSD",   "S&P 500"],
["FOREXCOM:NSXUSD",   "Nasdaq 100"],
["FOREXCOM:DJI",      "Dow Jones"],
["FOREXCOM:US2000",   "Russell 2000"],
]},

{ tab: "United States", title: "Rates & Volatility", assets: [
["OANDA:USB10YUSD",   "US 10Y T-Note (Price)"],
["CAPITALCOM:VIX",    "VIX (Volatility)"],
]},

{ tab: "Europe", title: "Euro Area (ECB)",
link: ["ECB Monetary Policy Decisions ↗", "https://www.ecb.europa.eu/press/govcdec/mopo/html/index.en.html"],
indicators: [
    ["EU_DEPOSIT_RATE", "ECB Deposit Facility Rate",           "%"],
    ["EU_REAL_RATE",    "Real Short-Term Rate (vs. HICP 12m)", "%"],
    ["EU_HICP",         "HICP Inflation (12 months)",          "%"],
    ["EU_GDP_GROWTH",   "Real GDP Growth (YoY)",               "%"],
]},
{ tab: "Europe", title: "Country Comparison", table: "europe" },

{ tab: "Europe", title: "Stock Indices", assets: [
["CAPITALCOM:EU50",   "Euro Stoxx 50"],
["CAPITALCOM:DE40",   "DAX (Germany)"],
["FOREXCOM:UKXGBP",   "FTSE 100 (London)"],
["CAPITALCOM:FR40",   "CAC 40 (France)"],
]},

{ tab: "Europe", title: "Government Bonds", assets: [
["OANDA:DE10YBEUR",        "German Bund 10Y (Price)"],
["OANDA:UK10YBGBP",        "UK Gilt 10Y (Price)"],
["FRED:IRLTLT01ITM156N",   "Italy 10Y — FRED (monthly)"],
["FRED:IRLTLT01ESM156N",   "Spain 10Y — FRED (monthly)"],
["FRED:IRLTLT01FRM156N",   "France 10Y — FRED (monthly)"],
["FRED:IRLTLT01DEM156N",   "Germany 10Y — FRED (monthly)"],
["FRED:IRLTLT01GBM156N",   "UK 10Y — FRED (monthly)"],
]},

{ tab: "Asia", title: "Country Comparison", table: "asia" },      

{ tab: "Asia", title: "Stock Indices", assets: [
["OANDA:JP225USD",         "Nikkei 225 (Japan)"],
["CAPITALCOM:HK50",        "Hang Seng (Hong Kong)"],
["CAPITALCOM:CN50",        "China A50"],
["OANDA:AU200AUD",         "ASX 200 (Australia)"],
]},

{ tab: "Asia", title: "Country ETFs (USD, US hours)", assets: [
["BATS:INDA",              "India (INDA)"],
["AMEX:EWT",               "Taiwan (EWT)"],
["AMEX:EWY",               "South Korea (EWY)"],
]},

{ tab: "Asia", title: "Currencies", assets: [
["FX:AUDUSD",              "AUD / USD"],
["FX_IDC:USDINR",          "USD / INR (India)"],
]},

{ tab: "Asia", title: "Bond Yields (monthly, %)", assets: [
["FRED:IRLTLT01JPM156N",   "Japan 10Y"],
["FRED:IRLTLT01AUM156N",   "Australia 10Y"],
]},

{ tab: "Asia", title: "Government Bonds", assets: [
["FRED:IRLTLT01JPM156N",   "Japan 10Y — FRED (monthly)"]
]},

{ tab: "Brazil", title: "Rates & Inflation",
link: ["Focus Survey: Latest Report (PDF) ↗", latestFocusUrl()],
indicators: [
[432,   "Selic Target Rate",          "%"],
["REAL_RATE", "Real Interest Rate (Selic vs. IPCA 12m)", "%"],
[13522, "IPCA Inflation (12 months)", "%"],
[433,   "IPCA Inflation (monthly)",   "%"],
[13521, "Inflation Target",           "%"],
]},

{ tab: "Brazil", title: "Economy & Fiscal", indicators: [
["GDP", "Real GDP Growth (YoY)", "%"],
[7324,  "GDP, Last Full Year",  " US$ tn", 1000000],
[24369, "Unemployment Rate",               "%"],
[13762, "Gross Public Debt (% GDP)",       "%"],
[3546,  "International Reserves", " US$ bn", 1000],
]},    

{ tab: "Brazil", title: "Market", assets: [
["BMFBOVESPA:IBOV",   "Ibovespa"],
["FX_IDC:USDBRL",     "USD / BRL"],
["BMFBOVESPA:PETR4",  "Petrobras (PETR4)"],
["BMFBOVESPA:VALE3",  "Vale (VALE3)"],
["BMFBOVESPA:ITUB4",  "Itaú (ITUB4)"],
]},

{ tab: "Brazil", title: "Interest Rates", assets: [
["BMFBOVESPA:DI1F2027",    "DI Jan/2027 (Short-term rate, %)"],
["BMFBOVESPA:DI1F2035",    "DI Jan/2035 (Long-term rate, %)"],
]},

{ tab: "Commodities", title: "Precious Metals", assets: [
["OANDA:XAUUSD",           "Gold (USD/oz)"],
["OANDA:XAGUSD",           "Silver (USD/oz)"],
["OANDA:XPTUSD",           "Platinum (USD/oz)"],
["OANDA:XPDUSD",           "Palladium (USD/oz)"],
]},

{ tab: "Commodities", title: "Industrial Metals", assets: [
["CAPITALCOM:COPPER",      "Copper"],
["IG:IRON",                "Iron Ore (CNH/t, China)"],
]},
{ tab: "Commodities", title: "Energy", assets: [
["TVC:UKOIL",              "Brent Crude"],
["TVC:USOIL",              "WTI Crude"],
]},

{ tab: "Commodities", title: "Critical Minerals (via ETFs & miners)", assets: [
["AMEX:URA",               "Uranium Miners (URA)"],
["AMEX:URNM",              "Uranium Miners & Physical (URNM)"],
["AMEX:REMX",              "Rare Earths & Strategic Metals (REMX)"],
["NYSE:MP",                "MP Materials (US Rare Earths)"],
["AMEX:LIT",               "Lithium & Battery Tech (LIT)"],
]},

{ tab: "Crypto", title: "Crypto", assets: [
["BITSTAMP:BTCUSD",   "Bitcoin"],
["BITSTAMP:ETHUSD",   "Ethereum"],
]},

{ tab: "Sectors", title: "Defense & Aerospace", assets: [
["AMEX:ITA",               "US Aerospace & Defense (ITA)"],
["AMEX:XAR",               "US Aerospace & Defense, Equal Weight (XAR)"],
["BATS:EUAD",              "Europe Defense (EUAD) - BATS"],
]},
{ tab: "Sectors", title: "Healthcare & Pharma", assets: [
["AMEX:XLV",               "US Healthcare (XLV)"],
["AMEX:XPH",               "US Pharmaceuticals (XPH)"],
["AMEX:XBI",               "US Biotech (XBI)"],
]},
{ tab: "Sectors", title: "Tech & Semiconductors", assets: [
["NASDAQ:SMH",             "Semiconductors (SMH)"],
["AMEX:XLK",               "US Technology (XLK)"],
["NASDAQ:CIBR",            "Cybersecurity (CIBR)"],
]},
{ tab: "Sectors", title: "Financials & Energy", assets: [
["AMEX:XLF",               "US Financials (XLF)"],
["AMEX:XLE",               "US Energy (XLE)"],
["NASDAQ:ICLN",            "Clean Energy (ICLN)"],
]},

{ tab: "Forex", title: "Currencies", assets: [
["CAPITALCOM:DXY",    "Dollar Index (DXY)"],
["FX:EURUSD",         "EUR / USD"],
["FX:USDJPY",         "USD / JPY"],
["FX:USDCNH",         "USD / CNH (China)"],
["FX_IDC:CHFEUR",     "CHF / EUR"],
]},
];

// Used the first time the page opens (before anything is saved)
const DEFAULT_TAB = TABS[0];
const DEFAULT_PERIOD = "1M"; // 1 day, 1 month, 3 months, 1 year, 5 years


// 2) MEMORY: save and read choices in the browser (localStorage),
// so the page reopens on the same tab and period.
// try/catch: if the browser blocks storage, we just use the default.
function load(key, fallback) {
try { return localStorage.getItem(key) || fallback; }
catch (e) { return fallback; }
}
function save(key, value) {
try { localStorage.setItem(key, value); } catch (e) {}
}

// NEW: the "state" of the page = what is selected right now.
// "let" (not "const") because these values change when you click.
let currentTab = load("tab", DEFAULT_TAB);
let currentPeriod = DEFAULT_PERIOD;;

// If a saved tab no longer exists (e.g. you renamed it), go back to the default
if (!TABS.includes(currentTab)) currentTab = DEFAULT_TAB;

// 3) TRADINGVIEW WIDGETS
// Every TradingView widget is built the same way: a container, a target div
// and a <script> with the settings as JSON. Only the widget type and the settings change.
const TV_BASE_URL = "https://s3.tradingview.com/external-embedding/embed-widget-";

function createWidget(box, type, settings) {
const container = document.createElement("div");
container.className = "tradingview-widget-container";
container.style.height = "100%";

const target = document.createElement("div");
target.className = "tradingview-widget-container__widget";
container.appendChild(target);

const script = document.createElement("script");
script.src = TV_BASE_URL + type + ".js";   // e.g. ".../embed-widget-symbol-overview.js"
script.async = true;
// Settings shared by all our widgets, then the ones specific to this widget
script.innerHTML = JSON.stringify({
locale: "en",
colorTheme: "dark",
isTransparent: true,   // uses our box's background
width: "100%",
...settings,
});
container.appendChild(script);

box.appendChild(container);
}

// Chart with price, change and the selected period
function createChart(box, symbol, period) {
createWidget(box, "symbol-overview", {
symbols: [[symbol + "|" + period]],   // "EXCHANGE:TICKER|PERIOD"
height: "100%",
autosize: true,
chartOnly: false,
chartType: "area",
showVolume: false,
showMA: false,
scalePosition: "right",
scaleMode: "Normal",
valuesTracking: "1",                  // shows the value under the mouse
changeMode: "price-and-percent",
hideDateRanges: true,                 // we have our own period buttons
hideMarketStatus: false,
hideSymbolLogo: false,
});
}

// Compact card: just the value and the change, no chart
function createQuote(box, symbol) {
createWidget(box, "single-quote", { symbol: symbol });
}

// List of assets with their daily change
function createOverview(box, title, symbols) {
createWidget(box, "market-overview", {
height: "100%",
dateRange: "1D",
showChart: false,                     // just the list
showSymbolLogo: true,
showFloatingTooltip: false,
tabs: [{
    title: title,
    // our format ["EXCHANGE:TICKER", "Name"] → TradingView's format { s: ..., d: ... }
    symbols: symbols.map(([symbol, name]) => ({ s: symbol, d: name })),
}],
});
}

// 4) SHARED HELPERS (used by several countries)

// Fisher equation: nominal rate discounted by inflation
function realRate(nominal, inflation) {
return ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;
}

// Real rate as a { date, value } item, or null if one of the two numbers is missing
function realRateItem(rate, prices) {
if (!rate || !prices) return null;
return { date: prices.date, value: realRate(rate.value, prices.value) };
}

// World Bank → GDP in current US$, last full year → { date, value }
async function fetchWorldBankGDP(countryCode) {
const response = await fetch("https://api.worldbank.org/v2/country/" + countryCode + "/indicator/NY.GDP.MKTP.CD?format=json&mrv=1");
const json = await response.json();
const row = json[1][0];   // json[0] = page info, json[1] = the data
return { date: row.date, value: row.value };
}

// One table cell: "4.68%", with the reference date when the mouse is over it; "—" if missing
function cell(item) {
if (!item) return `<td>—</td>`;
return `<td title="${item.date}">${item.value.toFixed(2)}%</td>`;
}

// Small cache in the browser: some APIs (BLS, OECD) limit how many requests we can make
const CACHE_HOURS = 6;

function readCache(key) {
try {
const saved = JSON.parse(localStorage.getItem(key));
if (saved && Date.now() - saved.time < CACHE_HOURS * 60 * 60 * 1000) return saved.data;
} catch (e) {}
return null;   // nothing saved, or too old
}

function writeCache(key, data) {
try { localStorage.setItem(key, JSON.stringify({ time: Date.now(), data: data })); } catch (e) {}
}

// 5) DATA: BRAZIL (Central Bank, IBGE)
const BCB_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.";
const IBGE_GDP_URL = "https://servicodados.ibge.gov.br/api/v3/agregados/5932/periodos/-1/variaveis/6561?localidades=N1%5Ball%5D&classificacao=11255%5B90707%5D";

// Central Bank of Brazil → returns { date, value }
async function fetchBCB(series) {
const response = await fetch(BCB_URL + series + "/dados/ultimos/1?formato=json");
const data = await response.json();   // [{ data: "dd/mm/yyyy", valor: "13.75" }]
return { date: data[0].data, value: Number(data[0].valor) };
}

// IBGE → real GDP growth vs. same quarter of last year → returns { date, value }
async function fetchGDP() {
const response = await fetch(IBGE_GDP_URL);
const data = await response.json();
// The answer is nested: data → resultados → series → serie → { "202602": "2.0" }
const serie = data[0].resultados[0].series[0].serie;
const period = Object.keys(serie)[0];  // "202602" = year 2026, quarter 02
const quarter = "Q" + Number(period.slice(4)) + " " + period.slice(0, 4);  // "Q2 2026"
return { date: quarter, value: Number(serie[period]) };
}

// Real interest rate = Selic discounted by 12-month inflation (Fisher equation)
async function fetchRealRate() {
// Ask for both at the same time and wait for the two answers
const [selic, ipca] = await Promise.all([fetchBCB(432), fetchBCB(13522)]);
return realRateItem(selic, ipca);
}

// 6) DATA: UNITED STATES (NY Fed, BLS, Treasury)
const BLS_URL = "https://api.bls.gov/publicAPI/v1/timeseries/data/";
const FED_FUNDS_URL = "https://markets.newyorkfed.org/api/rates/unsecured/effr/last/1.json";
const US_DEBT_URL = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page%5Bsize%5D=1";

// BLS → monthly values, newest first: [{ year: "2026", period: "M10", periodName: "October", value: "4.1" }, ...]
async function fetchBLS(seriesId) {
const url = BLS_URL + seriesId;
const saved = readCache(url);
if (saved) return saved;   // use the saved copy, no request

const response = await fetch(url);
const json = await response.json();
if (json.status !== "REQUEST_SUCCEEDED") throw new Error("BLS: " + json.message);

const data = json.Results.series[0].data;
writeCache(url, data);
return data;
}

async function fetchUSUnemployment() {
const data = await fetchBLS("LNS14000000");
const last = data.find((month) => month.value !== "-");   // newest month with a value
return { date: last.periodName + " " + last.year, value: Number(last.value) };
}

// CPI is a price index: inflation = this month vs. the same month one year before
async function fetchUSCPI() {
const data = await fetchBLS("CUUR0000SA0");
for (const month of data) {   // newest first
if (month.period === "M13" || month.value === "-") continue;   // M13 = annual average; "-" = missing
const yearBefore = String(Number(month.year) - 1);
const sameMonthLastYear = data.find((x) => x.year === yearBefore && x.period === month.period);
if (sameMonthLastYear && sameMonthLastYear.value !== "-") {
    const change = (Number(month.value) / Number(sameMonthLastYear.value) - 1) * 100;
    return { date: month.periodName + " " + month.year, value: change };
}
}
throw new Error("CPI: no comparable months");
}

async function fetchFedFunds() {
const response = await fetch(FED_FUNDS_URL);
const json = await response.json();
const rate = json.refRates[0];   // { effectiveDate: "2026-11-19", percentRate: 3.88, ... }
return { date: rate.effectiveDate, value: rate.percentRate };
}

async function fetchUSRealRate() {
const [rate, cpi] = await Promise.all([fetchFedFunds(), fetchUSCPI()]);
return realRateItem(rate, cpi);
}

function fetchUSGDP() { return fetchWorldBankGDP("US"); }

async function fetchUSDebt() {
const response = await fetch(US_DEBT_URL);
const json = await response.json();
const row = json.data[0];
return { date: row.record_date, value: Number(row.tot_pub_debt_out_amt) };
}

// 7) DATA: EUROPE (ECB, Eurostat)
const ECB_URL = "https://data-api.ecb.europa.eu/service/data/";
const EUROSTAT_URL = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/";

// ECB → last value of any series key → { date, value }
async function fetchECB(key) {
const response = await fetch(ECB_URL + key + "?lastNObservations=1&format=jsondata");
const json = await response.json();
const series = Object.values(json.dataSets[0].series)[0];   // the only series in the answer
const observations = series.observations;                    // { "0": [2.5, ...] }
const index = Object.keys(observations)[0];
const date = json.structure.dimensions.observation[0].values[index].id;   // "2026-09-16"
return { date: date, value: observations[index][0] };
}

// Eurostat → last value of a dataset, filtered down to one series → { date, value }
async function fetchEurostat(dataset, filters) {
const response = await fetch(EUROSTAT_URL + dataset + "?" + filters + "&lastTimePeriod=1");
const json = await response.json();
const date = Object.keys(json.dimension.time.category.index)[0];   // "2026-10"
return { date: date, value: json.value["0"] };
}

// Each indicator is just "which series, from which source"
function fetchEUDepositRate()  { return fetchECB("FM/B.U2.EUR.4F.KR.DFR.LEV"); }
function fetchEUUnemployment() { return fetchECB("LFSI/M.I9.S.UNEHRT.TOTAL0.15_74.T"); }
function fetchEUDebtToGDP()    { return fetchECB("GFS/Q.N.I9.W0.S13.S1.C.L.LE.GD.T._Z.XDC_R_B1GQ_CY._T.F.V.N._T"); }
function fetchEUInflation()    { return fetchEurostat("prc_hicp_minr", "geo=EA&unit=RCH_A&coicop18=TOTAL"); }
function fetchEUGDPGrowth()    { return fetchEurostat("namq_10_gdp", "geo=EA&unit=CLV_PCH_SM&s_adj=SCA&na_item=B1GQ"); }

async function fetchEURealRate() {
const [rate, hicp] = await Promise.all([fetchEUDepositRate(), fetchEUInflation()]);
return realRateItem(rate, hicp);
}

function fetchEUGDP() { return fetchWorldBankGDP("EMU"); }

// Eurostat → latest value for several countries at once → { DE: { date, value }, FR: { ... }, ... }
async function fetchEurostatCountries(dataset, filters, countryCodes) {
const geo = countryCodes.map((code) => "geo=" + code).join("&");   // "geo=DE&geo=FR&..."
const url = EUROSTAT_URL + dataset + "?" + geo + (filters ? "&" + filters : "") + "&lastTimePeriod=3";
const response = await fetch(url);
const json = await response.json();

const times = Object.keys(json.dimension.time.category.index);   // ["2026-08", "2026-09", "2026-10"]
const geoIndex = json.dimension.geo.category.index;               // { DE: 0, ES: 1, FR: 2, ... }
const result = {};

for (const code of countryCodes) {
// Values come in one flat list: country after country, month after month
for (let t = times.length - 1; t >= 0; t--) {   // start from the newest month
    const value = json.value[geoIndex[code] * times.length + t];
    if (value !== undefined) {
    result[code] = { date: times[t], value: value };
    break;   // found the newest value for this country, stop looking
    }
}
}
return result;
}

const EUROPE_COUNTRIES = [
["DE", "Germany"],
["FR", "France"],
["IT", "Italy"],
["ES", "Spain"],
["NL", "Netherlands"],
["PT", "Portugal"],
];

async function createEuropeTable(box) {
box.innerHTML = `<div class="stat-date">Loading...</div>`;

try {
const codes = EUROPE_COUNTRIES.map(([code]) => code);   // ["DE", "FR", ...]

// Five requests at the same time, one per column
const [yields, inflation, growth, unemployment, debt] = await Promise.all([
    fetchEurostatCountries("irt_lt_mcby_m", "", codes),
    fetchEurostatCountries("prc_hicp_minr", "unit=RCH_A&coicop18=TOTAL", codes),
    fetchEurostatCountries("namq_10_gdp", "unit=CLV_PCH_SM&s_adj=SCA&na_item=B1GQ", codes),
    fetchEurostatCountries("une_rt_m", "s_adj=SA&age=TOTAL&sex=T&unit=PC_ACT", codes),
    fetchEurostatCountries("gov_10q_ggdebt", "unit=PC_GDP&sector=S13&na_item=GD", codes),
]);

let rows = "";
for (const [code, name] of EUROPE_COUNTRIES) {
    const bond = yields[code];
    const prices = inflation[code];
    const real = realRateItem(bond, prices);

    rows += `<tr>
    <th>${name}</th>
    ${cell(bond)}${cell(prices)}${cell(real)}
    ${cell(growth[code])}${cell(unemployment[code])}${cell(debt[code])}
    </tr>`;
}

box.innerHTML = `
    <table class="compare">
    <thead><tr>
        <th>Country</th><th>10Y Yield</th><th>Inflation (12m)</th><th>Real 10Y Yield</th>
        <th>GDP Growth (YoY)</th><th>Unemployment</th><th>Gov. Debt (% GDP)</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    </table>
    <div class="stat-date">Source: Eurostat. Hover over a number to see its reference date.</div>`;
} catch (error) {
box.innerHTML = `<div class="stat-date">Failed to load</div>`;
}
}

// 8) DATA: ASIA (BIS, OECD)
const BIS_URL = "https://stats.bis.org/api/v2/data/dataflow/BIS/";
const OECD_URL = "https://sdmx.oecd.org/public/rest/data/";

// Each country has two codes: BIS uses 2 letters, OECD uses 3
const ASIA_COUNTRIES = [
["JP", "JPN", "Japan"],
["CN", "CHN", "China"],
["IN", "IND", "India"],
["KR", "KOR", "South Korea"],
["AU", "AUS", "Australia"],
];

// Splits one CSV line into cells, ignoring commas inside "quoted text"
function splitCSVLine(line) {
const cells = [];
let current = "";
let insideQuotes = false;

for (const char of line) {
if (char === '"') {
    insideQuotes = !insideQuotes;   // entering or leaving a quoted text
} else if (char === "," && !insideQuotes) {
    cells.push(current);            // a real separator: close this cell
    current = "";
} else {
    current += char;                // any other character: keep building the cell
}
}
cells.push(current);   // the last cell has no comma after it
return cells;
}

// BIS and OECD both answer in SDMX-CSV → { JP: { date, value }, ... } with the newest value per country
async function fetchSDMX(url) {
const saved = readCache(url);
if (saved) return saved;

const response = await fetch(url);
const lines = (await response.text()).trim().split("\n");
const headers = splitCSVLine(lines[0]).map((header) => header.trim());
const result = {};

for (const line of lines.slice(1)) {   // skip the header line
const cells = splitCSVLine(line);
const row = {};
headers.forEach((header, i) => { row[header] = (cells[i] || "").trim(); });

if (row.OBS_VALUE === "") continue;   // no number in this row
const code = row.REF_AREA;
// Keep only the newest value for each country
if (!result[code] || row.TIME_PERIOD > result[code].date) {
    result[code] = { date: row.TIME_PERIOD, value: Number(row.OBS_VALUE) };
}
}

// Only save in the cache if we actually got data (not an error page)
if (Object.keys(result).length > 0) writeCache(url, result);
return result;
}

async function createAsiaTable(box) {
box.innerHTML = `<div class="stat-date">Loading...</div>`;

try {
const bis = ASIA_COUNTRIES.map((country) => country[0]).join("+");    // "JP+CN+IN+KR+AU"
const oecd = ASIA_COUNTRIES.map((country) => country[1]).join("+");   // "JPN+CHN+IND+KOR+AUS"

// Five requests at the same time, one per data type
const [policy, inflation, yields, growth, unemployment] = await Promise.all([
    fetchSDMX(BIS_URL + "WS_CBPOL/1.0/M." + bis + "?lastNObservations=1&format=csv"),
    fetchSDMX(BIS_URL + "WS_LONG_CPI/1.0/M." + bis + ".771?lastNObservations=1&format=csv"),
    fetchSDMX(OECD_URL + "OECD.SDD.STES,DSD_STES@DF_FINMARK,4.0/" + oecd + ".M.IRLT.PA.....?lastNObservations=1&format=csv"),
    fetchSDMX(OECD_URL + "OECD.SDD.NAD,DSD_NAMAIN1@DF_QNA_EXPENDITURE_GROWTH_OECD,/Q.." + oecd + ".S1..B1GQ......GY.?lastNObservations=1&format=csv"),
    fetchSDMX(OECD_URL + "OECD.SDD.TPS,DSD_LFS@DF_IALFS_UNE_M,1.0/" + oecd + "..._Z.Y._T.Y_GE15..M?lastNObservations=1&format=csv"),
]);

let rows = "";
for (const [b, o, name] of ASIA_COUNTRIES) {   // b = BIS code, o = OECD code
    rows += `<tr>
    <th>${name}</th>
    ${cell(policy[b])}${cell(inflation[b])}${cell(realRateItem(policy[b], inflation[b]))}
    ${cell(yields[o])}${cell(realRateItem(yields[o], inflation[b]))}
    ${cell(growth[o])}${cell(unemployment[o])}
    </tr>`;
}

box.innerHTML = `
    <table class="compare">
    <thead><tr>
        <th>Country</th><th>Policy Rate</th><th>Inflation (12m)</th><th>Real Policy Rate</th>
        <th>10Y Yield</th><th>Real 10Y Yield</th><th>GDP Growth (YoY)</th><th>Unemployment</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    </table>
    <div class="stat-date">Sources: BIS (policy rates, inflation) and OECD (10Y yields, GDP, unemployment). China's policy rate is the 1-year Loan Prime Rate. Hover over a number to see its reference date.</div>`;
} catch (error) {
box.innerHTML = `<div class="stat-date">Failed to load</div>`;
}
}

// 9) NUMBER CARDS: pick the right data source and draw the card

// Codes that are not Central Bank series numbers → which function fetches them
const SOURCES = {
GDP: fetchGDP,
REAL_RATE: fetchRealRate,
US_FED_FUNDS: fetchFedFunds,
US_CPI: fetchUSCPI,
US_REAL_RATE: fetchUSRealRate,
US_UNEMPLOYMENT: fetchUSUnemployment,
US_GDP: fetchUSGDP,
US_DEBT: fetchUSDebt,
EU_DEPOSIT_RATE: fetchEUDepositRate,
EU_HICP: fetchEUInflation,
EU_REAL_RATE: fetchEURealRate,
EU_GDP_GROWTH: fetchEUGDPGrowth,
EU_GDP: fetchEUGDP,
EU_UNEMPLOYMENT: fetchEUUnemployment,
EU_DEBT_GDP: fetchEUDebtToGDP,
};

function getData(series) {
if (SOURCES[series]) return SOURCES[series]();   // found in the list → call that function
return fetchBCB(series);                          // otherwise it's a Central Bank series number
}

// Draws one number card. divisor = 1 unless we say otherwise
async function createIndicator(box, series, unit, divisor = 1) {
box.innerHTML = `<div class="stat-value">Loading...</div>`;

try {
// "GDP" comes from IBGE; everything else is a Central Bank series code
const last = await getData(series);

box.innerHTML = `
    <div class="stat-value">${(last.value / divisor).toFixed(2)}<span class="stat-unit">${unit}</span></div>
    <div class="stat-date">Reference date: ${last.date}</div>`;
} catch (error) {
// No internet, server down, series code wrong...
box.innerHTML = `
    <div class="stat-value">—</div>
    <div class="stat-date">Failed to load</div>`;
}
}

// 10) DRAW THE PAGE for the current tab
// The panel is rebuilt every time the tab or the period changes:
// only the groups of the current tab are created.
const panel = document.getElementById("panel");

function render() {
panel.innerHTML = ""; // erase whatever was there

// .filter keeps only the groups whose "tab" is the current one
const groupsInTab = GROUPS.filter((group) => group.tab === currentTab);

for (const group of groupsInTab) {
const section = document.createElement("section");
section.innerHTML = `<h2>${group.title}</h2>`;
// Optional external link under the group title
if (group.link) {
    const [text, url] = group.link;
    section.innerHTML += `<a class="group-link" href="${url}" target="_blank">${text}</a>`;
}

const grid = document.createElement("div");
grid.className = "grid";

if (group.indicators) {
    // Number cards (API data)
    grid.className = "stat-grid";
    for (const [series, name, unit, divisor] of group.indicators) {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<div class="label">${name}</div><div class="stat"></div>`;
    grid.appendChild(card);
    
    // "EXCHANGE:SYMBOL" (has a colon) → TradingView compact widget; anything else → our APIs
    if (typeof series === "string" && series.includes(":")) {
        createQuote(card.querySelector(".stat"), series);
    } else {
        createIndicator(card.querySelector(".stat"), series, unit, divisor);
    }

    }
} else if (group.table === "europe") {
    // Country comparison table
    grid.className = "table-card";
    createEuropeTable(grid);

} else if (group.table === "asia") {
    grid.className = "table-card";
    createAsiaTable(grid);        

} else if (group.overview) {
    // Performance lists (one card per list)
    grid.className = "overview-grid";
    for (const [title, symbols] of group.overview) {
    const card = document.createElement("div");
    card.className = "card overview-card";
    card.innerHTML = `<div class="label">${title}</div><div class="chart"></div>`;
    grid.appendChild(card);
    createOverview(card.querySelector(".chart"), title, symbols);            
    }        

} else if (group.quotes) {

    // Compact value cards (TradingView)
    grid.className = "stat-grid";
    for (const [symbol, name] of group.quotes) {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<div class="label">${name}</div><div class="quote"></div>`;
    grid.appendChild(card);
    createQuote(card.querySelector(".quote"), symbol);
    }
} else {

    // Chart cards (TradingView)
    for (const [symbol, name] of group.assets) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="label">${name}</div><div class="chart"></div>`;
    grid.appendChild(card);
    createChart(card.querySelector(".chart"), symbol, currentPeriod);
    }
}

section.appendChild(grid);
panel.appendChild(section);
}

// Highlight the selected tab and period button
document.querySelectorAll(".tabs button").forEach((b) => {
b.classList.toggle("active", b.dataset.tab === currentTab);
});
document.querySelectorAll(".periods button").forEach((b) => {
b.classList.toggle("active", b.dataset.period === currentPeriod);
});
}

// 11) BUTTONS
// Tab buttons are created from the TABS list,
// so adding a tab = adding a name to TABS.
const tabsBar = document.getElementById("tabs");
for (const tab of TABS) {
const button = document.createElement("button");
button.textContent = tab;
button.dataset.tab = tab;
button.addEventListener("click", () => {
currentTab = tab;
save("tab", tab);
render();
});
tabsBar.appendChild(button);
}

// Period buttons already exist in the HTML: we just listen to clicks
document.querySelectorAll(".periods button").forEach((button) => {
button.addEventListener("click", () => {
currentPeriod = button.dataset.period;
save("period", currentPeriod);
render();
});
});

render(); // first drawing, when the page opens

// 12) CLOCK at the top (updates every second)
function updateClock() {
document.getElementById("clock").textContent = new Date().toLocaleString("en-US", {
weekday: "short", day: "2-digit", month: "short",
hour: "2-digit", minute: "2-digit", second: "2-digit",
});
}
updateClock();
setInterval(updateClock, 1000);
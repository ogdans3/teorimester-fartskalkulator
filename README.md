# Fartsbotkalkulator

Norske fartsbøter for 2026 som kode. Ut fra fartsgrensen og farten din får du
boten, prikkene, om du mister førerkortet og hvor lenge, og om utgangspunktet
er samfunnsstraff eller fengsel. Det er den samme utregningen som
fartsbotkalkulatoren på teorimester.no bruker, med bøtesatsene som gjelder fra
15. februar 2026.

**Prøv den på nettsiden:** [teorimester.no/kalkulatorer/fartsbot](https://teorimester.no/kalkulatorer/fartsbot)

Pakken er skrevet i TypeScript og har ingen avhengigheter. Alt i den er
offentlig regelverk, og kildene står lenger ned.

## Installer

```sh
npm install github:ogdans3/teorimester-fartskalkulator
```

## Bruk

```ts
import { calculateFine, describeFine } from 'teorimester-fartskalkulator';

const result = calculateFine({ limit: 50, speed: 70 });
// {
//   over: 20,
//   fine: 8650,
//   tooFastForFixedFine: false,
//   points: 3,
//   licence: null,
//   newTest: null,
//   punishment: null
// }

describeFine(result);
// {
//   headline: '20 km/t for fort',
//   fine: '8 650 kr',
//   points: '3 prikker',
//   licence: 'Du beholder førerkortet',
//   punishment: null
// }
```

`describeFine(result, 'en')` gir de samme setningene på engelsk.

### Det du sender inn

| Felt | |
|---|---|
| `limit` | Fartsgrensen: 30, 40, 50, 60, 70, 80, 90, 100 eller 110. |
| `speed` | Farten du ble målt i, i km/t. |
| `motorway` | Bare for 90-sone: `true` for motorvei. Motorvei og annen vei har hver sine tabeller ved 90. |
| `probation` | `true` i prøveperioden, de to første årene med førerkort for bil. |

### Det du får tilbake

| Felt | |
|---|---|
| `over` | Hvor mange km/t for fort, 0 innenfor fartsgrensen. |
| `fine` | Boten i kroner ved forenklet forelegg, eller `null`. |
| `tooFastForFixedFine` | `true` når farten er for høy for forenklet forelegg. Da går saken videre som et vanlig forelegg eller i retten, og boten blir høyere. |
| `points` | Prikker. Du får ingen når du mister førerretten, for da er det tapet som gjelder i stedet. |
| `licence` | `null` når du beholder førerkortet. Ellers `{ from, to, minMonths, maxMonths }` for fartsintervallet og hvor lenge du normalt mister førerretten. `maxMonths` er `null` når det er «mer enn» `minMonths` måneder. |
| `newTest` | Hvilken førerprøve du må ta på nytt når du mister førerretten, for eksempel `'practical'` eller `'full'`. |
| `punishment` | `'community'` når utgangspunktet er samfunnsstraff, `'prison'` når det er ubetinget fengsel, ellers `null`. |

Tabellene ligger også i pakken, om du vil bruke dem selv: `FINES_UP_TO_60`,
`FINES_FROM_70`, `FINE_MOTORWAY_EXTRA`, `ROADS` og `RATES_FROM`.

## Hva den regner med

- Personbil uten tilhenger, på tørr vei i dagslys. Ved dårlig sikt eller
  vanskelig føre kan reaksjonen bli strengere.
- Ved 90 km/t utenfor motorvei brukes forskriftens tabell for motortrafikkvei.
- I prøveperioden blir det dobbelt så mange prikker, og den som mister
  førerretten, må alltid ta hele førerprøven på nytt.
- Kalkulatoren viser det vanlige utgangspunktet. Det er politiet,
  påtalemyndigheten eller retten som bestemmer reaksjonen i hver enkelt sak,
  så dette er ikke juridisk rådgivning.

## Kilder

- [Forskrift om forenklet forelegg i vegtrafikksaker](https://lovdata.no/forskrift/1990-06-29-492), bøtesatsene
- [Forskrift om prikkbelastning](https://lovdata.no/forskrift/2003-09-19-1164), prikkene
- [Forskrift om tap av retten til å føre motorvogn](https://lovdata.no/forskrift/2003-12-19-1660), hvor lenge du mister førerretten
- [Førerkortforskriften § 4-2](https://lovdata.no/forskrift/2004-01-19-298/%C2%A74-2), prøveperioden
- [Vegtrafikkloven § 6](https://lovdata.no/lov/1965-06-18-4/%C2%A76) og [trafikkreglene § 13](https://lovdata.no/forskrift/1986-03-21-747/%C2%A713), fartsgrensene
- [Riksadvokatens rundskriv nr. 2/2021](https://www.riksadvokaten.no/document/revidert-trafikkrundskriv-om-botesatser/), når utgangspunktet er samfunnsstraff eller fengsel

Vil du lese mer om reglene bak tallene, står de forklart i artikkelen
[Fartsbøter i Norge for 2026](https://teorimester.no/artikler/fartsboter-i-norge-for-2026).

## Når satsene endres

Bøtesatsene står i forskriften om forenklet forelegg. Når de endres,
oppdaterer vi tabellene i `src/rates.ts` og datoen i `RATES_FROM`, og gir ut
en ny versjon. Ser du at noe er utdatert før vi rekker det, er du velkommen
til å lage en issue eller en pull request.

## Utvikling

```sh
npm install
npm test
npm run build
```

Testene kjører rett på TypeScript-filene med Nodes egen testkjører, så de
trenger Node 22.18 eller nyere. Pakken selv virker på Node 18 og nyere, og i
nettleseren.

## Lisens

MIT, se [LICENSE](LICENSE). Laget av [Teorimester](https://teorimester.no),
som hjelper deg med teoriprøven til førerkortet.

## In English

Norwegian speeding fines for 2026 as code: the fine, penalty points, whether
you lose your driving licence and for how long, and when the starting point is
community service or prison. It is the same calculation as the speeding fine
calculator on [teorimester.no](https://teorimester.no/kalkulatorer/fartsbot),
with the rates in force from 15 February 2026. `calculateFine({ limit, speed })`
returns the numbers, and `describeFine(result, 'en')` returns them in English
sentences. The figures are for a car without a trailer on a dry road in
daylight, and are not legal advice.

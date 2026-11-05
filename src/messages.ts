import type { FineResult, NewTest } from './calculate.ts';
import { RATES_FROM } from './rates.ts';

export type Locale = 'nb' | 'en';

/** The words teorimester.no shows for each result, in Norwegian and English. */
export const MESSAGES = {
  nb: {
    ratesFrom: 'Bøtesatser fra {date}',
    withinLimit: 'Du holder fartsgrensen, og da blir det ingen bot.',
    over: '{over} km/t for fort',
    amount: '{amount} kr',
    tooFast:
      'For fort for forenklet forelegg. Saken går videre som et vanlig forelegg eller i retten, og boten blir høyere.',
    pointsCount: '{count} prikker',
    noPoints: 'Ingen',
    noPointsLicence: 'Ingen, fordi du mister førerretten i stedet',
    keepLicence: 'Du beholder førerkortet',
    loseLicence: 'Du mister normalt førerretten i {min} til {max} måneder.',
    loseLicenceOver: 'Du mister normalt førerretten i mer enn {months} måneder.',
    seized: 'Politiet kan ta førerkortet ditt på stedet.',
    newTest: {
      none: 'Vanligvis trenger du ikke ta ny førerprøve.',
      practicalIfOverSixMonths: 'Blir tapet over 6 måneder, må du ta ny praktisk prøve.',
      practical: 'Du må ta ny praktisk prøve.',
      practicalFullIfAYear: 'Du må ta ny praktisk prøve, og blir tapet 1 år eller mer, hele førerprøven.',
      practicalIfOverSixMonthsFullIfAYear:
        'Blir tapet over 6 måneder, må du ta ny praktisk prøve, og blir det 1 år eller mer, hele førerprøven.',
      full: 'Du må ta hele førerprøven på nytt, både teoriprøven og den praktiske prøven.',
      fullInProbation: 'I prøveperioden må du alltid ta hele førerprøven på nytt.',
    } satisfies Record<NewTest, string>,
    community: 'Utgangspunktet er samfunnsstraff',
    prison: 'Utgangspunktet er ubetinget fengsel',
    note:
      'Kalkulatoren følger forskriftene og Riksadvokatens retningslinjer for personbil uten tilhenger, på tørr vei i ' +
      'dagslys. Ved dårlig sikt eller vanskelig føre kan reaksjonen bli strengere.',
    noteOtherRoad: 'For 90 km/t utenfor motorvei bruker den forskriftens tabell for motortrafikkvei.',
  },
  en: {
    ratesFrom: 'Fines from {date}',
    withinLimit: 'You are within the speed limit, so there is no fine.',
    over: '{over} km/h too fast',
    amount: 'NOK {amount}',
    tooFast:
      'Too fast for an on-the-spot fine. The case goes on as an ordinary fine or to court, and the fine is higher.',
    pointsCount: '{count} penalty points',
    noPoints: 'None',
    noPointsLicence: 'None, because you lose your licence instead',
    keepLicence: 'You keep your licence',
    loseLicence: 'You normally lose your licence for {min} to {max} months.',
    loseLicenceOver: 'You normally lose your licence for more than {months} months.',
    seized: 'The police can take your licence on the spot.',
    newTest: {
      none: 'You usually do not need to take a new driving test.',
      practicalIfOverSixMonths: 'If you lose it for more than 6 months, you must take a new practical test.',
      practical: 'You must take a new practical test.',
      practicalFullIfAYear:
        'You must take a new practical test, and if you lose it for a year or more, the whole driving test.',
      practicalIfOverSixMonthsFullIfAYear:
        'If you lose it for more than 6 months, you must take a new practical test, and for a year or more, the whole driving test.',
      full: 'You must take the whole driving test again, both the theory test and the practical test.',
      fullInProbation: 'In the probation period you always have to take the whole driving test again.',
    } satisfies Record<NewTest, string>,
    community: 'The starting point is community service',
    prison: 'The starting point is an unconditional prison sentence',
    note:
      "The calculator follows the regulations and the Director of Public Prosecutions' guidelines for a car without " +
      'a trailer, on a dry road in daylight. In poor visibility or difficult conditions the reaction can be stricter.',
    noteOtherRoad: 'For 90 km/h outside a motorway it uses the table the regulation gives for a motor road.',
  },
} as const;

/** A result in words, the way the calculator on teorimester.no says it. */
export interface FineDescription {
  /** «20 km/t for fort», or that there is no fine. */
  readonly headline: string;
  /** «8 650 kr», or that it is too fast for a fixed fine. Null within the limit. */
  readonly fine: string | null;
  /** «3 prikker», «Ingen», or none because the licence is lost. Null within the limit. */
  readonly points: string | null;
  /** That the licence is kept, or how long it is lost and what follows. Null within the limit. */
  readonly licence: string | null;
  /** The starting point for punishment, when there is one. */
  readonly punishment: string | null;
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

function number(value: number, locale: Locale): string {
  return value.toLocaleString(locale === 'en' ? 'en-GB' : 'nb-NO');
}

/** «Bøtesatser fra 15. februar 2026». */
export function ratesFrom(locale: Locale = 'nb'): string {
  const date = new Date(RATES_FROM).toLocaleDateString(locale === 'en' ? 'en-GB' : 'nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return fill(MESSAGES[locale].ratesFrom, { date });
}

export function describeFine(result: FineResult, locale: Locale = 'nb'): FineDescription {
  const m = MESSAGES[locale];
  if (result.over === 0) {
    return { headline: m.withinLimit, fine: null, points: null, licence: null, punishment: null };
  }
  const loss = result.licence;
  return {
    headline: fill(m.over, { over: result.over }),
    fine: result.fine !== null ? fill(m.amount, { amount: number(result.fine, locale) }) : m.tooFast,
    points: loss ? m.noPointsLicence : result.points > 0 ? fill(m.pointsCount, { count: result.points }) : m.noPoints,
    licence: loss
      ? [
          loss.maxMonths === null
            ? fill(m.loseLicenceOver, { months: loss.minMonths })
            : fill(m.loseLicence, { min: loss.minMonths, max: loss.maxMonths }),
          m.seized,
          m.newTest[result.newTest ?? 'none'],
        ].join(' ')
      : m.keepLicence,
    punishment: result.punishment ? m[result.punishment] : null,
  };
}

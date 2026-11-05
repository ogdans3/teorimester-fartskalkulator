import {
  FINE_MOTORWAY_EXTRA,
  FINES_FROM_70,
  FINES_UP_TO_60,
  type FineStep,
  type Road,
  ROADS,
  type SpeedLimit,
} from './rates.ts';

/** Whether a new driving test is needed after losing the licence, and which. */
export type NewTest =
  | 'none'
  | 'practical'
  | 'practicalIfOverSixMonths'
  | 'practicalFullIfAYear'
  | 'practicalIfOverSixMonthsFullIfAYear'
  | 'full'
  | 'fullInProbation';

export interface LicenceLoss {
  /** The speed band the speed fell in, from and to, both included. */
  readonly from: number;
  /** Null above the last band, where the loss is open-ended. */
  readonly to: number | null;
  readonly minMonths: number;
  /** Null when the loss is «more than» minMonths. */
  readonly maxMonths: number | null;
}

export interface FineResult {
  /** km/h over the speed limit, 0 within it. */
  readonly over: number;
  /** The fixed fine in kroner, or null within the limit or when too fast for one. */
  readonly fine: number | null;
  /** Too fast for a fixed fine (forenklet forelegg): the case goes on as an ordinary fine or to court. */
  readonly tooFastForFixedFine: boolean;
  /** Penalty points (prikker). None when the licence is lost, since that takes their place. */
  readonly points: number;
  /** The licence loss, or null when the driver keeps the licence. */
  readonly licence: LicenceLoss | null;
  /** Which driving test has to be taken again, when the licence is lost. */
  readonly newTest: NewTest | null;
  /** The starting point for punishment beyond the fine, at the highest speeds. */
  readonly punishment: 'community' | 'prison' | null;
}

export interface FineInput {
  readonly limit: SpeedLimit;
  /** The measured speed in km/h. */
  readonly speed: number;
  /**
   * Only for a 90 limit, where a motorway and other roads have their own
   * tables. Ignored for every other limit: 100 and 110 are motorways, the
   * rest are not. False when left out.
   */
  readonly motorway?: boolean;
  /** In the probation period, the first two years with a licence for a car. */
  readonly probation?: boolean;
}

/** The road the calculator uses for a speed limit (and, at 90, the road type). */
export function roadFor(limit: SpeedLimit, motorway = false): Road {
  const road = ROADS.find((r) => r.limit === limit && (limit !== 90 || r.motorway === motorway));
  if (!road) throw new RangeError(`No fines are known for a speed limit of ${limit} km/h.`);
  return road;
}

/** The fine table that applies on a road. */
export function finesFor(road: Road): readonly FineStep[] {
  if (road.limit <= 60) return FINES_UP_TO_60;
  return road.motorway && road.limit >= 90 ? [...FINES_FROM_70, FINE_MOTORWAY_EXTRA] : FINES_FROM_70;
}

/**
 * What driving at [speed] on [road] costs: the fine, the penalty points,
 * whether the licence is lost and for how long, which test has to be taken
 * again, and whether the starting point is community service or prison.
 */
export function calculateOnRoad(road: Road, speed: number, probation = false): FineResult {
  if (!Number.isFinite(speed) || speed < 0) throw new RangeError(`A speed must be a number of km/h, not ${speed}.`);
  const over = Math.max(0, speed - road.limit);
  const step = over > 0 ? finesFor(road).find(([maxOver]) => over <= maxOver) : undefined;

  const band = road.licence.find(([from, to]) => speed >= from && speed <= to);
  const licence: LicenceLoss | null = band
    ? { from: band[0], to: band[1], minMonths: band[2], maxMonths: band[3] }
    : speed > road.over[0]
      ? { from: road.over[0], to: null, minMonths: road.over[1], maxMonths: null }
      : null;

  // Points only where the licence stays: two, then three, from these many
  // km/h over, and twice as many in the probation period.
  let points = 0;
  if (!licence) {
    const [two, three] = road.limit <= 60 ? [11, 16] : [16, 21];
    points = over >= three ? 3 : over >= two ? 2 : 0;
    if (probation) points *= 2;
  }

  const [communityFrom, prisonFrom] = road.punishment ?? [];
  const punishment =
    prisonFrom !== undefined && speed >= prisonFrom
      ? 'prison'
      : communityFrom !== undefined && speed >= communityFrom
        ? 'community'
        : null;

  return {
    over,
    fine: step ? step[1] : null,
    tooFastForFixedFine: over > 0 && !step,
    points,
    licence,
    newTest: licence ? newTestAfter(licence.minMonths, licence.maxMonths, probation) : null,
    punishment,
  };
}

/** The same, from a speed limit: `calculateFine({ limit: 50, speed: 70 })`. */
export function calculateFine(input: FineInput): FineResult {
  return calculateOnRoad(roadFor(input.limit, input.motorway ?? false), input.speed, input.probation ?? false);
}

/**
 * Which driving test has to be taken again after losing the licence for
 * [minMonths] to [maxMonths] (null: more than [minMonths]). Losing it for
 * more than six months means a new practical test, a year or more the whole
 * test, and in the probation period always the whole test.
 */
export function newTestAfter(minMonths: number, maxMonths: number | null, probation = false): NewTest {
  if (probation) return 'fullInProbation';
  const max = maxMonths ?? Infinity;
  if (max <= 6) return 'none';
  if (minMonths >= 12) return 'full';
  if (minMonths <= 6) return max >= 12 ? 'practicalIfOverSixMonthsFullIfAYear' : 'practicalIfOverSixMonths';
  return max >= 12 ? 'practicalFullIfAYear' : 'practical';
}

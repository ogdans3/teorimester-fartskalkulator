/**
 * The figures behind the calculator: the fines, when a driving licence is lost
 * and for how long, and when the starting point is community service or
 * prison. Everything here is public law; the sources are in README.md.
 *
 * Every speed is in km/h and every amount in Norwegian kroner. The figures are
 * for a passenger car without a trailer, on a dry road in daylight.
 */

/** The day the fines below took effect, as an ISO date. */
export const RATES_FROM = '2026-02-15';

/** A step in a fine table: up to and including this many km/h over the limit, this fine. */
export type FineStep = readonly [maxOver: number, kroner: number];

/** Fines on roads with a speed limit of 60 km/h or less. */
export const FINES_UP_TO_60: readonly FineStep[] = [
  [5, 1250],
  [10, 3350],
  [15, 5950],
  [20, 8650],
  [25, 13450],
];

/** Fines on roads with a speed limit of 70 km/h or more. */
export const FINES_FROM_70: readonly FineStep[] = [
  [5, 1250],
  [10, 3350],
  [15, 5350],
  [20, 7450],
  [25, 10100],
  [30, 13450],
  [35, 16050],
];

/** The extra step on a motorway with a speed limit of 90 km/h or more. */
export const FINE_MOTORWAY_EXTRA: FineStep = [40, 16700];

/**
 * A speed band in which the licence is normally lost: from and to a speed,
 * both included, for so many months at least and at most.
 */
export type LicenceBand = readonly [fromSpeed: number, toSpeed: number, minMonths: number, maxMonths: number];

export interface Road {
  /** «30» to «110», and «90-motorvei» for a motorway with a 90 limit. */
  readonly key: string;
  readonly limit: number;
  readonly motorway: boolean;
  /** Bands in order. Where two bands meet at a speed, the first one holds. */
  readonly licence: readonly LicenceBand[];
  /** Above this speed the licence is lost for more than this many months. */
  readonly over: readonly [speed: number, months: number];
  /** From these speeds the starting point is community service, and then prison. */
  readonly punishment?: readonly [communityFrom: number, prisonFrom: number];
}

export const ROADS: readonly Road[] = [
  {
    key: '30',
    limit: 30,
    motorway: false,
    licence: [[56, 65, 3, 7], [65, 70, 7, 9], [70, 75, 9, 12], [75, 80, 12, 18], [80, 85, 18, 24], [85, 90, 24, 30], [90, 95, 30, 36]],
    over: [95, 36],
  },
  {
    key: '40',
    limit: 40,
    motorway: false,
    licence: [[66, 75, 3, 6], [75, 80, 6, 8], [80, 83, 8, 10], [83, 87, 10, 13], [87, 90, 13, 15], [90, 93, 15, 18], [93, 97, 18, 21], [97, 100, 21, 24], [100, 105, 24, 28], [105, 110, 28, 33]],
    over: [110, 33],
  },
  {
    key: '50',
    limit: 50,
    motorway: false,
    licence: [[76, 82, 3, 6], [82, 90, 6, 9], [90, 95, 9, 12], [95, 100, 12, 15], [100, 105, 15, 18], [105, 110, 18, 21], [110, 114, 21, 24], [114, 118, 24, 27], [118, 122, 27, 30], [122, 126, 30, 33], [126, 130, 33, 36]],
    over: [130, 36],
    punishment: [92, 96],
  },
  {
    key: '60',
    limit: 60,
    motorway: false,
    licence: [[86, 95, 3, 6], [95, 100, 6, 8], [100, 106, 8, 12], [106, 112, 12, 16], [112, 118, 16, 20], [118, 124, 20, 24], [124, 130, 24, 28], [130, 136, 28, 32], [136, 142, 32, 36]],
    over: [142, 36],
    punishment: [110, 115],
  },
  {
    key: '70',
    limit: 70,
    motorway: false,
    licence: [[106, 110, 3, 6], [110, 114, 6, 8], [114, 118, 8, 10], [118, 120, 10, 11], [120, 123, 11, 13], [123, 126, 13, 15], [126, 129, 15, 17], [129, 134, 17, 20], [134, 140, 20, 24], [140, 146, 24, 28], [146, 152, 28, 32], [152, 160, 32, 36]],
    over: [160, 36],
    punishment: [120, 125],
  },
  {
    key: '80',
    limit: 80,
    motorway: false,
    licence: [[116, 120, 3, 5], [120, 130, 5, 8], [130, 140, 8, 13], [140, 150, 13, 19], [150, 160, 19, 25], [160, 170, 25, 30], [170, 180, 30, 36]],
    over: [180, 36],
    punishment: [130, 136],
  },
  {
    key: '90',
    limit: 90,
    motorway: false,
    licence: [[126, 135, 3, 6], [135, 145, 6, 9], [145, 151, 9, 12], [151, 157, 12, 15], [157, 163, 15, 18], [163, 169, 18, 21], [169, 175, 21, 24], [175, 181, 24, 27], [181, 187, 27, 30], [187, 194, 30, 33], [194, 200, 33, 36]],
    over: [200, 36],
    punishment: [142, 150],
  },
  {
    key: '90-motorvei',
    limit: 90,
    motorway: true,
    licence: [[131, 135, 3, 5], [135, 137, 5, 6], [137, 139, 6, 7], [139, 141, 7, 8], [141, 145, 8, 9], [145, 151, 9, 12], [151, 157, 12, 15], [157, 163, 15, 18], [163, 169, 18, 21], [169, 175, 21, 24], [175, 181, 24, 27], [181, 187, 27, 30], [187, 194, 30, 33], [194, 200, 33, 36]],
    over: [200, 36],
    punishment: [142, 150],
  },
  {
    key: '100',
    limit: 100,
    motorway: true,
    licence: [[141, 145, 3, 5], [145, 147, 5, 6], [147, 149, 6, 7], [149, 151, 7, 8], [151, 155, 8, 9], [155, 161, 9, 12], [161, 167, 12, 15], [167, 173, 15, 18], [173, 179, 18, 21], [179, 185, 21, 24], [185, 191, 24, 27], [191, 197, 27, 30], [197, 204, 30, 33], [204, 210, 33, 36]],
    over: [210, 36],
    punishment: [155, 165],
  },
  {
    key: '110',
    limit: 110,
    motorway: true,
    licence: [[151, 155, 3, 5], [155, 157, 5, 6], [157, 159, 6, 7], [159, 161, 7, 8], [161, 165, 8, 9], [165, 171, 9, 12], [171, 177, 12, 15], [177, 183, 15, 18], [183, 189, 18, 21], [189, 195, 21, 24], [195, 201, 24, 27], [201, 207, 27, 30], [207, 214, 30, 33], [214, 220, 33, 36]],
    over: [220, 36],
  },
];

/** The speed limits the calculator knows. */
export const SPEED_LIMITS = [30, 40, 50, 60, 70, 80, 90, 100, 110] as const;
export type SpeedLimit = (typeof SPEED_LIMITS)[number];

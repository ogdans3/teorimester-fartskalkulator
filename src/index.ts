export {
  calculateFine,
  calculateOnRoad,
  finesFor,
  newTestAfter,
  roadFor,
  type FineInput,
  type FineResult,
  type LicenceLoss,
  type NewTest,
} from './calculate.ts';
export { describeFine, MESSAGES, ratesFrom, type FineDescription, type Locale } from './messages.ts';
export {
  FINE_MOTORWAY_EXTRA,
  FINES_FROM_70,
  FINES_UP_TO_60,
  RATES_FROM,
  ROADS,
  SPEED_LIMITS,
  type FineStep,
  type LicenceBand,
  type Road,
  type SpeedLimit,
} from './rates.ts';

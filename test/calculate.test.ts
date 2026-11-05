// What the calculator answers, case by case, as teorimester.no answers it.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { calculateFine, newTestAfter, roadFor, ROADS, SPEED_LIMITS } from '../src/index.ts';

describe('the fine', () => {
  test('20 km/h over in a 50 zone: 8 650 kr and three points', () => {
    const r = calculateFine({ limit: 50, speed: 70 });
    assert.equal(r.over, 20);
    assert.equal(r.fine, 8650);
    assert.equal(r.points, 3);
    assert.equal(r.licence, null);
    assert.equal(r.punishment, null);
  });

  test('within the limit there is nothing', () => {
    const r = calculateFine({ limit: 80, speed: 80 });
    assert.deepEqual(r, {
      over: 0,
      fine: null,
      tooFastForFixedFine: false,
      points: 0,
      licence: null,
      newTest: null,
      punishment: null,
    });
  });

  test('up to 60 km/h and from 70 km/h have their own tables', () => {
    assert.equal(calculateFine({ limit: 60, speed: 75 }).fine, 5950);
    assert.equal(calculateFine({ limit: 70, speed: 85 }).fine, 5350);
    assert.equal(calculateFine({ limit: 30, speed: 31 }).fine, 1250);
    assert.equal(calculateFine({ limit: 100, speed: 135 }).fine, 16050);
  });

  test('a motorway with 90 or more has one step more', () => {
    assert.equal(calculateFine({ limit: 110, speed: 150 }).fine, 16700);
    assert.equal(calculateFine({ limit: 90, speed: 130, motorway: true }).fine, 16700);
    // Outside a motorway, 40 over at 90 is too fast for a fixed fine.
    const other = calculateFine({ limit: 90, speed: 130 });
    assert.equal(other.fine, null);
    assert.equal(other.tooFastForFixedFine, true);
  });

  test('beyond the last step it is too fast for a fixed fine', () => {
    const r = calculateFine({ limit: 50, speed: 76 });
    assert.equal(r.fine, null);
    assert.equal(r.tooFastForFixedFine, true);
  });
});

describe('the points', () => {
  test('two from 11 and three from 16 km/h over, up to 60', () => {
    assert.equal(calculateFine({ limit: 60, speed: 70 }).points, 0);
    assert.equal(calculateFine({ limit: 60, speed: 71 }).points, 2);
    assert.equal(calculateFine({ limit: 60, speed: 76 }).points, 3);
  });

  test('two from 16 and three from 21 km/h over, from 70', () => {
    assert.equal(calculateFine({ limit: 70, speed: 85 }).points, 0);
    assert.equal(calculateFine({ limit: 70, speed: 86 }).points, 2);
    assert.equal(calculateFine({ limit: 70, speed: 91 }).points, 3);
  });

  test('twice as many in the probation period', () => {
    assert.equal(calculateFine({ limit: 60, speed: 71, probation: true }).points, 4);
    assert.equal(calculateFine({ limit: 70, speed: 91, probation: true }).points, 6);
  });

  test('none when the licence goes, since that takes their place', () => {
    const r = calculateFine({ limit: 50, speed: 76 });
    assert.equal(r.points, 0);
    assert.notEqual(r.licence, null);
  });
});

describe('the licence', () => {
  test('lost for a span of months in each speed band', () => {
    assert.deepEqual(calculateFine({ limit: 50, speed: 76 }).licence, { from: 76, to: 82, minMonths: 3, maxMonths: 6 });
    assert.deepEqual(calculateFine({ limit: 80, speed: 125 }).licence, {
      from: 120,
      to: 130,
      minMonths: 5,
      maxMonths: 8,
    });
  });

  test('where two bands meet at a speed, the first holds', () => {
    assert.deepEqual(calculateFine({ limit: 30, speed: 65 }).licence, { from: 56, to: 65, minMonths: 3, maxMonths: 7 });
  });

  test('above the last band, lost for more than the last band says', () => {
    assert.deepEqual(calculateFine({ limit: 50, speed: 131 }).licence, {
      from: 130,
      to: null,
      minMonths: 36,
      maxMonths: null,
    });
  });

  test('a 90 limit on a motorway and on other roads', () => {
    assert.equal(calculateFine({ limit: 90, speed: 128 }).licence?.minMonths, 3);
    assert.equal(calculateFine({ limit: 90, speed: 128, motorway: true }).licence, null);
  });

  test('which test has to be taken again', () => {
    assert.equal(calculateFine({ limit: 50, speed: 76 }).newTest, 'none');
    assert.equal(calculateFine({ limit: 30, speed: 65 }).newTest, 'practicalIfOverSixMonths');
    assert.equal(calculateFine({ limit: 30, speed: 66 }).newTest, 'practical');
    assert.equal(calculateFine({ limit: 30, speed: 72 }).newTest, 'practicalFullIfAYear');
    assert.equal(calculateFine({ limit: 50, speed: 131 }).newTest, 'full');
    assert.equal(calculateFine({ limit: 50, speed: 76, probation: true }).newTest, 'fullInProbation');
    assert.equal(newTestAfter(6, 12), 'practicalIfOverSixMonthsFullIfAYear');
  });
});

describe('punishment beyond the fine', () => {
  test('community service, then prison, at the highest speeds', () => {
    assert.equal(calculateFine({ limit: 50, speed: 91 }).punishment, null);
    assert.equal(calculateFine({ limit: 50, speed: 92 }).punishment, 'community');
    assert.equal(calculateFine({ limit: 50, speed: 96 }).punishment, 'prison');
  });

  test('not given for every limit', () => {
    assert.equal(calculateFine({ limit: 30, speed: 120 }).punishment, null);
    assert.equal(calculateFine({ limit: 110, speed: 240 }).punishment, null);
  });
});

describe('the roads', () => {
  test('every limit has a road, and 90 has two', () => {
    for (const limit of SPEED_LIMITS) assert.equal(roadFor(limit).limit, limit);
    assert.equal(ROADS.filter((r) => r.limit === 90).length, 2);
    assert.equal(roadFor(90, true).key, '90-motorvei');
  });

  test('an unknown limit or a speed that is not one is refused', () => {
    assert.throws(() => calculateFine({ limit: 45 as never, speed: 60 }), RangeError);
    assert.throws(() => calculateFine({ limit: 50, speed: Number.NaN }), RangeError);
    assert.throws(() => calculateFine({ limit: 50, speed: -1 }), RangeError);
  });
});

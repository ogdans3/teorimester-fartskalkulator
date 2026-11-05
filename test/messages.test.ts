// The words for a result, as the calculator on teorimester.no shows them.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateFine, describeFine, ratesFrom } from '../src/index.ts';

const nbsp = ' ';

test('20 km/h over in a 50 zone, in Norwegian', () => {
  assert.deepEqual(describeFine(calculateFine({ limit: 50, speed: 70 })), {
    headline: '20 km/t for fort',
    fine: `8${nbsp}650 kr`,
    points: '3 prikker',
    licence: 'Du beholder førerkortet',
    punishment: null,
  });
});

test('the same in English', () => {
  assert.deepEqual(describeFine(calculateFine({ limit: 50, speed: 70 }), 'en'), {
    headline: '20 km/h too fast',
    fine: 'NOK 8,650',
    points: '3 penalty points',
    licence: 'You keep your licence',
    punishment: null,
  });
});

test('within the limit, one sentence and nothing else', () => {
  const d = describeFine(calculateFine({ limit: 50, speed: 48 }));
  assert.equal(d.headline, 'Du holder fartsgrensen, og da blir det ingen bot.');
  assert.equal(d.fine, null);
  assert.equal(d.licence, null);
});

test('losing the licence says for how long, that it can be taken, and what to take again', () => {
  const d = describeFine(calculateFine({ limit: 50, speed: 92 }));
  assert.equal(d.fine, 'For fort for forenklet forelegg. Saken går videre som et vanlig forelegg eller i retten, og boten blir høyere.');
  assert.equal(d.points, 'Ingen, fordi du mister førerretten i stedet');
  assert.equal(
    d.licence,
    'Du mister normalt førerretten i 9 til 12 måneder. Politiet kan ta førerkortet ditt på stedet. ' +
      'Du må ta ny praktisk prøve, og blir tapet 1 år eller mer, hele førerprøven.',
  );
  assert.equal(d.punishment, 'Utgangspunktet er samfunnsstraff');
});

test('above the last band, «mer enn»', () => {
  const d = describeFine(calculateFine({ limit: 50, speed: 140 }));
  assert.match(d.licence ?? '', /^Du mister normalt førerretten i mer enn 36 måneder\./);
  assert.equal(d.punishment, 'Utgangspunktet er ubetinget fengsel');
});

test('the date the rates are from', () => {
  assert.equal(ratesFrom(), 'Bøtesatser fra 15. februar 2026');
  assert.equal(ratesFrom('en'), 'Fines from 15 February 2026');
});

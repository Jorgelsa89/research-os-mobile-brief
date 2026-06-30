// Tests de la definicion de tiers (gating de features)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIERS, can, canUseSkill } from '../monetize/tiers.mjs';

test('free existe con 3 skills', () => {
  assert.deepEqual(TIERS.free.skills, ['research', 'trading', 'daily']);
  assert.equal(TIERS.free.maxSkills, 3);
});

test('pro desbloquea todo', () => {
  assert.equal(TIERS.pro.skills, 'all');
  assert.ok(TIERS.pro.connectors && TIERS.pro.skillCreator && TIERS.pro.trainer);
});

test('can(): free no tiene conectores, pro si', () => {
  assert.equal(can('free', 'connectors'), false);
  assert.equal(can('pro', 'connectors'), true);
});

test('can(): tier desconocido cae a free', () => {
  assert.equal(can('inventado', 'connectors'), false);
});

test('canUseSkill(): free solo sus 3, pro cualquiera', () => {
  assert.ok(canUseSkill('free', 'research'));
  assert.ok(!canUseSkill('free', 'finance'));
  assert.ok(canUseSkill('pro', 'finance'));
  assert.ok(canUseSkill('team', 'legal'));
});

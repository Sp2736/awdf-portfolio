import assert from 'node:assert/strict';
import test from 'node:test';
import { getApiBase } from '../src/utils/api-base.js';

test('uses the local API URL when no base is configured', () => {
  assert.equal(getApiBase(undefined), 'http://localhost:5000');
});

test('uses the configured API base for deployed environments', () => {
  assert.equal(getApiBase('/api'), '/api');
});

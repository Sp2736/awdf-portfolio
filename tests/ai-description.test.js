import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFallbackDescription,
  extractGeminiDescription,
  generateTaskDescription
} from '../src/utils/ai-description.js';

test('builds a useful fallback description from the task title', () => {
  assert.equal(
    buildFallbackDescription('  Prepare release notes  '),
    'Complete "Prepare release notes" and verify the result.'
  );
});

test('extracts generated text from Gemini response parts', () => {
  assert.equal(
    extractGeminiDescription({
      candidates: [{ content: { parts: [{ text: 'Draft the update.' }, { text: 'Review it.' }] } }]
    }),
    'Draft the update.\nReview it.'
  );
});

test('rejects an empty Gemini response so the API can use its fallback', () => {
  assert.throws(() => extractGeminiDescription({ candidates: [] }), /no description/);
});

test('returns an editable fallback when the Gemini key is missing', async () => {
  let fetchCalled = false;
  const result = await generateTaskDescription('Write tests', {
    fetchImpl: async () => {
      fetchCalled = true;
      throw new Error('should not request Gemini without a key');
    }
  });

  assert.equal(fetchCalled, false);
  assert.equal(result.fallback, true);
  assert.equal(result.description, 'Complete "Write tests" and verify the result.');
});

test('returns generated text from Gemini on success', async () => {
  const result = await generateTaskDescription('Write tests', {
    apiKey: 'test-key',
    fetchImpl: async (url, options) => {
      assert.match(url, /gemini-3\.1-flash-lite:generateContent$/);
      assert.equal(options.headers['x-goog-api-key'], 'test-key');
      return {
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Add unit tests and run them.' }] } }]
        })
      };
    }
  });

  assert.deepEqual(result, {
    description: 'Add unit tests and run them.',
    fallback: false
  });
});

test('returns a fallback when Gemini fails', async () => {
  const result = await generateTaskDescription('Write tests', {
    apiKey: 'test-key',
    fetchImpl: async () => {
      throw new Error('request timed out');
    }
  });

  assert.equal(result.fallback, true);
  assert.equal(result.description, 'Complete "Write tests" and verify the result.');
  assert.equal(result.reason, 'request timed out');
});

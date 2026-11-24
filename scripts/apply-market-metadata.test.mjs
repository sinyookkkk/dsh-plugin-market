import assert from 'node:assert/strict'
import test from 'node:test'
import { applyMarketMetadata, MarketMetadataError } from './apply-market-metadata.mjs'

function baseIndex() {
  return {
    format: 1,
    title: { en: 'Test Market', zh: '测试市场' },
    metadata: { sortKeys: { stars: { title: { en: 'Stars' }, order: 'desc' } } },
    plugins: [
      { name: 'alpha', metadata: { keywords: ['a'], sortKeys: { stars: 3 } }, versions: [{ version: '1.0.0' }] },
      { name: 'beta', metadata: { keywords: ['b'] }, versions: [{ version: '1.0.0' }] },
      { name: 'gamma', versions: [{ version: '1.0.0' }] },
    ],
  }
}

function baseConfig() {
  return {
    categories: {
      essentials: { title: { en: 'Essentials', zh: '必备' } },
      capabilities: { title: { en: 'Capabilities', zh: '能力' } },
      other: { title: { en: 'Other', zh: '其他' } },
    },
    labels: { vision: { title: { en: 'Vision', zh: '视觉' } } },
    otherAllow: ['gamma'],
    plugins: {
      alpha: { category: 'essentials' },
      beta: { category: 'capabilities', labels: ['vision'] },
      gamma: { category: 'other' },
    },
  }
}

test('injects categories and labels while preserving existing metadata', () => {
  const { index, counts, warnings } = applyMarketMetadata(baseIndex(), baseConfig())
  assert.deepEqual(counts, { essentials: 1, capabilities: 1, other: 1 })
  assert.deepEqual(warnings, [])
  assert.deepEqual(index.metadata.sortKeys, { stars: { title: { en: 'Stars' }, order: 'desc' } })
  assert.equal(index.metadata.categories.essentials.title.zh, '必备')
  assert.deepEqual(index.plugins[0].metadata, { keywords: ['a'], sortKeys: { stars: 3 }, category: 'essentials', labels: [] })
  assert.deepEqual(index.plugins[1].metadata, { keywords: ['b'], category: 'capabilities', labels: ['vision'] })
  assert.equal(index.plugins[2].metadata.category, 'other')
})

test('fails when a plugin has no mapping', () => {
  const config = baseConfig()
  delete config.plugins.beta
  assert.throws(() => applyMarketMetadata(baseIndex(), config), /beta/)
})

test('fails when a plugin uses an undeclared category', () => {
  const config = baseConfig()
  config.plugins.alpha.category = 'missing'
  assert.throws(() => applyMarketMetadata(baseIndex(), config), /undeclared category "missing"/)
})

test('fails when a plugin uses an undeclared label', () => {
  const config = baseConfig()
  config.plugins.beta.labels = ['missing']
  assert.throws(() => applyMarketMetadata(baseIndex(), config), /undeclared label "missing"/)
})

test('fails when a non-whitelisted plugin uses other', () => {
  const config = baseConfig()
  config.otherAllow = []
  assert.throws(() => applyMarketMetadata(baseIndex(), config), /gamma uses "other"/)
})

test('fails when a non-other category is empty', () => {
  const config = baseConfig()
  config.plugins.beta.category = 'essentials'
  assert.throws(() => applyMarketMetadata(baseIndex(), config), /category "capabilities" has no plugins/)
})

test('warns about stale mappings without failing', () => {
  const config = baseConfig()
  config.plugins.removed = { category: 'essentials' }
  config.otherAllow.push('removed-too')
  const { warnings } = applyMarketMetadata(baseIndex(), config)
  assert.ok(warnings.some(message => message.includes('stale mapping: removed')))
  assert.ok(warnings.some(message => message.includes('stale otherAllow entry: removed-too')))
})

test('warns when otherAllow lists a plugin mapped elsewhere', () => {
  const config = baseConfig()
  config.otherAllow.push('alpha')
  const { warnings } = applyMarketMetadata(baseIndex(), config)
  assert.ok(warnings.some(message => message.includes('otherAllow lists alpha')))
})

test('is deterministic for the same input', () => {
  const first = applyMarketMetadata(baseIndex(), baseConfig()).index
  const second = applyMarketMetadata(baseIndex(), baseConfig()).index
  assert.equal(JSON.stringify(first, null, 2), JSON.stringify(second, null, 2))
})

test('rejects a malformed mapping file', () => {
  assert.throws(() => applyMarketMetadata(baseIndex(), { categories: {}, labels: {}, plugins: {}, otherAllow: 'x' }), /otherAllow/)
  assert.throws(() => applyMarketMetadata(baseIndex(), { categories: { a: { title: {} } }, labels: {}, plugins: {}, otherAllow: [] }), /non-empty "en"/)
})

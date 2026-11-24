#!/usr/bin/env node
/**
 * Inject the market's category and label metadata into a generated index.
 *
 * The generator owns the plugin list and versions; this script owns only the
 * market-defined metadata. It refuses to publish an index with an unmapped
 * plugin, an undeclared id, a non-whitelisted "other", or an empty non-other
 * category.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** A data error that should stop the build (exit 1). */
export class MarketMetadataError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MarketMetadataError'
  }
}

/** An input/argument error (exit 2). */
export class MarketInputError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MarketInputError'
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertRecord(value, label) {
  if (!isRecord(value)) throw new MarketInputError(`${label} must be an object`)
}

function assertLocalizedTitle(value, label) {
  if (!isRecord(value) || typeof value.en !== 'string' || value.en.trim() === '') {
    throw new MarketInputError(`${label} must carry a non-empty "en" title`)
  }
}

/**
 * Validate the mapping file's own shape before looking at the index.
 * @param {unknown} config
 * @returns {{ categories: Record<string, { title: Record<string, string> }>, labels: Record<string, { title: Record<string, string> }>, plugins: Record<string, { category: string, labels?: string[] }>, otherAllow: string[] }}
 */
export function validateConfig(config) {
  assertRecord(config, 'categories.json')
  assertRecord(config.categories, 'categories')
  assertRecord(config.labels, 'labels')
  assertRecord(config.plugins, 'plugins')
  if (!Array.isArray(config.otherAllow)) throw new MarketInputError('otherAllow must be an array of package names')
  for (const [id, declaration] of Object.entries(config.categories)) {
    if (id.trim() === '') throw new MarketInputError('category id must not be blank')
    assertRecord(declaration, `category "${id}"`)
    assertLocalizedTitle(declaration.title, `category "${id}".title`)
  }
  for (const [id, declaration] of Object.entries(config.labels)) {
    if (id.trim() === '') throw new MarketInputError('label id must not be blank')
    assertRecord(declaration, `label "${id}"`)
    assertLocalizedTitle(declaration.title, `label "${id}".title`)
  }
  for (const name of config.otherAllow) {
    if (typeof name !== 'string' || name.trim() === '') throw new MarketInputError('otherAllow entries must be non-empty strings')
  }
  for (const [name, mapping] of Object.entries(config.plugins)) {
    if (name.trim() === '') throw new MarketInputError('plugin mapping name must not be blank')
    assertRecord(mapping, `plugins["${name}"]`)
    if (typeof mapping.category !== 'string' || mapping.category === '') {
      throw new MarketInputError(`plugins["${name}"].category must be a non-empty string`)
    }
    if (mapping.labels !== undefined) {
      if (!Array.isArray(mapping.labels) || mapping.labels.some(label => typeof label !== 'string' || label === '')) {
        throw new MarketInputError(`plugins["${name}"].labels must be an array of non-empty strings`)
      }
    }
  }
  return config
}

/**
 * Apply the market metadata to a parsed index.
 * @param {any} index
 * @param {unknown} rawConfig
 * @returns {{ index: any, warnings: string[], counts: Record<string, number> }}
 */
export function applyMarketMetadata(index, rawConfig) {
  const config = validateConfig(rawConfig)
  if (!isRecord(index) || !Array.isArray(index.plugins)) throw new MarketInputError('index.plugins must be an array')

  const names = new Set()
  for (const plugin of index.plugins) {
    if (!isRecord(plugin) || typeof plugin.name !== 'string' || plugin.name === '') {
      throw new MarketInputError('every index plugin must have a non-empty name')
    }
    if (names.has(plugin.name)) throw new MarketInputError(`duplicate plugin name in index: ${plugin.name}`)
    names.add(plugin.name)
  }

  const missing = [...names].filter(name => !Object.hasOwn(config.plugins, name))
  if (missing.length > 0) {
    throw new MarketMetadataError(`plugins without a category mapping: ${missing.join(', ')}`)
  }

  const declaredCategories = Object.keys(config.categories)
  const counts = Object.fromEntries(declaredCategories.map(id => [id, 0]))
  for (const plugin of index.plugins) {
    const mapping = config.plugins[plugin.name]
    if (!Object.hasOwn(config.categories, mapping.category)) {
      throw new MarketMetadataError(`${plugin.name} uses undeclared category "${mapping.category}"`)
    }
    if (mapping.category === 'other' && !config.otherAllow.includes(plugin.name)) {
      throw new MarketMetadataError(`${plugin.name} uses "other" but is not in otherAllow`)
    }
    for (const label of mapping.labels ?? []) {
      if (!Object.hasOwn(config.labels, label)) {
        throw new MarketMetadataError(`${plugin.name} uses undeclared label "${label}"`)
      }
    }
    counts[mapping.category] += 1
  }

  for (const id of declaredCategories) {
    if (id !== 'other' && counts[id] === 0) {
      throw new MarketMetadataError(`category "${id}" has no plugins`)
    }
  }

  const warnings = []
  for (const name of Object.keys(config.plugins)) {
    if (!names.has(name)) warnings.push(`stale mapping: ${name} is not in the index`)
  }
  for (const name of config.otherAllow) {
    if (!names.has(name)) warnings.push(`stale otherAllow entry: ${name} is not in the index`)
  }
  for (const [name, mapping] of Object.entries(config.plugins)) {
    if (names.has(name) && mapping.category !== 'other' && config.otherAllow.includes(name)) {
      warnings.push(`otherAllow lists ${name}, but the plugin maps to "${mapping.category}"`)
    }
  }

  const metadata = {
    ...(isRecord(index.metadata) ? index.metadata : {}),
    categories: config.categories,
    labels: config.labels,
  }
  const plugins = index.plugins.map(plugin => {
    const mapping = config.plugins[plugin.name]
    return {
      ...plugin,
      metadata: {
        ...(isRecord(plugin.metadata) ? plugin.metadata : {}),
        category: mapping.category,
        labels: [...(mapping.labels ?? [])],
      },
    }
  })

  return { index: { ...index, metadata, plugins }, warnings, counts }
}

/**
 * Read the two files, apply the metadata, and write only when the bytes change.
 * @param {string[]} argv
 * @returns {number} process exit status
 */
export function main(argv) {
  const [indexPath, configPath, ...extra] = argv
  if (indexPath === undefined || configPath === undefined || extra.length > 0) {
    console.error('usage: node scripts/apply-market-metadata.mjs <index.json> <categories.json>')
    return 2
  }
  let index
  let config
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf8'))
    config = JSON.parse(readFileSync(configPath, 'utf8'))
  } catch (error) {
    console.error(`cannot read input: ${error instanceof Error ? error.message : String(error)}`)
    return 2
  }
  let result
  try {
    result = applyMarketMetadata(index, config)
  } catch (error) {
    if (error instanceof MarketInputError) {
      console.error(error.message)
      return 2
    }
    if (error instanceof MarketMetadataError) {
      console.error(error.message)
      return 1
    }
    throw error
  }
  for (const warning of result.warnings) console.error(`warning: ${warning}`)
  const text = `${JSON.stringify(result.index, null, 2)}\n`
  const previous = readFileSync(indexPath, 'utf8')
  if (text !== previous) writeFileSync(indexPath, text)
  const counts = Object.entries(result.counts).map(([id, count]) => `${id}=${String(count)}`).join(' ')
  console.log(`${text === previous ? 'unchanged' : 'wrote'} ${indexPath}: ${String(result.index.plugins.length)} plugin(s); ${counts}`)
  return 0
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2))
}

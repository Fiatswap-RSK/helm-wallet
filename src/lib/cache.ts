import { Wallet } from '../providers/wallet'
import { NewAddress, generateAddress } from './address'
import { ChainSource, ElectrumBlockHeader, ElectrumHistory, ElectrumTransaction } from './chainsource'
import { readCacheFromStorage, saveCacheToStorage } from './storage'

export interface CacheInfo {
  blockHeaders: ElectrumBlockHeader[]
  electrumTxs: ElectrumTransaction[]
  txHexas: { txid: string; hex: string }[]
}

export const defaultCache: CacheInfo = {
  blockHeaders: [],
  electrumTxs: [],
  txHexas: [],
}

let cacheInMemory: CacheInfo = defaultCache

export const getCache = (): CacheInfo => {
  if (cacheInMemory.blockHeaders.length > 0) return cacheInMemory
  const cache = readCacheFromStorage() ?? defaultCache
  for (const key of Object.keys(defaultCache)) {
    if (!cache[key as keyof CacheInfo]) cache[key as keyof CacheInfo] = []
  }
  cacheInMemory = cache
  return cache
}

export const updateCache = (cache: CacheInfo) => {
  const onlyConfirmedTxs = cache.electrumTxs.filter((tx) => tx.height > 1)
  cacheInMemory = { ...cache, electrumTxs: onlyConfirmedTxs }
  return saveCacheToStorage(cacheInMemory)
}

export const cleanCache = () => saveCacheToStorage(defaultCache)

/** safe cache (never changes) */
export const getCachedBlockHeader = async (height: number, chainSource: ChainSource) => {
  const cache = getCache()
  const inCache = cache.blockHeaders.find((bh) => bh.height === height)
  if (inCache) return inCache
  const bh = await chainSource.fetchBlockHeader(height)
  cache.blockHeaders.push(bh)
  updateCache(cache)
  return bh
}

export interface AddressesHistory {
  address: NewAddress
  history: ElectrumHistory[]
}

/** Dangerous cache (updates often) */
export const getCachedElectrumHistories = async (
  chainSource: ChainSource,
  wallet: Wallet,
): Promise<{ histories: AddressesHistory[]; numTxs: number }> => {
  const { gapLimit } = wallet
  const uniqueTxHashes = new Set()
  let emptyAddrInARow = 0
  let histories: AddressesHistory[] = []
  let index = 0

  while (emptyAddrInARow < gapLimit) {
    // generate address
    const address = await generateAddress(wallet, index)
    if (!address.address || !address.blindingKeys) throw new Error('Could not generate new address')
    // get address history
    const history = await chainSource.fetchHistories([address.script])
    // push to return object
    if (history.length > 0) {
      histories.push({ address, history })
      history.map((h) => uniqueTxHashes.add(h.tx_hash))
    }
    // update emptyAddrInARow and index
    emptyAddrInARow = history.length === 0 ? emptyAddrInARow + 1 : 0
    index += 1
  }

  return { histories, numTxs: uniqueTxHashes.size }
}

/**
 * finds hex and height for a given txid
 *
 * safe cache (never changes)
 * a txid (aka tx_hash) has always the same hex and height (after confirmation)
 * {
 *   height: number
 *   hex: string
 *   tx_hash: string
 * }
 */
export const getCachedElectrumTransactions = async (
  histories: ElectrumHistory[],
  chainSource: ChainSource,
): Promise<ElectrumTransaction[]> => {
  const cache = getCache()
  const historiesToFetch: ElectrumHistory[] = []
  const transactions: ElectrumTransaction[] = []
  const getTxFromCache = (txid: string) => cache.electrumTxs.find((t) => t.tx_hash === txid)
  const getHexFromCache = (txid: string) => cache.txHexas.find((t) => t.txid === txid)
  for (const h of histories) {
    const inCache = getTxFromCache(h.tx_hash)
    if (inCache) transactions.push(inCache)
    else historiesToFetch.push(h)
  }
  if (historiesToFetch) {
    for (const tx of await chainSource.fetchTransactions(historiesToFetch)) {
      transactions.push(tx)
      if (!getTxFromCache(tx.tx_hash)) cache.electrumTxs.push(tx)
      if (!getHexFromCache(tx.tx_hash)) cache.txHexas.push({ hex: tx.hex, txid: tx.tx_hash })
    }
  }
  updateCache(cache)
  return transactions
}

/** safe cache (never changes) */
export const getCachedTransaction = async (txid: string, chainSource: ChainSource): Promise<string> => {
  const cache = getCache()
  const inCache = cache.txHexas.find((tx) => tx.txid === txid)
  if (inCache) return inCache.hex
  const hex = await chainSource.fetchSingleTransaction(txid)
  cache.txHexas.push({ txid, hex })
  updateCache(cache)
  return hex
}

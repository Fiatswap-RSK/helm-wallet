import { Config } from '../providers/config'
import { NetworkName } from './networks'

export enum ExplorerName {
  Blockstream = 'Blockstream',
  Mempool = 'Mempool',
  Nigiri = 'Nigiri',
}

export interface ExplorerURLs {
  webExplorerURL: string
  websocketExplorerURL: string // ws:// or wss:// endpoint
}

export interface Explorer {
  name: ExplorerName
  [NetworkName.Liquid]?: ExplorerURLs
  [NetworkName.Testnet]?: ExplorerURLs
  [NetworkName.Regtest]?: ExplorerURLs
}

const explorers: Explorer[] = [
  {
    name: ExplorerName.Blockstream,
    [NetworkName.Liquid]: {
      webExplorerURL: 'https://blockstream.info/liquid',
      websocketExplorerURL: 'wss://blockstream.info/liquid/electrum-websocket/api',
    },
    [NetworkName.Testnet]: {
      webExplorerURL: 'https://blockstream.info/liquidtestnet',
      websocketExplorerURL: 'wss://blockstream.info/liquidtestnet/electrum-websocket/api',
    },
  },
  {
    name: ExplorerName.Mempool,
    [NetworkName.Liquid]: {
      webExplorerURL: 'https://liquid.network',
      websocketExplorerURL: 'wss://esplora.blockstream.com/liquid/electrum-websocket/api',
    },
    [NetworkName.Testnet]: {
      webExplorerURL: 'https://liquid.network/testnet',
      websocketExplorerURL: 'wss://esplora.blockstream.com/liquidtestnet/electrum-websocket/api',
    },
  },
  {
    name: ExplorerName.Nigiri,
    [NetworkName.Regtest]: {
      webExplorerURL: 'http://localhost:5001',
      websocketExplorerURL: 'ws://127.0.0.1:1234',
    },
  },
]

export const explorerNames = ({ network }: Config) => explorers.filter((e: any) => e[network]).map((e) => e.name)

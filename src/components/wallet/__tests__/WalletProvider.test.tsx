import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WalletProvider, useWallet } from '../WalletProvider'

// Mock useFreighter to avoid real Stellar SDK calls
vi.mock('../../hooks/useFreighter', () => ({
  useFreighter: () => ({
    wallet: null,
    isConnecting: false,
    isConnected: false,
    isFreighterInstalled: false,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    refreshBalance: vi.fn(),
  }),
}))

function TestConsumer() {
  const { wallet, isConnected } = useWallet()
  return (
    <div>
      <span data-testid="connected">{String(isConnected)}</span>
      <span data-testid="wallet">{wallet ? wallet.address : 'none'}</span>
    </div>
  )
}

describe('WalletProvider', () => {
  it('renders children without crashing', () => {
    render(
      <WalletProvider>
        <div>child content</div>
      </WalletProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('provides default state: not connected, no wallet', () => {
    render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    )
    expect(screen.getByTestId('connected')).toHaveTextContent('false')
    expect(screen.getByTestId('wallet')).toHaveTextContent('none')
  })
})

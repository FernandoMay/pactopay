import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../App'

// Mock useFreighter to avoid Stellar SDK dependency in tests
vi.mock('../hooks/useFreighter', () => ({
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

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('App routing', () => {
  it('renders landing page at /', async () => {
    renderAt('/')
    await waitFor(() => {
      expect(screen.getByText(/Cobra tus contratos al exterior/)).toBeInTheDocument()
    })
  })

  it('renders 404 for unknown routes', async () => {
    renderAt('/no-existe-esta-ruta')
    await waitFor(() => {
      expect(screen.getByText(/404/)).toBeInTheDocument()
    })
  })

  it('navigation links work', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await waitFor(() => {
      expect(screen.getByText(/Cobra tus contratos al exterior/)).toBeInTheDocument()
    })

    // Click the CTA that links to /crear-factura
    const link = screen.getByText('Crear Factura Segura Gratis')
    await user.click(link)

    await waitFor(() => {
      expect(screen.getByText('Crear Factura Inteligente con Custodia')).toBeInTheDocument()
    })
  })
})

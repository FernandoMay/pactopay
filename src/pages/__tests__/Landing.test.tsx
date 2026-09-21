import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from '../Landing'

function renderLanding() {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  )
}

describe('Landing page', () => {
  it('renders with default amount of 2,500', () => {
    renderLanding()
    expect(screen.getByText('2,500')).toBeInTheDocument()
  })

  it('calculator updates when slider changes', () => {
    renderLanding()

    const slider = screen.getByRole('slider') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '5000' } })

    // After changing, the display should show 5,000
    expect(screen.getByText('5,000')).toBeInTheDocument()
  })

  it('shows SWIFT vs PactoPay comparison', () => {
    renderLanding()
    expect(screen.getByText(/Banca Tradicional \/ SWIFT/)).toBeInTheDocument()
    expect(screen.getByText(/PactoPay \(Custodia\)/)).toBeInTheDocument()
  })

  it('renders hero section with CTA links', () => {
    renderLanding()
    expect(screen.getByText('Crear Factura Segura Gratis')).toBeInTheDocument()
    expect(screen.getByText('Ver Demo de Pago')).toBeInTheDocument()
  })
})

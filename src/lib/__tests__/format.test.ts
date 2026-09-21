import { describe, it, expect } from 'vitest'
import {
  formatLatamCurrency,
  calculateFees,
  getLocalEstimates,
  generateInvoiceId,
  generatePaymentLink,
} from '../format'

describe('formatLatamCurrency', () => {
  it('formats a small USD amount with proper locale', () => {
    expect(formatLatamCurrency(2500)).toBe('$ 2.500,00 USDC')
  })

  it('formats zero correctly', () => {
    expect(formatLatamCurrency(0)).toBe('$ 0,00 USDC')
  })

  it('accepts a custom currency label', () => {
    expect(formatLatamCurrency(100, 'USDT')).toBe('$ 100,00 USDT')
  })

  it('formats large amounts with thousand separators', () => {
    expect(formatLatamCurrency(125000)).toBe('$ 125.000,00 USDC')
  })
})

describe('calculateFees', () => {
  it('returns correct 0.5% fee for a standard amount', () => {
    const result = calculateFees(1000)
    expect(result.gross).toBe(1000)
    expect(result.fee).toBeCloseTo(5)
    expect(result.net).toBeCloseTo(995)
  })

  it('returns zero fee for zero amount', () => {
    const result = calculateFees(0)
    expect(result.fee).toBe(0)
    expect(result.net).toBe(0)
  })

  it('allows custom fee percentage', () => {
    const result = calculateFees(1000, 0.01)
    expect(result.fee).toBeCloseTo(10)
    expect(result.net).toBeCloseTo(990)
  })
})

describe('getLocalEstimates', () => {
  it('returns ARS, MXN, and COP estimates for a given USDC amount', () => {
    const estimates = getLocalEstimates(1)
    // ARS ~1220, MXN ~20.5, COP ~4200
    expect(estimates.ars).toBeDefined()
    expect(estimates.mxn).toBeDefined()
    expect(estimates.cop).toBeDefined()
  })

  it('scales estimates linearly', () => {
    const one = getLocalEstimates(1)
    const two = getLocalEstimates(2)
    // toLocaleString may add commas so parse the numeric result
    const parse = (s: string) => Number(s.replace(/[^0-9]/g, ''))
    expect(parse(two.ars)).toBeCloseTo(parse(one.ars) * 2, -2)
    expect(parse(two.mxn)).toBeCloseTo(parse(one.mxn) * 2, -1)
    expect(parse(two.cop)).toBeCloseTo(parse(one.cop) * 2, -2)
  })
})

describe('generateInvoiceId', () => {
  it('returns a string starting with INV-', () => {
    const id = generateInvoiceId()
    expect(id).toMatch(/^INV-\d{4}-\d{4}$/)
  })
})

describe('generatePaymentLink', () => {
  it('returns a URL containing pactopay.lat', () => {
    const link = generatePaymentLink()
    expect(link).toMatch(/^https:\/\/pactopay\.lat\/pagar\/inv_/)
  })
})

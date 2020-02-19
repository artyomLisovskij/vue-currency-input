import { DEFAULT_OPTIONS, parseCurrency, setValue } from '../../src/api'
import CurrencyFormat from '../../src/currencyFormat'
import dispatchEvent from '../../src/utils/dispatchEvent'

jest.mock('../../src/currencyFormat')
jest.mock('../../src/utils/dispatchEvent')

describe('parseCurrency', () => {
  it('delegates to the internal parse method with the expected arguments', () => {
    const formattedValue = '$1,234.50'
    const locale = 'en'
    const currency = 'USD'

    parseCurrency(formattedValue, { locale, currency })

    expect(CurrencyFormat).toHaveBeenCalledWith({ ...DEFAULT_OPTIONS, locale, currency })
    expect(CurrencyFormat.mock.instances[0].parse).toHaveBeenCalledWith(formattedValue, false)
  })
})

describe('setValue', () => {
  it('dispatches a format event on the given input', () => {
    const el = document.createElement('input')

    setValue(el, 1234)

    expect(dispatchEvent).toHaveBeenCalledWith(el, 'format', { value: 1234 })
  })
})

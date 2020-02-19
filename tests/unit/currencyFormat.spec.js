import CurrencyFormat from '../../src/currencyFormat'

describe('CurrencyFormat', () => {
  describe('i18n', () => {
    it('de-DE_EUR', () => {
      expect(new CurrencyFormat({ locale: 'de-DE', currency: 'EUR' })).toMatchSnapshot()
    })

    it('es-ES_EUR', () => {
      expect(new CurrencyFormat({ locale: 'es-ES', currency: 'EUR' })).toMatchSnapshot()
    })

    it('nl-NL_EUR', () => {
      expect(new CurrencyFormat({ locale: 'nl-NL', currency: 'EUR' })).toMatchSnapshot()
    })

    it('en-US_USD', () => {
      expect(new CurrencyFormat({ locale: 'en-US', currency: 'USD' })).toMatchSnapshot()
    })

    it('zh_CNY', () => {
      expect(new CurrencyFormat({ locale: 'zh', currency: 'CNY' })).toMatchSnapshot()
    })

    it('en-GB_GBP', () => {
      expect(new CurrencyFormat({ locale: 'en-GB', currency: 'GBP' })).toMatchSnapshot()
    })

    it('en-IN_INR', () => {
      expect(new CurrencyFormat({ locale: 'en-GB', currency: 'INR' })).toMatchSnapshot()
    })

    it('pt_BRL', () => {
      expect(new CurrencyFormat({ locale: 'pt', currency: 'BRL' })).toMatchSnapshot()
    })

    it('ja_JPY', () => {
      expect(new CurrencyFormat({ locale: 'ja', currency: 'JPY' })).toMatchSnapshot()
    })
  })

  it('custom prefix/suffix', () => {
    expect(new CurrencyFormat({ locale: 'de-DE', currency: { prefix: '₿ ' } })).toMatchSnapshot()
    expect(new CurrencyFormat({ locale: 'de-DE', currency: { suffix: ' Euro' } })).toMatchSnapshot()
    expect(new CurrencyFormat({ locale: 'de-DE', currency: null })).toMatchSnapshot()
  })

  it('custom precision', () => {
    expect(new CurrencyFormat({ locale: 'de-DE', currency: 'EUR', precision: 0 })).toMatchSnapshot()
    expect(new CurrencyFormat({ locale: 'de-DE', currency: 'EUR', precision: { min: 0, max: 0 } })).toMatchSnapshot()
    expect(new CurrencyFormat({ locale: 'de-DE', currency: null, precision: { min: 0, max: 2 } })).toMatchSnapshot()
    expect(new CurrencyFormat({ locale: 'de-DE', currency: { suffix: ' €' }, precision: { min: 0, max: 2 } })).toMatchSnapshot()
    expect(new CurrencyFormat({ locale: 'ja', currency: 'JPY', precision: { min: 2, max: 2 } })).toMatchSnapshot()
  })

  describe('parse', () => {
    it('returns null if the value is empty', () => {
      expect(new CurrencyFormat({}).parse('')).toBeNull()
      expect(new CurrencyFormat({}).parse(' ')).toBeNull()
    })

    it('returns null if the value is invalid', () => {
      expect(new CurrencyFormat({ locale: 'en' }).parse('-')).toBeNull()
      expect(new CurrencyFormat({ locale: 'en' }).parse('123e-1')).toBeNull()
      expect(new CurrencyFormat({ locale: 'en' }).parse('0x11')).toBeNull()
      expect(new CurrencyFormat({ locale: 'en' }).parse('0b11')).toBeNull()
      expect(new CurrencyFormat({ locale: 'en' }).parse('0o11')).toBeNull()
      expect(new CurrencyFormat({ locale: 'en' }).parse('1.2e1')).toBeNull()
      expect(new CurrencyFormat({ locale: 'en' }).parse('1.23.4')).toBeNull()
    })

    it('returns the parsed number if the value conforms to the currency format config', () => {
      expect(new CurrencyFormat({ locale: 'en' }).parse('1234')).toBe(1234)
      expect(new CurrencyFormat({ locale: 'en', precision: 3 }).parse('1234', true)).toBe(1234000)
      expect(new CurrencyFormat({ locale: 'en' }).parse('1,234,567')).toBe(1234567)
      expect(new CurrencyFormat({ locale: 'en' }).parse('-1,234,567')).toBe(-1234567)
      expect(new CurrencyFormat({ locale: 'en' }).parse('−1,234,567')).toBe(-1234567)
      expect(new CurrencyFormat({ locale: 'de' }).parse('−1234567,89')).toBe(-1234567.89)
      expect(new CurrencyFormat({ locale: 'en', currency: 'USD' }).parse('$1,234,567')).toBe(1234567)
      expect(new CurrencyFormat({ locale: 'de', currency: 'EUR' }).parse('1234 €')).toBe(1234)
      expect(new CurrencyFormat({ locale: 'en' }).parse('-1234')).toBe(-1234)
      expect(new CurrencyFormat({ locale: 'en', currency: 'USD' }).parse('-$1234')).toBe(-1234)
      expect(new CurrencyFormat({ locale: 'de', currency: 'EUR' }).parse('-1234 €')).toBe(-1234)
      expect(new CurrencyFormat({ locale: 'ja', currency: 'JPY' }).parse('￥123,456')).toBe(123456)
      expect(new CurrencyFormat({ locale: 'en' }).parse('.5')).toBe(null)
      expect(new CurrencyFormat({ locale: 'en' }).parse('0.5')).toBe(0.5)
      expect(new CurrencyFormat({ locale: 'en' }).parse('1234.50')).toBe(1234.5)
      expect(new CurrencyFormat({ locale: 'en' }).parse('1234.00')).toBe(1234)
      expect(new CurrencyFormat({ locale: 'en', currency: 'USD' }).parse('$1,234.50')).toBe(1234.5)
      expect(new CurrencyFormat({ locale: 'en', currency: 'USD' }).parse('$1,234.50', true)).toBe(123450)
      expect(new CurrencyFormat({ locale: 'de', currency: 'EUR' }).parse('1.234,50 €')).toBe(1234.5)
    })

    it('returns null if the value does not conform to the currency format config', () => {
      expect(new CurrencyFormat({ locale: 'en' }).parse('1234,5')).toBeNull()
      expect(new CurrencyFormat({ locale: 'de' }).parse('1,234,567.89')).toBeNull()
      expect(new CurrencyFormat({ locale: 'de', currency: 'EUR' }).parse('$1234')).toBeNull()
      expect(new CurrencyFormat({ locale: 'en', currency: 'USD' }).parse('1234 €')).toBeNull()
    })
  })
})

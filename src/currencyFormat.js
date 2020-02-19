import { toInteger } from './utils/numberUtils'
import { isNumber, normalizeMinusSymbol, onlyDigits, stripCurrencySymbol } from './utils/stringUtils'

export default class CurrencyFormat {
  constructor (options) {
    const { currency, locale, precision, autoDecimalMode, valueAsInteger } = options
    if (typeof precision === 'number') {
      this.minimumFractionDigits = this.maximumFractionDigits = precision
    } else if (typeof precision === 'object' && !autoDecimalMode && !valueAsInteger) {
      this.minimumFractionDigits = precision.min || 0
      this.maximumFractionDigits = precision.max !== undefined ? precision.max : 20
    } else {
      this.minimumFractionDigits = this.maximumFractionDigits = 2
    }
    let numberFormat
    if (typeof currency === 'string') {
      numberFormat = new Intl.NumberFormat(locale, { currency, style: 'currency' })
      const { maximumFractionDigits, minimumFractionDigits } = numberFormat.resolvedOptions()
      if (!minimumFractionDigits) {
        this.minimumFractionDigits = this.maximumFractionDigits = 0
      } else if (precision === undefined) {
        this.minimumFractionDigits = minimumFractionDigits
        this.maximumFractionDigits = maximumFractionDigits
      }
    } else {
      numberFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 })
    }

    const ps = numberFormat.format(123456)
    const hasFractionDigits = (ps.match(/0/g) || []).length > 0
    this.decimalSymbol = hasFractionDigits ? ps.substr(ps.indexOf('6') + 1, 1) : undefined
    this.groupingSymbol = ps.substr(ps.indexOf('3') + 1, 1)
    this.minusSymbol = new Intl.NumberFormat(locale).format(-1).charAt(0)

    if (currency == null) {
      this.prefix = this.suffix = ''
      this.negativePrefix = this.minusSymbol
    } else if (typeof currency === 'object') {
      this.prefix = currency.prefix || ''
      this.negativePrefix = `${this.minusSymbol}${currency.prefix || ''}`
      this.suffix = currency.suffix || ''
    } else {
      const ns = numberFormat.format(-1)
      this.prefix = ps.substring(0, ps.indexOf('1'))
      this.negativePrefix = ns.substring(0, ns.indexOf('1'))
      this.suffix = ps.substring(ps.lastIndexOf(hasFractionDigits ? '0' : '6') + 1)
    }
  }

  parse (str, valueAsInteger = false) {
    let number = null
    if (isNumber(str)) {
      number = Number(str)
    } else {
      str = stripCurrencySymbol(str, this)
      str = normalizeMinusSymbol(str)
      const grouping = this.groupingSymbol ? `\\${this.groupingSymbol}?` : ''
      const fraction = this.decimalSymbol ? `(\\${this.decimalSymbol}\\d*)?` : ''
      const match = str.match(new RegExp(`^(-?)(0|[1-9]\\d{0,2}(${grouping}\\d{3})*)${fraction}$`))
      if (match) {
        number = Number(`${match[1]}${(onlyDigits(match[2]))}.${(onlyDigits(match[4] || ''))}`)
      }
    }
    return toInteger(number, valueAsInteger, this.minimumFractionDigits)
  }
}

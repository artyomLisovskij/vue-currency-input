import CurrencyFormat from './currencyFormat'
import { getCaretPositionAfterFormat, getDistractionFreeCaretPosition, setCaretPosition } from './utils/caretPosition'
import conformToMask from './utils/conformToMask'
import { toFloat, toInteger } from './utils/numberUtils'
import { insertCurrencySymbol } from './utils/stringUtils'

export class CurrencyInput {
  constructor (el, options, callbackFns, forceUpdate = false) {
    this.el = el
    this.callbackFns = callbackFns
    this.addEventListener()
    this.init(options)
    this.formattedValue = this.el.value
    this.numberValue = this.toFloat(this.currencyFormat.parse(this.el.value))
    this.applyFixedFractionFormat(this.numberValue, forceUpdate)
  }

  init (newOptions) {
    const options = { ...newOptions }
    const { distractionFree, autoDecimalMode } = options
    if (typeof distractionFree === 'boolean') {
      options.distractionFree = {
        hideCurrencySymbol: distractionFree,
        hideNegligibleDecimalDigits: distractionFree,
        hideGroupingSymbol: distractionFree
      }
    }
    if (autoDecimalMode) {
      options.distractionFree.hideNegligibleDecimalDigits = false
    }
    this.options = options
    this.currencyFormat = new CurrencyFormat(this.options)
  }

  updateOptions (newOptions) {
    this.init(newOptions)
    this.applyFixedFractionFormat(this.numberValue, true)
  }

  applyFixedFractionFormat (value, forcedChange) {
    const { locale, valueAsInteger } = this.options
    const { maximumFractionDigits, minimumFractionDigits } = this.currencyFormat
    if (value != null) {
      value = this.validateValueRange(value)
      value = new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(value)
    }
    this.format(value)
    if (forcedChange) {
      this.callbackFns.onChange({
        numberValue: toInteger(this.numberValue, valueAsInteger, maximumFractionDigits),
        formattedValue: this.formattedValue
      })
    }
  }

  toFloat (number) {
    return toFloat(number, this.options.valueAsInteger, this.currencyFormat.maximumFractionDigits)
  }

  setValue (value) {
    const newValue = this.toFloat(value)
    console.log('setValue', newValue, this.numberValue)
    if (newValue !== this.numberValue) {
      this.applyFixedFractionFormat(newValue)
    }
  }

  validateValueRange (value) {
    if (this.options.valueRange) {
      const { min, max } = this.options.valueRange
      if (min !== undefined && value < min) {
        value = min
      }
      if (max !== undefined && value > max) {
        value = max
      }
    }
    return value
  }

  updateInputValue (value, hideNegligibleDecimalDigits = false) {
    if (value != null) {
      const hideCurrencySymbol = this.focus && this.options.distractionFree.hideCurrencySymbol
      const { conformedValue, fractionDigits } = conformToMask(value, this.currencyFormat, this.formattedValue, hideCurrencySymbol, this.options.autoDecimalMode, this.options.allowNegative)
      if (typeof conformedValue === 'number') {
        let { maximumFractionDigits, minimumFractionDigits } = this.currencyFormat
        if (this.focus) {
          minimumFractionDigits = maximumFractionDigits
        }
        minimumFractionDigits = hideNegligibleDecimalDigits
          ? fractionDigits.replace(/0+$/, '').length
          : Math.min(minimumFractionDigits, fractionDigits.length)
        const formattedValue = new Intl.NumberFormat(this.options.locale, {
          useGrouping: !(this.focus && this.options.distractionFree.hideGroupingSymbol),
          minimumFractionDigits,
          maximumFractionDigits
        }).format(Math.abs(conformedValue))
        const isNegativeZero = conformedValue === 0 && (1 / conformedValue < 0)
        this.el.value = insertCurrencySymbol(formattedValue, this.currencyFormat, isNegativeZero || conformedValue < 0, hideCurrencySymbol)
        this.numberValue = conformedValue
      } else {
        this.el.value = conformedValue
        this.numberValue = this.currencyFormat.parse(this.el.value)
      }
    } else {
      this.el.value = this.numberValue = null
    }
    this.formattedValue = this.el.value
  }

  format (value) {
    this.updateInputValue(value)
    this.callbackFns.onInput({
      numberValue: toInteger(this.numberValue, this.options.valueAsInteger, this.currencyFormat.maximumFractionDigits),
      formattedValue: this.formattedValue
    })
  }

  addEventListener = () => {
    this.el.addEventListener('input', () => {
      const { value, selectionStart } = this.el
      this.format(value)
      if (this.focus) {
        setCaretPosition(this.el, getCaretPositionAfterFormat(this.el.value, value, selectionStart, this.currencyFormat, this.options))
      }
    }, { capture: true })

    this.el.addEventListener('focus', () => {
      this.oldValue = this.numberValue
      this.focus = true
      const { hideCurrencySymbol, hideGroupingSymbol, hideNegligibleDecimalDigits } = this.options.distractionFree
      if (hideCurrencySymbol || hideGroupingSymbol || hideNegligibleDecimalDigits) {
        setTimeout(() => {
          const { value, selectionStart, selectionEnd } = this.el
          this.updateInputValue(this.el.value, hideNegligibleDecimalDigits)
          if (Math.abs(selectionStart - selectionEnd) > 0) {
            this.el.setSelectionRange(0, this.el.value.length)
          } else {
            setCaretPosition(this.el, getDistractionFreeCaretPosition(this.currencyFormat, this.options, value, selectionStart))
          }
        })
      }
    })

    this.el.addEventListener('blur', () => {
      this.focus = false
      this.applyFixedFractionFormat(this.numberValue, this.oldValue !== this.numberValue)
    })
  }
}

import { DEFAULT_OPTIONS } from './api'
import { CurrencyInput } from './currencyInput'

export default {
  render (h) {
    return h('input', {
      domProps: {
        value: this.formattedValue
      }
    })
  },
  name: 'CurrencyInput',
  props: {
    value: {
      type: Number,
      default: null
    },
    locale: {
      type: String,
      default: undefined
    },
    currency: {
      type: [String, Object],
      default: undefined
    },
    distractionFree: {
      type: [Boolean, Object],
      default: undefined
    },
    precision: {
      type: [Number, Object],
      default: undefined
    },
    autoDecimalMode: {
      type: Boolean,
      default: undefined
    },
    valueAsInteger: {
      type: Boolean,
      default: undefined
    },
    valueRange: {
      type: Object,
      default: undefined
    },
    allowNegative: {
      type: Boolean,
      default: undefined
    }
  },
  data () {
    return {
      ci: null,
      formattedValue: this.value
    }
  },
  computed: {
    options () {
      const options = { ...this.$CI_DEFAULT_OPTIONS || DEFAULT_OPTIONS }
      Object.keys(DEFAULT_OPTIONS).forEach(key => {
        if (this[key] !== undefined) {
          options[key] = this[key]
        }
      })
      return options
    }
  },
  watch: {
    value: 'setValue',
    options (newOptions, oldOptions) {
      this.ci.updateOptions(newOptions, oldOptions)
    }
  },
  mounted () {
    this.ci = new CurrencyInput(this.$el, this.options, {
      onChange: ({ formattedValue, numberValue }) => {
        this.$emit('change', numberValue)
        this.formattedValue = formattedValue
      },
      onInput: ({ formattedValue, numberValue }) => {
        if (this.value !== numberValue) {
          this.$emit('input', numberValue)
        }
        this.formattedValue = formattedValue
      }
    })
  },
  methods: {
    setValue (value) {
      this.ci.setValue(value)
    }
  }
}

import { DEFAULT_OPTIONS } from './api'
import { CurrencyInput } from './currencyInput'
import equal from './utils/equal'

export default {
  bind (el, { value: optionsFromBinding }, vnode) {
    const inputElement = el.tagName.toLowerCase() === 'input' ? el : el.querySelector('input')
    if (!inputElement) {
      throw new Error('No input element found')
    }
    const options = { ...(vnode.context.$CI_DEFAULT_OPTIONS || DEFAULT_OPTIONS), ...optionsFromBinding }
    const listeners = (vnode.data && vnode.data.on) || (vnode.componentOptions && vnode.componentOptions.listeners) || {}

    const emit = (event, data) => {
      if (listeners[event]) {
        listeners[event].fns(vnode.componentOptions ? data : { target: { value: data } })
      }
    }

    el.$ci = new CurrencyInput(inputElement, options, {
      onChange: ({ formattedValue }) => emit('change', formattedValue),
      onInput: ({ formattedValue }) => emit('input', formattedValue)
    }, !!listeners['change'])
  },
  componentUpdated (el, { value, oldValue }) {
    if (!equal(value, oldValue)) {
      el.$ci.updateOptions(value)
    }
  }
}

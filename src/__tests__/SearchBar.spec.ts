import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/features/search/components/SearchBar.vue'

describe('SearchBar', () => {
  it('shows keyboard shortcut hint and Ukrainian placeholder', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })
    const input = wrapper.get('input#search-input')
    expect(input.attributes('placeholder')).toMatch(/Ctrl\+K|\//)
    const hint = wrapper.get('#search-kbd-hint')
    expect(hint.text()).toContain('Ctrl')
  })

  it('clears on Escape', async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: 'молоко' } })
    const input = wrapper.get('input#search-input')
    await input.trigger('keydown', { key: 'Escape' })
    // v-model emit should be called with ''
    const emits = wrapper.emitted('update:modelValue')
    expect(emits && emits.length > 0).toBe(true)
    expect(emits?.[emits.length - 1][0]).toBe('')
  })
})

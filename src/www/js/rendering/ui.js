import { h, render } from '../external/preact.module.js'
import { useState, useEffect } from '../external/preact.hooks.module.js'
import htm from '../external/htm.module.js'

export const ui = document.createElement('miso-ui')
export const preact = {
  html: htm.bind(h),
  render,
  useState,
  useEffect
}

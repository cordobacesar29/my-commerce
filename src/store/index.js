import {proxy} from 'valtio'

const state = proxy({
  intro: true,
  color: "#ffffff",
  isLogoTexture: true,
  isFullTexture: false,
  logoDecal: './ramon_logo.svg',
  fullDecal: './RAMon.png',
  shirtRotation: 0,
  shirtScale: 1,
  triggerSpin: false,
})

export default state
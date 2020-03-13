const showLCH = document.getElementById('lch');
const showHSL = document.getElementById('hsl');

const chromaRange = document.getElementById('chroma-range');
const hueRange = document.getElementById('hue-range');
const viewOptions = document.getElementById('out-of-gamut');
const chromaValue = document.getElementById('chroma-value')
const hueValue = document.getElementById('hue-value')

const lchElements = document.querySelectorAll('[data-lch]');

const getLCH = (data) => data.split(',').map(((channel) => Number(channel)));

const setLCH = (item, chroma = null, hue = null) => {
  const LCH = getLCH(item.dataset.lch);
  if (chroma) { LCH[1] = chroma; }
  if (hue) { LCH[2] = hue; }
  const color = convert(LCH);

  if (color.clipped) {
    item.style.setProperty('--fixed', css(color.final));
    item.style.setProperty('--clipped', css(color.sRGB));
    item.style.removeProperty('--in-gamut');
  } else {
    item.style.removeProperty('--fixed');
    item.style.removeProperty('--clipped');
    item.style.setProperty('--in-gamut', css(color.final));
  }
}

const updateLCH = (chroma = null, hue = null) => {
  lchElements.forEach((item) => setLCH(item, chroma, hue))
};

if (showLCH) {
  document.onload = updateLCH();

  viewOptions.addEventListener('change', () => {
    showLCH.dataset.show = viewOptions.value;
  });
}

if (chromaRange) {
  // update the shown value on-input
  chromaRange.addEventListener('input', () =>{
    if (chromaValue) {
      chromaValue.innerHTML = chromaRange.value;
    }
  });

  // only update colors on-change
  chromaRange.addEventListener('change', () => {
    if (showLCH) {
      updateLCH(chromaRange.value, null)
    }

    if (showHSL) {
      showHSL.style.setProperty('--s', chromaRange.value);
    }
  });
}

if (hueRange) {
  // update the shown value on-input
  hueRange.addEventListener('input', () =>{
    if (hueValue) {
      hueValue.innerHTML = hueRange.value;
    }
  });

  // only update colors on-change
  hueRange.addEventListener('change', () => {
    if (showLCH) {
      updateLCH(null, hueRange.value)
    }

    if (showHSL) {
      showHSL.style.setProperty('--h', hueRange.value);
    }
  });
}

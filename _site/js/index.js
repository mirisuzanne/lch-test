const showLCH = document.getElementById('lch');
const showHSL = document.getElementById('hsl');

const chromaRange = document.getElementById('chroma-range');
const viewOptions = document.getElementById('out-of-gamut');
const chromaValue = document.getElementById('chroma-value')

const lchElements = document.querySelectorAll('[data-lch]');

const getLCH = (data) => data.split(',').map(((channel) => Number(channel)));

const setLCH = (item, chroma) => {
  const LCH = getLCH(item.dataset.lch);
  if (chroma) { LCH[1] = chroma; }
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

const updateLCH = (chroma) => {
  lchElements.forEach((item) => setLCH(item, chroma))
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
      updateLCH(chromaRange.value)
    }

    if (showHSL) {
      showHSL.style.setProperty('--s', chromaRange.value);
    }
  });
}

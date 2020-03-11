const showLCH = document.getElementById('lch');
const showHSL = document.getElementById('hsl');

const chromaRange = document.getElementById('chroma-range');
const chromaValue = document.getElementById('chroma-value')

const lchElements = document.querySelectorAll('[data-lch]');

const getLCH = (data) => data.split(',').map(((channel) => Number(channel)));

const setLCH = (item, chroma) => {
  const LCH = getLCH(item.dataset.lch);
  if (chroma) { LCH[1] = chroma; }
  const convert = relative(LCH);
  const clipped = convert.clipped ? 'clipped' : 'result';
  item.style.setProperty('--result', css(convert.final));
  item.style.setProperty('--simple', css(convert.sRGB));
  item.style.setProperty('--gamut', `var(--${clipped})`);
}

const updateLCH = (chroma) => {
  lchElements.forEach((item) => setLCH(item, chroma))
};

if (showLCH) {
  document.onload = updateLCH();
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

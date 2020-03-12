---
class: markdown
---

# Exploring CIE lab/LCH Colors

[Play with my (slow) LCH demo »](/lch/)

## Other Resources:

- [Color Module Level 4](https://www.w3.org/TR/css-color-4/)
- [The Evolution of CSS4 Color](https://www.w3.org/Talks/2016/css4-color-talk/)
- [Stripe Blog](https://stripe.com/blog/accessible-color-systems)
- [HCL Picker](http://tristen.ca/hcl-picker/)
- [chroma.js](https://github.com/gka/chroma.js)

## Notes:

The CIE Lab/LCH color space --
coming to CSS in
[Color Module Level 4](https://www.w3.org/TR/css-color-4/) --
is _device-independent_ and _perceptually uniform_.

While we wait for browser implementations,
Sass could provide basic Lab/LCH tools inside a module,
to avoid naming conflicts with the eventual CSS functions.
The Sass functions would
pre-compile into an `rgb()` format  for output,
making them usable right away.

That's great in theory,
but the CIE & sRGB color spaces don't align cleanly.
Color conversion will need to follow the
[_relative-colorimetric_](https://www.w3.org/TR/css-color-4/#valdef-color-profile-rendering-intent-relative-colorimetric)
rendering intent:
resolving out-of-gamut colors
to the nearest available sRGB color,
without altering in-gamut values.

I haven't yet found a description of *how*
to achieve relative-colorimetric rendering.
For this demo,
I make an over-simplified gesture that direction --
lowering the "chroma" value until
the color is in-gamut.
I don't think that's a real solution,
but neither is the default RGB clipping
used by [chroma.js](https://github.com/gka/chroma.js),
which can  end up altering the hue
in unpredicatble ways.

You can toggle between the two options
in the demo "settings" menu,
or hide out-of-gamut-colors entirely.
You can also change the overall chroma value --
just give it time to update.
This isn't optimized for performance,
and the adjustments take more time
at higher saturation levels.

## ToDo:

- Are there available algorythms for relative-colorimetric rendering?
- Can we use them?

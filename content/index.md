---
class: markdown
---

# Exploring CIE lab/LCH Colors

- [Play with my (slow) LCH demo »](/lch/)
- ["HCL Picker"](http://tristen.ca/hcl-picker/)
- [chroma.js](https://github.com/gka/chroma.js)

The CIE Lab/LCH color space --
coming to CSS in
[Color Module Level 4](https://www.w3.org/TR/css-color-4/) --
is _device-independent_ and _perceptually uniform_.

In the meantime,
Sass could provide tools to describe color in Lab/LCH formats --
taking advantage of the uniform space --
and pre-compile the output into an `rgb()` format.

That's great in theory,
but the two color spaces don't align cleanly.
Color conversion will need to follow the
[_relative-colorimetric_](https://www.w3.org/TR/css-color-4/#valdef-color-profile-rendering-intent-relative-colorimetric)
rendering intent:
resolving out-of-gamut colors to their nearest boundary,
without altering in-gamut values.

For the demo,
I've used a highly over-simplified approach
to relative-colorimetric rendering --
lowering the "chroma" value until the conversion is in-range.
I don't think that's a real option,
but neither is RGB clipping
(the only option in [chroma.js](https://github.com/gka/chroma.js)).

You can toggle between the two options,
or hide out-of-gamut-colors,
in the demo "settings" menu.
You can also change the chroma value --
but give it time to update,
especially at higher saturation levels.
This isn't optimized for performance.

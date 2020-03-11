const normal_RGB = (RGB) => {
  return RGB.map((channel) => channel / 255);
}

const expand_RGB = (normal) => {
  return normal.map((channel) => channel * 255);
}

const normal_HSL = (HSL) => {
  return [
    HSL[0] * (6/360),
    HSL[1] * (1/100),
    HSL[2] * (1/100),
  ];
}

const expand_HSL = (HSL) => {
  return [
    HSL[0] / (6/360),
    HSL[1] / (1/100),
    HSL[2] / (1/100),
  ];
}

// sRGB-related functions

const hueToRgb = (t1, t2, hue) => {
  if(hue < 0) hue += 6;
  if(hue >= 6) hue -= 6;

  if(hue < 1) return (t2 - t1) * hue + t1;
  else if(hue < 3) return t2;
  else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
  else return t1;
}

const HSL_to_sRGB = (HSL) => {
  const normal = normal_HSL(HSL);
  const hue = normal[0];
  const sat = normal[1];
  const light = normal[2];

  if( light <= .5 ) {
    var t2 = light * (sat + 1);
  } else {
    var t2 = light + sat - (light * sat);
  }
  var t1 = light * 2 - t2;
  var r = hueToRgb(t1, t2, hue + 2);
  var g = hueToRgb(t1, t2, hue);
  var b = hueToRgb(t1, t2, hue - 2);
  return [r,g,b];
}

const lin_sRGB = (RGB) => {
  // convert an array of sRGB values in the range 0.0 - 1.0
  // to linear light (un-companded) form.
  // https://en.wikipedia.org/wiki/SRGB
  return RGB.map((val) => {
    if (val < 0.04045) {
      return val / 12.92;
    }

    return Math.pow((val + 0.055) / 1.055, 2.4);
  });
}

const gam_sRGB = (RGB) => {
  // convert an array of linear-light sRGB values in the range 0.0-1.0
  // to gamma corrected form
  // https://en.wikipedia.org/wiki/SRGB
  return RGB.map((val) => {
    if (val > 0.0031308) {
      return 1.055 * Math.pow(val, 1/2.4) - 0.055;
    }

    return 12.92 * val;
  });
}

const lin_sRGB_to_XYZ = (rgb) => {
  // convert an array of linear-light sRGB values to CIE XYZ
  // using sRGB’s own white, D65 (no chromatic adaptation)
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  var M = math.matrix([
    [0.4124564,  0.3575761,  0.1804375],
    [0.2126729,  0.7151522,  0.0721750],
    [0.0193339,  0.1191920,  0.9503041]
  ]);

  return math.multiply(M, rgb).valueOf();
}

const XYZ_to_lin_sRGB = (XYZ) => {
  // convert XYZ to linear-light sRGB
  var M = math.matrix([
    [ 3.2404542, -1.5371385, -0.4985314],
    [-0.9692660,  1.8760108,  0.0415560],
    [ 0.0556434, -0.2040259,  1.0572252]
  ]);

  return math.multiply(M, XYZ).valueOf();
}

// Chromatic adaptation

const D65_to_D50 = (XYZ) => {
  // Bradford chromatic adaptation from D65 to D50
  // The matrix below is the result of three operations:
  // - convert from XYZ to retinal cone domain
  // - scale components from one reference white to another
  // - convert back to XYZ
  // http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
  var M = math.matrix([
    [ 1.0478112,  0.0228866, -0.0501270],
    [ 0.0295424,  0.9904844, -0.0170491],
    [-0.0092345,  0.0150436,  0.7521316]
   ]);

  return math.multiply(M, XYZ).valueOf();
}

const D50_to_D65 = (XYZ) => {
  // Bradford chromatic adaptation from D50 to D65
  var M = math.matrix([
    [ 0.9555766, -0.0230393,  0.0631636],
    [-0.0282895,  1.0099416,  0.0210077],
    [ 0.0122982, -0.0204830,  1.3299098]
   ]);

  return math.multiply(M, XYZ).valueOf();
}

// Lab and LCH

const XYZ_to_Lab = (XYZ) => {
  // Assuming XYZ is relative to D50, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  var ε = 216/24389;  // 6^3/29^3
  var κ = 24389/27;   // 29^3/3^3
  var white = [0.96422, 1.00000, 0.82521]; // D50 reference white

  // compute xyz, which is XYZ scaled relative to reference white
  var xyz = XYZ.map((value, i) => value / white[i]);

  // now compute f
  var f = xyz.map(value => value > ε ? Math.cbrt(value) : (κ * value + 16)/116);

  return [
    (116 * f[1]) - 16,    // L
    500 * (f[0] - f[1]), // a
    200 * (f[1] - f[2])  // b
  ];
}

const Lab_to_XYZ = (Lab) => {
  // Convert Lab to D50-adapted XYZ
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  var κ = 24389/27;   // 29^3/3^3
  var ε = 216/24389;  // 6^3/29^3
  var white = [0.96422, 1.00000, 0.82521]; // D50 reference white
  var f = [];

  // compute f, starting with the luminance-related term
  f[1] = (Lab[0] + 16)/116;
  f[0] = Lab[1]/500 + f[1];
  f[2] = f[1] - Lab[2]/200;

  // compute xyz
  var xyz = [
    Math.pow(f[0],3) > ε ?   Math.pow(f[0],3)            : (116*f[0]-16)/κ,
    Lab[0] > κ * ε ?         Math.pow((Lab[0]+16)/116,3) : Lab[0]/κ,
    Math.pow(f[2],3)  > ε ?  Math.pow(f[2],3)            : (116*f[2]-16)/κ
  ];

  // Compute XYZ by scaling xyz by reference white
  return xyz.map((value, i) => value * white[i]);
}

const Lab_to_LCH = (Lab) => {
  // Convert to polar form
  var hue = Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI;
  return [
    Lab[0], // L is still L
    Math.sqrt(Math.pow(Lab[1], 2) + Math.pow(Lab[2], 2)), // Chroma
    hue >= 0 ? hue : hue + 360 // Hue, in degrees [0 to 360)
  ];
}

const LCH_to_Lab = (LCH) => {
  // Convert from polar form
  return [
    LCH[0], // L is still L
    LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
    LCH[1] * Math.sin(LCH[2] * Math.PI / 180) // b
  ];
}

// multi-step
const sRGB_to_Lab = (RGB) => {
  const linear = lin_sRGB(RGB);
  const xyz = lin_sRGB_to_XYZ(linear);
  const d50 = D65_to_D50(xyz);
  return XYZ_to_Lab(d50);
}

const Lab_to_sRGB = (Lab) => {
  const xyz = Lab_to_XYZ(Lab);
  const d65 = D50_to_D65(xyz);
  const linear = XYZ_to_lin_sRGB(d65);
  return gam_sRGB(linear);
}

// Conversions

const is_clipped = (sRGB) => sRGB.find((channel) => (channel > 1) || (channel < 0));

const LCH_to_sRGB = (LCH) => {
  const Lab = LCH_to_Lab(LCH);
  return Lab_to_sRGB(Lab);
}

const b_w = (sRGB) => {
  if (sRGB.every((channel) => channel <= 0.001)) {
    return [0,0,0];
  } else if (sRGB.every((channel) => channel >= 0.999)) {
    return [1,1,1];
  }

  return false;
}

const adjust = (LCH) => {
  const desaturate = [LCH[0], LCH[1] - 0.5, LCH[2]];
  const sRGB = LCH_to_sRGB(desaturate);

  return is_clipped(sRGB) ? b_w(sRGB) || adjust(desaturate) : sRGB;
}

const relative = (LCH) => {
  const sRGB = LCH_to_sRGB(LCH);
  const clipped = is_clipped(sRGB) || false;
  const final = clipped ? b_w(sRGB) || adjust(LCH) : sRGB;
  return {
      LCH,
      sRGB,
      final,
      clipped,
  }
}

const css = (rgb) => {
  if (typeof rgb === 'string') {
    return rgb;
  }
  if (rgb) {
    const channels = expand_RGB(rgb);
    return `rgb(${channels[0]} ${channels[1]} ${channels[2]})`;
  }
  return 'red';
}

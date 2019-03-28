export function scaleLinear(domain, range) {
  let scale = v => interpolate(range, normalize(domain, v));
  let inverse = v => interpolate(domain, normalize(range, v));
  return Object.assign(scale, { inverse, domain, range });
}

// N -> [0, 1]
function normalize(range, x) {
  let k = range[1] - range[0];
  let b = range[0];
  return (x - b) / k;
}

// [0, 1] -> N
function interpolate(range, t) {
  let k = range[1] - range[0];
  let b = range[0];
  return b + k * t;
}

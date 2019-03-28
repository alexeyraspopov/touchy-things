// Gaussian random number generator based on Box-Muller transformation
export function* randomNormal(mu, sigma) {
  let x = null;
  let y = null;
  let s = null;

  while (true) {
    do {
      x = 2 * Math.random() - 1;
      y = 2 * Math.random() - 1;
      s = x * x + y * y;
    } while (s > 1 || s === 0);

    let z0 = x * Math.sqrt((-2 * Math.log(s)) / s);
    let z1 = y * Math.sqrt((-2 * Math.log(s)) / s);

    yield z0 * sigma + mu;
    yield z1 * sigma + mu;
  }
}

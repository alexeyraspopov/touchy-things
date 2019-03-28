import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { randomNormal } from '/modules/randomNormal';
import { scaleLinear } from '/modules/scaleLinear';
import { useZoomBehavior } from '/modules/useZoomBehavior';
import { useBrushBehavior } from '/modules/useBrushBehavior';

let generator = randomNormal(0, 1);
let pointsA = Array.from(new Array(1000), () => generator.next().value);
let pointsB = Array.from(new Array(1000), () => generator.next().value);

let width = 800;
let height = 300;

function Stage() {
  let stageRef = useRef();
  let brushRef = useRef();

  let scaleX = useMemo(
    () => scaleLinear([0, pointsA.length - 1], [0, width]),
    []
  );
  let scaleY = useMemo(() => scaleLinear([-5, 5], [height, 0]), []);

  let [range, setRange] = useState([0, pointsA.length - 1]);
  let subScaleX = scaleLinear(range, [0, width]);

  let scaleExtent = useMemo(() => [1, 32], []);

  useZoomBehavior(stageRef, scaleExtent, scaleX, setRange);
  useBrushBehavior(brushRef, scaleX.range, scaleX, setRange);

  return (
    <section style={{ padding: '1em' }}>
      <svg width={width} height={height} ref={stageRef}>
        <path
          d={line(pointsA, (n, i) => subScaleX(i), n => scaleY(n))}
          fill="transparent"
          stroke="red"
        />
        <path
          d={line(pointsB, (n, i) => subScaleX(i), n => scaleY(n))}
          fill="transparent"
          stroke="green"
        />
      </svg>
      <svg
        width={width}
        height={height / 5}
        style={{ background: 'rgba(0, 0, 0, 0.03)' }}
        ref={brushRef}
      >
        <path
          d={line(pointsA, (n, i) => scaleX(i), n => scaleY(n) / 5)}
          fill="transparent"
          stroke="red"
        />
        <path
          d={line(pointsB, (n, i) => scaleX(i), n => scaleY(n) / 5)}
          fill="transparent"
          stroke="green"
        />
        <rect
          x={scaleX(range[0])}
          y={0}
          width={scaleX(range[1]) - scaleX(range[0])}
          height={100}
          fill="rgba(119, 119, 119, 0.3)"
          stroke="rgb(255, 255, 255)"
        />
      </svg>
    </section>
  );
}

function line(data, x, y) {
  return data.reduce((curve, datum, index) => {
    let prefix = index === 0 ? 'M' : 'L';
    let point = prefix + x(datum, index) + ',' + y(datum, index);
    return curve + point;
  }, '');
}

ReactDOM.render(<Stage />, document.querySelector('main'));

import { useEffect, useRef } from 'react';

let transformIdentity = { k: 1, x: 0 };

function transformReducer(transform, action) {
  switch (action.type) {
    case 'wheel': {
      let delta = 2 ** (-action.deltaY / 500);
      let invX = (action.pointerX - transform.x) / transform.k;
      let k = constrain(action.scaleExtent, transform.k * delta);
      let x = constrainX(action.translateExtent, action.pointerX - invX * k, k);
      return { k, x };
    }
    case 'mouse': {
      let k = transform.k;
      let x = constrainX(
        action.translateExtent,
        transform.x + action.deltaX,
        k
      );
      return { k, x };
    }
    default:
      return transform;
  }
}

export function useZoomBehavior(ref, scaleExtent, scale, update) {
  let transform = useRef(transformIdentity);

  function handleWheelEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    transform.current = transformReducer(transform.current, {
      type: 'wheel',
      deltaY: event.deltaY,
      pointerX: event.layerX,
      scaleExtent,
      translateExtent: scale.range,
    });

    let t = transform.current;
    update(scale.range.map(x => scale.inverse((x - t.x) / t.k)));
  }

  function handleMouseDownEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    let x0 = event.clientX;

    function handleMoveEvent(event) {
      let dx = event.clientX - x0;
      x0 = event.clientX;
      transform.current = transformReducer(transform.current, {
        type: 'mouse',
        deltaX: dx,
        scaleExtent,
        translateExtent: scale.range,
      });

      let t = transform.current;
      update(scale.range.map(x => scale.inverse((x - t.x) / t.k)));
    }

    function handleUpEvent(event) {
      window.removeEventListener('mousemove', handleMoveEvent);
      window.removeEventListener('mouseup', handleUpEvent);
    }

    window.addEventListener('mousemove', handleMoveEvent);
    window.addEventListener('mouseup', handleUpEvent);
  }

  function zoomEffect() {
    ref.current.addEventListener('wheel', handleWheelEvent, true);
    ref.current.addEventListener('mousedown', handleMouseDownEvent, true);
    return () => {
      ref.current.removeEventListener('wheel', handleWheelEvent);
      ref.current.removeEventListener('mousedown', handleMouseDownEvent);
    };
  }

  useEffect(zoomEffect, [ref, scaleExtent, transform, scale, update]);
}

function constrain(range, x) {
  return x < range[0] ? range[0] : x > range[1] ? range[1] : x;
}

function constrainX(range, x, k) {
  let dx0 = (range[0] - x) / k - range[0];
  let dx1 = (range[1] - x) / k - range[1];
  let dx = Math.min(0, dx0) || Math.max(0, dx1);
  return x + k * dx;
}

import { useEffect, useRef } from 'react';

function selectionReducer(selection, action) {
  return action;
}

export function useBrushBehavior(ref, translateExtent, scale, update) {
  let initialSelection = [translateExtent[0], translateExtent[1]];
  let selection = useRef(initialSelection);

  function handleMouseDownEvent(event) {
    event.preventDefault();
    let rect = ref.current.getBoundingClientRect();
    let x0 = event.clientX;

    function handleMoveEvent(event) {
      let x1 = event.clientX;
      if (Math.abs(x1 - x0) < 1) return;
      let s = x1 > x0 ? [x0 - rect.x, x1 - rect.x] : [x1 - rect.x, x0 - rect.x];
      selection.current = selectionReducer(selection.current, s);
      update(selection.current.map(scale.inverse));
    }

    function handleUpEvent(event) {
      window.removeEventListener('mousemove', handleMoveEvent);
      window.removeEventListener('mouseup', handleUpEvent);
    }

    window.addEventListener('mousemove', handleMoveEvent);
    window.addEventListener('mouseup', handleUpEvent);
  }

  function brushEffect() {
    ref.current.addEventListener('mousedown', handleMouseDownEvent, true);
    return () => {
      ref.current.removeEventListener('mousedown', handleMouseDownEvent);
    };
  }

  useEffect(brushEffect, [ref, scale, update]);
}

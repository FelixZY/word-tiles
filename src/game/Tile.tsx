import React, { forwardRef, useEffect, useState } from "react";
import mergeRefs from "react-merge-refs";
import "./Tile.scss";

export enum TileState {
  Default,
  Correct,
  Position,
  Incorrect,
}
export enum TileIndicationState {
  None,
  Focus,
  Valid,
  Invalid,
}
export type TileSideOpts = {
  state?: TileState;
  indicate?: TileIndicationState;
  value?: string;
};
export type TileParams = {
  frontOpts?: TileSideOpts;
  backOpts?: TileSideOpts;
  flip?: boolean;
  onFlipEnd?: (isFlipped: boolean) => void;
};
export const Tile = forwardRef(
  (
    {
      frontOpts = {},
      backOpts = {},
      flip = false,
      onFlipEnd = () => {},
    }: TileParams,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const myRef = React.useRef<HTMLDivElement | null>(null);
    const [isFlipped, setFlipped] = useState(flip);

    useEffect(() => {
      const elm = myRef.current;

      function onTransitionEnd(e: globalThis.TransitionEvent) {
        if (e.propertyName === "transform") {
          setFlipped(flip);
          onFlipEnd(flip);
        }
      }

      if (isFlipped !== flip) {
        elm?.addEventListener("transitionend", onTransitionEnd);
      }

      return () => elm?.removeEventListener("transitionend", onTransitionEnd);
    }, [myRef, flip, isFlipped, onFlipEnd]);

    return (
      <div
        ref={mergeRefs([myRef, ref])}
        className={`tile ${flip ? "flip" : ""}`}
      >
        <div
          className={`front state-${TileState[
            frontOpts.state ?? TileState.Default
          ].toLowerCase()} border-${TileIndicationState[
            frontOpts.indicate ?? TileIndicationState.None
          ].toLowerCase()}`}
        >
          <span className="text-high-emphasis">{frontOpts.value ?? ""}</span>
        </div>
        <div
          className={`back state-${TileState[
            backOpts.state ?? TileState.Default
          ].toLowerCase()} border-${TileIndicationState[
            backOpts.indicate ?? TileIndicationState.None
          ].toLowerCase()}`}
        >
          <span className="text-high-emphasis">{backOpts.value ?? ""}</span>
        </div>
      </div>
    );
  }
);

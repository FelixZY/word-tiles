import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import mergeRefs from "react-merge-refs";
import { usePrevious } from "../hooks";
import { Tile, TileIndicationState, TileSideOpts, TileState } from "./Tile";
import "./Word.scss";

export const Word = forwardRef(
  (
    {
      frontOpts,
      backOpts,
      length,
      showCursor = false,
      flipLetter = () => false,
      onFullWordFlipEnd = () => {},
    }: {
      frontOpts: Pick<TileSideOpts, "indicate" | "value">;
      backOpts: Pick<TileSideOpts, "value"> & {
        getLetterState: (index: number, letter: string) => TileState;
      };
      length?: number;
      showCursor?: boolean;
      flipLetter?: (index: number) => boolean;
      onFullWordFlipEnd?: (isFlipped: boolean) => void;
    },
    forwardRef
  ) => {
    frontOpts.value = frontOpts.value ?? "";
    backOpts.value = backOpts.value ?? "";

    const wordRef = React.createRef<HTMLDivElement>();
    const [useSmallSize, setUseSmallSize] = useState(false);
    const wordLength = useMemo(
      () =>
        length ??
        Math.max(frontOpts.value?.length ?? 0, backOpts.value?.length ?? 0),
      [length, frontOpts, backOpts]
    );

    const checkShouldUseSmallSize = useCallback(() => {
      setUseSmallSize(
        (wordRef.current?.offsetWidth ?? 0) >
          (wordRef.current?.parentElement?.offsetWidth ?? 0)
      );
    }, [setUseSmallSize, wordRef]);
    const onResize = useCallback(() => {
      if (useSmallSize) setUseSmallSize(false);
      else checkShouldUseSmallSize();
    }, [useSmallSize, setUseSmallSize, checkShouldUseSmallSize]);

    const previousWordLength = usePrevious(wordLength);
    useLayoutEffect(() => {
      if (previousWordLength !== wordLength) {
        onResize();
      }
    }, [onResize, previousWordLength, wordLength]);

    useLayoutEffect(() => {
      if (!useSmallSize) {
        checkShouldUseSmallSize();
      }
    }, [useSmallSize, checkShouldUseSmallSize]);

    useEffect(() => {
      const parent = wordRef.current?.parentElement;
      if (!parent) return;

      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(parent);

      return () => resizeObserver.disconnect();
    }, [onResize, wordRef]);

    const letterFlips = Array.from({ length: wordLength }, (_, i) =>
      flipLetter(i)
    );
    return (
      <div
        ref={mergeRefs([forwardRef, wordRef])}
        className={`word ${useSmallSize ? "small" : ""}`}
      >
        {Array.from({ length: wordLength }, (_, i) => {
          const isFirstEmpty =
            (i === 0 || frontOpts.value!!.charAt(i - 1).length > 0) &&
            frontOpts.value!!.charAt(i).length === 0;
          return (
            <Tile
              key={i}
              frontOpts={{
                state: TileState.Default,
                indicate:
                  (showCursor && isFirstEmpty && TileIndicationState.Focus) ||
                  (frontOpts.indicate ?? TileIndicationState.None),
                value: frontOpts.value!!.charAt(i),
              }}
              backOpts={{
                state: backOpts.getLetterState(i, backOpts.value!!.charAt(i)),
                value: backOpts.value!!.charAt(i),
              }}
              flip={letterFlips[i]}
              onFlipEnd={
                i === wordLength - 1 &&
                (letterFlips.every((it) => it) ||
                  letterFlips.every((it) => !it))
                  ? onFullWordFlipEnd
                  : undefined
              }
            />
          );
        })}
      </div>
    );
  }
);

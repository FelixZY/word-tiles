import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import "./Mosaic.scss";
import { TileIndicationState, TileState } from "./Tile";
import { Word } from "./Word";

function findCommonAncestor(
  a: HTMLElement,
  b: HTMLElement
): HTMLElement | null {
  if (a === b) return a;
  if (a.contains(b)) return a;
  if (b.contains(a)) return b;

  function findDepth(elm: HTMLElement): number {
    let depth = 0;
    let walk = elm;

    while (walk.parentElement) {
      walk = walk.parentElement!!;
      depth++;
    }
    return depth;
  }

  let aDepth = findDepth(a);
  let bDepth = findDepth(b);

  let aWalk = a;
  let bWalk = b;

  let commonAncestor: HTMLElement | null = null;
  while (commonAncestor === null && aDepth >= 0 && bDepth >= 0) {
    if (aDepth >= bDepth) {
      if (aDepth > 0) {
        aWalk = aWalk.parentElement!!;
      }
      aDepth--;
    } else {
      bWalk = bWalk.parentElement!!;
      bDepth--;
    }
    if (aWalk === bWalk) {
      commonAncestor = aWalk;
    }
  }

  return commonAncestor;
}

export const Mosaic: FunctionComponent<{
  word: string;
  guess: string;
  previousGuesses: string[];
  showGuesses: boolean;
  isGuessValid: boolean;
  maxAttempts: number;
  showCursor: boolean;
  onCurrentWordFlipEnd?: (isFlipped: boolean) => void;
}> = ({
  word,
  guess,
  previousGuesses,
  showGuesses,
  isGuessValid,
  maxAttempts,
  showCursor,
  onCurrentWordFlipEnd = () => {},
}) => {
  const activeLineRef = React.createRef<HTMLElement>();

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", (e) => {
      setReduceMotion(e.matches);
    });
  }, []);

  useLayoutEffect(() => {
    const elm = activeLineRef.current;
    if (!elm) return;

    const elmBounds = elm.getBoundingClientRect();

    if (elmBounds.top < 0) {
      window.scrollTo({
        top: elm.offsetTop - elmBounds.height * 0.2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }

    let overlay = document.elementFromPoint(
      elmBounds.x + elmBounds.width / 2,
      elmBounds.y + elmBounds.height - 1
    ) as HTMLElement;

    if (
      overlay &&
      overlay !== elm &&
      !elm.contains(overlay) &&
      !overlay.contains(elm)
    ) {
      for (
        let i = 0, children = findCommonAncestor(elm, overlay)!!.children;
        i < children.length;
        i++
      ) {
        const child = children[i];
        if (child.contains(overlay)) {
          overlay = child as HTMLElement;
          break;
        }
      }

      const overlayBounds = overlay.getBoundingClientRect();
      window.scrollTo({
        top: elm.offsetTop - overlayBounds.top + elmBounds.height * 1.2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [activeLineRef, reduceMotion]);

  return (
    <div className="mosaic">
      {Array.from({ length: maxAttempts }, (_, line) => (
        <Word
          key={line}
          ref={
            line ===
            Math.max(
              // Cursor is hidden while word is being revealed.
              // Wait for reveal before scrolling.
              showCursor ? previousGuesses.length : previousGuesses.length - 1,
              0
            )
              ? activeLineRef
              : null
          }
          frontOpts={{
            value:
              line < previousGuesses.length
                ? showGuesses
                  ? previousGuesses[line]
                  : ""
                : line === previousGuesses.length
                ? guess
                : "",
            indicate:
              line === previousGuesses.length && word.length === guess.length
                ? isGuessValid
                  ? TileIndicationState.Valid
                  : TileIndicationState.Invalid
                : TileIndicationState.None,
          }}
          backOpts={{
            value:
              line < previousGuesses.length
                ? previousGuesses[line]
                : line === previousGuesses.length
                ? guess
                : "",
            getLetterState: (i, l) =>
              word.charAt(i) === l
                ? TileState.Correct
                : word.includes(l)
                ? TileState.Position
                : TileState.Incorrect,
          }}
          length={word.length}
          showCursor={showCursor && line === previousGuesses.length}
          flipLetter={() => showGuesses && line < previousGuesses.length}
          onFullWordFlipEnd={(isFlipped) =>
            line === previousGuesses.length - 1 &&
            onCurrentWordFlipEnd(isFlipped)
          }
        />
      ))}
    </div>
  );
};

import { FunctionComponent } from "react";
import { TileState } from "../game/Tile";
import { Key } from "./Key";
import "./Keyboard.scss";

export const Keyboard: FunctionComponent<{
  keyboardLayout: string[];
  letterToTileState: { [letter: string]: TileState | undefined };
  enterEnabled: boolean;
  backspaceEnabled: boolean;
}> = ({
  keyboardLayout,
  letterToTileState,
  enterEnabled,
  backspaceEnabled,
}) => {
  const longestRow = keyboardLayout.reduce(
    (longest, it) => Math.max(longest, it.length),
    0
  );
  return (
    <div className="keyboard">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className={`row n-${longestRow}`}>
          {row.split("").map((letter, colIndex) => (
            <Key
              key={`r${rowIndex}c${colIndex}`}
              text={letter}
              state={letterToTileState[letter] ?? TileState.Default}
            />
          ))}
        </div>
      ))}
      <div className="row">
        <Key
          text="Enter"
          state={enterEnabled ? TileState.Correct : TileState.Incorrect}
        />
        <Key
          text={"\u232B"}
          keyboardEventKey="Backspace"
          state={backspaceEnabled ? TileState.Position : TileState.Incorrect}
        />
      </div>
    </div>
  );
};

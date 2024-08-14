import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { FunctionComponent } from "react";
import { TileState } from "../game/Tile";
import "./Key.scss";

export const Key: FunctionComponent<{
  text: string;
  state: TileState;
  keyboardEventKey?: string;
  enableVibration?: boolean;
}> = ({
  state,
  text = "",
  keyboardEventKey = text,
  enableVibration = true,
}) => {
  return (
    <div
      className={`key state-${TileState[state].toLowerCase()}`}
      onClick={() => {
        if (enableVibration) {
          Haptics.impact({ style: ImpactStyle.Light });
        }
        if (keyboardEventKey.length > 0) {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: keyboardEventKey })
          );
          document.dispatchEvent(
            new KeyboardEvent("keyup", { key: keyboardEventKey })
          );
        }
      }}
    >
      <span>{text}</span>
    </div>
  );
};

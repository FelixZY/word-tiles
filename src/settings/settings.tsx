import { DataStore } from "../storage/Table";

export enum CefrLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}
type Settings = {
  cefrLevel: CefrLevel;
  wordLength: number;
  maxAttempts: number;
  language: string;
};

const NAME = "settings";
const VERSION = 1;
export const Settings = new (class extends DataStore<Settings> {
  constructor() {
    super(VERSION, NAME, {
      cefrLevel: CefrLevel.B2,
      wordLength: 5,
      maxAttempts: 6,
      language: "en",
    });

    const urlParams = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
    if (["sv", "en"].includes(urlParams["lang"])) {
      this.mutate((it) => {
        it.language = urlParams["lang"];
      });
    }
    if (Object.values(CefrLevel).includes(urlParams["cefr"] as CefrLevel)) {
      this.mutate((it) => {
        it.cefrLevel = urlParams["cefr"] as CefrLevel;
      });
    }
    try {
      const wordLength = parseInt(urlParams["wordLength"]);
      if (wordLength > 2 && wordLength < 15) {
        this.mutate((it) => {
          it.wordLength = wordLength;
        });
      }
    } catch {}
    try {
      const maxAttempts = parseInt(urlParams["maxAttempts"]);
      if (maxAttempts > 0 && maxAttempts < 100) {
        this.mutate((it) => {
          it.maxAttempts = maxAttempts;
        });
      }
    } catch {}
  }
  protected migrate(fromVersion: number, data: any): Settings {
    return data;
  }
})();

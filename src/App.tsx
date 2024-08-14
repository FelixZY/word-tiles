import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import "./App.scss";
import { Mosaic } from "./game/Mosaic";
import { TileState } from "./game/Tile";
import { Word } from "./game/Word";
import { Keyboard } from "./keyboard/Keyboard";
import { CefrLevel, Settings } from "./settings/settings";
import { Statistics } from "./stats/statistics";

type WordList = {
  [key in CefrLevel]: {
    [length: string]: string[] | undefined;
  };
};

const resetState = {
  word: () => "",
  guess: () => "",
  previousGuesses: () => [],
  revealRemaining: () => false,
  isGameOver: () => false,
};

function App() {
  const [settings, _] = useState(Settings.read());
  const [word, setWord] = useState<string>(resetState.word());
  const [keyboardLayout, setKeyboardLayout] = useState<string[]>([]);
  const [wordList, setWordList] = useState<WordList>({
    A1: {},
    A2: {},
    B1: {},
    B2: {},
    C1: {},
    C2: {},
  });
  const [guess, setGuess] = useState(resetState.guess());
  const [previousGuesses, setPreviousGuesses] = useState<string[]>(
    resetState.previousGuesses()
  );
  const [isGameEnding, setIsGameEnding] = useState(
    resetState.revealRemaining()
  );
  const [isGameOver, setIsGameOver] = useState(resetState.isGameOver());
  const [isRevealingWord, setIsRevealingWord] = useState(false);

  const wordSet = useMemo(
    () =>
      new Set(
        Object.values(wordList)
          .flatMap((it) => it[settings.wordLength] ?? "")
          .filter((it) => it.length > 0)
      ),
    [settings, wordList]
  );
  const revealedWord = useMemo(
    () =>
      word
        .split("")
        .map((l, i) =>
          previousGuesses.map((g) => g.split("")[i]).includes(l) ? l : " "
        )
        .join(""),
    [word, previousGuesses]
  );
  const isAcceptingInput = useMemo(
    () => !isRevealingWord && !isGameEnding,
    [isRevealingWord, isGameEnding]
  );
  const isGuessValid = useMemo(
    () => guess.length === word.length && wordSet.has(guess),
    [word, guess, wordSet]
  );
  const [uiSyncedLetterToTileState, setUiSyncedLetterToTileState] = useState<{
    [letter: string]: TileState | undefined;
  }>({});
  const letterToTileState = useMemo<{
    [letter: string]: TileState | undefined;
  }>(
    () =>
      previousGuesses.reduce(
        (letterState: { [key: string]: TileState | undefined }, guess) => {
          for (let i = 0, letters = guess.split(""); i < letters.length; i++) {
            if (letterState[letters[i]] === TileState.Correct) continue;

            if (word.charAt(i) === letters[i]) {
              letterState[letters[i]] = TileState.Correct;
            } else if (word.includes(letters[i])) {
              letterState[letters[i]] = TileState.Position;
            } else if (!letterState[i]) {
              letterState[letters[i]] = TileState.Incorrect;
            }
          }
          return letterState;
        },
        {}
      ),
    [word, previousGuesses]
  );
  useEffect(() => {
    !isRevealingWord && setUiSyncedLetterToTileState(letterToTileState);
  }, [isRevealingWord, letterToTileState]);

  const reset = useCallback(() => {
    const eligibleWords = wordList[settings.cefrLevel][
      settings.wordLength.toString()
    ] ?? [""];

    Object.entries(resetState).forEach(([key, _]) => {
      switch (key) {
        case "word":
          setWord(
            eligibleWords[Math.floor(Math.random() * eligibleWords.length)]
          );
          break;
        case "guess":
          setGuess(resetState.guess());
          break;
        case "previousGuesses":
          setPreviousGuesses(resetState.previousGuesses());
          break;
        case "revealRemaining":
          setIsGameEnding(resetState.revealRemaining());
          break;
        case "isGameOver":
          setIsGameOver(resetState.isGameOver());
          break;
        default:
          throw new Error(`Did not reset state with key ${key}!`);
      }
    });
  }, [
    wordList,
    settings,
    setWord,
    setGuess,
    setPreviousGuesses,
    setIsGameEnding,
    setIsGameOver,
  ]);
  const endGame = useCallback(
    (isVictory: boolean) => {
      setIsGameEnding(true);

      Statistics.mutate((statistics) => {
        statistics.totalGames++;
        if (isVictory) {
          statistics.victories++;
          statistics.attemptsToVictory[previousGuesses.length] =
            (statistics.attemptsToVictory[previousGuesses.length] ?? 0) + 1;
        } else {
          statistics.defeats++;
        }
      });

      setTimeout(() => {
        setIsGameOver(true);
      }, 2500);
    },
    [setIsGameEnding, previousGuesses]
  );
  const requestEndOfRoundCheck = useCallback(() => {
    if (
      previousGuesses.length > 0 &&
      word === previousGuesses[previousGuesses.length - 1]
    ) {
      endGame(true);
    }
    if (previousGuesses.length >= settings.maxAttempts) {
      endGame(false);
    }
  }, [word, settings, previousGuesses, endGame]);

  const wordsQuery = useQuery(`words-${settings.language}`, () =>
    fetch(process.env.PUBLIC_URL + `/words-${settings.language}.json`)
      .then(async (res) => (await res.json()) as WordList)
      .then(
        (it): WordList => ({
          A1: it[CefrLevel.A1],
          A2: { ...it[CefrLevel.A1], ...it[CefrLevel.A2] },
          B1: { ...it[CefrLevel.A1], ...it[CefrLevel.A2], ...it[CefrLevel.B1] },
          B2: {
            ...it[CefrLevel.A1],
            ...it[CefrLevel.A2],
            ...it[CefrLevel.B1],
            ...it[CefrLevel.B2],
          },
          C1: {
            ...it[CefrLevel.A1],
            ...it[CefrLevel.A2],
            ...it[CefrLevel.B1],
            ...it[CefrLevel.B2],
            ...it[CefrLevel.C1],
          },
          C2: {
            ...it[CefrLevel.A1],
            ...it[CefrLevel.A2],
            ...it[CefrLevel.B1],
            ...it[CefrLevel.B2],
            ...it[CefrLevel.C1],
            ...it[CefrLevel.C2],
          },
        })
      )
      .then(setWordList)
  );
  const keysQuery = useQuery(`keys-${settings.language}`, () =>
    fetch(process.env.PUBLIC_URL + `/keys-${settings.language}.json`)
      .then(async (res) => (await res.json()) as string[])
      .then(setKeyboardLayout)
  );

  useEffect(() => reset(), [wordList, reset]);
  useEffect(() => console.log("The word is", word), [word]);

  useEffect(() => {
    function onKeyPress(e: KeyboardEvent) {
      if (!isAcceptingInput) return;

      const key = e.key.toUpperCase();

      if (key === "BACKSPACE") {
        if (guess.length === 0) return;
        setGuess(guess.slice(0, guess.length - 1));
        return;
      }

      if (key === "ENTER") {
        if (guess.length !== word.length) return;
        if (!wordSet.has(guess)) return;
        setIsRevealingWord(true);
        setPreviousGuesses([...previousGuesses, guess]);
        setGuess("");
        return;
      }

      if (key.length > 1) return;
      if (guess.length >= word.length) return;

      setGuess(guess + key);
    }

    document.addEventListener("keyup", onKeyPress);

    return () => {
      document.removeEventListener("keyup", onKeyPress);
    };
  }, [word, previousGuesses, guess, isGameEnding, isAcceptingInput, wordSet]);

  useEffect(() => {
    if (!isGameEnding) {
      setIsGameEnding(previousGuesses.length >= settings.maxAttempts);
    }
  }, [isGameEnding, settings, previousGuesses]);

  if (wordsQuery.isLoading || keysQuery.isLoading) return <p>Loading...</p>;

  if (wordsQuery.isError || keysQuery.isError)
    return <p>Failed to load words</p>;
  return (
    <div className="App">
      <Mosaic
        word={word}
        guess={guess}
        previousGuesses={previousGuesses}
        showGuesses={!isGameOver}
        isGuessValid={isGuessValid}
        maxAttempts={settings.maxAttempts}
        showCursor={isAcceptingInput}
        onCurrentWordFlipEnd={(isFlipped) => {
          setIsRevealingWord(false);
          isFlipped ? requestEndOfRoundCheck() : isGameOver && reset();
        }}
      />
      <span className="body-small" style={{ textAlign: "center" }}>
        With words from{" "}
        <a
          href="https://spraakbanken.gu.se/en/projects/kelly"
          target="_blank"
          rel="noreferrer"
        >
          the Kelly project
        </a>
        .
      </span>
      <div className="bottom-sticky">
        <Word
          frontOpts={{
            value: Array.from({ length: word.length }, () => "?").join(""),
          }}
          backOpts={{
            value: isGameEnding ? word : revealedWord,
            getLetterState: (i, l) =>
              revealedWord.charAt(i) === l
                ? TileState.Correct
                : TileState.Incorrect,
          }}
          flipLetter={(i) =>
            !isGameOver &&
            (isGameEnding || revealedWord.charAt(i).trim().length > 0)
          }
        />
        <Keyboard
          keyboardLayout={keyboardLayout}
          letterToTileState={uiSyncedLetterToTileState}
          enterEnabled={isGuessValid}
          backspaceEnabled={guess.length > 0}
        />
      </div>
    </div>
  );
}

export default App;

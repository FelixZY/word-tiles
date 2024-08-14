import { DataStore } from "../storage/Table";

type Statistics = {
  totalGames: number;
  victories: number;
  defeats: number;
  attemptsToVictory: {
    [attempts: string]: number | undefined;
  };
};

const NAME = "statistics";
const VERSION = 1;
export const Statistics = new (class extends DataStore<Statistics> {
  constructor() {
    super(VERSION, NAME, {
      totalGames: 0,
      victories: 0,
      defeats: 0,
      attemptsToVictory: {},
    });
  }
  protected migrate(fromVersion: number, data: any): Statistics {
    return data;
  }
})();

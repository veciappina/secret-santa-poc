import { Player } from '../models';
import getRandomNumber from '../utils/getRandomNumber';
import EmailClient from './EmailClient';

export default class SecretSanta {
  constructor(private players: Player[], private debugMode = false) {}

  getCircleCount(count = 0, player?: Player, initialPlayer?: Player): number {
    if (player === undefined) {
      player = this.players[getRandomNumber(this.players.length)];
    }

    if (initialPlayer === undefined) {
      initialPlayer = player;
    } else if (player.name === initialPlayer.name) {
      return count;
    }
    return this.getCircleCount(
      // eslint-disable-next-line no-plusplus
      ++count,
      this.players.find((p) => p.name === player!.secretBuddy)!,
      initialPlayer
    );
  }

  getCircleChain(chain = '', player?: Player, initialPlayer?: Player): string {
    const chainer = ' -> ';
    if (player === undefined) {
      player = this.players[getRandomNumber(this.players.length)];
    }
    if (initialPlayer === undefined) {
      initialPlayer = player;
    } else if (player.name === initialPlayer.name) {
      return chain + player.name;
    }
    return this.getCircleChain(
      `${chain}${player.name}${chainer}`,
      this.players.find((p) => p.name === player!.secretBuddy)!,
      initialPlayer
    );
  }

  playersHaveInnerCircles(players: Player[]): boolean {
    return this.getCircleCount() !== players.length;
  }

  get forcedBuddies(): string[] {
    return this.players.filter((p) => p.forceBuddy !== undefined).map((p) => p.forceBuddy!);
  }

  validateForceBuddies(): void {
    const playersWithForceBuddies = this.players.filter((p) => p.forceBuddy !== undefined);
    // eslint-disable-next-line no-restricted-syntax
    for (const player of playersWithForceBuddies) {
      if (player.name === player.forceBuddy)
        throw new Error('A player cannot have itself as a forcedBuddy');
    }
    // detect if forcedBuddies contains duplicates
    if (this.forcedBuddies.length !== new Set(this.forcedBuddies).size) {
      throw new Error('There are duplicate forcedBuddies');
    }
    // sort players starting with those that have a forcedBuddy
    this.players.sort((a, b) => {
      if (a.forceBuddy !== undefined && b.forceBuddy === undefined) return -1;
      if (a.forceBuddy === undefined && b.forceBuddy !== undefined) return 1;
      return 0;
    });
  }

  assignSecretSantas(): void {
    const playersWithSecretSantaAssigned: Player[] = [];
    const indexOfPlayersWithSecretBuddyAssigned: number[] = [];
    const indexOfPlayersThatAreAlreadyReceivingGift: number[] = [];
    this.validateForceBuddies();

    try {
      while (playersWithSecretSantaAssigned.length < this.players.length) {
        const currentPlayerIndex = getRandomNumber(
          this.players.length,
          indexOfPlayersWithSecretBuddyAssigned
        );
        const currentPlayer = this.players[currentPlayerIndex];
        let secretSantaIndex: number;

        if (currentPlayer.forceBuddy !== undefined) {
          currentPlayer.secretBuddy = currentPlayer.forceBuddy;
          secretSantaIndex = this.players.findIndex((p) => p.name === currentPlayer.forceBuddy);
        } else {
          const indexOfPlayersThatAreForcedBuddies = this.forcedBuddies.map((forcedBuddy) =>
            this.players.map((p) => p.name).indexOf(forcedBuddy)
          );
          secretSantaIndex = getRandomNumber(this.players.length, [
            ...new Set([
              currentPlayerIndex,
              ...indexOfPlayersThatAreAlreadyReceivingGift,
              ...indexOfPlayersThatAreForcedBuddies,
            ]),
          ]);
          currentPlayer.secretBuddy = this.players[secretSantaIndex].name;
        }

        indexOfPlayersWithSecretBuddyAssigned.push(currentPlayerIndex);
        indexOfPlayersThatAreAlreadyReceivingGift.push(secretSantaIndex);
        playersWithSecretSantaAssigned.push(currentPlayer);
      }
    } catch (e) {
      this.assignSecretSantas();
      return;
    }

    if (this.playersHaveInnerCircles(playersWithSecretSantaAssigned)) {
      this.assignSecretSantas();
    } else {
      this.players = playersWithSecretSantaAssigned;
    }
  }

  async notify(): Promise<void> {
    if (this.debugMode) {
      console.log(this.getCircleChain());
      return;
    }

    const emailClient = new EmailClient();
    await emailClient.init();
    const promises: Promise<void>[] = this.players.map(emailClient.sendInfoToPlayer);
    await Promise.all(promises);
  }
}

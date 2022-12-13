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

  assignSecretSantas(): void {
    const playersWithSecretSantaAssigned: Player[] = [];
    const indexOfPlayersWithSecretBuddyAssigned: number[] = [];
    const indexOfPlayersThatAreAlreadyReceivingGift: number[] = [];

    try {
      while (playersWithSecretSantaAssigned.length < this.players.length) {
        const currentPlayerIndex = getRandomNumber(
          this.players.length,
          indexOfPlayersWithSecretBuddyAssigned
        );
        const currentPlayer = this.players[currentPlayerIndex];

        const secretSantaIndex = getRandomNumber(this.players.length, [
          ...new Set([currentPlayerIndex, ...indexOfPlayersThatAreAlreadyReceivingGift]),
        ]);

        currentPlayer.secretBuddy = this.players[secretSantaIndex].name;
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

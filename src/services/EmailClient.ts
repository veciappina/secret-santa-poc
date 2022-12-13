import Email from 'email-templates';
import { Player } from '../models';

export default class EmailClient {
  private email?: Email;

  private sender?: string;

  constructor() {
    this.sendInfoToPlayer = this.sendInfoToPlayer.bind(this);
  }

  async init() {
    this.email = new Email({
      message: {
        from: `"VictorBot 👻" <${this.sender ?? 'victor@santabot.com'}>`,
      },
      send: true,
      preview: false,
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
    });
  }

  async sendInfoToPlayer(player: Player): Promise<void> {
    await this.email?.send({
      message: {
        to: `${player.name} <${player.email}>`,
        replyTo: this.sender,
      },
      template: 'secretSanta',
      locals: player,
    });
  }
}

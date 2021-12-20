import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import { Player } from '../models';
import CommandLine from './CommandLine';
import HTMLParser from './HTMLParser';

export default class EmailClient {
  private transporter?: Transporter;

  private sender?: string;

  private password?: string;

  constructor() {
    this.sendInfoToPlayer = this.sendInfoToPlayer.bind(this);
  }

  async init() {
    const promptResult = await CommandLine.promptUser([
      {
        name: 'gmail',
        validator: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        warning: 'please enter a valid email account',
      },
      { name: 'password', hidden: true },
    ]);
    this.sender = promptResult.gmail;
    this.password = promptResult.password;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.sender,
        pass: this.password,
      },
    });
  }

  async sendInfoToPlayer(player: Player): Promise<void> {
    const htmlParser = new HTMLParser(path.join(__dirname, '..', 'utils', 'emailTemplate.html'));
    const message = htmlParser.getWithInjectedContent({
      header: `Hola ${player.name},`,
      secretBuddy: player.secretBuddy!,
    });
    await this.transporter?.sendMail({
      from: `"VictorBot 👻" <${this.sender}>`,
      to: `${player.name} <${player.email}>`,
      subject: 'Tu amigo secreto está listo ✔',
      replyTo: this.sender,
      html: message,
    });
  }
}

import * as dotenv from 'dotenv';
import { Player } from './models';
import SecretSanta from './services/SecretSanta';

dotenv.config();

const players: Player[] = [
  { name: 'Victor', email: 'vecl21@gmail.com' },
  { name: 'Roraima', email: 'royadiro2@gmail.com' },
  { name: 'Maigualida', email: 'maiguarod@gmail.com' },
  { name: 'Yenissei', email: 'yenisseid@gmail.com' },
  { name: 'Ricardo', email: 'rjdiaz154@gmail.com' },
  { name: 'Fernanda', email: 'rjdiaz154@gmail.com' },
];

const secretSanta = new SecretSanta(players);
secretSanta.assignSecretSantas();
secretSanta.notify().then().catch(console.error);

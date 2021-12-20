import { Player } from './models';
import SecretSanta from './services/SecretSanta';

const players: Player[] = [
  { name: 'Victor', email: 'victor_cl21@hotmail.com' },
  { name: 'Roraima', email: 'royadiro2@gmail.com' },
  { name: 'Maigualida', email: 'maiguarod@gmail.com' },
  { name: 'Yenissei', email: 'yenisseid@gmail.com' },
  { name: 'Ricardo', email: 'rjdiaz154@gmail.com' },
];

const secretSanta = new SecretSanta(players);
secretSanta.assignSecretSantas();
secretSanta.notify().then().catch(console.error);

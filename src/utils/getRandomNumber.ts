export default function getRandomNumber(max: number, block?: number[]) {
  let random = Math.floor(Math.random() * max);
  if (block !== undefined) {
    block = block.filter((b) => b <= max);
    if (block.length >= max) {
      throw new Error(
        `Cannot obtain a random number with of max ${max} with this block: ${block.join(',')}`
      );
    }
    if (block.includes(random)) random = getRandomNumber(max, block);
  }
  return random;
}

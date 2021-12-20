const prompt = require('prompt');

export default class CommandLine {
  static promptUser(
    properties: {
      name: string;
      validator?: RegExp;
      warning?: string;
      hidden?: boolean;
    }[]
  ): Promise<{ [key in string]: string }> {
    return new Promise((resolve, reject) => {
      prompt.start();
      prompt.get(properties, (err: Error, result: { [key in string]: string }) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
}

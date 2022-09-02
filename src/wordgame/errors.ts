abstract class BaseLetterError extends Error {
  readonly letter;
  protected constructor(letter: string, message?: string) {
    super(message);
    this.letter = letter;
  }
}

export class NotALetterError extends BaseLetterError {
  constructor(letter: string) {
    super(letter, `not a single letter: "${letter}"`);
  }
}

export class AlreadyGuessedLetterError extends BaseLetterError {
  constructor(letter: string) {
    super(letter, `"${letter}" has already been guessed`);
  }
}

export class AlreadySolvedError extends Error {
  constructor() {
    super();
  }
}

export class NoGuessesRemainingError extends Error {
  constructor() {
    super();
  }
}

export class EmptyWordListError extends Error {
  constructor() {
    super();
  }
}

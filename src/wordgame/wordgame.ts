import * as fs from 'fs';
import * as path from 'path';
import {
  AlreadyGuessedLetterError,
  AlreadySolvedError,
  EmptyWordListError,
  NoGuessesRemainingError,
  NotALetterError,
} from './errors';

/**
 * A simple word guessing game framework, similar to Hangman.
 */
export class WordGame {
  /**
   * The number of incorrect allowed guesses for a game when not specified in the constructor.
   */
  static readonly defaultGuesses = 9;

  /**
   * The list of words for a game when not otherwise specified.
   */
  static readonly defaultWordList = WordGame.processWordList(
    fs.readFileSync(path.resolve(__dirname, './words.txt')).toString().split('\n')
  );

  /**
   * The number of incorrect guesses allowed for a {@link WordGameSession}.
   */
  readonly guesses: number;

  private readonly _words: string[];

  /**
   * Note that any number of allowed incorrect guesses greater than 25 will allow the player to win every time as there
   * are enough attempts to cover the entire alphabet.
   * For the word list, whitespace will be trimmed from both ends or each entry, and every word converted to all caps.
   * Any string that isn't composed entirely of the letters A-Z will be removed.
   *
   * @param {object?} args Optional constructor arguments.
   * @param {number?} args.guesses The number of incorrect attempts the player will have to guess the word. Defaults to
   *   {@link WordGame.defaultGuesses}.
   * @param {string[]?} args.words The list of words to use for guessing. Defaults to {@link WordGame.defaultWordList}.
   * @throws {EmptyWordListError} Throws error if there is not at least one valid word after filtering.
   * @throws {RangeError} Throws error is `guesses` is not greater than zero.
   */
  constructor(args: { guesses?: number; words?: string[] } = {}) {
    this.guesses = args.guesses !== undefined ? args.guesses : WordGame.defaultGuesses;
    if (this.guesses < 1) {
      throw new RangeError('must allow at least one guess');
    }
    this._words = args.words === undefined || args.words.length == 0 ? [] : WordGame.processWordList(args.words);
  }

  /**
   * Start a new game for a random word chosen from {@link words}.
   *
   *  @returns {WordGameSession} A game session with a random word selected from the options returned by {@link words}.
   */
  createSession(): WordGameSessionImpl {
    const words = this.words;
    return new WordGameSessionImpl(words[Math.floor(Math.random() * words.length)], this.guesses);
  }

  /**
   * @returns {string[]} The list of words to use for guessing.
   */
  get words(): string[] {
    return this._words.length > 0 ? this._words : WordGame.defaultWordList;
  }

  /**
   * Takes an array of strings, converts each word to uppercase, and filters out anything that isn't a single word, i.e.,
   * being composed exclusives of letters (a-z). Leading and trailing whitespace is removed.
   *
   * @param {string[]} words The list of strings to filter.
   * @returns {string[]} The sorted and filtered list, containing only uppercase words.
   * @throws {EmptyWordListError} If filtered list is empty.
   */
  static processWordList(words: string[]): string[] {
    const modifiedWords = words
      .map((w) => {
        return w.trim().toUpperCase();
      }) // force uppercase
      .filter((w) => {
        return w.match(/^[A-Z]+$/);
      }); // ignore any member that isn't just a word
    if (modifiedWords.length < 1) {
      throw new EmptyWordListError();
    }
    return modifiedWords.sort();
  }
}

/**
 * Individual session tracking a game for a particular word.
 * A WordGameSession is created using the {@link WordGame.createSession} method.
 *
 * A basic game flow would look something like:
 * ```node
 * const game = new WordGame();
 * const session = game.createSession();
 * do {
 *   // show progress
 *   const guess = getGuessFromPlayer();
 *   try {
 *     const correct = session.makeGuess(guess);
 *   } catch (ex) {
 *     if (ex instanceof NotALetterError) {
 *       // tell player to use a single letter
 *     } else if (ex instanceof AlreadyGuessedLetterError) {
 *       // tell player to try again
 *     } else {
 *       throw ex;
 *     }
 *   }
 * } while (session.canGuess() && !session.isSolved());
 * if (session.isSolved()) {
 *   // congratulations!
 * } else {
 *   // sad trombone
 * }
 * ```
 *
 * @see WordGame
 */
export interface WordGameSession {
  /**
   * @returns {boolean} TRUE if the player has at least one remaining guess and the secret word hasn't been guessed,
   *   FALSE otherwise.
   */
  canGuess(): boolean;

  /**
   * @param {string} letter The letter to guess.
   * @returns {number} The number of times the given letter appears in the word.
   * @throws {NoGuessesRemainingError}
   * @throws {AlreadyGuessedLetterError}
   * @throws {NotALetterError}
   * @throws {AlreadySolvedError}
   */
  makeGuess(letter: string): number;

  /**
   * @returns {boolean} TRUE if all the letters in the secret word have been guessed, FALSE otherwise.
   */
  isSolved(): boolean;

  /**
   * @param {string} letter The letter to query.
   * @returns {boolean} TRUE if the letter has been guessed, FALSE otherwise.
   * @throws {NotALetterError}
   */
  hasGuessed(letter: string): boolean;

  /**
   * @returns {string} The list of letters already guessed, in the order they were guessed.
   */
  lettersGuessed(): string;

  /**
   * @returns {number} The number of incorrect attempts remaining the player has to guess the word.
   */
  guessesLeft(): number;

  /**
   * @returns {number} The number of times the player has already made a guess, correctly or incorrectly.
   */
  guessesMade(): number;

  /**
   * @returns {number} The number of incorrect attempts the player has to guess the word.
   */
  guessesAllowed(): number;

  /**
   * @returns {string} The word to guess.
   */
  secretWord(): string;
}

/**
 * Implementation of {@link WordGameSession}.
 */
class WordGameSessionImpl implements WordGameSession {
  private readonly word: string;
  private readonly maxGuesses: number;
  private guessed = '';
  private incorrectGuesses = 0;

  constructor(word: string, maxGuesses: number) {
    this.word = WordGame.processWordList([word])[0];
    this.maxGuesses = maxGuesses;
  }

  secretWord(): string {
    return this.word;
  }

  canGuess(): boolean {
    return this.incorrectGuesses < this.maxGuesses && !this.isSolved();
  }

  makeGuess(letter: string): number {
    if (this.isSolved()) {
      throw new AlreadySolvedError();
    }
    if (!this.canGuess()) {
      throw new NoGuessesRemainingError();
    }
    const upperLetter = this.letterCheck(letter);
    if (this.hasGuessedAlreadyUpper(upperLetter)) {
      throw new AlreadyGuessedLetterError(upperLetter);
    }
    // we have a good guess
    this.guessed += upperLetter;
    // how many times does this letter appear in the word?
    const repetitions = this.word.length - this.word.replaceAll(upperLetter, '').length;
    if (repetitions == 0) {
      this.incorrectGuesses += 1;
    }
    return repetitions;
  }

  isSolved(): boolean {
    return this.word.split('').every((letter) => {
      return this.hasGuessedAlreadyUpper(letter);
    });
  }

  hasGuessed(letter: string): boolean {
    return this.hasGuessedAlreadyUpper(this.letterCheck(letter));
  }

  lettersGuessed(): string {
    return this.guessed;
  }

  guessesLeft(): number {
    return this.guessesAllowed() - this.incorrectGuesses;
  }

  guessesMade(): number {
    return this.lettersGuessed().length;
  }

  guessesAllowed(): number {
    return this.maxGuesses;
  }

  private hasGuessedAlreadyUpper(letter: string): boolean {
    // assert(/^[A-Z]$/.test(letter));
    return this.guessed.includes(letter);
  }

  private letterCheck(letter: string): string {
    if (letter.length != 1 || !letter.match(/^[a-zA-z]$/)) {
      throw new NotALetterError(letter);
    }
    return letter.toUpperCase();
  }
}

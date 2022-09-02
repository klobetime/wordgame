import {
  WordGame,
  NotALetterError,
  EmptyWordListError,
  AlreadyGuessedLetterError,
  AlreadySolvedError,
  NoGuessesRemainingError,
} from '../src/wordgame';

describe('constructors', () => {
  it('default guess value', () => {
    expect(WordGame.defaultGuesses).toBe(9);
  });

  it('defaults', () => {
    const game = new WordGame();
    expect(game.guesses).toBe(WordGame.defaultGuesses);
    expect(isValidWordList(game.words)).toBeTruthy();
    expect(game.words.length).toBeGreaterThanOrEqual(300);
  });

  it('with valid guess', () => {
    const game = new WordGame({ guesses: 11 });
    expect(game.guesses).toBe(11);
  });

  it('with invalid guess', () => {
    expect(() => {
      new WordGame({ guesses: 0 });
    }).toThrow(RangeError);
  });

  it('with valid word list', () => {
    const game = new WordGame({ words: ['  Fred', 'daphne  ', ' veLmA ', 'Scooby Doo', 'SHAGGY'] });
    expect(isValidWordList(game.words)).toBeTruthy();
    expect(game.words).toStrictEqual(['DAPHNE', 'FRED', 'SHAGGY', 'VELMA']);
  });

  it('with invalid word list', () => {
    expect(() => {
      // eslint-disable-next-line quotes
      new WordGame({ words: ['', '   ', 'O.M.A.C.', "R'as", 'Geo-Force', 'Swamp Thing', '2Face', 'Jonah_Hex'] });
    }).toThrow(EmptyWordListError);
  });

  it('with valid guesses and word list', () => {
    const game = new WordGame({ words: ['Ricky', 'Earl'], guesses: 2 });
    expect(game.guesses).toBe(2);
    expect(isValidWordList(game.words)).toBeTruthy();
    expect(game.words).toStrictEqual(['EARL', 'RICKY']);
  });

  it('processWordList is empty', () => {
    expect(() => {
      WordGame.processWordList([]);
    }).toThrow(EmptyWordListError);
  });
});

describe('session creation', () => {
  it('defaults', () => {
    const game = new WordGame();
    const session = game.createSession();
    expect(session.guessesAllowed()).toBe(WordGame.defaultGuesses);
    expect(session.guessesLeft()).toBe(WordGame.defaultGuesses);
    expect(session.canGuess()).toBeTruthy();
    expect(session.isSolved()).toBeFalsy();
    expect(session.lettersGuessed()).toBe('');
    expect(isValidWordList([session.secretWord()])).toBeTruthy();
  });

  it('custom', () => {
    const game = new WordGame({ guesses: 7 });
    const session = game.createSession();
    expect(session.guessesAllowed()).toBe(7);
    expect(session.guessesLeft()).toBe(7);
    expect(session.canGuess()).toBeTruthy();
    expect(session.isSolved()).toBeFalsy();
    expect(session.lettersGuessed()).toBe('');
    expect(isValidWordList([session.secretWord()])).toBeTruthy();
  });
});

describe('session operation', () => {
  // build a string containing capital letters A-Z
  // (way more complicated than just a string, but not nearly as much fun!)
  const alphabet = Array.from(Array(26))
    .map((_, x) => {
      return x + 65;
    })
    .map((x) => {
      return String.fromCharCode(x);
    });

  it('nothing has been guessed', () => {
    const session = new WordGame().createSession();
    expect(session.lettersGuessed()).toBe('');
    expect(
      alphabet.every((letter) => {
        return !session.hasGuessed(letter);
      })
    ).toBeTruthy();
  });

  it('guess count loss', () => {
    const session = new WordGame({ guesses: 1, words: ['Bevo'] }).createSession();
    expect(session.guessesAllowed()).toBe(1);
    expect(session.guessesLeft()).toBe(1);
    expect(session.guessesMade()).toBe(0);
    expect(session.canGuess()).toBeTruthy();
    expect(session.isSolved()).toBeFalsy();

    // wrong letter
    expect(session.makeGuess('t')).toBe(0);
    expect(session.guessesAllowed()).toBe(1);
    expect(session.guessesLeft()).toBe(0);
    expect(session.guessesMade()).toBe(1);
    expect(session.canGuess()).toBeFalsy();
    expect(session.isSolved()).toBeFalsy();

    // good guess
    expect(() => {
      session.makeGuess('B');
    }).toThrow(NoGuessesRemainingError);
    expect(session.guessesAllowed()).toBe(1);
    expect(session.guessesLeft()).toBe(0);
    expect(session.guessesMade()).toBe(1);
    expect(session.canGuess()).toBeFalsy();
    expect(session.isSolved()).toBeFalsy();

    // bad guess
    expect(() => {
      session.makeGuess('q');
    }).toThrow(NoGuessesRemainingError);
    expect(session.guessesAllowed()).toBe(1);
    expect(session.guessesLeft()).toBe(0);
    expect(session.guessesMade()).toBe(1);
    expect(session.canGuess()).toBeFalsy();
    expect(session.isSolved()).toBeFalsy();
  });

  it('guess count win', () => {
    const session = new WordGame({ guesses: 5, words: ['gigahertz'] }).createSession();
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(5);
    expect(session.guessesMade()).toBe(0);
    expect(session.canGuess()).toBeTruthy();

    // bad letter
    expect(session.makeGuess('x')).toBe(0);
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(4);
    expect(session.guessesMade()).toBe(1);
    expect(session.canGuess()).toBeTruthy();

    // good letter
    expect(session.makeGuess('G')).toBe(2);
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(4);
    expect(session.guessesMade()).toBe(2);
    expect(session.canGuess()).toBeTruthy();

    // not a letter
    expect(() => {
      session.makeGuess('pea');
    }).toThrow(NotALetterError);
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(4);
    expect(session.guessesMade()).toBe(2);
    expect(session.canGuess()).toBeTruthy();

    // duplicate letter
    expect(session.makeGuess('y')).toBe(0);
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(3);
    expect(session.guessesMade()).toBe(3);
    expect(session.canGuess()).toBeTruthy();
    expect(() => {
      session.makeGuess('Y');
    }).toThrow(AlreadyGuessedLetterError);
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(3);
    expect(session.guessesMade()).toBe(3);
    expect(session.canGuess()).toBeTruthy();

    // cspell:disable-next-line
    'iahert'.split('').forEach((letter, index) => {
      expect(session.makeGuess(letter)).toBe(1);
      expect(session.guessesAllowed()).toBe(5);
      expect(session.guessesLeft()).toBe(3);
      expect(session.guessesMade()).toBe(4 + index);
      expect(session.canGuess()).toBeTruthy();
    });

    // solved!
    expect(session.isSolved()).toBeFalsy();
    expect(session.makeGuess('Z')).toBe(1);
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(3);
    expect(session.guessesMade()).toBe(10);
    expect(session.canGuess()).toBeFalsy();
    expect(session.isSolved()).toBeTruthy();

    // now what?
    expect(() => {
      session.makeGuess('Q');
    }).toThrow(AlreadySolvedError);
    expect(session.guessesAllowed()).toBe(5);
    expect(session.guessesLeft()).toBe(3);
    expect(session.guessesMade()).toBe(10);
    expect(session.canGuess()).toBeFalsy();
  });

  it('guess everything', () => {
    const session = new WordGame({ guesses: 26, words: ['skate', 'stake', 'steak', 'takes'] }).createSession();
    expect(session.lettersGuessed()).toBe('');
    expect(
      alphabet.every((letter) => {
        return !session.hasGuessed(letter);
      })
    ).toBeTruthy();

    // make a bad guess
    expect(session.makeGuess('x')).toBe(0);
    expect(session.lettersGuessed()).toBe('X');
    expect(
      alphabet.every((letter) => {
        return session.hasGuessed(letter) === (letter === 'X');
      })
    ).toBeTruthy();

    // make a good guess
    expect(session.makeGuess('k')).toBe(1);
    expect(session.lettersGuessed()).toBe('XK');
    expect(
      alphabet.every((letter) => {
        return session.hasGuessed(letter) === /^[KX]$/.test(letter);
      })
    ).toBeTruthy();

    // guess everything that isn't already guessed or in the word
    alphabet
      .filter((letter) => {
        return /^[^XKEATS]$/.test(letter); // cspell:disable-line
      })
      .forEach((letter) => {
        expect(session.makeGuess(letter)).toBe(0);
      });
    expect(session.lettersGuessed()).toBe('XKBCDFGHIJLMNOPQRUVWYZ'); // cspell:disable-line
    expect(
      alphabet.every((letter) => {
        return session.hasGuessed(letter) !== /^[EATS]$/.test(letter);
      })
    ).toBeTruthy();

    // guess the rest
    'EATS'.split('').forEach((letter) => {
      expect(session.makeGuess(letter)).toBe(1);
    });
    expect(session.lettersGuessed()).toBe('XKBCDFGHIJLMNOPQRUVWYZEATS'); // cspell:disable-line
    expect(
      alphabet.every((letter) => {
        return session.hasGuessed(letter);
      })
    ).toBeTruthy();

    // wrap it up!
    expect(session.isSolved()).toBeTruthy();
  });
});

describe('errors', () => {
  it('check NotALetterError', () => {
    const error = new NotALetterError('jay');
    expect(error.message).toBe('not a single letter: "jay"');
    expect(error.letter).toBe('jay');
  });

  it('check AlreadyGuessedLetterError', () => {
    const error = new AlreadyGuessedLetterError('kay');
    expect(error.message).toBe('"kay" has already been guessed');
    expect(error.letter).toBe('kay');
  });

  it('check AlreadySolvedError', () => {
    const error = new AlreadySolvedError();
    expect(error.message).toBe('');
  });

  it('check NoGuessesRemainingError', () => {
    const error = new NoGuessesRemainingError();
    expect(error.message).toBe('');
  });

  it('check EmptyWordListError', () => {
    const error = new EmptyWordListError();
    expect(error.message).toBe('');
  });
});

/**
 * @param {string[]} words Array of strings to test
 * @returns {boolean} TRUE if every array element is composed of exclusively uppercase letters and the array isn't empty.
 */
function isValidWordList(words: string[]): boolean {
  return (
    words.length > 0 &&
    words.every((word) => {
      return word.match(/^[A-Z]+$/);
    })
  );
}

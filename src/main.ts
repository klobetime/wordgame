import { WordGame, NotALetterError, AlreadyGuessedLetterError } from './wordgame';
import pluralize = require('pluralize');

// use prompt-sync for user input
import promptSync from 'prompt-sync';
const prompt = promptSync();

/* eslint-disable no-console */

// create a new game
const session = new WordGame().createSession();

// main loop
do {
  // user prompt
  console.log(`You have ${pluralize('guess', session.guessesLeft(), true)} left.`);
  if (session.lettersGuessed().length > 0) {
    console.log(`Already guessed: ${session.lettersGuessed().split('').sort().join(' ')}`);
  }

  // show the secret word, replacing letters yet to be guessed with underscores
  console.log(
    `Secret word: ${session
      .secretWord()
      .split('')
      .map((letter) => {
        return session.hasGuessed(letter) ? letter : '_';
      })
      .join(' ')}`
  );

  // ask user for input
  const guess = prompt('Choose a letter: ');

  // check the letter
  try {
    const correct = session.makeGuess(guess);
    if (correct > 0) {
      console.log(`Correct! You found ${pluralize('letter', correct, true)}!`);
    } else {
      console.log('Wrong!');
    }
  } catch (ex) {
    if (ex instanceof NotALetterError) {
      console.log(`"${guess}" is not a letter. Must be a single character: A-Z.`);
    } else if (ex instanceof AlreadyGuessedLetterError) {
      console.log(`"${guess}" has already been guessed.`);
    } else {
      throw ex;
    }
  }

  // loop until the word is guessed or there are no more guesses
} while (session.canGuess() && !session.isSolved());

// report the end game
if (session.isSolved()) {
  console.log(`Congratulations! You guessed ${session.secretWord()} in ${pluralize('guess', session.guessesMade(), true)}.`);
} else {
  console.log(`Too bad, you failed to guess ${session.secretWord()}.`);
}

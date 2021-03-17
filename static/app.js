class Boggle {
    constructor() {
        this.score = 0;                 // the score for this game
        this.isTimeUp = 0;              // set to true when the game is over
        this.seen = [];                 // array of words that have been submitted during this game
        this.maxTime = 60;              // the number of seconds the game is active for
        this.time = this.maxTime;       // time elapsed in the game
        this.timer = undefined;         // the indentifier for the timer so it can be disposed
    }

    updateScore(result, guess) {
        // if the guessed word is in the dictionary and on the board 
        // update the score with the length of the word
        if(result.result === 'ok') {
            this.score = this.score + guess.length;
        }
        return this.score;
    }

    decrementTimer() {
        // increment the timer by one as long as the timer has not exceed the game active time
        if(this.time > 0) {
            this.time = this.time -= 1;
        } else {
        // if the elapsed time has exceeded the max game time set the game over flag and dispose of the interval
            this.isTimeUp = 1;
            clearInterval(this.timer);
        }
    }

    startTimer() {
        // start the timer
        this.timer = setInterval(() => {this.decrementTimer()}, 1000);
    }
}

async function submitGuess(guess) {
    // make a get request submitting the guessed word
    params = {'params': {'word': guess}};
    response = await axios.get('/check_guess', params);
    return response.data;
}

function showGuessResult(result) {
    // update the DOM with the result of the guessed word
    if(result.result === 'ok') {
        $('#result').text('Word Found!');
    } else if (result.result === 'not-word') {
        $('#result').text('Word not in dictionary');
    } else if (result.result === 'not-on-board') {
        $('#result').text('Word not on board');
    } else if(result.result === 'seen') {
        $('#result').text('Word already guessed');
    }
}

function showScore(score) {
    // udpate the DOM with the current score
    $('#score').text(`Score: ${boggle.score}`);
}

function showTimer() {
    // update the DOM with the current game time or that the game time has reached the max and the game is over
    if(boggle.isTimeUp === 1){
        $('#time').text('Time is up!');
    } else {
        $('#time').text(`${boggle.time} seconds`);
    }
}

function monitorIsTimeUp() {
    // monitor the isTimeUp class property
    // end the game when it becomes true
    if(boggle.isTimeUp === 1) {
        gameOver();
        showTimer('Time is up!');
    } else {
        showTimer()
    }
}

$('#submit-guess').on('click', async function(evt) {
    // handle the user's word guess
    evt.preventDefault();
    // as long as the game is still active collect the user's guess
    if(!boggle.isTimeUp) {
        guess = $('#guess').val();
        // if the user's guess has already been used this game inform the user 
        // and do not submit to the server for validation
        if(boggle.seen.find((word) => word === guess)) {
            showGuessResult({'result': 'seen'});
        } else {
        // if the word has not been guessed already this game, 
        // add the word to the array of already guessed words
        // and submit to the server for validation and update the DOM
            boggle.seen.push(guess);
            result = await submitGuess(guess);
            showGuessResult(result);
            showScore(boggle.updateScore(result, guess));
        }
        // always clear the input
        $('#guess').val('');
    }
})

async function gameOver() {
    // when the game is over stop monitoring the isTimeUp class property
    // and make a post request to the server to update the game count and high score in the session
    params = {
        'params': {
            'score': boggle.score
        }
    }
    clearInterval(gameMonitor);
    response = await axios.post('/update_stats', params);
}

// create a new instance of the class for this game
let boggle = new Boggle();
// start the game timer
boggle.startTimer();
// monitor the timer
gameMonitor = setInterval(monitorIsTimeUp, 100)
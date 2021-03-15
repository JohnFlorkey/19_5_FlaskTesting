SUBMIT_GUESS_URL = '/check_guess'

let score = 0;
let time = 0;
let isTimeUp = 0;

async function submitGuess(guess) {
    params = {'params': {'word': guess}}
    response = await axios.get(SUBMIT_GUESS_URL, params)
    return response.data
}

function showGuessResult(result) {
    if(result.result === 'ok') {
        $('#result').text('Word Found!')
    }
    else if (result.result === 'not-word') {
        $('#result').text('Word not in dictionary')
    }
    else if (result.result === 'not-on-board') {
        $('#result').text('Word not on board')
    }    
}

function updateScore(result, guess) {
    if(result.result === 'ok') {
        score = score + guess.length
    }
    return score
}

function showScore(score) {
    $('#score').text(`Score: ${score}`)
}

function showTime() {
    $('#time').text(`${60 - time} seconds`);
}

function showTimeUp() {
    $('#time').text('Time is up!')
}
$('#submit-guess').on('click', async function(evt) {
    evt.preventDefault()

    if(!isTimeUp) {
        guess = $('#guess').val()
        result = await submitGuess(guess)
        $('#guess').val('')
        showGuessResult(result)
        showScore(updateScore(result, guess))
    }
})

async function gameOver() {
    params = {
        'params': {
            'score': score
        }
    }
    response = await axios.post('/update_stats', params)
}

const timer = setInterval(() => {
    time = time += 1;
    showTime();
}, 1000);

const monitorTimer = setInterval(() => {
    if(time >= 60) {
        isTimeUp = 1;
        showTimeUp();
        clearInterval(timer)
        clearInterval(monitorTimer)
        gameOver()
    }
}, 100);
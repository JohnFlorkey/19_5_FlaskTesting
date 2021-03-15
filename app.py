from flask import Flask, render_template, session, request, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

app = Flask(__name__)

app.config['SECRET_KEY'] = 'notmuchofasecret'
debug = DebugToolbarExtension(app)

# create an instance of the Boggle class
boggle_game = Boggle()

@app.route('/')
def show_board():
    # ask our instance to create a game board
    board = boggle_game.make_board()
    session['board'] = board
    return render_template('game.html', board=board)

@app.route('/check_guess')
def check_guess():
    word = request.args.get('word')
    board = session['board']
    result = boggle_game.check_valid_word(board, word)
    return jsonify(result=result)

@app.route('/update_stats', methods=['POST'])
def update_stats():
    game_count = session.get('game_count', 0)
    print(game_count)
    session['game_count'] = game_count + 1

    high_score = session.get('high_score', 0)
    print(high_score)
    new_score = request.json['params']['score']
    print(new_score)
    if new_score > high_score:
        high_score = new_score
    session['high_score'] = high_score
    return ''
from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle
import json

app.config['TESTING'] = True

app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

class FlaskTests(TestCase):

    # TODO -- write tests for every view function / feature!
    test_board = [['Q', 'G', 'D', 'B', 'J'], ['X', 'G', 'K', 'W', 'J'], ['J', 'O', 'R', 'O', 'D'], ['Y', 'Q', 'N', 'B', 'U'], ['G', 'Q', 'R', 'R', 'L']]

    def test_show_board(self):
        with app.test_client() as client:
            resp = client.get('/')
            html = resp.get_data(as_text=True)
            board = session['board']

            self.assertEqual(resp.status_code, 200)     # successfuel get request
            self.assertIn('<tr id="0">', html)          # html was rendered with a table row with id = 0
            self.assertTrue(board)                      # board exists in the session
            self.assertIsInstance(board, list)          # board is a list
            
    def test_checkguess_ok(self, test_board=test_board):
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['board'] = test_board
            resp = client.get("/check_guess?word=rod")
            data = json.loads(resp.get_data(as_text=True))

            self.assertEqual(resp.status_code, 200)
            self.assertEqual({'result':'ok'}, data)

    def test_checkguess_not_on_board(self, test_board=test_board):
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['board'] = test_board
            resp = client.get("/check_guess?word=plank")
            data = json.loads(resp.get_data(as_text=True))

            self.assertEqual(resp.status_code, 200)
            self.assertEqual({'result':'not-on-board'}, data)

    def test_checkguess_not_word(self, test_board=test_board):
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['board'] = test_board
            resp = client.get("/check_guess?word=chungus")
            data = json.loads(resp.get_data(as_text=True))

            self.assertEqual(resp.status_code, 200)
            self.assertEqual({'result':'not-word'}, data)

    def test_update_stats_new_high_score(self, test_board=test_board):
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['board'] = test_board
                change_session['high_score'] = 9
                change_session['game_count'] = 22
            resp = client.post('/update_stats', 
                                json={'params':{'score':11}})
            data = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            self.assertEqual('', data)
            self.assertEqual(11, session['high_score'])
            self.assertEqual(23, session['game_count'])

    def test_update_stats_high_score_no_change(self, test_board=test_board):
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['board'] = test_board
                change_session['high_score'] = 14
                change_session['game_count'] = 22
            resp = client.post('/update_stats', 
                                json={'params':{'score':11}})
            data = resp.get_data(as_text=True)

            self.assertEqual(resp.status_code, 200)
            self.assertEqual('', data)
            self.assertEqual(14, session['high_score'])
            self.assertEqual(23, session['game_count'])
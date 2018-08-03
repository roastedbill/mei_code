from flask import Flask
from flask import send_from_directory
import music_suggestion


app = Flask(__name__)
app.config.setdefault('WTF_CSRF_METHODS', ['POST', 'PUT', 'PATCH'])


@app.route('/music_suggestion/<text>')
def get_music_suggestion(text):
	emotion = music_suggestion.get_emotion(text)
	print 'get_music_suggestion: %s -> %s' % (text, emotion)
	return emotion


@app.route('/music/<path:filename>')
def download_music(filename):
	return send_from_directory('music', filename)

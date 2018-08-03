import paralleldots


class TextToEmotionProcessor:
	def __init__(self):
		paralleldots.set_api_key('PrRnUIkEPXEJPW5ODcL8sne5dH0vh5clVVt8LPAZUQQ')
		self.emotion_map = {
			"Excited": 1,
			"Happy": 2,
			"Sarcasm": 3,
			"Bored": 4,
			"Sad": 5,
			"Fear": 6,
			"Angry": 7,
		}

	def get_emotion_data_from_text(self, text):
		res = paralleldots.emotion(text)
		return res.get("emotion").get("emotion")

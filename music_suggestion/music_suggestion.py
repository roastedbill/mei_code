import text_to_emotion_processor

text_to_emotion = text_to_emotion_processor.TextToEmotionProcessor()


def get_emotion(text):
	return text_to_emotion.get_emotion_data_from_text(text)

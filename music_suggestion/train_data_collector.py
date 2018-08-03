import csv
import time

import text_to_emotion_processor


if __name__ == "__main__":
	text_to_emotion = text_to_emotion_processor.TextToEmotionProcessor()
	with open('training_data.csv', 'w+') as csvfile:
		writer = csv.writer(csvfile)
		while True:
			start_time = time.time()
			text = raw_input("Tell me something!")
			if text == "q":
				break

			time_elapse = time.time() - start_time
			data_set = text_to_emotion.get_emotion_data_from_text(text)
			data_set.append(time_elapse)
			data_set.append(text)
			music = raw_input("Choose the music you need!")
			data_set.append(music)

			writer.writerow(data_set)

from flask import Flask, request, jsonify
import cv2
import numpy as np
from tensorflow.keras.models import load_model

app = Flask(__name__)
model = load_model('D:\semester 5\\trials_and_ tests\Video-call\emotion_detection_model.h5')

emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

def preprocess_image(image):
    resized_image = cv2.resize(image, (48, 48))  # Resize to 48x48 pixels as required by the model
    normalized_image = resized_image / 255.0  # Normalize pixel values to [0, 1]
    expanded_image = np.expand_dims(normalized_image, axis=0)  # Expand dimensions to match model's input shape
    return expanded_image

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    image_data = data['image']  # Base64 encoded image data

    # Convert base64 to image
    img_data = np.frombuffer(image_data, dtype=np.uint8)
    img = cv2.imdecode(img_data, cv2.IMREAD_COLOR)

    # Preprocess image and get emotion prediction
    processed_img = preprocess_image(img)
    preds = model.predict(processed_img)
    emotion = emotion_labels[np.argmax(preds)]

    return jsonify({'emotion': emotion})

if __name__ == '__main__':
    app.run(port=5000)

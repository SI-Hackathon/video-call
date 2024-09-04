const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cv = require('opencv4nodejs');  // You need to install opencv4nodejs
const { loadModel, preprocessImage } = require('./model');  // Assuming your model code is in model.js

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('video-frame', (dataURL) => {
        const buffer = Buffer.from(dataURL.split(',')[1], 'base64');
        const img = cv.imdecode(buffer);

        // Preprocess the image and get emotion prediction
        const emotion = getEmotionPrediction(img);
        
        // Emit the emotion to the doctor
        io.emit('emotion-label', { id: socket.id, emotion });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

function getEmotionPrediction(img) {
    // Convert to grayscale and resize as per model requirements
    const grayImg = img.bgrToGray();
    const resizedImg = grayImg.resize(48, 48);

    // Preprocess image to fit the model's input requirements
    const processedImg = preprocessImage(resizedImg);

    // Load model and predict emotion
    const model = loadModel('D:/semester 5/trials_and_tests/emotion_detection_model.h5');
    const emotionLabels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'];

    const preds = model.predict(processedImg)[0];
    return emotionLabels[np.argmax(preds)];
}

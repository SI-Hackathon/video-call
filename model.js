const tf = require('@tensorflow/tfjs-node');
const cv = require('opencv4nodejs');

let model;

async function loadModel(modelPath) {
    if (!model) {
        model = await tf.loadLayersModel(`file://${modelPath}`);
    }
    return model;
}

function preprocessImage(image) {
    const resizedImage = image.resize(48, 48);  // Resize to 48x48 pixels as required by the model
    const normalizedImage = resizedImage.div(255.0);  // Normalize pixel values to [0, 1]
    const expandedImage = normalizedImage.expandDims(0);  // Expand dimensions to match model's input shape
    return expandedImage;
}

module.exports = {
    loadModel,
    preprocessImage
};

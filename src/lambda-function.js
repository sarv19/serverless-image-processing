const processImage = require('./processImage');

exports.handler = async (event) => {
    try {
        return await processImage(event);
    } catch (error) {
        console.error('Error processing image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Internal Server Error'),
        };
    }
};
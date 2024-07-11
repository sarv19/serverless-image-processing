module.exports = function createResponse(imageBuffer) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'image/jpeg',
        },
        isBase64Encoded: true,
        body: imageBuffer.toString('base64'),
    };
};
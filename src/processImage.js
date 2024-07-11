const AWS = require('aws-sdk');
const sharp = require('sharp');
const rekognition = new AWS.Rekognition();
const calculateCropParameters = require('./calculateCropParameters');
const createResponse = require('./createResponse');

module.exports = async function processImage(event) {
    const { imageKey, feature } = JSON.parse(event.body);

    const s3 = new AWS.S3();
    const originalImage = await s3.getObject({
        Bucket: 'your-source-bucket',
        Key: imageKey,
    }).promise();

    const imageBase64 = originalImage.Body.toString('base64');

    let rekognitionParams = {};
    switch (feature) {
        case 'smartCropping':
            rekognitionParams = {
                Image: {
                    Bytes: Buffer.from(imageBase64, 'base64'),
                },
                Attributes: ['ALL'],
            };
            const faces = await rekognition.detectFaces(rekognitionParams).promise();
            const cropParams = calculateCropParameters(faces);
            const croppedImageBuffer = await sharp(originalImage.Body)
                .extract({ left: cropParams.left, top: cropParams.top, width: cropParams.width, height: cropParams.height })
                .toBuffer();
            return createResponse(croppedImageBuffer);
        case 'contentModeration':
            rekognitionParams = {
                Image: {
                    Bytes: Buffer.from(imageBase64, 'base64'),
                },
                MinConfidence: 80,
            };
            const moderationLabels = await rekognition.detectModerationLabels(rekognitionParams).promise();
            if (moderationLabels.ModerationLabels.length > 0) {
                const blurredImageBuffer = await sharp(originalImage.Body).blur(10).toBuffer();
                return createResponse(blurredImageBuffer);
            } else {
                return createResponse(originalImage.Body);
            }
        default:
            return {
                statusCode: 400,
                body: JSON.stringify('Invalid feature specified'),
            };
    }
};
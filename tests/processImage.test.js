const AWS = require('aws-sdk');
const sharp = require('sharp');
const processImage = require('../src/processImage');

jest.mock('aws-sdk', () => {
    return {
        S3: jest.fn().mockImplementation(() => {
            return {
                getObject: jest.fn().mockImplementation(() => {
                    return {
                        promise: jest.fn().mockResolvedValue({
                            Body: Buffer.from('test-image'),
                        }),
                    };
                }),
            };
        }),
        Rekognition: jest.fn().mockImplementation(() => {
            return {
                detectFaces: jest.fn().mockImplementation(() => {
                    return {
                        promise: jest.fn().mockResolvedValue({
                            FaceDetails: [],
                        }),
                    };
                }),
                detectModerationLabels: jest.fn().mockImplementation(() => {
                    return {
                        promise: jest.fn().mockResolvedValue({
                            ModerationLabels: [],
                        }),
                    };
                }),
            };
        }),
    };
});

jest.mock('sharp', () => {
    return jest.fn().mockImplementation(() => {
        return {
            extract: jest.fn().mockReturnThis(),
            blur: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('test-image')),
        };
    });
});

describe('processImage', () => {
    it('should process image for smartCropping', async () => {
        const event = {
            body: JSON.stringify({
                imageKey: 'test-key',
                feature: 'smartCropping',
            }),
        };

        const response = await processImage(event);

        expect(response.statusCode).toEqual(200);
        expect(response.isBase64Encoded).toEqual(true);
        expect(response.body).toEqual(Buffer.from('test-image').toString('base64'));
    });

    it('should process image for contentModeration', async () => {
        const event = {
            body: JSON.stringify({
                imageKey: 'test-key',
                feature: 'contentModeration',
            }),
        };

        const response = await processImage(event);

        expect(response.statusCode).toEqual(200);
        expect(response.isBase64Encoded).toEqual(true);
        expect(response.body).toEqual(Buffer.from('test-image').toString('base64'));
    });

    it('should return error for invalid feature', async () => {
        const event = {
            body: JSON.stringify({
                imageKey: 'test-key',
                feature: 'invalidFeature',
            }),
        };

        const response = await processImage(event);

        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual(JSON.stringify('Invalid feature specified'));
    });
});
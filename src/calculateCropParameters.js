module.exports = function calculateCropParameters(faces) {
    if (faces.FaceDetails.length > 0) {
        const face = faces.FaceDetails[0];
        return {
            left: Math.floor(face.BoundingBox.Left * 100),
            top: Math.floor(face.BoundingBox.Top * 100),
            width: Math.floor(face.BoundingBox.Width * 100),
            height: Math.floor(face.BoundingBox.Height * 100),
        };
    } else {
        return { left: 0, top: 0, width: 100, height: 100 };
    }
};
const loadModels = async () => {
    await faceapi.loadSsdMobilenetv1Model('models');
    await faceapi.loadFaceExpressionModel('models');
    await faceapi.loadFaceLandmarkModel('models');
};

const operationTypes = {
    DRAW_FACE_EXPRESSION: "drawFaceExpressions",
    DRAW_SQUARE_ON_DETECTED_FACE: "drawSquareOnDetectedFace",
    DRAW_FACE_EXPRESSION_WITH_LAND_MARKS: "drawFaceExpressionWithLandMarks",
};

const operations = {
    drawFaceExpressions: (canvas, detectionsForSize) => {
        const minConfidence = 0.05;
        faceapi.draw.drawFaceExpressions(canvas, detectionsForSize, minConfidence);
    },
    drawSquareOnDetectedFace: (canvas, detectionsForSize) => {
        const options = { withScore: true };
        faceapi.draw.drawDetections(canvas, detectionsForSize, options);
    },
    drawFaceExpressionWithLandMarks: (canvas, detectionsForSize) => {
        const options = { drawLines: true };
        faceapi.draw.drawFaceLandmarks(canvas, detectionsForSize, options);
    },
};

const drawDetections = (detectionsWithFaceExpression, operationType, imgEl, canvas) => {
    const detectionsForSize = faceapi.resizeResults(detectionsWithFaceExpression, { width: imgEl.width, height: imgEl.height });
    operations[operationType](canvas, detectionsForSize);
};

const detectFaces = async (imgEl, canvas) => {
    try {
        const detections = await faceapi
            .detectAllFaces(imgEl);
        
        drawDetections(detections, operationTypes.DRAW_SQUARE_ON_DETECTED_FACE, imgEl, canvas);
    } catch (err) {
        console.error(err);
    }  
};

const detectFacesExpression = async (imgEl, canvas) => {
    try {
        const detectionsWithExpression = await faceapi
            .detectAllFaces(imgEl)
            .withFaceExpressions();

        drawDetections(detectionsWithExpression, operationTypes.DRAW_FACE_EXPRESSION, imgEl, canvas);
    } catch (err) {
        console.error(err);
    }  
};

const detectFacesWithLandmarks = async (imgEl, canvas) => {
    try {
        const detectionsWithLandmarks = await faceapi
            .detectAllFaces(imgEl)
            .withFaceLandmarks();

        drawDetections(detectionsWithLandmarks, operationTypes.DRAW_FACE_EXPRESSION_WITH_LAND_MARKS, imgEl, canvas);
    } catch (err) {
        console.error(err);
    }  
};

const detectWebcam = async () => {
    const videoEl = document.getElementById('video1');
    const canvas = document.getElementById('webcamOverlay');
    canvas.width = videoEl.width;
    canvas.height = videoEl.height;

    const faceExpressionModelLoaded = faceapi.nets.faceExpressionNet.isLoaded;
    const faceDetectorModelLoaded = faceapi.nets.ssdMobilenetv1.isLoaded;

    if(videoEl.paused || videoEl.ended || !faceExpressionModelLoaded || !faceDetectorModelLoaded){
        return setTimeout(() => detectWebcam());
    }

    const detections = await faceapi
        .detectAllFaces(videoEl)
        .withFaceExpressions();
        //.withFaceLandmarks();

    if (detections) {
        console.log("Sent to DB",JSON.stringify(detections));
        drawDetections(detections, operationTypes.DRAW_FACE_EXPRESSION, videoEl, canvas);
    }

    setTimeout(() => detectWebcam());
};

const run = async () => {
    await loadModels();

    /* Image */
    const imgEl = document.querySelector('img');
    const canvas = document.getElementById('imgOverlay');
    canvas.width = imgEl.width;
    canvas.height = imgEl.height;
    // detectFaces(imgEl, canvas);
    detectFacesWithLandmarks(imgEl, canvas);
};

run();

const videoSize = 15;
const h = 400;
const w = 400;
const factor = w / videoSize;

const learningRate = 0.1;
const noEpochs = 200;

let video;

// Buttons
let recordButton;
let trainButton;
let classifyButton;
let resetButton;

// Inputs
let labelButton;
let labelWindow;

let classification = false;

let temp;
let trainingData = [];
let testingData = [];

let labelData;
let noOfOutputs = 0;

let neuralNetwork;

let labelArray = [];

function saveFrame() {
    trainingData.push(Matrix.fromArray(temp));
    trainingData[trainingData.length - 1].label = labelData;
    trainingData[trainingData.length - 1].number = labelArray.indexOf(trainingData[trainingData.length - 1].label);
}

function trainNN() {
    neuralNetwork = new NN(videoSize * videoSize, noOfOutputs, 1, [64]);
    neuralNetwork.initialise();

    // Preparing Data
    let output = [];
    for (let i = 0; i < noOfOutputs; i++) {
        output.push(0);
    }
    for (let i = 0; i < trainingData.length; i++) {
        output[trainingData[i].number] = 1;
        trainingData[i].outputMatrix = Matrix.fromArray(output);
        output[trainingData[i].number] = 0;
    }

    // Training
    for (let i = 0; i < noEpochs; i++) {
        shuffle(trainingData, true);
        for (let j = 0; j < trainingData.length; j++) {
            neuralNetwork.forwardPropagation(trainingData[j]);
            neuralNetwork.backPropagation(trainingData[j].outputMatrix, learningRate);
        }
    }
    console.log("Training Done");
    noOfOutputs = 0;
}

function classifyImages() {
    classification = true;
}

function resetAll() {
    classification = false;
    labelArray = [];
    trainingData = [];
}

function setup() {
    createCanvas(w + 200, h);

    video = createCapture(VIDEO);
    video.size(videoSize, videoSize);
    video.hide();

    recordButton = createButton("Take Data");
    trainButton = createButton("Train");
    classifyButton = createButton("Classify");
    labelButton = createButton("Add");
    resetButton = createButton("RESET");

    recordButton.position(w + 20, 30);
    trainButton.position(w + 20, 60);
    classifyButton.position(w + 20, 90);
    labelButton.position(w + 20, 180);
    resetButton.position(w + 20, 225)

    labelWindow = createInput();
    labelWindow.position(w + 20, 160);
}

function draw() {
    background(0);
    fill(255);
    textSize(18);
    text("Label:", w + 10, 150);

    video.loadPixels();
    temp = [];
    for (let x = 0; x < video.width; x++) {
        for (let y = 0; y < video.height; y++) {
            let index = (x + y * video.width) * 4;
            let r = video.pixels[index + 0];
            let g = video.pixels[index + 1];
            let b = video.pixels[index + 2];
            noStroke();
            fill(r, g, b);
            rect(x * factor, y * factor, factor, factor);
            temp.push((r + g + b) / (3 * 255));
        }
    }

    recordButton.mousePressed(saveFrame);
    trainButton.mousePressed(trainNN);
    classifyButton.mousePressed(classifyImages);
    resetButton.mousePressed(resetAll);

    if (classification) {
        let temp3 = neuralNetwork.estimate(Matrix.fromArray(temp));
        let temp1 = temp3.index;
        let temp2 = temp3.accuracy;
        push();
        
        fill(255);
        
        text("Accuracy:", w + 10, h - 35)
        text(temp2, w + 10, h - 15);

        textAlign(CENTER, CENTER);
        textSize(32);
        text(labelArray[temp1], w / 2, h - 16);
        pop();
    }

    labelButton.mousePressed(function () {
        if (labelArray.includes(labelWindow.value())) {
            labelData = labelArray[labelArray.indexOf(labelWindow.value())];
        }
        else {
            labelArray.push(labelWindow.value());
            labelData = labelWindow.value();

        }
        noOfOutputs = labelArray.length;
    });
}

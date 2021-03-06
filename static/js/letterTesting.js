$(document).ready(init);

let testLeft = true;
let state;
let recognition;
let result = null;
let prev = -1;
let letterTester;
let msg = new SpeechSynthesisUtterance();
let restart = true;
let numIncorrect = 0;
const letters = ["Right", "Up", "Left", "Down"];
const wordCalib = [
    [ "right", "bright", "wright", "write", "alright"],
    ["top", "pop", "hop", "up", "IHOP", "off", "op"],
    ["left", "last", "laughed", "loved", "Lyft", "laugh", "Loft", "lost"],
    ["down", "dumb", "tongue", "thumb", "done", "dong"]
];
const distMultiplier = 1 / (2 * Math.tan(0.0007272205216625));
let sizeMultiplier;
let numCorrect = 0;
let numTested = 0;
let currSize = 250;
let end = false;
let distFromCamera;
let ind;
let myInterval;

try {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.interimResults = true;
}
catch(e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
}

function init() {
    msg.text = "Please cover your right eye";
    window.speechSynthesis.speak(msg);
    state = new State();
    sizeMultiplier = state.ratio();
    distFromCamera = state.distFromCamera();
    letterTester = new LetterTester();
    letterTester.initializeRecognition();
    letterTester.testLetters();
    letterTester.createKeyListener()
}

class LetterTester {
    constructor() {
    }

    createKeyListener() {
        document.addEventListener("keydown", (event) => {
            let num = -1;
            if (event.code === "ArrowLeft") {
                num = this.testDirection(ind, "left");
            }
            if (event.code === "ArrowDown") {
                num = this.testDirection(ind, "down");
            }
            if (event.code === "ArrowRight") {
                num = this.testDirection(ind, "right");
            }
            if (event.code === "ArrowUp") {
                num = this.testDirection(ind, "up");
            }
            result = "foo";
            this.handleInput(num);
            result = null;
        });
    }

    reset() {
        result = null;
        numIncorrect = 0;
        numCorrect = 0;
        numTested = 0;
        currSize = 250;
        letterTester.testLetters();
    }

    handleInput(num) {
        if (result && num === 0) {
            clearInterval(myInterval);
            // recognition.stop();
            letterTester.testLetters();
            result = null;
        } else if (result && num === 1 && numIncorrect === 1) {
            clearInterval(myInterval);
            this.finishTest();
        } else if (result && num === 1 && numIncorrect === 0) {
            clearInterval(myInterval);
            letterTester.testLetters();
            result = null;
            numIncorrect++;
        }
    }

    finishTest() {
        let subtendDist = this.calculateDist()
        result = null;
        if (testLeft) {
            window.speechSynthesis.cancel();
            state.resultLeft(subtendDist.toString());
            this.reset();
            $("#italicized").text("left eye");
            testLeft = false;
            msg.text = "Now cover your left eye";
            window.speechSynthesis.speak(msg);
        } else {
            state.resultRight(subtendDist.toString());
            window.speechSynthesis.cancel();
            window.location.href = '/results?' + state.toString();
        }
    }

    calculateDist() {
        let actualSize = currSize * sizeMultiplier;
        return actualSize * distMultiplier;
    }

    initializeRecognition() {
        recognition.onstart = function() {
            console.log("Speech detection started")
        }

        recognition.onend = function() {
            console.log("Speech detection stopped")
            // if(restart) recognition.start();
        }

        recognition.onerror = function(event) {
            if(event.error === 'no-speech') {
                console.log('No speech was detected. Try again.');
            }
        }

        recognition.onresult = function(event) {
            const current = event.resultIndex;
            let finalResult = null;
            let interimResult;
            for (let i = current; i < event.results.length; ++i) {
                // setTimeout(() => {
                    if (!event.results[i].isFinal) {
                        if (event.results[i][0].confidence < 0.5) continue;
                        console.log(event);
                        interimResult = event.results[i][0].transcript;
                        // console.log(event.results[i]);
                        let words = interimResult.split(" ");
                        interimResult = words[0];
                        interimResult = interimResult.trim();
                        let inArray = false;
                        for (let j = 0; j < wordCalib.length; ++j) {
                            for (let k = 0; k < wordCalib[j].length; ++k) {
                                if (interimResult === wordCalib[j][k]) {
                                    inArray = true;
                                }
                            }
                        }
                        // console.log(interimResult);
                        if (inArray && !finalResult) finalResult = interimResult;
                    }
                // }, 100);
            }
            result = finalResult;
            console.log(result);
        }
    }

    testLetters() {
        let correct = $("#correct");
        let incorrect = $("#incorrect")
        correct.text(numCorrect + "/4");
        incorrect.text(numTested - numCorrect + "/2");
        let element = $("#testing-letter");
        if (numCorrect > 3) {
            numTested = 0;
            numCorrect = 0;
            numIncorrect = 0;
            currSize *= 0.75;
            let actualSize = currSize * sizeMultiplier;
            let subtendDist = actualSize * distMultiplier;
            correct.text(numCorrect + "/4");
            incorrect.text(numIncorrect + "/2");
            console.log("Actual size: " + actualSize);
            console.log("Subtending Distance in Feet: " + (subtendDist / 12));
            console.log("Visual Acuity: " + (distFromCamera / 12) + "/" + (subtendDist / 12));
            console.log("Passed Level")
            if (this.calculateDist() <= state.distFromCamera()) {
                clearInterval(myInterval);
                this.finishTest()
            }
        }
        numTested++;
        ind = Math.floor(Math.random() * 4);
        if (ind === prev) {
            ind++;
            ind %= 4;
        }
        prev = ind;
        let letter = letters[ind];

        element.attr("src", "images/letters/" + letter + "-E.svg");
        element.attr("width", currSize);
        console.log(currSize * sizeMultiplier);
        myInterval = setInterval(function () {
            let num = letterTester.testDirection(ind, result);
            // if(result && num === 2) {
            //     restart = false;
            //     recognition.stop();
            //     msg.text = "Please try again.";
            //     window.speechSynthesis.speak(msg);
            //     msg.text = null;
            //     result = null;
            //     console.log("Not in dictionary.")
            //     setTimeout(() => {
            //         restart = true;
            //         recognition.start();
            //     }, 1000)
            // }
            letterTester.handleInput(num);
        }, 50);
    }

    testDirection(ind, word) {
        for (let i = 0; i < wordCalib[ind].length; i++) {
            if (word === wordCalib[ind][i]) {
                console.log("Correct!");
                numCorrect++;
                return 0;
            }
        }
        for (let i = 0; i < 4; i++) {
            if (i === ind) continue;
            for (let j = 0; j < wordCalib[ind].length; j++) {
                if (word === wordCalib[i][j]) {
                    console.log("Incorrect!");
                    return 1;
                }
            }
        }
        return 2;
    }
}
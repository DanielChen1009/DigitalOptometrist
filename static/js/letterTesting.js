window.onload = init;
let recognition;
let result = null;
let prev = -1;
let letterTester;
let msg = new SpeechSynthesisUtterance();
let restart = true;
const letters = ["Right", "Up", "Left", "Down"];
const wordCalib = [
    [ "right", "bright", "wright", "write", "alright"],
    ["top", "pop", "hop", "up", "IHOP", "off"],
    ["left", "last", "laughed", "loved", "Lyft", "laugh", "Loft", "lost"],
    ["down", "dumb", "tongue", "thumb", "done", "dong"]
];
const distMultiplier = 1 / (2 * Math.tan(0.0007272205216625));
const sizeMultiplier = sessionStorage.getItem("ratio");
let numCorrect = 0;
let numTested = 0;
let currSize = 300;
let end = false;
const distFromCamera = sessionStorage.getItem("DistFromCamera");

try {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
}
catch(e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
}

function init() {
    letterTester = new LetterTester();
    letterTester.initializeRecognition();
    letterTester.testLetters();
    recognition.start();
    console.log(sessionStorage.getItem("DistFromCamera"));
}

class LetterTester {
    constructor() {
    }

    initializeRecognition() {
        recognition.onstart = function() {
            console.log("Speech detection started")
        }

        recognition.onend = function() {
            console.log("Speech detection stopped")
            if(restart) recognition.start();
        }

        recognition.onerror = function(event) {
            if(event.error === 'no-speech') {
                console.log('No speech was detected. Try again.');
            }
        }

        recognition.onresult = function(event) {
            const current = event.resultIndex;
            for (let i = current; i < event.results.length; ++i) {
                if (!event.results[i].isFinal) {
                    result += event.results[i][0].transcript;
                    let words = result.split(" ");
                    result = words[0];
                    result = result.trim();
                }
            }
            console.log(result);
        }
    }

    testLetters() {
        let correct = $("#correct");
        let incorrect = $("#incorrect")
        correct.text(numCorrect + "/3");
        incorrect.text(numTested - numCorrect + "/3");
        let element = $("#testing-letter");
        if (numTested === 3) {
            if (numCorrect > 1) {
                numTested = 0;
                numCorrect = 0;
                currSize *= 0.5;
                let actualSize = currSize * sizeMultiplier;
                let subtendDist = actualSize * distMultiplier;
                correct.text(numCorrect + "/3");
                incorrect.text(numCorrect + "/3");
                console.log("Actual size: " + actualSize);
                console.log("Subtending Distance in Feet: " + (subtendDist / 12));
                console.log("Visual Acuity: " + (distFromCamera / 12) + "/" + (subtendDist / 12));
                console.log("Passed Level")
                end = false;
            } else {
                numTested = 0;
                numCorrect = 0;
                currSize *= 1.25;
                let actualSize = currSize * sizeMultiplier;
                let subtendDist = actualSize * distMultiplier;
                console.log("Actual size: " + actualSize);
                console.log("Subtending Distance in Feet: " + (subtendDist / 12));
                console.log("Visual Acuity: " + (distFromCamera / 12) + "/" + (subtendDist / 12));
                console.log("Failed Level");
                if (end) {
                    element.attr("src", null);
                    $("#nextbutton").prop("disabled", false);
                    sessionStorage.setItem("result", subtendDist.toString());
                    return;
                }
                end = true;
            }
        }
        numTested++;
        let ind = Math.floor(Math.random() * 4);
        if (ind === prev) {
            ind++;
            ind %= 4;
        }
        prev = ind;
        let letter = letters[ind];

        element.attr("src", "images/letters/" + letter + "-E.svg");
        element.attr("width", currSize);
        element.attr("height", currSize);
        // console.log(letter);
        let myInterval = setInterval(function () {
            let num = letterTester.testDirection(ind);
            if(result && num === 2) {
                restart = false;
                recognition.stop();
                msg.text = "Please try again.";
                window.speechSynthesis.speak(msg);
                msg.text = null;
                result = null;
                console.log("Not in dictionary.")
                setTimeout(() => {
                    restart = true;
                    recognition.start();
                }, 1000)
            }

            if (result && (num === 1 || num === 0)) {
                clearInterval(myInterval);
                letterTester.testLetters();
                result = null;
            }
        }, 50);
    }

    testDirection(ind) {
        for (let i = 0; i < wordCalib[ind].length; i++) {
            if (result === wordCalib[ind][i]) {
                console.log("Correct!");
                numCorrect++;
                return 0;
            }
        }
        for (let i = 0; i < 4; i++) {
            if (i === ind) continue;
            for (let j = 0; j < wordCalib[ind].length; j++) {
                if (result === wordCalib[i][j]) {
                    console.log("Incorrect!");
                    return 1;
                }
            }
        }
        return 2;
    }
}
$(document).ready(init);

let state;
let msg = new SpeechSynthesisUtterance();
const calibration = [12, 24, 30, 34, 37, 38.5, 39, 40, 41, 42, 45]
let distFromCamera;

try {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.onend = () => {
        recognition.start();
    };
    recognition.onresult = (event) => {
        const current = event.resultIndex;
        let result = event.results[current][0].transcript;
        if (result === "next") {
            window.location.href = "../testing";
        }
        console.log(result);
    };
}
catch(e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
}

function init() {
    state = new State();
    session = new Session();
    session.start();
    console.log(state.distFromCamera());
}

class Session {
    constructor() {
        this.percentages = [];
    }

    start() {
        let streamOn = null;
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        let video = document.getElementById("video");
        if (streamOn !== null) {
            streamOn = null;
            session.stopCamera();
            video.srcObject = null;
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            session.startCamera().then(stream => {
                streamOn = stream;
                recognition.start();
            });
        }
    }

    startCamera() {
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
            .then(stream => {
                let video = document.getElementById("video");
                video.srcObject = stream;
                let faceDetectionTimer = setInterval(() => {
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    let faces = ccv.detect_objects({
                        canvas: ccv.pre(canvas),
                        cascade: cascade,
                        interval: 2,
                        min_neighbors: 1
                    });
                    let faceSizes = new Map();
                    faces.forEach((face) => {
                        this.processFace(face);
                    });
                }, 1);
                return stream;
            })
            .catch(e => console.log(e.name + ": " + e.message));
    }

    stopCamera() {
        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: false
        });
        clearInterval();
    }

    rollingAverage(size) {
        this.percentages.splice(0, this.percentages.length - size);
        if (this.percentages.length < size) return 0;
        let sum = this.percentages.reduce(function (total, num) {
            return total + num
        }, 0);
        return sum / this.percentages.length;
    }

    percentageToInches(p) {
        if (p === 0) return 0;
        let num = 49.0 * Math.exp(-0.023 * p);
        for (let i = 1; i < calibration.length; i++) {
            let fir = calibration[i - 1];
            let sec = calibration[i];
            let slope = 12 / (sec - fir);
            let diff = num - fir;
            let newNum = ((i) * 12) + diff * slope;

            if (num >= fir && num <= sec) {
                num = newNum;
                break;
            }
        }
        return num;
    }

    processFace(face) {
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        context.lineWidth = 1;
        context.strokeStyle = 'red';
        context.strokeRect(face.x, face.y, face.width, face.height);
        let percentage = 100 * face.height / video.videoHeight;
        this.percentages.push(percentage);
        distFromCamera = this.percentageToInches(this.rollingAverage(20)).toFixed(1);
        state.distFromCamera(distFromCamera);
        document.querySelector('#distance').textContent = distFromCamera + " inches";
        if (this.percentages.length >= 20) {
            $("#nextbutton").prop("disabled", false);
        } else {
            document.querySelector('#distance').textContent = "PLEASE WAIT"
        }
    }
}

function nextPage() {
    window.location.href='../testing?' + state.toString();
}

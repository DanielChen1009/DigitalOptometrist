$(document).ready(init);

let state;
let currWidth = 400;
let increaseTimer;
let decreaseTimer;

function init() {
    state = new State();
    document.addEventListener("keydown", (event) => {
        if(increaseTimer) return;
        if(event.code === "ArrowRight" || event.code === "ArrowUp") {
            increaseTimer = setInterval(() => {
                changeSize(+6)
            }, 100)
        }
    });

    document.addEventListener("keyup", (event) => {
        if(event.code === "ArrowRight" || event.code === "ArrowUp") {
            clearInterval(increaseTimer);
            increaseTimer = null;
        }
    });

    document.addEventListener("keydown", (event) => {
        if(decreaseTimer) return;
        if(event.code === "ArrowLeft" || event.code === "ArrowDown") {
            decreaseTimer = setInterval(() => {
                changeSize(-6)
            }, 100)
        }
    });

    document.addEventListener("keyup", (event) => {
        if(event.code === "ArrowLeft" || event.code === "ArrowDown") {
            clearInterval(decreaseTimer);
            decreaseTimer = null;
        }
    });
}

function changeSize(change) {
    let card = $("#card");
    currWidth += change;
    card.prop("width", currWidth);
}

function nextPage() {
    let ratio = 3.37 / currWidth;
    state.ratio(ratio);
    window.location.href='/videodetector?' + state.toString();
}

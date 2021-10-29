$(document).ready(init);

const state = new State();

let conversion = [
    [2, 0], [20/15, -0.03], [20/20, -0.06125],
    [20/25, -0.25], [20/30, -0.5], [20/40, -0.75],
    [20/50, -1.00], [20/60, -1.5], [20/70, -1.75],
    [20/100, -2], [20/160, -2.25], [20/200, -2.50],
    [20/250, -3.00], [20/300, -3.50], [20/400, -4.00],
    [20/500, -4.75], [20/600, -5.25], [20/800, -6.5],
    [20/1000, -7.50]
];

function init() {
    let recText = $("#recommendation");
    let visualAcuity = convertToDiopters()
    if (visualAcuity <= -0.75 || visualAcuity === "< -7.5") {
        recText.text("We recommend that you go see an optometrist.");
    } else {
        recText.text("We do not think that a visit to the optometrist's office is necessary.")
    }
    $("#results").text(visualAcuity);

    console.log(state.distFromCamera());
    console.log(state.result() / 12);
}

function convertToDiopters() {
    let testingDist = state.distFromCamera() / 12;
    testingDist = testingDist.toFixed(2);
    let resultDist = state.result() / 12
    resultDist = resultDist.toFixed(2);
    let ratio = testingDist / resultDist;
    for (let i = 1; i < conversion.length; i++) {
        let fir = conversion[i - 1][0];
        let sec = conversion[i][0];
        let diff = conversion[i - 1][1] - conversion[i][1];
        if (ratio <= fir && ratio > sec) {
            if (ratio <= fir + diff) {
                return conversion[i - 1][1] * 2;
            } else {
                return conversion[i][1] * 2;
            }
        }
    }
    return "< -7.5"
}

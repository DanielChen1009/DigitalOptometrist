$(document).ready(init);

const state = new State();

let conversion = [
    [2, 0], [20/15, 0], [20/20, -0.06],
    [20/25, -0.25], [20/30, -0.5], [20/40, -0.75],
    [20/50, -1.00], [20/60, -1.5], [20/70, -1.75],
    [20/100, -2], [20/160, -2.25], [20/200, -2.50],
    [20/250, -3.00], [20/300, -3.50], [20/400, -4.00],
    [20/500, -4.75], [20/600, -5.25], [20/800, -6.5],
    [20/1000, -7.50]
];

function init() {
    let recText = $("#recommendation");
    let visualAcuity = [convertToDiopters(state.resultLeft() / 12), convertToDiopters(state.resultRight() / 12)]

    let text = "< -15 (1500)";
    if (visualAcuity[0] !== "< -15") text = "" + visualAcuity[0] + " (" + -visualAcuity[0] * 100 + ")";
    console.log(text)
    $("#resultleft").text(text);

    text = "< -15 (1500)";
    if (visualAcuity[1] !== "< -15") text = "" + visualAcuity[1] + " (" + -visualAcuity[1] * 100 + ")";
    console.log(text)
    $("#resultright").text(text);

    if (visualAcuity[0] <= -0.75 || visualAcuity[0] === "< -15" || visualAcuity[1] <= -0.75 || visualAcuity[1] === "< -15") {
        recText.text("The Digital Optometrist recommends that you go see a certified optometrist.");
    } else {
        recText.text("The Digital Optometrist does not think that a visit to the optometrist's office is necessary.")
    }

    console.log(state.distFromCamera());
}

function convertToDiopters(resultDist) {
    let testingDist = state.distFromCamera() / 12;
    testingDist = testingDist.toFixed(2);
    resultDist = resultDist.toFixed(2);
    let ratio = testingDist / resultDist;
    for (let i = 1; i < conversion.length; i++) {
        let fir = conversion[i - 1][0];
        let sec = conversion[i][0];
        let diff = conversion[i - 1][0] - conversion[i][0];
        if (ratio <= fir && ratio > sec) {
            if (ratio <= fir + diff) {
                return conversion[i - 1][1] * 2;
            } else {
                return conversion[i][1] * 2;
            }
        }
    }
    if (ratio > 2) return 0;
    return "< -15"
}

// Contains state that represents the info to be passed between
// pages. Pages can change this data as needed and it should always
// to passed onto any next pages by appending the toString() return
// value to the URL whenever a page transition happens.
//
// This state.js file should always be included first, before any
// other scripts on the page.
class State {
    constructor() {
        this.params = new URLSearchParams(document.location.search);
    }

    // The calibration data from the screen calibration page.
    ratio(value) {
        if (value === undefined) return this.params.get("ratio");
        this.params.set("ratio", value);
    }

    // The calibration data from the distance calibration page.
    distFromCamera(value) {
        if (value === undefined) return this.params.get("distance");
        this.params.set("distance", value);
    }

    // The result data from the testing page.
    result(value) {
        if (value === undefined) return this.params.get("result");
        this.params.set("result", value);
    }

    toString() {
        return this.params.toString();
    }
}
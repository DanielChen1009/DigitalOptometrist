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
        $("#nav-screen").hide();
        $("#nav-dist").hide();
        $("#nav-exam").hide();
        $("#nav-results").hide();

        if (this.params.has("started")) {
            $("#nav-screen").show();
        }
        else if (window.location.pathname !== "/") {
            window.location.href = "/";
        }
        if (this.params.has("ratio")) {
            $("#nav-dist").show();
        }
        if (this.params.has("distance")) {
            $("#nav-exam").show();
        }
        if (this.params.has("result")) {
            $("#nav-results").show();
        }
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
    resultLeft(value) {
        if (value === undefined) return this.params.get("resultLeft");
        this.params.set("resultLeft", value);
    }

    resultRight(value) {
        if (value === undefined) return this.params.get("resultRight");
        this.params.set("resultRight", value);
    }

    toString() {
        return this.params.toString();
    }
}

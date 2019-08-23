
"use strict";


function updateAnimationStepLabel(idx) {
    let label = document.getElementById("animationStep");
    label.innerText = "Animation Step: " + idx;
}


var step;
function updateBlock(event) {
    // Disable remark control since we will take care of the keypress event
    // We will give remark back the control in the end of the animation
    slideshow.pause();

    console.log(event.code);

    let square = document.getElementById("square");

    const nextSlideShortcutCodes = ["Space", "ArrowDown", "ArrowRight", "KeyJ", "PageDown"];
    const previousSlideShortcutCodes = ["ArrowUp", "ArrowLeft", "KeyK", "PageUp"];

    let keyName = event.code;
    console.log(keyName);
    let horizontalShift;

    if(keyName === "End") {
        slideshow.resume();
        slideshow.gotoLastSlide();
    } else if(keyName === "Home") {
        slideshow.resume();
        slideshow.gotoFirstSlide();
    }

    if (nextSlideShortcutCodes.includes(keyName)) {
        if(step === undefined) { step = -1; }
        step += 1;

        if (step > 5) {
            slideshow.resume();
            // slideshow.gotoNextSlide();
            step = undefined;
        } else {
            horizontalShift = step * 20;
            updateAnimationStepLabel(step);
        }

    } else if (previousSlideShortcutCodes.includes(keyName)) {
        if (step === undefined) { step = 6; }
        step -= 1;

        if (step < 0) {
            slideshow.resume();
            // slideshow.gotoPreviousSlide();
            step = undefined;
        } else {
            horizontalShift = step * 20;
            updateAnimationStepLabel(step);
        }
    }
    square.style.transform = "translateX(SHIFTXpx)".replace("SHIFTX", horizontalShift);
}

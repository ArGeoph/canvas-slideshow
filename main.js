//HTML objects that will be used in application
let canvasObject, canvasContext;
let startStopButton, randomSequentialButton, backwardForwardButton, effectsList;
let imagesDetails, preloadedImages = []; //Array which will be used to store information about pictures loaded from .json file
let slideshowStarted = false, slideshowInterval, slideshowSpeed, slideshowSpeedController, imageCounter = 0, imageIncrement = 1; //Flags used to control slideshow

//Function called to initialize all objects when page is loaded for the first time
const initialize = () => {
    //Get all html objects
    canvasObject = document.getElementById("slideshow");
    canvasContext = canvasObject.getContext("2d");
    startStopButton = document.getElementById("startStopButton");
    randomSequentialButton = document.getElementById("randomSequentialButton");
    backwardForwardButton = document.getElementById("backwardForwardButton");
    effectsList = document.getElementById("effectsList");
    slideshowSpeedController = document.getElementById("slideshowSpeed");
    slideshowSpeed = slideshowSpeedController.value * 1000;
    //Preload all images to array
    loadPicturesDetails().then((images) => {
        preloadImages(images);
    });
    
    
    slideshowSpeedController.addEventListener("change", () => {
        slideshowSpeed = slideshowSpeedController.value * 1000;
        console.log("Slideshow speed changed to " + slideshowSpeed + " seconds");

        clearInterval(slideshowInterval);
        slideshowInterval = setInterval(showPictures, slideshowSpeed);
    }, false);

    //Add event listeners to html objects
    startStopButton.addEventListener("click", startStopSlideshow, false);
    // randomSequentialButton.addEventListener("click", shufflePictures, false);
    backwardForwardButton.addEventListener("click", changeSlideshowDirection, false);
    // effectsList.addEventListener("change", setCurrentEffect, false);
    document.getElementById("backButton").addEventListener("click", function() {
  
        if (imageIncrement === 1) {
            imageCounter--;

            if (imageCounter < 0) {
                imageCounter = preloadedImages.length - 1;
            }
        }
        else {
            imageCounter++;

            if (imageCounter > preloadedImages.length - 1) {
                imageCounter = 0;
            }
        }


        if (slideshowStarted) {
            clearInterval(slideshowInterval);
            slideshowInterval = setInterval(showPictures, slideshowSpeed);
        }
        else {
            showPictures();
        }
        
    }, false);

    document.getElementById("forwardButton").addEventListener("click", () => {

        if (slideshowStarted && imageIncrement === -1) {
            clearInterval(slideshowInterval);
            if (imageCounter === preloadedImages.length - 1) {
                imageCounter = 0;
            }
            else {
                imageCounter++;
            }
            slideshowInterval = setInterval(showPictures, slideshowSpeed);
        }
        else if (!slideshowStarted) {
            showPictures();
        }
       
    }, false);
};


//
const preloadImages = (images) => {
    console.log(images.length);
    let tmp;
    for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
       // console.log(`Image ${imageIndex} has been preloaded`);
        tmp = new Image();
        tmp.src = images[imageIndex].fileLocation;

        tmp.addEventListener("load", addImages, false);       
    }
};

const addImages = (event) => {
    preloadedImages.push(event.currentTarget);
}

//Function changing slideshow flow direction
const changeSlideshowDirection = (event) => {
    clearInterval(slideshowInterval);

    if (event.currentTarget.innerHTML === "Backward") {
        event.currentTarget.innerHTML = "Forward";
        imageCounter--;
        imageIncrement = -1;
    }
    else {
        event.currentTarget.innerHTML = "Backward";
        imageCounter++;
        imageIncrement = 1;
    }
    
    slideshowInterval = setInterval(showPictures, slideshowSpeed);
};

// //Function sending asyncrnous request to fetch data from .json file and store it as a JavaScript array
// const loadPicturesDetails = () => {
//     try {
//         let request = new XMLHttpRequest();

//         request.onreadystatechange = () => {
//             if (request.readyState === 4 && request.status === 200) {
//                 images = JSON.parse(request.responseText).pictures;
//                 console.log(images);
//                 images.forEach((picture, index) => {
//                     console.log(index, picture.fileLocation, picture.caption);
//                 })
//             }
//         }

//         request.open("Get", "picturesInfo.json", true);
//         request.responseType = "text";
//         request.send();
//     }
//     catch(networkError) {
//         console.log(networkError);
//     }
// };


const loadPicturesDetails = async () => {
    try {
        const response = await fetch("picturesInfo.json");

        if (response.ok) {
            const responseJson = await response.json();
            console.log(responseJson);
            imagesDetails = await responseJson.pictures;
            
            return imagesDetails;
        }
    }
    catch(networkError) {
        console.log(networkError);
    }
}
//Function shuffling c

const startStopSlideshow = () => {
    if (slideshowStarted) {
        startStopButton.innerHTML = "Start";
        slideshowStarted = false;
        clearInterval(slideshowInterval);
    }
    else {
        showPictures();
        slideshowStarted = true;
        startStopButton.innerHTML = "Stop";       
        slideshowInterval = setInterval(showPictures, slideshowSpeed);
    }    
};

//Function used to show pictures on the canvas
const showPictures = () => {
    //Clear canvas to draw new image
    canvasContext.clearRect(0, 0, canvasObject.width, canvasObject.height);

    console.log(imageCounter);
    //Set caption parameters
    canvasContext.font = "bold 34px sans-serif";
    canvasContext.textBaseline = "bottom";
    canvasContext.fillStyle = "blue";
    canvasContext.textAlign = "center";
    
    let scalingFactor = canvasObject.height / preloadedImages[imageCounter].height; 

    if (preloadedImages[imageCounter].width < preloadedImages[imageCounter].height) { //if image has potrait orientation  

        canvasContext.drawImage(preloadedImages[imageCounter],  0.5 * (canvasObject.width - scalingFactor*preloadedImages[imageCounter].width), 0, 
        scalingFactor * preloadedImages[imageCounter].width, scalingFactor * preloadedImages[imageCounter].height);    
    }
    else if (preloadedImages[imageCounter].width >= preloadedImages[imageCounter].height) { //if image has landscape orientation    
        canvasContext.drawImage(preloadedImages[imageCounter],  0.5 * (canvasObject.width - scalingFactor*preloadedImages[imageCounter].width), 0, 
        scalingFactor * preloadedImages[imageCounter].width, scalingFactor * preloadedImages[imageCounter].height);  
                        
    }

    canvasContext.fillText(imagesDetails[imageCounter].caption, 500,  550);  

    if (imageIncrement === 1 && imageCounter === preloadedImages.length-1) {
        imageCounter = 0;
    }
    else if (imageIncrement === -1 && imageCounter === 0) {
        imageCounter = preloadedImages.length - 1;
    }
    else {
        imageCounter += imageIncrement;
    }
};

//initialize application when web page loading is completed
window.addEventListener("load", initialize, false);
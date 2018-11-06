//HTML objects that will be used in application
let canvasObject, canvasContext;
let backButton, forwardButton, startStopButton, randomSequentialButton, backwardForwardButton, effectsList;
let imagesDetails, preloadedImages = [], shuffledImages = []; //Array which will be used to store information about pictures loaded from .json file
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
    backButton = document.getElementById("backButton");
    forwardButton = document.getElementById("forwardButton");

    //Preload all images to array
    loadPicturesDetails().then((images) => preloadImages(images));
    
    //Shuffle image for random mode



    slideshowSpeedController.addEventListener("change", () => {
        slideshowSpeed = slideshowSpeedController.value * 1000;
        console.log("Slideshow speed changed to " + slideshowSpeed + " seconds");

        if (slideshowStarted) {
            clearInterval(slideshowInterval);
            slideshowInterval = setInterval(showPictures, slideshowSpeed);
        } 
    }, false);

    //Add event listeners to html objects
    startStopButton.addEventListener("click", startStopSlideshow, false);
    randomSequentialButton.addEventListener("click", randomSequential, false);
    backwardForwardButton.addEventListener("click", changeSlideshowDirection, false);
    // effectsList.addEventListener("change", setCurrentEffect, false);
    backButton.addEventListener("click", backButtonBehavior, false);
    forwardButton.addEventListener("click", () => {

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

const backButtonBehavior = () => {
    if (imageCounter === 0) {
        imageCounter = preloadedImages.length - 1;
        showPictures();        
        imageCounter = preloadedImages.length - 1;
    }
    else {        
        imageCounter--;
        showPictures();
        imageCounter--;   
    }    
}

//
const preloadImages = async (images) => {
    let tmp;

    for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        tmp = new Image();
        tmp.src = images[imageIndex].fileLocation;

        tmp.addEventListener("load", function(event) {
            addImages(event, images[imageIndex].caption, imageIndex);
        }, false);       
    }

    return preloadedImages;
};

const addImages = (event, imageCaption, imageIndex) => {
    preloadedImages[imageIndex] = {"imageFile" : event.currentTarget, "imageCaption" : imageCaption};
}

//Function changing slideshow flow direction
const changeSlideshowDirection = () => {
    if (backwardForwardButton.innerHTML === "Backward") {
        backwardForwardButton.innerHTML = "Forward";
        if (imageCounter === 0) {
            imageCounter = preloadedImages.length - 1;
        }
        else {
            imageCounter--;
        }
       
        imageIncrement = -1;
    }
    else {
        backwardForwardButton.innerHTML = "Backward";
        
        if (imageCounter === preloadedImages.length - 1) {
            imageCounter = 0;
        }
        else {
            imageCounter++;
        }       
        imageIncrement = 1;
    }
    
    if (slideshowStarted) {
        clearInterval(slideshowInterval);
        slideshowInterval = setInterval(showPictures, slideshowSpeed);
    } 
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

const startStopSlideshow = () => {
    if (slideshowStarted) {
        //Enable back and forward buttons (with arrows) when slideshow is not active
        backButton.disabled = false;
        forwardButton.disabled = false;

        startStopButton.innerHTML = "Start";
        slideshowStarted = false;
        clearInterval(slideshowInterval);
    }
    else {
        //Disable back and forward buttons (with arrows) when slideshow is active
        backButton.disabled = true;
        forwardButton.disabled = true;
        
        showPictures();
        slideshowStarted = true;
        startStopButton.innerHTML = "Stop";       
        slideshowInterval = setInterval(showPictures, slideshowSpeed);
    }    
};

//Function switching from sequential to random showing
const randomSequential = () => {
    if (randomSequentialButton.innerHTML === "Random") {
        //Disable backwardForward button when in the random mode
        backwardForwardButton.disabled = true;
        
        //Turn the show forward, it it was in backward mode
        if (backwardForwardButton.innerHTML === "Forward") {
            changeSlideshowDirection();
        }        
        //Shuffle images 
        shuffleImages();
        randomSequentialButton.innerHTML = "Sequential";
        //Save array with pictures to return to sequential mode later
        let tmp = preloadedImages;
        preloadedImages = shuffledImages;
        shuffledImages = tmp;
    }
    else if (randomSequentialButton.innerHTML === "Sequential") {
        randomSequentialButton.innerHTML = "Random";
        backwardForwardButton.disabled = false;

        //Save array with pictures to return to random mode later
        let tmp = preloadedImages;
        preloadedImages = shuffledImages;
        shuffledImages = tmp;
    }
};

//Function shuffling images
const shuffleImages =  () => {
    let currentIndex, maximumIndex = preloadedImages.length; 
    shuffledImages = [];     

    preloadedImages.forEach((picture) => {

        while(true) {
            currentIndex = Math.floor(maximumIndex * Math.random());

            if (typeof shuffledImages[currentIndex] === 'undefined') {
                shuffledImages[currentIndex] = picture; 

                break;
            }            
        }      
    });

    console.log("Shuffled pictures");
    console.log(shuffledImages);
}

//Function used to show pictures on the canvas
const showPictures = () => {
    //Clear canvas to draw new image
    canvasContext.clearRect(0, 0, canvasObject.width, canvasObject.height);

    console.log(imageCounter);
    //Set caption parameters
    canvasContext.font = "bold 30px sans-serif";
    canvasContext.textBaseline = "bottom";
    canvasContext.fillStyle = "blue";
    canvasContext.textAlign = "center";
    
    let scalingFactor = canvasObject.height / preloadedImages[imageCounter].imageFile.height; 

    if (preloadedImages[imageCounter].imageFile.width < preloadedImages[imageCounter].imageFile.height) { //if image has potrait orientation  
        canvasContext.drawImage(preloadedImages[imageCounter].imageFile,  0.5 * (canvasObject.width - scalingFactor*preloadedImages[imageCounter].imageFile.width), 0, 
        scalingFactor * preloadedImages[imageCounter].imageFile.width, scalingFactor * preloadedImages[imageCounter].imageFile.height);    
    }
    else if (preloadedImages[imageCounter].imageFile.width >= preloadedImages[imageCounter].imageFile.height) { //if image has landscape orientation    
        canvasContext.drawImage(preloadedImages[imageCounter].imageFile,  0.5 * (canvasObject.width - scalingFactor*preloadedImages[imageCounter].imageFile.width), 0, 
        scalingFactor * preloadedImages[imageCounter].imageFile.width, scalingFactor * preloadedImages[imageCounter].imageFile.height);                          
    }

    canvasContext.fillText(preloadedImages[imageCounter].imageCaption, 500,  550);  

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
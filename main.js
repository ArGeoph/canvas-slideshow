//HTML objects that will be used in application
let canvasObject, canvasContext;
let backButton, forwardButton, startStopButton, randomSequentialButton, backwardForwardButton;
let imagesDetails, preloadedImages = [], shuffledImages = []; //Array which will be used to store information about pictures loaded from .json file
let slideshowStarted = false, slideshowInterval, slideshowSpeed, slideshowSpeedController, imageCounter = 0, imageIncrement = 1; //used to control slideshow

//Function called to initialize all objects when page is loaded for the first time
const initialize = () => {
    //Get all html objects
    canvasObject = document.getElementById("slideshow");
    canvasContext = canvasObject.getContext("2d");
    startStopButton = document.getElementById("startStopButton");
    randomSequentialButton = document.getElementById("randomSequentialButton");
    backwardForwardButton = document.getElementById("backwardForwardButton");
    slideshowSpeedController = document.getElementById("slideshowSpeed");
    slideshowSpeed = slideshowSpeedController.value * 1000;
    backButton = document.getElementById("backButton");
    forwardButton = document.getElementById("forwardButton");

    //Set caption parameters
    canvasContext.font = "bold 26px sans-serif";
    canvasContext.fillStyle = "yellow";
    canvasContext.textAlign = "center";

    //Print welcome messages and instructions on canvas
    canvasContext.fillText("To start slideshow please press start", 500,  330);  
    canvasContext.fillText("You can use buttons with arrows to change pictures manually", 500,  370);  

    //Preload all images to array        
    loadPicturesDetails().then((images) => preloadImages(images));   

    //Add event listeners to control buttons
    slideshowSpeedController.addEventListener("change", () => {
        slideshowSpeed = slideshowSpeedController.value * 1000;

        if (slideshowStarted) {
            clearInterval(slideshowInterval);
            slideshowInterval = setInterval(showPictures, slideshowSpeed);
        } 
    }, false);

    //Add event listeners to html objects
    startStopButton.addEventListener("click", startStopSlideshow, false);
    randomSequentialButton.addEventListener("click", randomSequential, false);
    backwardForwardButton.addEventListener("click", changeSlideshowDirection, false);
    backButton.addEventListener("click", backButtonBehavior, false);
    forwardButton.addEventListener("click", forwardButtonBehavior, false);   
};

/*Buttons event handlers behaviour
=================================================*/
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
};

const forwardButtonBehavior = () => {
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
};

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
/*==================================================================================*/

//Load asynchronously picture information from a .json file
const loadPicturesDetails = async () => {
    try {
        const response = await fetch("picturesInfo.json", {
            mode: 'no-cors' // 'cors' by default
          });

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
};


//Preload images
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
};

//Function used to show pictures on the canvas
const showPictures = () => {
    //Clear canvas to draw new image
    canvasContext.clearRect(0, 0, canvasObject.width, canvasObject.height);

    let scalingFactor = canvasObject.height / preloadedImages[imageCounter].imageFile.height; 

    if (preloadedImages[imageCounter].imageFile.width < preloadedImages[imageCounter].imageFile.height) { //if image has potrait orientation  
        canvasContext.drawImage(preloadedImages[imageCounter].imageFile,  0.5 * (canvasObject.width - scalingFactor*preloadedImages[imageCounter].imageFile.width), 0, 
        scalingFactor * preloadedImages[imageCounter].imageFile.width, scalingFactor * preloadedImages[imageCounter].imageFile.height);    
    }
    else if (preloadedImages[imageCounter].imageFile.width >= preloadedImages[imageCounter].imageFile.height) { //if image has landscape orientation    
        canvasContext.drawImage(preloadedImages[imageCounter].imageFile,  0.5 * (canvasObject.width - scalingFactor*preloadedImages[imageCounter].imageFile.width), 0, 
        scalingFactor * preloadedImages[imageCounter].imageFile.width, scalingFactor * preloadedImages[imageCounter].imageFile.height);                          
    }

    canvasContext.fillText(preloadedImages[imageCounter].imageCaption, 500,  630);  

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
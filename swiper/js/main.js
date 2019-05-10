
// Load the profiles
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
readTextFile("files/profiles.json", function(text){
    var data = JSON.parse(text);
    profiles = data;
    arrangeProfiles();
    // console.log(data);
});

// When importing the profiles, this function arranges them in the correct order
function arrangeProfiles() {
    // Re-arrange the profiles so that those already rated are moved to the start of the array
    var counter = 0;
    for (var p in profiles) {
        var profile = profiles[p];
        if (["good", "maybe", "bad"].includes(profile["currentRating"])) {
            profiles.unshift(profiles.splice(p, 1)[0]);
            counter++;
        };
    };
    // Load the initial profile, starting at the location of the first un-rated profile
    retrieveProfile(counter);
}

// Save the rating results JSON file
$("#export").click(function() {

    var textToSave = profiles
    var textToSave = JSON.stringify(textToSave);
    var filename = 'saved_profiles.json';

    var hiddenElement = document.createElement('a');
    hiddenElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToSave));
    hiddenElement.setAttribute('download', filename);
    hiddenElement.style.display = 'none';

    document.body.appendChild(hiddenElement);
    hiddenElement.click();
    document.body.removeChild(hiddenElement);

});



// Helper function to convert ID attributes
function convertId(str) {
    return str.replace(/\s+/g, '_');
}

// Helper function to help fill in gender-specific text
function getPronoun(gender, type) {
    switch (gender) {
        case "female":
            switch (type) {
                case "nominative":
                    return "she"
                case "possessive":
                    return "her"
            }
        case "male":
            switch (type) {
                case "nominative":
                    return "he"
                case "possessive":
                    return "him"
            }
        default:
            return "it"
    }
}



// Retrieves the next/previous photo
function getPhoto(direction) {
    var i = currentPhotoIndex;
    switch (direction) {
        case "next":
            if (i + 1 < profile['photos'].length) { // Check that photo is not out-of-bounds
                retrievePhoto(i + 1);
            };
            break;
        case "previous":
            if (i - 1 >= 0) { // Check that photo is not out-of-bounds
                retrievePhoto(i - 1);
            };     
            break;
    }
}

// Loads the desired image into the 'main-photo' image slot
function retrievePhoto(i) {
    currentPhotoIndex = Number(i);
    $("#main-photo").attr("src", `files/profile-photos/${profile['id']}/${profile['photos'][i]}`);
    $("#test3").text(`files/profile-photos/${profile['id']}/${profile['photos'][i]}`);
}

// Load gallery image into 'main-photo' slot when thumbnail is clicked
$("#gallery").on('click', 'img', function() {
    retrievePhoto($(this).attr("id"));
});

// Preload images into cache to make the app go faster
function preloadPhotos(i) {
    console.log("Current i: " + i);
    var profilesToLoad = [i+1, i-1];

    for (let profile of profilesToLoad) {
    	if (typeof profiles[profile] != 'undefined') {
	        var id = profiles[profile]['id'];
	        var photos = profiles[profile]['photos'];
	        for (let p of photos) {
	            var url = "files/profile-photos/" + id + "/" + p;
	            console.log(url);
	            var image = new Image();
	            image.src = url;
	        };
    	};
    };
};



// Keyboard-mapping function to determine which code is executed on which keystrokes
$(document).keydown(function(e){
    switch(e.keyCode) {
        case 83: // 'S' key
            getPhoto('previous');
            break;
        case 87: // 'W' key
            getPhoto('next');
            break;
        case 65: // 'A' key
            getProfile('previous');
            break;
        case 68: // 'D' key
            getProfile('next');
            break;
        case 51:
        case 99:
            rateProfile('good');
            break;
        case 50:
        case 98:
            rateProfile('maybe');
            break;
        case 49:
        case 97:
            rateProfile('bad');
            break;
        case 48:
        case 96:
            rateProfile('skip');
            break;
    }
});



function retrieveProfile(i) {

    currentProfileIndex = Number(i);
    profile = profiles[i];

    // Set profile photos
    $("#gallery").empty();
    currentPhotoIndex = 0;
    for (j = 0; j < profile["photos"].length; j++) {
        $("#gallery").append(`<img id="${j}" class="photo" src="files/profile-photos/${profile['id']}/${profile['photos'][j]}">`);
    };
    $("#main-photo").attr("src", `files/profile-photos/${profile['id']}/${profile['photos'][0]}`);    
    $("#main-photo").removeClass('rotate-left rotate-right'); // Reset the appearance

    // Set profile info
    $("#profile-label").text(profile["data"]["username"]);
    $(".details-table tr td").empty();

    // Set values for standard fields
    for (var key in profile['data']) {
        // If a value is given
        if (profile['data'][key]) {
            $(`.details-table tr#${convertId(key)} td`).text(profile['data'][key]);
        }
        // If a value is NOT given
        else {
            $(`.details-table tr#${convertId(key)} td`).html(`<span class="no-value">(no "${key}" given)</span>`);
        };        
    };
    // Set values for 'special' fields
    $(".details-table tr#url td").html(`<a href="${profile['data']['url']}">View original profile</a>`);
    $("#essay").text(profile['data']['essay']);

    // Set values for 'special' labels
    $("#profile-has").text(getPronoun(profile['data']['gender'], 'nominative') + ' has:');
    $("#profile-wants").text(getPronoun(profile['data']['gender'], 'nominative') + ' wants:');


    // Set attributes depending on how the profile is already rated
    $("#main-container").removeAttr('rating');
    $("#rating-row").css('display', 'none');
    var rating = profile['currentRating']
    if (rating) {
        $("#current-profile-rating").text(profile["currentRating"]);
        $("#rating-row").css('display', 'flex');
        $("#main-container").attr('rating', rating);
    }

    preloadPhotos(i);

}

// Retrieves the next/previous profile
function getProfile(direction) {
    var i = currentProfileIndex;
    switch (direction) {
        case "next":
            if (i + 1 < profiles.length) { // Check that profile is not out-of-bounds
                retrieveProfile(i + 1);
            } else {
                retrieveProfile(i); // Refresh the user's profile
            };
            break;
        case "previous":
            if (i - 1 >= 0) { // Check that profile is not out-of-bounds
                retrieveProfile(i - 1);
            } else {
                retrieveProfile(i); // Refresh the user's profile
            };
            break;
    }
}

function rateProfile(rating) {
    profile.currentRating = rating;
    getProfile('next');
}



// Finger-swiping functionality for mobile devices
$(document).ready(function() {
    $("#main-photo").swipe({
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
            if (direction == "left") {
                $(this).addClass('rotate-left');
                setTimeout(function() {rateProfile('bad');}, 400);
                $("#test1").text('Went left');
                //console.log("left swipe");
            }
            if (direction == "right") {
                $(this).addClass('rotate-right');
                setTimeout(function() {rateProfile('good');}, 400);
                $("#test1").text('Went right');
                //console.log("left swipe");
            }           
            if (direction == "down") {
                getPhoto('next');
            }
            if (direction == "up") {
                getPhoto('previous');
            }
        },
        threshold:30
    });
});



// Parallax background scroller
window.addEventListener('scroll', () => {
   let parent = document.getElementById('parallax-container');
   let child = document.getElementById('background');
   child.style.transform = 'translateY(-' + (window.pageYOffset * 0.2) + 'px)';
   // let children = parent.getElementsByTagName('div');
   // for(let i = 0; i < children.length; i++) {
   //   children[i].style.transform = 'translateY(-' + (window.pageYOffset * i / children.length) + 'px)';
   // }
}, false)


// Initialize global variables
// var currentProfileIndex = 0
// var currentPhotoIndex = 0
// var profiles = []





// Import the profiles
$('#import').click(function() {

    let files = document.getElementById('selectFiles').files;
    console.log(files);

    // Check that file was chosen for upload
    if (files.length <= 0) {
        return false;
    }

    // Parse the profiles into a list, then arrange and load them
    let fr = new FileReader();
    fr.onload = function(e) {
        console.log(e);
        let result = JSON.parse(e.target.result);
        profiles = result;
        arrangeProfiles();
    }
    fr.readAsText(files.item(0));

});

// When importing the profiles, this function arranges arranges them in the correct order
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
        case 99:
            rateProfile('good');
            break;
        case 98:
            rateProfile('maybe');
            break;
        case 97:
            rateProfile('bad');
            break;
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
    $("#details-row-essay").text(profile['data']['essay']);

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





// $(document).ready(function(){

//     $(".buddy").on("swiperight",function(){
//       $(this).addClass('rotate-left').delay(300).fadeOut(1);
//       $('.buddy').find('.status').remove();

//       $(this).append('<div class="status like">Like!</div>');      
//       if ( $(this).is(':last-child') ) {
//         $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right').fadeIn(300);
//        } else {
//           $(this).next().removeClass('rotate-left rotate-right').fadeIn(400);
//        }
//     });  

//    $(".buddy").on("swipeleft",function(){
//     $(this).addClass('rotate-right').delay(700).fadeOut(1);
//     $('.buddy').find('.status').remove();
//     $(this).append('<div class="status dislike">Dislike!</div>');

//     if ( $(this).is(':last-child') ) {
//      $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right').fadeIn(300);
//       alert('OUPS');
//      } else {
//         $(this).next().removeClass('rotate-left rotate-right').fadeIn(400);
//     } 
//   });

// });



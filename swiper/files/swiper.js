
var currentProfileIndex = 0
var currentPhotoIndex = 0
var profiles = []

var ratedList = {
    "good": [],
    "maybe": [],
    "bad": [],
    "skip": []
};


// Sets the desired image in the 'main-photo' image slot
function getPhoto(i) {
    currentPhotoIndex = Number(i);
    $("#main-photo").attr("src", `files/profile-photos/${profile['id']}/${profile['photos'][i]}`);
    $("#test3").text(`files/profile-photos/${profile['id']}/${profile['photos'][i]}`);
}


// Load gallery image into 'main-photo' slot when thumbnail is clicked
$("#gallery").on('click', 'img', function() {
    getPhoto($(this).attr("id"));
});


function rateProfile(rating) {

    // Remove the profile from any lists they are already in
    for (var category in ratedList) {
        list = ratedList[category];
        if (list.includes(profile['id'])) {
            list.splice(list.indexOf(profile['id']), 1);
        };
    };

    // Add the profile to the rated list
    ratedList[rating].push(profile['id']);

    // Go to the next profile
    getProfile(currentProfileIndex+1);
}


// Code that determines actions based on which keys the user presses
$(document).keydown(function(e){
    switch(e.keyCode) {
        case 83: // 'S' key
            getPhoto(currentPhotoIndex-1);
            break;
        case 87: // 'W' key
            getPhoto(currentPhotoIndex+1);
            break;
        case 65: // 'A' key
            getProfile(currentProfileIndex-1);
            break;
        case 68: // 'D' key
            getProfile(currentProfileIndex+1);
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


// Instantiate details table labels
$(document).ready(function() {
    $(".details-table").find("tbody tr").each(function(index) {
        $(this).html(`<th>${$(this).attr("id")}:</th><td></td>`);
    })
});


// Helper function to convert ID attributes
function convertId(str) {
    return str.replace(/\s+/g, '_');
}









// what about 'null' values?

function getProfile(i) {

	// Check that profile is within bounds of profile list
    currentProfileIndex = i;
    profile = profiles[i];

    // set photos
    $("#gallery").empty(); // clear existing gallery
    currentPhotoIndex = 0;
    for (j = 0; j < profile["photos"].length; j++) {
        $("#gallery").append(`<img id="${j}" class="photo" src="files/profile-photos/${profile['id']}/${profile['photos'][j]}">`);
    };
    $("#main-photo").attr("src", `files/profile-photos/${profile['id']}/${profile['photos'][0]}`);

    // set profile info
    $("#profile-label").text(profile["data"]["username"]);
    for (var key in profile['data']) {
        $(`.details-table #${convertId(key)}`).html(`<th>${key}</th><td>${profile['data'][key]}</td>`)
    };
}













// var textToSave = 'this is a test';

// var hiddenElement = document.createElement('a');

// hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
// hiddenElement.target = '_blank';
// hiddenElement.download = 'myFile.txt';
// hiddenElement.click();








// add functionality to load the first profile

$('#import').onclick = function() {

    let files = document.getElementById('selectFiles').files;
    console.log(files);

    // Check that file was chosen for upload
    if (files.length <= 0) {
        return false;
    }

    let fr = new FileReader();

    fr.onload = function(e) {
        console.log(e);
        let result = JSON.parse(e.target.result);
        // let formatted = JSON.stringify(result, null, 2);
        // document.getElementById('result').value = formatted;
        profiles = result;
    }

    fr.readAsText(files.item(0));

};














// Add limitations in case they try to reach outside the bounds of profile/photo list





// // How to instantiate?
// var profile = profiles[currentProfileIndex]


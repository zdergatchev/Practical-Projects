/*
The following lines of code are for the constants such as kinvey credentials!
 */
const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppKey = "kid_H1B6JH3r";
const kinveyAppSecret = "38a0463e4732482198d5ea0516017001";
const guestCredentials = "1dd6401f-a161-45bc-bd91-0c41803238f1.8EUzf+izWf2VlqGCjLszKWXzdZs7NIADZgLd6t8vMB0=";
var currentlyLoggedUser = "";
/*
------------------------------------------------------
 */

/*
view functions!
 */

function showView(viewName) {
    $('main>section').hide();
    $('#' + viewName).show();
}

function showHideMenuLinks() {
    $("#linkHome").show();
    $("#linkAbout").show();
    if(sessionStorage.getItem('authToken') == null){
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkMyAdds").hide();
        $("#linkListAdds").show();
        $("#linkCreateAdd").hide();
        $("#linkLogout").hide();
    }
    else{
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkMyAdds").show();
        $("#linkListAdds").show();
        $("#linkCreateAdd").show();
        $("#linkLogout").show();
    }

}

function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function () { $('#infoBox').fadeOut()},3000);
}

function showErrorMsg(errorMsg) {
    $('#errorBox').text(errorMsg);
    $('#errorBox').show();
}

$(function () {

    showHideMenuLinks();
    showView('viewHome');

    currentlyLoggedUser = localStorage.getItem('username');
    if(currentlyLoggedUser != null){ $('#greetingsHeading').html("Greetings, " + "<span class='helloUsername'>"+ currentlyLoggedUser + "</span>");}
    else{$('#greetingsHeading').text("Greetings");}

    $('#linkHome').click(showHomeView);
    $('#linkAbout').click(showAboutView);
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
    $('#linkMyAdds').click(showMyAddsView);
    $('#linkListAdds').click(listAdds);
    $('#linkCreateAdd').click(showCreateAddView);
    $('#linkLogout').click(logout);


    $("#formLogin").submit(function (e) {
        e.preventDefault();
        login();
    });
    $("#formRegister").submit(function (e) {
        e.preventDefault();
        register();
    });
    $("#formCreateAdd").submit(function (e) {
        e.preventDefault();
        createAdd();
    });
    $("#formModifyAdd").submit(function (e) {
        e.preventDefault();
        modifyAdd();
    });
    $(document).on({
        ajaxStart: function(){ $("#loadingBox").show()},
        ajaxStop: function() { $("#loadingBox").hide()}
    });

})

function showHomeView() {
    showView('viewHome');

    if(currentlyLoggedUser != null){ $('#greetingsHeading').html("Greetings, " + "<span class='helloUsername'>"+ currentlyLoggedUser + "</span>");}
    else{$('#greetingsHeading').text("Greetings");}

}
function showAboutView() {
    showView('viewAbout');
    $('.contacts').hide();
    $('.map').hide();
}

function showLoginView() {
    showView('viewLogin');
}

function showRegisterView() {
    showView('viewRegister');
}

function showCreateAddView() {
    showView('viewCreateAdd');
}

function showModifyAddView() {
    showView('viewModifyAdd');
}

/*Here we get the entire collection of advertisments posted by all users and in the loadSuccess function we select those whose
author is the same with the currentlyLoggedUser
 */
function showMyAddsView() {
    $('#myAdds').empty();
	$('#page-selection').empty();
    showView('viewMyAdds');

    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds?query={}&sort={\"_kmd.lmt\": -1}";

    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

   $('body').on("click", ".buttonEdit", editAdd);
   $('body').on("click", ".buttonDelete", deleteAdd);

    $.ajax({
        method: "GET",
        url:kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        success: loadMyAddsSuccess,
        error: handleAjaxError
    });


    function loadMyAddsSuccess(allAds) {
        showInfo('Your personal adds are loaded.');
        //allAds.reverse();
        if(allAds.length == 0)
            $('#myAdds').text('No adds in the database.');

        else{

          var sd = allAds.filter(function(data){return data.author === currentlyLoggedUser});


            if(sd.length ===0){
                $('#myAdds').text('No adds published by you.');
            }
			else
			{
				var ADS_PER_PAGE = 5;
				var userAdsCount = 0;
				var pages = [];
				pages[0] = $('<div class="page" id="page-1">');
				var pageIndex = 0;
				for(let add of allAds){
					if(add.author === currentlyLoggedUser){
						let adds = $('<div class="singleAdd panel-body" style="width: 90%; min-width: 200px; margin-left: 7%;" id=' +add._id + '>');

						if(userAdsCount % ADS_PER_PAGE == 0 && userAdsCount != 0)
						{
							pageIndex++;
							pages[pageIndex] = $('<div class="page" id="page-' + (pageIndex+1) +'">');
						}
						userAdsCount++;

						let singleAddHeading = $('<h1>').html(add.title);
						let singleAddAuthor = $('<p>').html("posted by " +
							"<span class='helloUsername'>" + add.author + "</span>");


					let fullText = add.description;
                    let shortTxt = add.description.substring(0, 101);

                    let singleAddText = $('<p class="short">').html(shortTxt + "...");
                    let singleFullText = $('<p class="full">').html(fullText);


                    let postId = add._id;

                    let zoomIn = $('<button id="tooltip" class="zoomInZoomOutButtons btn btn-success" title="Increase text size" onclick="magnifieTextPost(this)"><img class="zoomInZooMOut" src="media/zoom-in.png" alt="zoom in text" />Zoom in</button>').attr('id', postId);
                    let zoomOut = $('<button id="tooltip" class="zoomInZoomOutButtons btn btn-success" title="Decrease size of text" onclick="decreaseTextPost(this)"><img class="zoomInZooMOut" src="media/zoom-out.png" alt="zoom out text" />Zoom out</button>').attr('id', postId);
                    let date = add.from_date;


                    let readMore = $('<button id="tooltip" class="readMore btn btn-success" title="Click here to read full post" onclick="readMore(this)"><img class="zoomInZooMOut" src="media/cursor.png" alt="read more icon" />Read More..</button>').attr('id', postId);

                    let hideText = $('<button id="tooltip" class="hide btn btn-success" title="Hide post" onClick="hide(this)"><img class="zoomInZooMOut" src="media/hide.png" alt="hide text" />Hide...</button>').attr('id', postId);

                    let btn_edit = $('<button id="tooltip" class="buttonEdit btn btn-primary" title="Here you can edit yours posts" data-id="'+add._id+'"><img class="zoomInZooMOut" src="media/edit.png" alt="edit post" />Edit</button>');
                    let btn_delete = $('<button id="tooltip" class="buttonDelete btn btn-danger" title="This will delete your post. Be carefull!" data-id="'+add._id+'"><img class="zoomInZooMOut" src="media/delete.png" alt="delete post" />Delete</button>');

                    var singleAdd = '';


                    if(fullText.length <= 50){
                        singleFullText = $('<p class="short">').html(fullText);

                        let copyButton = $('<button id="tooltip" class="copyButton btn btn-success" title="Copy this advertisment on clipboard" onclick="copy(this)"><img class="zoomInZooMOut" src="media/copy.png" alt="hide text" />Copy</button>').attr('id', postId);
                        let printButton = $('<button id="tooltip" class="copyButton btn btn-success" title="Print this advertisment" onclick="printDiv(this)"><img class="zoomInZooMOut" src="media/printer.png" alt="hide text" />Print</button>').attr('id', postId);


                        singleAdd = [singleAddHeading,singleAddAuthor,singleFullText,btn_edit,btn_delete, zoomIn, zoomOut, copyButton, printButton];



                    }else{
                        shortTxt = add.description.substring(0, 51);
                        singleAddText = $('<p class="short">').html(shortTxt + "...");
                        let copyButton = $('<button  class="copyButton btn btn-success" onclick="copyLongPosts(this)"><img class="zoomInZooMOut" src="media/copy.png" alt="hide text" />Copy</button>').attr('id', postId);
                        let printButton = $('<button class="copyButton btn btn-success" onclick="printLongDiv(this)"><img class="zoomInZooMOut" src="media/printer.png" alt="hide text" />Print</button>').attr('id', postId);
                        singleAdd = [singleAddHeading,singleAddAuthor,singleAddText, singleFullText, readMore, hideText,btn_edit, btn_delete, zoomIn, zoomOut, copyButton, printButton];


                    }











                        // var singleAdd = '';

                        // if(add.description.length >= 5){
                        //      singleAdd = [singleAddHeading,singleAddAuthor,singleAddText,btn_edit,btn_delete, link];
                        // }else {
                        //      singleAdd = [singleAddHeading,singleAddAuthor,singleAddText,btn_edit,btn_delete];
                        // }

                        //singleAdd = [singleAddHeading,singleAddAuthor,singleAddText,btn_edit,btn_delete];

						adds.append(singleAdd);
						pages[pageIndex].append(adds);
					}
				}
				for(var index = 0; index< pages.length; index++){
					$('#myAdds').append(pages[index]);
					$('#page-selection').append('<button class="btn btn-success" style="margin-top: 10px;" onClick="showPage(' + (index+1) + ')">' + (index+1) + '</button>');
				}
			}
        }
    }
}
function showPage(pageIndex){
	$('.page').hide();
	$('#page-'+pageIndex).show();
}


/*
-----------------------------------------------------------
 */

/*
Functions suchs as login, logout and register
 */
function login() {

    const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/login";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };
    let userData = {
        username: $('#loginUser').val(),
        password: $('#loginPassword').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: loginSuccess,
        error: handleAjaxError
    });
    function loginSuccess(response) {

        localStorage.clear();
        localStorage.setItem('username',response.username);

        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);

        showHideMenuLinks();
        showView('viewHome');
        showInfo('Login successful.');
        location.reload();

    }
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if(response.readyState ===0)
        errorMsg = "Cannot connect due to network error.";
    if(response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showErrorMsg(errorMsg);
}



function register() {
    const kinveyRegisterUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };

    let userName = $('#registerUser').val();
    let password = $('#registerPassword').val();
    let confirm = $('#confirmPassword').val();

    function validateForm() {
        if(userName.length <= 3){
            showErrorMsg("Username is too short. Minimum 3 characters");
            return false;
        }

        if(!userName[0].match(/[a-z]/)){
            showErrorMsg("Username can`t begin with digit.");
            return false;
        }

        if(!userName.match(/^[a-zA-Z0-9- ]*$/)){
            showErrorMsg("You have entered forbidden sign. Please check for @, !, ., - , and remove them");
            return false;
        }


        if(password.length < 3){
            showErrorMsg("The password is too short. Minimum 3 characters")
            return false;
        }

        if(password != confirm){
            showErrorMsg("Passwords does not match.");
            return false;
        }

        return true;
    }


    if(!validateForm()){
        return;
    }else {
        showInfo("Congratulations. Successful registration");
    }




    let userData = {
        username: $('#registerUser').val(),
        password: $('#registerPassword').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyRegisterUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: registerSuccess,
        error: handleAjaxError
    });
    function registerSuccess(response) {

        localStorage.clear();
        localStorage.setItem('username',response.username);

        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHideMenuLinks();
        showView('viewHome');
        showInfo('User registration successful.');
        location.reload();
    }
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    showHideMenuLinks();
    showView('viewHome');
    location.reload();
}

/*
-------------------------------------------------------------
 */

/*
Functions for the advertisments such as listing, deleting, editing etc.
 */

function redirectMyAdvert(event){
    event.preventDefault();
    showView('viewMyAdds');
}


function showHideContacts(){
    $('.contacts').toggle();
}

function showHideMap(){
    $('.map').toggle();
}




function magnifieText(view){
    let increase   = 1;
    let currentView = "#" + view;
    let currentSize = parseInt($(currentView + ' p').css("font-size"));

    if(currentSize > 30){
        alert('You have reached maximum size.');
        currentSize = 30;
    }

     currentSize = currentSize + increase + "px";


    $(currentView + ' p').css({"font-size": currentSize});


}


function decreaseText(view){
    let decrease   = 1;
    let currentView = "#" + view;
    let currentSize = parseInt($(currentView + ' p').css("font-size"));

    if(currentSize < 11){
        alert('You have reached minimal size.');
        currentSize = 11;
    }

     currentSize = currentSize - decrease + "px";

    $(currentView + ' p').css({"font-size": currentSize});
}









function readMore(postId){
    let fullId = '#' + postId.id;

    $(fullId + ' .short').hide();
    $(fullId + ' .full').show();
    $(fullId + ' .full').addClass('fullVisibilOn');
    $(fullId + ' .readMore').hide();
    $(fullId + ' .hide').addClass('fullVisibilOn');
    $(fullId + ' .hide').show();

}

function hide(postId){
    let fullId = '#' + postId.id;

    $(fullId + ' .short').show();
    $(fullId + ' .full').hide();
    $(fullId + ' .hide').hide();
    $(fullId + ' .readMore').show();
}


function magnifieTextPost(postId){
    let increase   = 1;
    let currentView = "#" + postId.id;
    let currentSize = parseInt($(currentView + ' p').css("font-size"));

    if(currentSize > 30){
        alert('You have reached maximum size');
        currentSize = 30;
    }

     currentSize = currentSize + increase + "px";


    $(currentView + ' p').css({"font-size": currentSize});

}



function decreaseTextPost(postId){

    let increase   = 1;
    let currentView = "#" + postId.id;
    let currentSize = parseInt($(currentView + ' p').css("font-size"));

    if(currentSize < 12){
        alert('You have reached minimal size');
        currentSize = 12;
    }

     currentSize = currentSize - increase + "px";


    $(currentView + ' p').css({"font-size": currentSize});
}





function copy(postId){
     let target = '#' + postId.id;
     let text = $(target + " p:nth-child(3)" ).text();
     window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

function copyLongPosts(postId){
     let target = '#' + postId.id;
     let text = $(target + " p:nth-child(4)" ).text();
     window.prompt("Copy to clipboard: Ctrl+C, Enter", text);

}



function printDiv(divName) {

        let divToPrint = '#' + divName.id;


        var restorepage = document.body.innerHTML;
        var printcontent = $(divToPrint + ' p:nth-child(2)').html();
        var printcontent2 = $(divToPrint + ' p:nth-child(3)').html();

        document.body.style.backgroundColor = "#E9E9E9";
        document.body.innerHTML = "<div class='printfriendly'>" + "<h3>" + printcontent + "</h3>" + "<hr />" + "<br />" + "<p>" + printcontent2 + "</p>" +  "</div>";


        window.print();
        document.body.innerHTML = restorepage;

        location.reload();


          // var printContents = $(divToPrint + ' p').text();
          // var originalContents = document.body.innerHTML;
          // document.body.innerHTML = printContents;
          // window.print();
          // document.body.innerHTML = originalContents;
}




//printLongDiv
function printLongDiv(divName) {

        let divToPrint = '#' + divName.id;


        var restorepage = document.body.innerHTML;
        var printcontent = $(divToPrint + ' p:nth-child(2)').html();
        var printcontent2 = $(divToPrint + ' p:nth-child(4)').html();

        document.body.style.backgroundColor = "#E9E9E9";
        document.body.innerHTML = "<div class='printfriendly'>" + "<h3>" + printcontent + "</h3>" + "<hr />" + "<br />" + "<p>" + printcontent2 + "</p>" + "</div>";
        window.print();
        document.body.innerHTML = restorepage;
        location.reload();


          // var printContents = $(divToPrint + ' p').text();
          // var originalContents = document.body.innerHTML;
          // document.body.innerHTML = printContents;
          // window.print();
          // document.body.innerHTML = originalContents;
}














function listAdds() {
    $('#AllAdds').empty();
    $('#page-selectionAllAdds').empty();

    showView('viewAdds');

    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds?query={}&sort={\"_kmd.lmt\": -1}";
    if(sessionStorage.getItem('authToken')){
        var authToken = sessionStorage.getItem('authToken');
    }
    else{
        var authToken = guestCredentials;
    }

    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + authToken,
    };

    $.ajax({
        method: "GET",
        url:kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        success: loadAddsSuccess,
        error: handleAjaxError
    });

    function loadAddsSuccess(adds) {
        showInfo('Adds loaded.');
        if(adds.length == 0)
            $('#AllAdds').text('No adds in the database.');

    else{

            var ADS_PER_PAGE = 5;
            var userAdsCount = 0;
            var pages = [];
            pages[0] = $('<div class="page" id="page-1">');
            var pageIndex = 0;
            for(let add of adds){

                    let adds = $('<div class="singleAdd panel-body" style="width: 90%; min-width: 200px; margin-left: 7%;" id=' +add._id + '>');

                    if(userAdsCount % ADS_PER_PAGE == 0 && userAdsCount != 0)
                    {
                        pageIndex++;
                        pages[pageIndex] = $('<div class="page" id="page-' + (pageIndex+1) +'">');
                    }
                    userAdsCount++;

                    let singleAddHeading = $('<h1>').html(add.title);
                    let singleAddAuthor = $('<p>').html("posted by " +
                        "<span class='helloUsername'>" + add.author + "</span>");

                    let fullText = add.description;
                    let shortTxt = add.description.substring(0, 101);

                    let singleAddText = $('<p class="short">').html(shortTxt + "...");
                    let singleFullText = $('<p class="full">').html(fullText);


                    let postId = add._id;
                    let zoomIn = $('<button class="zoomInZoomOutButtons btn btn-success" onclick="magnifieTextPost(this)"><img class="zoomInZooMOut" src="media/zoom-in.png" alt="zoom in text" />Zoom in</button>').attr('id', postId);
                    let zoomOut = $('<button class="zoomInZoomOutButtons btn btn-success" onclick="decreaseTextPost(this)"><img class="zoomInZooMOut" src="media/zoom-out.png" alt="zoom out text" />Zoom out</button>').attr('id', postId);

                    let readMore = $('<button class="readMore btn btn-success" onclick="readMore(this)"><img class="zoomInZooMOut" src="media/cursor.png" alt="read more icon" />Read More..</button>').attr('id', postId);
                    let hideText = $('<button class="hide btn btn-success" onClick="hide(this)"><img class="zoomInZooMOut" src="media/hide.png" alt="hide text" />Hide...</button>').attr('id', postId);

                    var singleAdd = '';


                    if(fullText.length <= 50){
                        singleFullText = $('<p class="short">').html(fullText);

                        let copyButton = $('<button class="copyButton btn btn-success" onclick="copy(this)"><img class="zoomInZooMOut" src="media/copy.png" alt="hide text" />Copy</button>').attr('id', postId);
                        let printButton = $('<button class="copyButton btn btn-success" onclick="printDiv(this)"><img class="zoomInZooMOut" src="media/printer.png" alt="hide text" />Print</button>').attr('id', postId);



                        singleAdd = [singleAddHeading,singleAddAuthor,singleFullText, zoomIn, zoomOut, copyButton, printButton];


                    }else{
                        shortTxt = add.description.substring(0, 51);
                        singleAddText = $('<p class="short">').html(shortTxt + "...");
                        let copyButton = $('<button class="copyButton btn btn-success" onclick="copyLongPosts(this)"><img class="zoomInZooMOut" src="media/copy.png" alt="hide text" />Copy</button>').attr('id', postId);
                        let printButton = $('<button class="copyButton btn btn-success" onclick="printLongDiv(this)"><img class="zoomInZooMOut" src="media/printer.png" alt="hide text" />Print</button>').attr('id', postId);

                        singleAdd = [singleAddHeading,singleAddAuthor,singleAddText, singleFullText, readMore, hideText, zoomIn, zoomOut, copyButton, printButton];
                    }



                    adds.append(singleAdd);


                    pages[pageIndex].append(adds);

            }
            for(var index = 0; index< pages.length; index++){
                $('#AllAdds').append(pages[index]);
                $('#page-selectionAllAdds').append('<button class="btn btn-success" style="margin-top: 10px;" onClick="showPage(' + (index+1) + ')">' + (index+1) + '</button>');
            }

        }

    }

    function showPage(pageIndex){
        $('.page').hide();
        $('#page-'+pageIndex).show();
    }

}

function createAdd() {
    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds";
    const kinveyAuthHeaders = {
      'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    let authorTitle = $('#addTitle').val();

    function validateForm() {
        if(authorTitle.length <= 3){
            showErrorMsg("Title is too short. Minimum 3 characters");
            return false;
        }

        return true;
    }

    if(!validateForm()){
        return;
    }

    let addData = {
        title: $('#addTitle').val(),
        author: currentlyLoggedUser,
        description: $('#addDescription').val(),
        from_date: new Date()
    }

    $.ajax({
        method: "POST",
        url: kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        data: addData,
        success: createAddSuccess,
        error: handleAjaxError
    });

    function createAddSuccess(response) {
        showMyAddsView();
        showInfo('Add created.');
    }
}

function modifyAdd() {
    var id = $('#addModifyId').val();
    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey+ "/Adds/"+id;
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    let addData = {
        title: $('#addModifyTitle').val(),
        author: currentlyLoggedUser,
        description: $('#addModifyDescription').val()
    }

    $.ajax({
        method: "PUT",
        url: kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        data: addData,
        success: modifyAddSuccess,
        error: handleAjaxError
    });

    function modifyAddSuccess(response) {
        showMyAddsView();
        showInfo('Add modified.');
    }
}

function deleteAdd(event) {
    event.preventDefault();

    let confirmation = confirm("Do you really want to delete this post ?");
    if(!confirmation){
        return;
    }

    let id = $(this).attr('data-id');


    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    $.ajax({
        method: "DELETE",
        url:kinveyAddsUrl + "/" + id,
        headers: kinveyAuthHeaders,
        success: deleteAddSuccess,
        error: handleAjaxError
    });

    function deleteAddSuccess() {
        location.reload();
        showMyAddsView();
    }
}

function editAdd(event) {
    event.preventDefault();
    let id = $(this).attr('data-id');
    const kinveyAddsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Adds/"+id;
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    var getData = {'_id': id};
    $.ajax({
        method: "GET",
        url: kinveyAddsUrl,
        headers: kinveyAuthHeaders,
        data: null,
        success: getAddSuccess,
        error: handleAjaxError
    });
    function getAddSuccess(data) {
        $('#addModifyTitle').val(data.title);
        $('#addModifyDescription').val(data.description);
        $('#addModifyId').val(data._id);
        showModifyAddView();
    }
}

var apiKey = '0736d16b20ce1910ef314ff1d89461f2'
var scrollTime = 500
var scrollEasing = 'swing'
var masterData = {}
var movieDB = {}
var watchHistory = []
var tileHeight = 250;
var tileWidth = (tileHeight / (3/2));
var posterSize = 'w154'
var videoUrl = 'http://d2bqeap5aduv6p.cloudfront.net/project_coderush_640x360_521kbs_56min.mp4'
var video = document.getElementById('playerVideo');
var cursor = null
/*
"backdrop_sizes": [
  "w300",
  "w780",
  "w1280",
  "original"
],
"logo_sizes": [
  "w45",
  "w92",
  "w154",
  "w185",
  "w300",
  "w500",
  "original"
],
"poster_sizes": [
  "w92",
  "w154",
  "w185",
  "w342",
  "w500",
  "w780",
  "original"
],
"profile_sizes": [
  "w45",
  "w185",
  "h632",
  "original"
],
"still_sizes": [
  "w92",
  "w185",
  "w300",
  "original"
]
*/

$( document ).ready(function() {
    $.get( "https://api.themoviedb.org/3/genre/movie/list?api_key=" + apiKey + "&language=en-US", function( data ) {   
        //console.log(data.genres[0])
        var genre = {}
        genre.id = 0
        genre.name = 'Recently Watched'
        addGenre(genre,0,data.genres.length)
        $(data.genres).each(function( index ) {
            console.log(data.genres[index].name)   
            addGenre(data.genres[index],index,data.genres.length)   
        });
    });
    setTimeout(function(){
        $('.loadingClass').hide()
    }, 1000);      
})


//$.get("https://demo2697834.mockable.io/movies", function( data ) {
//${data.results[index].contents[0].url}


// Adds New Carousal(Genre) to the view and adds tiles
function addGenre(genre,currIndex,maxIndex){
    var genreName = genre.name.replace(/\s/g, '')
    var genreContainer = `
    <div id="parent${genreName}" class=" animated fadeInUp">
        <h3 style="margin-left: 50px;">${genre.name}</h3>
        <div class="genre" id="outer${genreName}">        
            <div class="row">              
                <div class="row__inner" id="${genreName}" genre-id=${genre.id}> 
                </div>
            </div>
        </div>
    </div>
    `
    $('.contain').append(genreContainer)
    if(genreName != 'RecentlyWatched'){
        $.get( "https://api.themoviedb.org/3/genre/" + genre.id + "/movies?api_key=" + apiKey + "&language=en-US&include_adult=false&sort_by=created_at.asc", function( data ) {   
            //console.log(genreName)    
            //console.log(data)
            if(data.results.length == 0){
                $('#parent'+genreName).hide();
                //console.log('genre empty' + genreName)
            }else{
                $(data.results).each(function( index ) {                               
                    //console.log(JSON.stringify(data.results[index]))   
                    if(data.results[index].poster_path != null){
                        var posterUrl = 'http://image.tmdb.org/t/p/' + posterSize + '/' + data.results[index].poster_path
                        var movieInfo = {}
                        movieInfo.id = data.results[index].id
                        movieInfo.title = data.results[index].title
                        movieInfo.posterUrl = posterUrl
                        movieInfo.description = data.results[index].overview
                        movieInfo.videoUrl = videoUrl
                        movieDB[data.results[index].id] = movieInfo 
                        $('#'+genreName).append(getTileHTML(movieInfo,genreName,index))
                    }
                });
                updateMasterData(genreName);
            }      
        });  
    }                              
    if((currIndex+1) == maxIndex){       
        setTimeout(function(){
            watchHistory = JSON.parse(userInfo.watch_history)   
            $.each(watchHistory,function (index, obj){
                console.log(movieDB[watchHistory[index]])
                $('#RecentlyWatched').append(getTileHTML(movieDB[watchHistory[index]],'RecentlyWatched',index))
            });
            showHideWatchHistory()
            updateMasterData('RecentlyWatched');
        }, 500);                       
    }
}

// Generates Individual Tile HTML Content
function getTileHTML(movieInfo,genreName,index){
    var container = `
        <div class="tile" id="${genreName+'tile'+index}" onclick="openPlayerModal(${movieInfo.id},'${movieInfo.title}','${movieInfo.videoUrl}','${movieInfo.posterUrl}')">
            <div class="tile__media">
                <img class="tile__img" src="${movieInfo.posterUrl}" alt=""  />
            </div>
            <div class="tile__details">
                <div class="tile__title">
                    ${movieInfo.title}
                </div>
            </div>
        </div>
        `
    return container
}

// Updates Master Data
function updateMasterData(genreName){
    //console.log('inside updatemasterdata ' + genreName)
    var leftArrowContent = `<div class="left-controls" role="button" aria-label="See Previous" onclick="moveLeft('${genreName}')">
    <b class="fa fa-chevron-left fa-chevron-left-extra leftarrow" aria-hidden="true"></b>
    </div>`
    var rightArrowContent = `<div class="right-controls" role="button" aria-label="See Previous" onclick="moveRight('${genreName}')">
    <b class="fa fa-chevron-right fa-chevron-right-extra rightarrow" aria-hidden="true"></b>
    </div>`
    $('#outer'+genreName).prepend(leftArrowContent);
    $('#outer'+genreName).append(rightArrowContent);
    var genreData = {}
    genreData.maxWidth = $('#outer'+genreName + ' > .row > .row__inner').width()
    genreData.visibleWidth = $('#outer'+genreName + ' > .row').width()
    genreData.scrollWidth = $('#outer'+genreName + ' > .row').width()
    genreData.enableLeftArrow = false
    genreData.enableRightArrow = true
    genreData.scrollLock = false
    masterData[genreName] = genreData
    $('#outer'+genreName+' .left-controls .leftarrow' ).hide();
    if(genreName == 'RecentlyWatched')
        $('#outer'+genreName+' .right-controls .rightarrow' ).hide();
    //console.log('inside update')
}

// Scrolls the Selected Carousel to the Right
function moveRight(element){
    if(masterData[element].enableRightArrow && !masterData[element].scrollLock){
        //console.log(JSON.stringify(masterData))
        masterData[element].scrollLock = true
        var $item = $('#'+element + ' div.tile')
        //console.log(masterData[element].scrollWidth +' >> '+ masterData[element].maxWidth )
        if(masterData[element].scrollWidth < masterData[element].maxWidth ){            
            //console.log('inside move right ' + element)
            if((masterData[element].scrollWidth + masterData[element].visibleWidth) < masterData[element].maxWidth){
                var tempWidth = masterData[element].scrollWidth + masterData[element].visibleWidth
                masterData[element].scrollWidth = tempWidth;
                $item.animate({'left':'-=' + masterData[element].visibleWidth + 'px'}, {
                    duration: scrollTime,
                    easing: scrollEasing,
                    complete: function () {
                        masterData[element].scrollLock = false
                      }
                  });     
            }else{                
                //$item.animate({'left':'-=' + (masterData[element].maxWidth - masterData[element].scrollWidth) + 'px'}, {
                $item.animate({'left': '-'+(masterData[element].maxWidth - masterData[element].visibleWidth) + 'px'}, {
                    duration: scrollTime,
                    easing: scrollEasing,
                    complete: function () {
                        masterData[element].scrollLock = false
                      }
                  });
                masterData[element].scrollWidth = masterData[element].maxWidth;
            }   
            if(masterData[element].scrollWidth == masterData[element].maxWidth){
                masterData[element].enableRightArrow = false
                masterData[element].enableLeftArrow = true
                $('#outer'+element+' .right-controls .rightarrow' ).fadeOut();
                $('#outer'+element+' .left-controls .leftarrow' ).fadeIn();                
            }else{
                resetAll(element)
            }
        }
    }
}

// Scrolls the Selected Carousel to the Left
function moveLeft(element){
    if(masterData[element].enableLeftArrow && !masterData[element].scrollLock){
        masterData[element].scrollLock = true
        var $item = $('#'+element + ' div.tile')
        if(masterData[element].scrollWidth >= masterData[element].visibleWidth){
            var tempWidth = masterData[element].scrollWidth - masterData[element].visibleWidth;    
            if(tempWidth <= masterData[element].visibleWidth){
                //$item.animate({'left':'+=' + (masterData[element].scrollWidth - masterData[element].visibleWidth) + 'px'}, {
                $item.animate({'left':'0px'}, {
                    duration: scrollTime,
                    easing: scrollEasing,
                    complete: function () {
                        masterData[element].scrollLock = false
                      }
                  });
                masterData[element].scrollWidth = masterData[element].visibleWidth
            }else{             
                masterData[element].scrollWidth = tempWidth
                $item.animate({'left':'+=' + masterData[element].visibleWidth + 'px'}, {
                    duration: scrollTime,
                    easing: scrollEasing,
                    complete: function () {
                        masterData[element].scrollLock = false
                      }
                  });
            }     
        }
        if(masterData[element].scrollWidth <= masterData[element].visibleWidth){
            masterData[element].enableLeftArrow = false
            masterData[element].enableRightArrow = true
            $('#outer'+element+' .left-controls .leftarrow' ).fadeOut();
            $('#outer'+element+' .right-controls .rightarrow' ).fadeIn();
        }else{
            resetAll(element)
        }

    }
}

// Reset all Arrow Controls
function resetAll(element){    
    masterData[element].enableRightArrow = true
    masterData[element].enableLeftArrow = true
    $('#outer'+element+' .left-controls .leftarrow' ).fadeIn();
    $('#outer'+element+' .right-controls .rightarrow' ).fadeIn();
}

// Add Movie to User's Watch History
function updateAndSyncWatchHistory(mId){
    if(!movieAlreadyInWatchHistory(mId)){
        watchHistory.unshift(mId)
        $('#RecentlyWatched').html('')
        for(i=0;i<watchHistory.length;i++){
            $('#RecentlyWatched').append(getTileHTML(movieDB[watchHistory[i]],'RecentlyWatched',i))
        }
        //$('#RecentlyWatched').append(getTileHTML(movieDB[mId],'RecentlyWatched',watchHistory.length-1))
        masterData['RecentlyWatched'].maxWidth = $('#outerRecentlyWatched > .row > .row__inner').width()
        masterData['RecentlyWatched'].visibleWidth = $('#outerRecentlyWatched > .row').width()
        if(masterData['RecentlyWatched'].maxWidth < masterData['RecentlyWatched'].visibleWidth || watchHistory.length<=1){
            $('#outerRecentlyWatched .right-controls .rightarrow' ).fadeOut();
        }else{
            $('#outerRecentlyWatched .right-controls .rightarrow' ).fadeIn();
        }
        storeWatchHistory()
        showHideWatchHistory()
    }
    console.log(JSON.stringify(watchHistory))
}

// Store User's Watch History to server
function storeWatchHistory(){
    $.post("/api/user/" + userInfo._id + "/storeHistory",{
        watch_history: JSON.stringify(watchHistory)
    }, function(data, status){
        console.log("Data: " + data + "\nStatus: " + status);
    });
}

// If Current movie already in watch history
function movieAlreadyInWatchHistory(mId){
    var hasFound = false
    $.each(watchHistory, function( index, value ) {
         if(value == mId)
            hasFound = true;
      });
    return hasFound;
}

// Show/Hide Recently Watched Carousel
function showHideWatchHistory(){
    if(watchHistory.length > 0)
        $('#parentRecentlyWatched').fadeIn();
    else
        $('#parentRecentlyWatched').hide();
}

// Play Video
function openPlayerModal(movieId,movieName,movieUrl,moviePoster){
    //console.log(movieName + '\n' + movieUrl + '\n' + moviePoster)   
    video.pause();
    $('#playerVideo').attr('src',movieUrl)
    $('.modal-title').html(movieName)
    video.load();
    $('#playerVideo').show()
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    }    
    updateAndSyncWatchHistory(movieId)
}

// on fullscreen on or fullscreen off
$(video).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
    var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    var event = state ? 'FullscreenOn' : 'FullscreenOff';
    if(!state)
        cleanVideo()
});


// On video ended close fullscreen and clean video player
$(video).bind("ended", function() {
    console.log('inside ended')
    document.webkitExitFullscreen();
    document.mozCancelFullscreen();
    document.exitFullscreen();
    cleanVideo()
});


// Pause video and clear video player
function cleanVideo(){
    //console.log('exit fullscreen')
    $('#playerVideo').hide()
    video.pause();
    $('#playerVideo').attr('src', '');
}

// On Modal Close
$('.modalPlayer').on('hidden.bs.modal', function () {    
    video.pause();
    $('#playerVideo').attr('src', '');
})


// On Window Resize, recalculate Carousel widths
$(window).resize(function(){
    //console.log('resize')
    $.each(masterData, function(genre, val) {
        var oldVisibleWidth = masterData[genre].visibleWidth
        masterData[genre].maxWidth = $('#outer'+genre + ' > .row > .row__inner').width()
        masterData[genre].visibleWidth = $('#outer'+genre + ' > .row').width()
        /*masterData[genre].scrollWidth = masterData[genre].visibleWidth
        $('#outer'+genre+' .left-controls .leftarrow' ).hide();
        var $item = $('#'+genre + ' div.tile')
        $item.animate({'left':'0px'},{
            duration:0
        });*/
        var oldScrollWidth = masterData[genre].scrollWidth
        if(oldVisibleWidth > masterData[genre].visibleWidth){
            var tempWidth = masterData[genre].scrollWidth - (oldScrollWidth - masterData[genre].visibleWidth)
            if(tempWidth >= masterData[genre].visibleWidth)
                masterData[genre].scrollWidth =  tempWidth
        }else{
            var tempWidth = masterData[genre].scrollWidth + (masterData[genre].visibleWidth - oldScrollWidth)
            if(tempWidth < masterData[genre].maxWidth)
                masterData[genre].scrollWidth =  masterData[genre].scrollWidth + (masterData[genre].visibleWidth - oldScrollWidth)
        }
    });
});

// Adding Keyboard Controls
$(document).keydown(function(e) {
    //console.log(e.keyCode);
    if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 13 || e.keyCode == 27){
        event.preventDefault();
        if(cursor == null){
            cursor = {}
            cursor.currentTile = -1
            cursor.currentGenre = 'Action'
        }
        //console.log(cursor)
        //console.log('#' + cursor.currentGenre + 'tile'+cursor.currentTile)
        //$('#' + cursor.currentGenre + ' > div:nth-child('+cursor.currentTile+')').mouseenter()
        //$('#' + cursor.currentGenre + 'tile'+cursor.currentTile).addClass('highlightTile')       

        // On Right Arrow Pressed, move cursor to next tile
        if(e.keyCode == 39){
            var maxGenreLength = $('#' + cursor.currentGenre + ' .tile').length-1
            if(cursor.currentTile < maxGenreLength){
                $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).removeClass('highlightTile')
                cursor.currentTile = cursor.currentTile + 1 
                $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).addClass('highlightTile')
                /*if($('#' + cursor.currentGenre + 'tile'+cursor.currentTile).isOnScreen()){
                    moveRight(cursor.currentGenre)
                }*/
                if(!$('#' + cursor.currentGenre + 'tile'+cursor.currentTile).isOnScreen()){
                    moveRight(cursor.currentGenre)
                }
            }
        }

        // On Left Arrow Pressed, move cursor to previous tile
        if(e.keyCode == 37){
            if(cursor.currentTile > 0){
                $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).removeClass('highlightTile')
                cursor.currentTile = cursor.currentTile - 1 
                $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).addClass('highlightTile')
                /*if($('#' + cursor.currentGenre + 'tile'+cursor.currentTile).is(':offscreen')){
                    moveLeft(cursor.currentGenre)
                }*/
                if(!$('#' + cursor.currentGenre + 'tile'+cursor.currentTile).isOnScreen()){
                    moveLeft(cursor.currentGenre)
                }
            }
        }

        // On Down Arrow Pressed, move cursor to next Genre Carousel
        if(e.keyCode == 40){
            $('.row__inner').each(function (index, obj){
                if(obj.id == cursor.currentGenre){
                    //console.log(obj.id + ' >>>> ' + cursor.currentGenre)
                    if(index < $('.row__inner').length-1){                        
                        $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).removeClass('highlightTile')
                        cursor.currentTile = 0
                        cursor.currentGenre = $('.row__inner').get(index+1).id
                        //console.log('#' + cursor.currentGenre + 'tile'+cursor.currentTile)
                        $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).addClass('highlightTile')
                        if(!$('#' + cursor.currentGenre).isOnScreen()){
                            $('html, body').animate({
                                scrollTop: $('#parent' + cursor.currentGenre).offset().top
                            }, 250);
                        }
                        return false;
                    }
                }
            });
        }

        // On Up Arrow Pressed, move cursor to Previous Genre Carousel
        if(e.keyCode == 38){
            $('.row__inner').each(function (index, obj){
                if(obj.id == cursor.currentGenre){
                    //console.log(obj.id + ' >>>> ' + cursor.currentGenre)
                    if(index > 0){
                        $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).removeClass('highlightTile')
                        cursor.currentTile = 0
                        cursor.currentGenre = $('.row__inner').get(index-1).id
                        //console.log('#' + cursor.currentGenre + 'tile'+cursor.currentTile)
                        $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).addClass('highlightTile')
                        if(!$('#' + cursor.currentGenre).isOnScreen()){
                            $('html, body').animate({
                                scrollTop: $('#parent' + cursor.currentGenre).offset().top
                            }, 250);
                        }
                        return false;
                    }
                }
            });
        }

        // On Enter Key Pressed, play current selected tile's video
        if(e.keyCode == 13){
            $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).click()
        }

        // On ESC Key Pressed, clear cursor
        if(e.keyCode == 27){
            $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).removeClass('highlightTile')
            cursor.currentTile = 0
        }
    }
});

$('.tile').hover( function(){
    //console.log('inside moseover')
    $('#' + cursor.currentGenre + 'tile'+cursor.currentTile).removeClass('highlightTile')
    cursor.currentTile = 0
});


// Supporting Functionalities

$.fn.extend({
    scrollRight: function (val) {
        if (val === undefined) {
            return this[0].scrollWidth - (this[0].scrollLeft + this[0].clientWidth) + 1;
        }
        return this.scrollLeft(this[0].scrollWidth - this[0].clientWidth - val);
    },
    isInViewport: function() {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
    
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
    
        return elementBottom > viewportTop && elementTop < viewportBottom;
    }
});

jQuery.expr.filters.offscreen = function(el) {
    var rect = el.getBoundingClientRect();
    return (
             (rect.x + rect.width) < 0 
               || (rect.y + rect.height) < 0
               || (rect.x > window.innerWidth || rect.y > window.innerHeight)
           );
};

$.fn.isOnScreen = function(){
	
	var win = $(window);
	
	var viewport = {
		top : win.scrollTop(),
		left : win.scrollLeft()
	};
	viewport.right = viewport.left + win.width();
	viewport.bottom = viewport.top + win.height();
	
	var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();
	
    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	
};

function isElementVisible(el) {
    var rect     = el.getBoundingClientRect(),
        vWidth   = window.innerWidth || doc.documentElement.clientWidth,
        vHeight  = window.innerHeight || doc.documentElement.clientHeight,
        efp      = function (x, y) { return document.elementFromPoint(x, y) };     

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0 
            || rect.left > vWidth || rect.top > vHeight)
        return false;

    // Return true if any of its four corners are visible
    return (
          el.contains(efp(rect.left,  rect.top))
      ||  el.contains(efp(rect.right, rect.top))
      ||  el.contains(efp(rect.right, rect.bottom))
      ||  el.contains(efp(rect.left,  rect.bottom))
    );
} 
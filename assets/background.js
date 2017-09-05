var data = {};
var fetchedDate = {};

function prefetch() {
    chrome.storage.local.get(null, function(g) {
        for (i=0;i<2;i++) {
            try {
                $.ajax({
                    type: "GET",
                    url: "https://c1.staticflickr.com/" + g.photos[i].farm + "/" + g.photos[i].server + "/" + g.photos[i].id + "_" + g.photos[i].secret + "_b.jpg",
                    success: function() {
                        console.log("downloded: " + i);
                    },
                    dataType: "image/jpg",
                    async: true,
                    error: function(err) {
                        console.log(err);
                    }
                });
            }
            
            catch (err) {
                console.log(err);
            } 
        }
    });
}

function fetchPhotos() {
    try {
        $.ajax({
            type: "GET",
            url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4be06fdd7de2b65531cdddcdb29211ce&user_id=khrimages&per_page=500&format=json&nojsoncallback=1",
            success: function(photos){
                console.log(data);
                for (i=0;i<photos.photos.photo.length;i++) {
                    delete photos.photos.photo[i].isfamily;
                    delete photos.photos.photo[i].isfriend;
                    delete photos.photos.photo[i].ispublic;
//                    photos.photos.photo[i] = photos.photos.photo[i].id;
                }
                data.photos = photos.photos.photo;
                chrome.storage.local.set(data);
                console.log(data);
                console.log(data.photos.length);
            },
//            dataType: "html",
            async: true,
            error: function() {
                console.log(err);
            }
        });
    }
    
    catch (err) {
        console.log(err);
    }
}

chrome.storage.local.get(null, function(g) {
    if (g.prefetch == undefined) {
        g.prefetch = 2;
        chrome.storage.local.set(g);
    }
    
    if (g.fetchedDate == undefined) {
        //new
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd = '0'+dd;
        } 
        if(mm<10) {
            mm = '0'+mm;
        } 
        today = yyyy + '-' + mm + '-' + dd;    
        
        fetchedDate.latest = today;
        data.fetchedDate = fetchedDate;
        chrome.storage.local.set(data);
    } else {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd = '0'+dd;
        } 
        if(mm<10) {
            mm = '0'+mm;
        } 
        today = yyyy + '-' + mm + '-' + dd;
        fetchedDate.latest = today;
        data.fetchedDate = fetchedDate;
        chrome.storage.local.set(data);
        console.log("latestDate: ", g.fetchedDate.latest);
    }
});


chrome.storage.local.get(null, function(g) {
    if (g.photos != undefined) {
        console.log(g.photos[0]);
        console.log(g.photos.length);
        
        $('#imgCall').attr('src',"https://c1.staticflickr.com/" + g.photos[0].farm + "/" + g.photos[0].server + "/" + g.photos[0].id + "_" + g.photos[0].secret + "_b.jpg");
        var imgMeta = $('#imgTitle');
        imgMeta.attr('href',"https://www.flickr.com/photos/" + g.photos[0].owner + "/" + g.photos[0].id + "/");
        imgMeta.attr('target','_blank');
        imgMeta.text(g.photos[0].title);
        
        delete g.photos[0];
        g.photos.shift();
        var nPrefetch = g.prefetch;
        if (nPrefetch == 1) {
            g.prefetch = 2;
        } else {
            g.prefetch = nPrefetch - 1;
        }
        chrome.storage.local.set(g);
        console.log("delete:", g.photos.length);
        
        //If photos lenght reached 1; fetch next set from Flickr
        if(g.photos.length == 1) {
            fetchPhotos();
        }
    }
    console.log(nPrefetch);
    if (nPrefetch == 1) {
        prefetch();
    }
    
    if (g.photos != undefined) {
        if (g.photos.length == 1) {
            fetchPhotos();
        }
    } else {
        //default photo
        $('#imgCall').attr('src',"https://c1.staticflickr.com/1/85/233472093_1f1d235e7b_b.jpg");
        var imgMeta = $('#imgTitle');
        imgMeta.attr('href',"https://www.flickr.com/photos/alphageek/233472093/");
        imgMeta.attr('target','_blank');
        imgMeta.text("Sunny Side Up - Taken at the Lexington Arboretum, Lexington, KY.");
        fetchPhotos();
    }
});

// chrome.bookmarks.get({'parentId': bookmarkBar.id,
//                               'title': 'Extension bookmarks'},
//                              function(newFolder) {
//        console.log("added folder: " + newFolder.title);
//      });
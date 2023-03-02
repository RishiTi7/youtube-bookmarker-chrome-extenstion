(()=>{
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response)=>{
        const {type,value,videoID} = obj;

        if(type ==="NEW"){
            currentVideo = videoID;
            newVideoLoaded();
        }else if(type ==="PLAY"){
            youtubePlayer.currentTime = value;
        } else if(type ==="DELETE"){
            currentVideoBookmarks = currentVideoBookmarks.filter((b)=>b.time !=value);
            chrome.storage.sync.set({[currentVideo]:JSON.stringify(currentVideoBookmarks)});

            response(currentVideoBookmarks);
        }
    });
    
    const fetchBookmarks = () =>{
        return new Promise((resolve)=>{
            chrome.storage.sync.get([currentVideo],(obj)=>{
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]):[]);
            });
        })
    }


    const newVideoLoaded = async () =>{
        const bookmarkBtnExists = document.getElementsByClassName("boolmark-btn")[0]
        currentVideoBookmarks = await fetchBookmarks();

        if (! bookmarkBtnExists){
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn,src = chrome.runtime.getURL("assests/bookmark.png");
            bookmarkBtn,className = "ytp-button" + "bookmark-btn";
            bookmarkBtn,title = "click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("videp-stream")[0];

            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click",addNewbookmarkEventHandler);
        }

    };
    // newVideoLoaded();
    const addNewbookmarkEventHandler = async () =>{
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc : "Bookmark at: " + getTime(currentTime),
    };
    currentVideoBookmarks = await fetchBookmarks();
    chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks,newBookmark].sort((a,b)=>a.time - b.time))
    }); 

}

})();

const getTime = t =>{
    var data = new Date(0);
    Date.setSeconds(t);

    return Date.toISOString().substr(11,8);
};

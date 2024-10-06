console.log("script loaded successfully");
let currFolder;

let currentSong = new Audio;
let playIcon = document.getElementById("play");
let songs
function formatTime(decimalSeconds) {
    // Round down to the nearest whole second
    const seconds = Math.floor(decimalSeconds);
    
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad the minutes and seconds with leading zeros if needed
    const minutesFormatted = String(minutes).padStart(2, '0');
    const secondsFormatted = String(remainingSeconds).padStart(2, '0');

    return `${minutesFormatted}:${secondsFormatted}`;
}



async function getSongs(folder) {
    try {
        currFolder = folder;


        let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let text = await response.text();

        let div = document.createElement("div");
        div.innerHTML = text;

        let anchors = div.getElementsByTagName("a");
        let anchorsArray = Array.from(anchors); // Convert HTMLCollection to Array

        let songsArray = anchorsArray.filter(element => element.href.endsWith(".mp3")); // Filter for .mp3 links

        // Convert songsArray to just the song names
        songsArray = songsArray.map(element => element.href.split(`/${folder}/`)[1]);

        // Assuming you have a reference to songsUL defined elsewhere in your code
        let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songsUL.innerHTML = ""; // Clear previous songs

        for (const song of songsArray) { // Changed 'songs' to 'songsArray'
            songsUL.innerHTML += `
            <li>                
                <i class="fa-duotone fa-solid fa-music music-icon"></i>
                <div class="info">
                    <div class="songTitle">${song.replaceAll("%20", " ").replaceAll("%", " ").replaceAll("2C", " ")}</div>
                    <div class="artist">BY Hrishabh</div>
                    <div style="display: none;" class="path">${song}</div>
                </div>
                <div class="playNow">   
                    <span>Play Now</span>
                    <i class="fa-sharp fa-solid fa-play"></i>
                </div>
            </li>`;
        }

        // Play the first song if available
        if (songsArray.length > 0) {
            playMusic(songsArray[0], decodeURI(songsArray[0]), true);
        }

        // Add event listeners to each song item
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(element => {
            element.addEventListener("click", () => {
                playMusic(element.querySelector(".path").innerHTML, element.querySelector(".songTitle").innerHTML);
            });
        });
    } catch (error) {
        console.error('Error fetching or parsing HTML data:', error);
    }
}


const playMusic = (trackPath, trackName,pause=false) => {
    currentSong.src = `/${currFolder}/` + trackPath;
    if (!pause) {
        currentSong.play()
        if (playIcon.classList.contains("fa-play")) {            
            playIcon.classList.remove("fa-sharp", "fa-solid", "fa-play");
            playIcon.classList.add("fa-solid", "fa-pause");
        }

    }
    document.querySelector(".songInfo").innerHTML = `${trackName}`
}



async function main() {
    //get songs from directory
    songs = await getSongs("Songs/NonCopyrightSongs");
    
    let url = "http://127.0.0.1:5500/Songs/"

    
    //show all the songs in the playlist
    let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    

    play.addEventListener("click", ()=>{
        if (currentSong.paused) {
            currentSong.play();
            if (playIcon.classList.contains("fa-play")) {
                
                playIcon.classList.remove("fa-sharp", "fa-solid", "fa-play");
                playIcon.classList.add("fa-solid", "fa-pause");
            } else {
                
                playIcon.classList.remove("fa-regular", "fa-pause");
                playIcon.classList.add("fa-sharp", "fa-solid", "fa-play");
            }
        } else{
            currentSong.pause();
            if (playIcon.classList.contains("fa-play")) {
                
                playIcon.classList.remove("fa-sharp", "fa-solid", "fa-play");
                playIcon.classList.add("fa-solid", "fa-pause");
            } else {
                
                playIcon.classList.remove("fa-regular", "fa-pause");
                playIcon.classList.add("fa-sharp", "fa-solid", "fa-play");
            }
        }
        
    })
        

    
    currentSong.addEventListener("loadedmetadata", () => {
        // Update the duration only after metadata is loaded
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    });
    
    currentSong.addEventListener("timeupdate", () => {
        // Update the current time every second while the song plays
        if (!isNaN(currentSong.duration)) {  // Ensure the duration is valid before updating
            document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
            document.querySelector(".seekCircle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";

        }
    });
    currentSong.addEventListener('ended', () => {
        
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    });
    
    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".seekCircle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent)/100;
    })
    
    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = 0;
        document.querySelector(".close").style.display = "block";
    })
    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-140%";
        document.querySelector(".close").style.display = "none  ";
        
    })

    backward.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        
        if(index > 0){
            playMusic(songs[index-1], decodeURI(songs[index-1]))
        }
    })
    forward.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        
        if(index+1 < songs.length){
            playMusic(songs[index+1], decodeURI(songs[index+1]).replaceAll("%", " ").replaceAll("2C", " "))
        }
    })
    
    document.querySelector(".volSeekBar").addEventListener("input", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100;
        if (currentSong.volume === 0) {
            document.querySelector(".volume").src = "mute.svg"
        }else{
            document.querySelector(".volume").src = "Volume.svg"
        }
    })

    //loading songs from the albums
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            // Accessing dataset folder correctly
            let folder = e.dataset.folder; 
            songs = await getSongs(`songs/${folder}`);
        });
    });
    
    

}

main();


//temporary 
async function displayFolders() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response =  await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    console.log(array.length);
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // console.log(e);     
        if (e.href.includes("/songs/")) {         
            let folder = e.href.split("/")[4]
            //getting the meta data of the folders
                let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                let response = await a.json();

        }               
    }    
}

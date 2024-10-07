console.log("script loaded successfully");
let currFolder;
let currentSong = new Audio;
let playIcon = document.getElementById("play");
let songs
let currVol = currentSong.volume;
const volumeSlider = document.getElementById('volSeekBar');
volumeSlider.value = 50;
currentSong.volume = 0.5;

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

        // Fetch JSON from the GitHub API instead of folder contents
        let response = await fetch(folder);
        let data = await response.json(); // Parse JSON response

        // Filter for .mp3 files
        let songsArray = data.filter(file => file.name.endsWith(".mp3"));

        // Assuming you have a reference to songsUL defined elsewhere in your code
        let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songsUL.innerHTML = ""; // Clear previous songs

        for (const song of songsArray) {
            let songTitle = song.name.replaceAll("%20", " ").replaceAll("%", " ").replaceAll("2C", " ");
            let downloadUrl = song.download_url; // Use the download_url from JSON

            songsUL.innerHTML += `
            <li>                
                <i class="fa-duotone fa-solid fa-music music-icon"></i>
                <div class="info">
                    <div class="songTitle">${songTitle}</div>
                    <div class="artist">BY Hrishabh</div>
                    <div style="display: none;" class="path">${downloadUrl}</div>
                </div>
                <div class="playNow">   
                    <span>Play Now</span>
                    <i class="fa-sharp fa-solid fa-play"></i>
                </div>
            </li>`;
        }

        // Play the first song if available
        if (songsArray.length > 0) {
            playMusic(songsArray[0].download_url, decodeURI(songsArray[0].name), true);
        }

        // Add event listeners to each song item
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(element => {
            element.addEventListener("click", () => {
                playMusic(element.querySelector(".path").innerHTML, element.querySelector(".songTitle").innerHTML);
            });
        });

        return songsArray;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}


const playMusic = (trackPath, trackName, pause = false) => {
    // Set the current song's source to the full trackPath (which is already a full URL)
    currentSong.src = trackPath;

    if (!pause) {
        currentSong.play();
        if (playIcon.classList.contains("fa-play")) {
            playIcon.classList.remove("fa-sharp", "fa-solid", "fa-play");
            playIcon.classList.add("fa-solid", "fa-pause");
        }
    }

    // Update the song info with the track name
    document.querySelector(".songInfo").innerHTML = `${trackName}`;
};


async function displayFolders() {
    let a = await fetch("https://api.github.com/repos/hrishabh6/Spotify/contents/Songs/")
    let response =  await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
   
        if (e.href.includes("/Songs/")) {         
            let folder = e.href.split("/")[4]
            //getting the meta data of the folders
                let a = await fetch(`/Songs/${folder}/info.json`);
                let response = await a.json();
                cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
                        <div class="circle">
                            <i class="fa-sharp fa-solid fa-play"></i>
                        </div>
                        <img src="songs/${folder}/cover.jpeg" alt="Honey Singh">
                        <h4>${response.description}</h4>
                        <p>${response.title}</p>
                    </div>`
        }               
    }
    
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            // Accessing dataset folder correctly
            let folder = e.dataset.folder; 
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0], decodeURIComponent(songs[0]))
        });
    });
    
}

async function main() {
    //get songs from directory
    songs = await getSongs("https://api.github.com/repos/hrishabh6/Spotify/contents/Songs/NonCopyrightSongs");
    
    let url = "/Songs/"

    
    //show all the songs in the playlist
    let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    //displaying folders dynamically
    displayFolders();

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
            document.querySelector(".volume").src = "svgs/mute.svg"
        }else{
            document.querySelector(".volume").src = "svgs/Volume.svg"
        }
    })

    document.querySelector(".volume").addEventListener("click", () => {
        

        
        if (currentSong.volume !== 0) {
            // Mute the song by setting volume to 0
            currentSong.volume = 0; // Use = to assign value
            document.querySelector(".volume").src = "svgs/mute.svg"; // Change icon to mute

            
        } else if (currentSong.volume == 0) {
            currentSong.volume = currVol;
            document.querySelector(".volume").src = "svgs/Volume.svg"; // Change icon to volume
        } 
    });
    
    
    

}

main();



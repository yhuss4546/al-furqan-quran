{
    class AudioPlayer extends HTMLElement {
        playing = false
        currentTime = 0
        duration = 0
        looped = false
        constructor(){
            super()

            this.attachShadow({mode: "open"})
            this.render()
            this.attatchEvents()
        }
           attatchEvents(){
            this.playPauseBtn.addEventListener("click", this.togglePlayPause.bind(this), false)
            this.loopBtn.addEventListener("click", () => {
                if(this.looped == true){
                    this.looped = false
                    this.loopBtn.textContent = "Loop"
                }
                else if(this.looped == false){
                    this.looped = true
                    this.loopBtn.textContent = "Unloop"
                }
            })
            this.progressBar.addEventListener(`input`, () =>{
                this.seekTo(this.progressBar.value)}, false)

            this.volumeBar.addEventListener(`input`, () => {
                this.updateVolume(this.volumeBar.value)
            }, false)

            this.audio.addEventListener(`loadedmetadata`, () =>{                
                this.duration = this.audio.duration
                let secs = `${parseInt(`${this.duration % 60}`, 10)}`.padStart(2, "0")
                let mins = `${parseInt(`${this.duration/60 % 60}`, 10)}`
                this.progressBar.max = (Number(secs) + (Number(mins) * 60))*100

                this.durationBar.textContent = `${mins}:${secs}`

            }, false)

            this.audio.addEventListener(`timeupdate`, () =>{
                this.updateAudioTime(this.audio.currentTime)

            }, false)

            this.audio.addEventListener(`ended`, () => {
                this.playPauseBtn.textContent = "Play"
                this.progressBar.value = 0
                this.playing = false
                if(this.looped == true){
                    this.togglePlayPause()
                }
            })
           } 

            togglePlayPause(){
                if(this.playing == false){
                    this.audio.play()
                    this.playing = true
                    this.playPauseBtn.textContent = "Pause"
                }
                else if(this.playing == true){
                    this.audio.pause()
                    this.playing = false
                    this.playPauseBtn.textContent = "Play"
                }
            }

            updateAudioTime(time){
                this.currentTime = time
                this.progressBar.value = time*100

                let secs = `${parseInt(`${time % 60}`, 10)}`.padStart(2, "0")
                let mins = `${parseInt(`${time/60 % 60}`, 10)}`

                this.currentTimeBar.textContent = `${mins}:${secs}`
            }

            updateVolume(vol){
                this.audio.volume = vol/100
            }

            seekTo(progress){
                this.audio.currentTime = progress/100

            }

            render(){
                this.shadowRoot.innerHTML = `
                <style>
                    :host{
                        width: 100%;
                        height: max-content;
                        max-width: 300px;
                        background-color: transparent;
                        display: flex;
                        flex-wrap:wrap;
                        margin:0;
                    }
                    audio-player{
                    width: 100%
                    margin:0;
                    }
                    button{
                    background-color: rgb(84, 84, 84);
                    color: rgb(223, 223, 223);
                    font-family: Poppins;
                    border-radius: 5px;
                    border: none;
                    }
                    input{
                    appearance: none;
                    background-color: black;
                    border-radius: 10px;
                    height: 7px;
                    overflow: hidden;
                    }
                    input::-webkit-slider-thumb{
                    appearance: none;
                    height: 20px;
                    width: 0;
                    box-shadow: -300px 0 0 300px rgb(197, 197, 197);
                    border-radius: 10px;
                    }
                </style>
                <audio class="audio" src=""></audio>
                <button class="playbtn">Play</button>
                <div class="progress">
                <span class="current-time">00:00</span>
                <input type="range" max="100" class="progress-bar" steps="1"></input>
                <span class="duration">0:00</span>
                </div>
                <input type="range" class="volume" max="100" value="100">Volume</input>
                <button class="loopbtn">Loop</button>
                `
            this.audio = this.shadowRoot.querySelector(".audio")
            this.playPauseBtn = this.shadowRoot.querySelector(".playbtn")
            this.progress = this.shadowRoot.querySelector(".progress")
            this.currentTimeBar = this.progress.querySelector(".current-time")
            this.progressBar = this.progress.querySelector(".progress-bar")
            this.durationBar = this.progress.querySelector(".duration")
            this.volumeBar = this.shadowRoot.querySelector(".volume")
            this.loopBtn = this.shadowRoot.querySelector(".loopbtn")
            }
        }
    customElements.define("audio-player", AudioPlayer)
}

// getting the required DOM elements
const main = document.querySelector(".chapters")
const content = document.querySelector(".content")
const menu = document.getElementById("menu")
const overlay = document.querySelector(".overlay")
var menuimg = document.getElementById("menuimg")
main.className = "inactive"
overlay.className = "inactive"
content.className = "inactive"
var reciterNum = 1
getNames()
async function getNames() {
try{
    // for loop that generates elements for each surah name from the API
    for(var i = 1; i <= 114; i++){ 
    let surah = document.createElement("div")
    var sep = document.createElement("div")
    var item = document.createElement("btn")
    var response = await fetch(`https://quranapi.pages.dev/api/${i}.json`)
    if(!response.ok){
        item.textContent = "Failed to fetch data"
        surah.id = "Failed to fetch"
        item.id = "N/A"
        main.appendChild(surah)
        surah.appendChild(item)
        throw new Error("Failed to fetch data")
    }
    else{
    var data = await response.json()
    item.href = "/home/index.html"
    item.className = "surahname"
    item.id = `${i}`
    item.onclick =  async function(){ 
        // Mouse event that generates the surah itself
        newId = String(this.id)
        main.className = "inactive"
        overlay.className = "inactive"
        menuimg.src = "menu.png"
        var response2 = await fetch(`https://quranapi.pages.dev/api/${newId}.json`)
        if(!response2.ok){
            throw new Error("Unable to fetch content")
        }
        var data2 =  await response2.json()
        content.className = "content"
        content.innerHTML = ""
        // for loop that generates each verse from the API
       for(var i2 = 0; i2 < data2.arabic1.length; i2++){
        // creating the required elements
        var verse = document.createElement("div")
        var vArabic = document.createElement("h3")
        var vEnglish = document.createElement("h3")
        var vNum = document.createElement("h3")
        var vAudio = document.createElement("audio-player")
        vAudio.shadowRoot.querySelector("audio").src = (await fetch(`https://quranaudio.pages.dev/${reciterNum}/${newId}_${i2+1}.mp3`)).url
        var separator = document.createElement("div")
        var section1 = document.createElement("div")
        verse.className = "verse"
        vArabic.textContent = data2.arabic1[i2]
        vArabic.className = "ayah arabic"
        vArabic.id = `${newId}:${i2+1}`
        vEnglish.textContent = data2.english[i2]
        vEnglish.className = "ayah english"
        vEnglish.id = `${newId}:${i2+1}`
        vNum.textContent = `${newId}:${i2+1}`
        vNum.className = "ayah number"
        separator.role = "separator"
        separator.className = "separator"
        section1.className = "section1"
        // adding said elements
        content.appendChild(verse)
        verse.appendChild(section1)
        content.appendChild(separator)
        section1.appendChild(vNum)
        section1.appendChild(vAudio)
        verse.appendChild(vArabic)
        verse.appendChild(vEnglish)
        vAudio.className = "ayah audio"
       }
    }
    surah.className = "surah"
    surah.id = `Surah ${i}`
    item.textContent = `Surah ${data.surahNo}: ${data.surahNameArabicLong} ${data.surahName} (${data.surahNameTranslation})`
    sep.role = "separator"
    sep.className = "separator2"
    main.appendChild(surah)
    surah.appendChild(item)
    surah.appendChild(sep)
    }
    }
}
catch{
}
}

menu.onclick = function(){ // Mouse event that toggles the side bar and the overlay
    var chapters = document.getElementById("chapters")
    if(!chapters.className.includes("inactive")){
        chapters.className = "inactive"
        overlay.className = "inactive"
        menuimg.src = "menu.png"
    }
    else{
        chapters.className = "chapters"
        overlay.className = "overlay"
        menuimg.src = "close.png"
    }
}

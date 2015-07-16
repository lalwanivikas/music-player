/**
 * This is the controller file for the dashboard. It reads data from the data.js
 * file and prepares the chart objects.
 *
 * More documentation on this can be found at
 * http://docs.fusioncharts.com/FusionCharts.html
 */

var myAudioPlayer;
FusionCharts.ready(function() {
    var i, onBulb, offBulb,
        bulbData = {},
        FLOOR = Math.floor,
        RANDOM = Math.random,
        //Initialize with the data from the object musicPlayerData in data.js file
        equalizerChart = musicPlayerData.equalizer;
    //If the browser doesnt support audio context, feed random data to the equalizer every 250ms. 
    try {
        if (context == null) {
            throw "Context is null";
        }
    } catch (e) {
        if (console && console.log) {
            console.log("Your browser doesn't support HTML5 Audio API. Please update your browser. ", e);
        }
        //Change the details that is being dsiplayed to  the user.
        document.getElementById("no-support-dashboard-detail").style.display = "block";

        //Feed random data [ between 0 -255 ] to equalizer every 250ms
        setInterval(function() {
            for (var i = 0; i < 8; i++) {
                try {
                    FusionCharts("equalizer-" + (i).toString()).feedData("&value=" + FLOOR(RANDOM() * 256));
                } catch (e) {
                    if (console && console.log) {
                        console.log(e);
                    }
                }
            }
        }, 250)
    }
    //Audio Player related functionality begins
    //Initialize the player only if the audiocontext is supported
    if (context) {
        var songs_elements = document.getElementsByClassName("song-link"),
            seekerWidth = document.getElementById("audio-seeker").offsetWidth,
            seekerTimer = document.getElementById("seeker-timer"),
            seekerRound = document.getElementById("seeker-round");
        //Create a new instance of Audio Player
        myAudioPlayer = new AudioPlayer();
        //Create a playlist
        myAudioPlayer.createPlaylist([{
            "filePath": "./music/a_tango.mp3",
            "songName": "A Tango"
        }, {
            "filePath": "./music/am_solo.mp3",
            "songName": "Am Solo"
        }, {
            "filePath": "./music/go_electronic.mp3",
            "songName": "Go Electronic"
        }, {
            "filePath": "./music/hlylmz.mp3",
            "songName": "Hlylmz"
        }, {
            "filePath": "./music/less.mp3",
            "songName": "Less"
        }, {
            "filePath": "./music/motion.mp3",
            "songName": "Motion"
        }]);

        //When the audio is begin loaded, show the loading message
        function showLoadingMessage(sender, args) {
            document.getElementById('chart-holder').style.visibility = "hidden";
            document.getElementById('loading').style.visibility = "visible";
            document.getElementById("player").style.pointerEvents = "none";
        }
        //Hide loading message when the audio is loaded
        function hideLoadingMessage(sender, args) {
            document.getElementById("player").style.pointerEvents = "";
            document.getElementById('chart-holder').style.visibility = "visible";
            document.getElementById('loading').style.visibility = "hidden";
        }
        //Configure the previous, next button as soon as the audio starts playing
        //Set the title of song playing
        function audioPlayingStart(sender, args) {
            var currentNextColor = "#ffffff",
                currentPrevColor = "#ffffff",
                playlistElement = document.getElementById("song-list"),
                currentSong = document.getElementById("current-song"),
                currentPaused = document.getElementById("current-song-pause"),
                playlistObj = sender.defaultPlaylist,
                songsCount = playlistObj.songsCount,
                currentAudio = playlistObj.currentAudio,
                playedAudio = playlistObj.playedAudio,
                playedAudioLength = playedAudio.length;

            if (playlistObj && playlistObj.length !== 0) {
                if (!sender.shuffle) {
                    if (currentAudio >= songsCount - 1)
                        currentNextColor = "#666666";
                    if (currentAudio == 0) {
                        currentPrevColor = "#666666";
                    }
                } else {
                    if (playedAudioLength == songsCount) {
                        currentNextColor = "#666666";
                    }
                    if (playedAudioLength == 1 || playedAudioLength == songsCount) {
                        currentPrevColor = "#666666"
                    }
                }
                if (currentSong)
                    currentSong.removeAttribute("id");
                if (currentPaused) {
                    currentPaused.removeAttribute("id");
                }
                playlistElement.children[currentAudio].setAttribute("id", "current-song");
                document.getElementById("next-bar").style.background = currentNextColor;
                document.getElementById("next-triangle").style.borderLeftColor = currentNextColor;

                document.getElementById("prev-bar").style.background = currentPrevColor;
                document.getElementById("previous-triangle").style.borderRightColor = currentPrevColor;
            }

            document.getElementById('current-song-title').innerHTML = playlistObj.songs[currentAudio].songName;
        }
        //Once all the songs are played, change the color of previous, next button
        function playlistCompleted(sender, args) {
            document.getElementById('play-triangle').style.display = "block";
            document.getElementById('pause-bar-container').style.display = "none";
            document.getElementById("next-bar").style.background = "";
            document.getElementById("next-triangle").style.borderLeftColor = "";

            document.getElementById("prev-bar").style.background = "";
            document.getElementById("previous-triangle").style.borderRightColor = "";
        }
        //Configure the seeker once the audio is played
        function audioPlayingCompleted(sender, args) {
            var currentSong = document.getElementById("current-song"),
                currentPaused = document.getElementById("current-song-pause"),
                defaultPlaylist = sender.defaultPlaylist;
            document.getElementById("seeker-timer").style.width = "0";
            document.getElementById("seeker-round").style.left = "0";
            if (defaultPlaylist && defaultPlaylist.length !== 0 && defaultPlaylist.songsCount > 1) {
                if (currentSong)
                    currentSong.removeAttribute("id");
                if (currentPaused)
                    currentPaused.removeAttribute("id");
            }
        }
        //Subscribe to the events
        myAudioPlayer.audioLoadingStartEvent.subscribe(showLoadingMessage);
        myAudioPlayer.audioLoadingCompletedEvent.subscribe(hideLoadingMessage);
        myAudioPlayer.audioPlayingStartEvent.subscribe(audioPlayingStart);
        myAudioPlayer.audioPlayingCompletedEvent.subscribe(audioPlayingCompleted);
        myAudioPlayer.playlistCompletedEvent.subscribe(playlistCompleted);


        //Play/Pause button toggle. Depending upon the current state of audio toggle between play and pause
        document.getElementById('play-pause-button').onclick = function() {
            var currentSong = document.getElementById("current-song"),
                currentPaused = document.getElementById("current-song-pause");
            if (myAudioPlayer.playing) {
                myAudioPlayer.pause();
                currentSong.removeAttribute("id");
                currentSong.setAttribute("id", "current-song-pause");
                document.getElementById('play-triangle').style.display = "block";
                document.getElementById('pause-bar-container').style.display = "none";
            } else {
                myAudioPlayer.play();
                document.getElementById('play-triangle').style.display = "none";
                document.getElementById('pause-bar-container').style.display = "block";
            }
        }
        //Change the volume on input. Change the icon depending upon the value
        document.getElementById('volume-control').oninput = function() {
            var volumeControl = this,
                value = volumeControl.value,
                volumeIcon = document.getElementById("volume-control-holder");
            myAudioPlayer.changeVolume(volumeControl.value);
            if (value > 75) {
                volumeIcon.style.backgroundPosition = "0 0";
                volumeIcon.style.width = "20px";
            } else if (value < 75 && value > 25) {
                volumeIcon.style.backgroundPosition = "-23px 0";
                volumeIcon.style.width = "16px";
            } else if (value < 25 && value > 0) {
                volumeIcon.style.backgroundPosition = "-43px 0";
                volumeIcon.style.width = "12px";
            } else {
                volumeIcon.style.backgroundPosition = "-59px 0";
                volumeIcon.style.width = "18px";
            }
        }
        //Play the previous audio, once the previous button is clicked.
        document.getElementById('previous-button').onclick = function() {
            if (myAudioPlayer.initialized) {
                if (!myAudioPlayer.shuffle) {
                    if (myAudioPlayer.defaultPlaylist.currentAudio > 0) {
                        myAudioPlayer.playPreviousAudio();
                    }
                } else if (myAudioPlayer.defaultPlaylist.playedAudio.length > 1 && myAudioPlayer.defaultPlaylist.playedAudio.length != myAudioPlayer.defaultPlaylist.songsCount) {
                    myAudioPlayer.playPreviousAudio();
                } else if (!myAudioPlayer.playing) {
                    document.getElementById('play-triangle').style.display = "block";
                    document.getElementById('pause-bar-container').style.display = "none";
                }
            }
        }
        //Play the next audio, once the next button is clicked.
        document.getElementById('next-button').onclick = function() {
            if (myAudioPlayer.initialized) {
                if (!myAudioPlayer.shuffle) {
                    if (myAudioPlayer.defaultPlaylist.currentAudio < myAudioPlayer.defaultPlaylist.songsCount - 1) {
                        myAudioPlayer.playNextAudio();
                    }
                } else if (myAudioPlayer.defaultPlaylist.playedAudio.length < myAudioPlayer.defaultPlaylist.songsCount) {
                    myAudioPlayer.playNextAudio();

                } else if (!myAudioPlayer.playing) {
                    document.getElementById('play-triangle').style.display = "block";
                    document.getElementById('pause-bar-container').style.display = "none";
                }
            }
        }
        //Hide or show the volume slider on clicking on the volume icon
        document.getElementById("volume-control-holder").onclick = function() {
            document.getElementById('volume-control').style.display = document.getElementById('volume-control').style.display == "block" ? "none" : "block";
        }
        //Play the audio from given time where the user clicks on the seeker
        document.getElementById('audio-seeker').onclick = function(e) {
            if (myAudioPlayer.playing) {
                if (e.offsetX == "undefined");
                e.offsetX = e.layerX;
                myAudioPlayer.playFromSeconds(((e.offsetX) / (this.offsetWidth)) * myAudioPlayer.totalDuration);
            }
        }
        //Update the seeker position once every 250 ms. This is done to improve the performance in mozilla
        setInterval(function() {
            if (myAudioPlayer.loaded && myAudioPlayer.playing) {
                time = ((myAudioPlayer.currentDuration / myAudioPlayer.totalDuration) * (seekerWidth));
                seekerTimer.style.width = (time).toString() + "px";
                seekerRound.style.left = (time).toString() + "px";
            }

        }, 300);
        //Play the selected song, once the user clicks the song from playlist
        var playSelectedSong = function() {
            var fileAttribute = this.getAttribute("data-file");
            if (myAudioPlayer.playing)
                myAudioPlayer.stop();
            if (!myAudioPlayer.initialized) {
                myAudioPlayer.initialized = true;
            }
            myAudioPlayer.defaultPlaylist.playedAudio = [];
            myAudioPlayer.loadAudio("./music/" + fileAttribute);
            myAudioPlayer.defaultPlaylist.currentAudio = myAudioPlayer.defaultPlaylist.songs.map(function(e) {
                return e.filePath;
            }).indexOf("./music/" + fileAttribute);
            myAudioPlayer.play();
            document.getElementById('play-triangle').style.display = "none";
            document.getElementById('pause-bar-container').style.display = "block";
        };
        //Add event listeners to the playlist songs
        for (var i = 0; i < songs_elements.length; i++) {
            songs_elements[i].addEventListener('click', playSelectedSong, false);
        }
    }
    //Audio Player related functionality ends

    //FusionCharts configuration begins
    //Configure the equalizer and bulb charts
    equalizerChart.containerBackgroundColor = "#272A2E";
    //Initialize 8 Vertical LED charts, which serves as equalizer in the music player
    for (i = 0; i < 8; i++) {
        equalizerChart.id = 'equalizer-' + i.toString();
        equalizerChart.renderAt = 'equalizer-container-' + i.toString();
        //If the browser supports Web Audio API and the music player is initalized, set the equalizer array in audio player and render it.
        //If the browser doesn't support Web Audio API, simply render the equalizer chart.
        if (context && myAudioPlayer) {
            myAudioPlayer.equalizerArray[i] = new FusionCharts(equalizerChart);
            FusionCharts.render(myAudioPlayer.equalizerArray[i]);
        } else {
            FusionCharts.render(equalizerChart);
        }
    }
    //Initialize 2 bulb charts, which serves as shuffle on and off in music player
    //Initialize the bulb with the data from the object musicPlayerData in data.js file
    bulbData = musicPlayerData.bulb;
    bulbData.id = 'shuffle-on-guage';
    bulbData.renderAt = 'shuffle-on';
    bulbData.containerBackgroundColor = "#222326";
    bulbData.dataSource.chart.gaugeBorderColor = "#ffffff";
    onBulb = new FusionCharts(bulbData);
    FusionCharts.render(onBulb);

    bulbData.id = 'shuffle-off-guage';
    bulbData.renderAt = 'shuffle-off';
    bulbData.dataSource.value = "1";
    bulbData.dataSource.chart.gaugeBorderColor = "#C8D758";
    offBulb = new FusionCharts(bulbData);
    FusionCharts.render(offBulb);

    //When a bulb is clicked, change the state of the bulb that is clicked and the other bulb. [ This simulates the on and off functionality ]
    var toggleShuffle = function(bulbId) {
        var otherBulb, currentBulb = bulbId;
        //Find out which bulb is clicked
        otherBulb = currentBulb === "shuffle-on-guage" ? "shuffle-off-guage" : "shuffle-on-guage";

        if (FusionCharts(currentBulb).getData() == "1") {
            FusionCharts(currentBulb).setChartAttribute("gaugeBorderColor", "#ffffff");
            FusionCharts(currentBulb).setData("0");
            FusionCharts(otherBulb).setChartAttribute("gaugeBorderColor", "#C8D758");
            FusionCharts(otherBulb).setData("1");

        } else if (FusionCharts(currentBulb).getData() == "0") {
            FusionCharts(currentBulb).setChartAttribute("gaugeBorderColor", "#C8D758");
            FusionCharts(currentBulb).setData("1");
            FusionCharts(otherBulb).setChartAttribute("gaugeBorderColor", "#ffffff");
            FusionCharts(otherBulb).setData("0");
        }
        //If the browser supports Web Audio API and the audio player in initalized, empty the contents of the list which hold the audio played so far and toggle the shuffle value in player.
        if (context && myAudioPlayer) {
            myAudioPlayer.defaultPlaylist.playedAudio = [];
            myAudioPlayer.shuffle = !myAudioPlayer.shuffle;
        }
    }

    //On clicking on the bulb charts, call the function toggleShuffle
    document.getElementById("shuffle-on-container").onclick = function() {
        toggleShuffle("shuffle-on-guage");
    }
    document.getElementById("shuffle-off-container").onclick = function() {
        toggleShuffle("shuffle-off-guage");
    }
    //FusionCharts configuration ends
});
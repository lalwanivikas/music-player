/*
 FusionCharts JavaScript Library
 Copyright FusionCharts Technologies LLP
 License Information at <http://www.fusioncharts.com/license>
 FusionCharts JavaScript Library
 Copyright FusionCharts Technologies LLP
 License Information at <http://www.fusioncharts.com/license>
*/
var context;
//Custom event class used by audio player to raise custom events when the player is played or stopped
function CustomEvent(type, callback) {
    var eventObject = this;
    eventObject.type = type;
    if (!eventObject.type) {
        throw ('Must specify a CodeEvent type');
    }
    eventObject.fn = [];
    if (typeof(callback) == 'function') {
        eventObject.fn[0] = callback;
    }

}
//Function used to raise an event. This will call the functions that are registered using subscribe function
CustomEvent.prototype.raise = function(sender, args) {
    var i, fnArray = this.fn, fnLength = fnArray.length;
    for (i = 0; i < fnLength; i++) {
        fnArray[i](sender, args);
    }
};
//Function used to subscribe to an event. Input should be a function which needs to be called when an event occurs
CustomEvent.prototype.subscribe = function(fn) {
    this.fn[this.fn.length] = fn;
};
//Function to unsubscribe to an event.
CustomEvent.prototype.unsubscribe = function(fn) {
    var i, fnArray = this.fn, fnLength = fnArray.length;
    for (i = 0; i < fnLength; i++) {
        if (fnArray[i] == fn) {
            fnArray.splice(i, 1);
            break;
        }
    }
};
//Try to initialize the AudioContext of Web Audio API. Currently supported only in latest chrome, mozilla and safari browsers.
//To see the list of browsers that support Web Audio API, please visit http://caniuse.com/#feat=audio-api
try {
    context = window.AudioContext ? new window.AudioContext() : new webkitAudioContext();
} catch (e) {
    if (console && console.log) {
        console.log("Your browser doesn't support HTML5 Audio API. Please update your browser. ", e);
    }
}
//Audio Player Class Starts
//AudioPlayer Constructor
//This function is used to create an audioplayer and initialize its properties
function AudioPlayer() {
    var audioPlayerObject = this;
    //Creating a Buffer Source where the audio will be buffered and played
    audioPlayerObject.source = context.createBufferSource();
    audioPlayerObject.source.loop = false;
    //Some browsers doesn't support createGain Method
    if (!context.createGain) {
        context.createGain = context.createGainNode;
    }
    //Create a gain node. Used to configure volume
    audioPlayerObject.gainNode = context.createGain();
    //Connect the source to gain node
    audioPlayerObject.source.connect(this.gainNode);
    //Connect the gain node to destination like speakers
    audioPlayerObject.gainNode.connect(context.destination);


    //Setting the default values.
    audioPlayerObject.initialized = false;
    //Current buffer - holds the current audio that is being played
    audioPlayerObject.currentBuffer = null;
    //Duration of the audio that is played so far
    audioPlayerObject.currentDuration = 0;
    //Total duration of the current audio being played
    audioPlayerObject.totalDuration = 0;
    //Starting time for the current audio being played
    audioPlayerObject.startTime = 0;
    audioPlayerObject.startOffset = 0;
    //Node values of the audio played. This array contains data that can be used to plot the graph
    audioPlayerObject.nodeValue = [];

    audioPlayerObject.maxVolume = 100;
    audioPlayerObject.defaultVolume = 100;
    audioPlayerObject.playing = false;
    audioPlayerObject.loaded = false;
    audioPlayerObject.shuffle = false;

    //Configure default playlist properties
    audioPlayerObject.defaultPlaylist = {};
    audioPlayerObject.defaultPlaylist.songsCount = 0;
    audioPlayerObject.defaultPlaylist.songs = [];
    audioPlayerObject.defaultPlaylist.previousAudio = -1;
    audioPlayerObject.defaultPlaylist.currentAudio = -1;
    audioPlayerObject.defaultPlaylist.playedAudio = [];

    //The array where equalizer objects will be stored
    audioPlayerObject.equalizerArray = [];

    //Custom events for the music player
    audioPlayerObject.audioLoadingStartEvent = new CustomEvent('audioLoadingStart');
    audioPlayerObject.audioLoadingCompletedEvent = new CustomEvent('audioLoadingCompleted');
    audioPlayerObject.audioPlayingStartEvent = new CustomEvent('audioPlayingStart');
    audioPlayerObject.audioPlayingCompletedEvent = new CustomEvent('audioPlayingCompleted');
    audioPlayerObject.playlistCompletedEvent = new CustomEvent('playlistCompleted');
    audioPlayerObject.playerStoppedEvent = new CustomEvent('playerStopped');
}
//This function is used to plot the data from audio into Fusion Chart's LED guage
//The audio data will be decoded into digital data [ within vale 0-255 ] and split into 16 buckets. Each equalizer is fed with the data from alternate buckets.
AudioPlayer.prototype.drawGraph = function(array) {
    var i, length = array.length,
        audioPlayerObject = this;
    for (i = 0; i < length; i += 2) {
        audioPlayerObject.equalizerArray[i / 2].feedData("&value=" + array[i / 2]);
    }
}
//This function loads the audio from given URL and stores the audio in a buffer that can be decoded later to play
AudioPlayer.prototype.loadAudio = function(url) {
    var request = new XMLHttpRequest(),
        audioPlayerObject = this;
    //Raise the loading event first
    audioPlayerObject.audioLoadingStartEvent.raise(audioPlayerObject, 'Loading Audio');
    audioPlayerObject.loaded = false;
    //Open an AJAX request to fetch the audio from the given url
    request.open('GET', url, true);
    //Since we are fetching audio data, set the response type as arraybuffer
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            audioPlayerObject.totalDuration = buffer.duration;
            audioPlayerObject.currentBuffer = buffer;
            audioPlayerObject.startTime = 0;
            audioPlayerObject.currentDuration = 0;
            audioPlayerObject.startOffset = 0;
            audioPlayerObject.loaded = true;
            audioPlayerObject.audioLoadingCompletedEvent.raise(audioPlayerObject, 'Audio Loaded Succesfully');
        }, function() {
            if(console && console.log)
                console.log("Error loading audio file.", url);
        });
    }
    request.send();
}

//This function plays the buffered audio that is being passed.
//If offset is passed, it will play the bufferedAudio from the offset
AudioPlayer.prototype.playBuffer = function(bufferedAudio, offset) {
    var array, audioPlayerObject = this;
    if (audioPlayerObject.loaded) {
        //Set playing value as true
        audioPlayerObject.playing = true;
        //Create a buffer source every time when a new audio is played
        audioPlayerObject.source = context.createBufferSource();
        //Connect the source to gain node
        audioPlayerObject.source.connect(this.gainNode);
        //Set the start time for the current audio
        audioPlayerObject.startTime = context.currentTime;
        //Set the buffer of source from the input parameter
        audioPlayerObject.source.buffer = bufferedAudio;

        //Create a processor node that processes the buffered audio. Connect the processor to the destination
        audioPlayerObject.javascriptNode = context.createScriptProcessor(1024, 1, 1);
        audioPlayerObject.javascriptNode.connect(context.destination);

        //Create an analyser and set default values to analyse audio samples
        audioPlayerObject.analyser = context.createAnalyser();
        audioPlayerObject.analyser.smoothingTimeConstant = 0.3;
        //fftSize of 32 will ensure that we get 16 buckets of digital data. 
        audioPlayerObject.analyser.fftSize = 32;
        //Connect the source to analyser. And connect analyser to processornode;
        audioPlayerObject.source.connect(audioPlayerObject.analyser);
        audioPlayerObject.analyser.connect(audioPlayerObject.javascriptNode);
        //Setthe offset from which the audio needs to be played
        if (offset && offset !== 0) {
            audioPlayerObject.startOffset = offset;
            audioPlayerObject.currentDuration = offset;
        } else {
            audioPlayerObject.currentDuration = 0;
        }
        //If there is a playlist, add the current audio to the playedlist.
        if (audioPlayerObject.defaultPlaylist && audioPlayerObject.defaultPlaylist.length !== 0) {
            if (audioPlayerObject.defaultPlaylist.playedAudio.indexOf(audioPlayerObject.defaultPlaylist.currentAudio) === -1)
                audioPlayerObject.defaultPlaylist.playedAudio.push(audioPlayerObject.defaultPlaylist.currentAudio);
        }
        //Raise the audioplayingstart event.
        audioPlayerObject.audioPlayingStartEvent.raise(audioPlayerObject, "Audio Playing");
        //This function is called automatically as soon as the audio starts playing
        audioPlayerObject.javascriptNode.onaudioprocess = function(audioProcessingEvent) {
            if (audioPlayerObject.playing) {
                //Getting the frequency strength in an Uint8Array [ where the values will be between 0 - 255 ]
                array = new Uint8Array(audioPlayerObject.analyser.frequencyBinCount);
                audioPlayerObject.analyser.getByteFrequencyData(array);
                if (audioPlayerObject.currentDuration < audioPlayerObject.totalDuration)
                    audioPlayerObject.currentDuration += audioProcessingEvent.outputBuffer.duration;
                if (audioPlayerObject.currentDuration <= audioPlayerObject.totalDuration) {
                    //Call the draw graph function
                    audioPlayerObject.drawGraph(array);
                } else {
                    //If the audio is played to its full duration, set the properties of the player and raise audioPlayingCompleted event
                    audioPlayerObject.playing = false;
                    audioPlayerObject.javascriptNode.disconnect(context.destination);
                    audioPlayerObject.analyser.disconnect(audioPlayerObject.javascriptNode);
                    audioPlayerObject.source.disconnect(audioPlayerObject.analyser);

                    audioPlayerObject.drawGraph([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                    audioPlayerObject.startTime = 0;
                    audioPlayerObject.currentDuration = 0;
                    audioPlayerObject.totalDuration = 0;
                    audioPlayerObject.startOffset = 0;
                    audioPlayerObject.loaded = false;

                    audioPlayerObject.audioPlayingCompletedEvent.raise(audioPlayerObject, "Audio Played");
                    //If there is a playlist, start playing the next audio. Raise playlistCompletedEvent if all audio are played
                    if (audioPlayerObject.defaultPlaylist && audioPlayerObject.defaultPlaylist.length !== 0 && audioPlayerObject.defaultPlaylist.songsCount > 1) {
                        if (!audioPlayerObject.shuffle) {
                            if (audioPlayerObject.defaultPlaylist.currentAudio < audioPlayerObject.defaultPlaylist.songsCount - 1) {
                                audioPlayerObject.loadAudio(audioPlayerObject.defaultPlaylist.songs[audioPlayerObject.defaultPlaylist.currentAudio + 1].filePath);
                                audioPlayerObject.defaultPlaylist.previousAudio = audioPlayerObject.defaultPlaylist.currentAudio;
                                audioPlayerObject.defaultPlaylist.currentAudio = audioPlayerObject.defaultPlaylist.currentAudio + 1;
                                audioPlayerObject.play();
                            } else {
                                audioPlayerObject.defaultPlaylist.playedAudio = [];
                                audioPlayerObject.defaultPlaylist.previousAudio = -1;
                                audioPlayerObject.defaultPlaylist.currentAudio = -1;
                                audioPlayerObject.initialized = false;
                                audioPlayerObject.playlistCompletedEvent.raise(audioPlayerObject, "Playlist Completed");
                            }
                        } else {
                            if (audioPlayerObject.defaultPlaylist.playedAudio.length < audioPlayerObject.defaultPlaylist.songsCount) {
                                var nextIndex = Math.floor(Math.random() * (audioPlayerObject.defaultPlaylist.songsCount));

                                while (audioPlayerObject.defaultPlaylist.playedAudio.indexOf(nextIndex) != -1) {
                                    nextIndex = Math.floor(Math.random() * (audioPlayerObject.defaultPlaylist.songsCount));
                                }
                                audioPlayerObject.defaultPlaylist.previousAudio = audioPlayerObject.defaultPlaylist.currentAudio;
                                audioPlayerObject.defaultPlaylist.currentAudio = nextIndex;
                                audioPlayerObject.loadAudio(audioPlayerObject.defaultPlaylist.songs[audioPlayerObject.defaultPlaylist.currentAudio].filePath);
                                audioPlayerObject.play();
                            } else {
                                audioPlayerObject.defaultPlaylist.playedAudio = [];
                                audioPlayerObject.defaultPlaylist.previousAudio = -1;
                                audioPlayerObject.defaultPlaylist.currentAudio = -1;
                                audioPlayerObject.initialized = false;
                                audioPlayerObject.playlistCompletedEvent.raise(audioPlayerObject, "Playlist Completed");
                            }
                        }
                    }
                }
            }
        }
        //For browsers that dont support the start method
        if (!audioPlayerObject.source.start)
            audioPlayerObject.source.start = audioPlayerObject.source.noteOn;
        //This function is called as soon as the audio ends
        audioPlayerObject.source.onended = function() {
            this.playing = false;
        }

        //Start playing the audio from the offset. This line plays the current audio in buffer

        audioPlayerObject.source.start(0, audioPlayerObject.startOffset);
    }

}
//This function plays the latest audio that is being loaded.
AudioPlayer.prototype.play = function() {
    var audioPlayerObject = this;
    (function myLoop() {
        if (!audioPlayerObject.initialized) {
            audioPlayerObject.initialized = true;
            audioPlayerObject.defaultPlaylist.currentAudio = 0;
            audioPlayerObject.loadAudio(audioPlayerObject.defaultPlaylist.songs[audioPlayerObject.defaultPlaylist.currentAudio].filePath);
        }
        //Wait till the audio gets loaded. Check for every 250ms if the audio is loaded.
        var timer = setTimeout(function() {
            if (!audioPlayerObject.loaded) myLoop();
            else {
                clearTimeout(timer);
                audioPlayerObject.playBuffer(audioPlayerObject.currentBuffer, audioPlayerObject.startOffset);
            }
        }, 250);
    })();
}
//This function plays the current audio from a specified timeframe
AudioPlayer.prototype.playFromSeconds = function(seconds) {
    var audioPlayerObject = this;
    (function myLoop() {
        var timer = setTimeout(function() {
            if (!audioPlayerObject.loaded) myLoop();
            else {
                clearTimeout(timer);
                if (seconds < audioPlayerObject.totalDuration) {
                    if (audioPlayerObject.playing) {
                        audioPlayerObject.source.stop(0);
                        audioPlayerObject.javascriptNode.disconnect(context.destination);
                        audioPlayerObject.javascriptNode = null;
                        audioPlayerObject.playBuffer(audioPlayerObject.currentBuffer, seconds);
                    } else {
                        audioObjaudioPlayerObjectect.startOffset = seconds;
                        audioPlayerObject.currentDuration = seconds;
                    }
                }
            }
        }, 250);
    })();


}
//Pause the current audio
AudioPlayer.prototype.pause = function() {
    var audioPlayerObject = this;
    audioPlayerObject.playing = false;
    //For browsers that dont support stop method
    if (!audioPlayerObject.source.stop)
        audioPlayerObject.source.stop = audioPlayerObject.source.noteOff;
    //Stop the audio
    audioPlayerObject.source.stop(0);
    //Store the position upto which the audio has been played
    audioPlayerObject.startOffset += context.currentTime - audioPlayerObject.startTime;
    audioPlayerObject.nodeValue = [];
    //Disconnect the connection with speakers
    audioPlayerObject.javascriptNode.disconnect(context.destination);
    audioPlayerObject.analyser.disconnect(audioPlayerObject.javascriptNode);
    audioPlayerObject.source.disconnect(audioPlayerObject.analyser);
};
//This is equivalent to the stop function in any audio player
AudioPlayer.prototype.stop = function() {
    var audioPlayerObject = this;
    audioPlayerObject.playing = false;
    if (!audioPlayerObject.source.stop)
        audioPlayerObject.source.stop = audioPlayerObject.source.noteOff;
    audioPlayerObject.source.stop(0);
    audioPlayerObject.currentBuffer = null;
    audioPlayerObject.startOffset = 0;
    audioPlayerObject.startTime = 0;
    audioPlayerObject.totalDuration = 0;
    audioPlayerObject.nodeValue = [];
    audioPlayerObject.initialized = false;
    audioPlayerObject.javascriptNode.disconnect();
    audioPlayerObject.playerStoppedEvent.raise(audioPlayerObject, "Player Stopped");
}
//Plays the preveious audio
AudioPlayer.prototype.playPreviousAudio = function() {
    var endPlaylist = false,
        audioPlayerObject = this;
    if (audioPlayerObject.initialized && audioPlayerObject.defaultPlaylist && audioPlayerObject.defaultPlaylist.songsCount > 1) {
        if (audioPlayerObject.playing) {
            audioPlayerObject.stop();
        }
        audioPlayerObject.initialized = true;
        audioPlayerObject.defaultPlaylist.previousAudio = audioPlayerObject.defaultPlaylist.currentAudio;
        if (!audioPlayerObject.shuffle) {
            if (audioPlayerObject.defaultPlaylist.currentAudio > 0) {

                audioPlayerObject.defaultPlaylist.currentAudio -= 1;

            } else {
                endPlaylist = true;
                audioPlayerObject.defaultPlaylist.playedAudio = [];
                audioPlayerObject.defaultPlaylist.currentAudio = audioPlayerObject.defaultPlaylist.previousAudio = -1;
                audioPlayerObject.currentBuffer = null;
                audioPlayerObject.loaded = false;
                audioPlayerObject.initialized = false;
            }
        } else {
            if (audioPlayerObject.defaultPlaylist.playedAudio.length < audioPlayerObject.defaultPlaylist.songsCount) {
                var nextIndex = Math.floor(Math.random() * (audioPlayerObject.defaultPlaylist.songsCount));

                while (audioPlayerObject.defaultPlaylist.playedAudio.indexOf(nextIndex) != -1) {
                    nextIndex = Math.floor(Math.random() * (audioPlayerObject.defaultPlaylist.songsCount));
                }
                audioPlayerObject.defaultPlaylist.currentAudio = nextIndex;
            } else {
                endPlaylist = true;
                audioPlayerObject.defaultPlaylist.playedAudio = [];
                audioPlayerObject.defaultPlaylist.currentAudio = audioPlayerObject.defaultPlaylist.previousAudio = -1;
                audioPlayerObject.currentBuffer = null;
                audioPlayerObject.loaded = false;
                audioPlayerObject.initialized = false;
            }
        }
        if (!endPlaylist) {
            audioPlayerObject.loadAudio(audioPlayerObject.defaultPlaylist.songs[audioPlayerObject.defaultPlaylist.currentAudio].filePath);
            audioPlayerObject.play();
        }
    }
}
//Plays the next audio
AudioPlayer.prototype.playNextAudio = function() {
    var endPlaylist = false,
        audioPlayerObject = this;
    if (audioPlayerObject.initialized && audioPlayerObject.defaultPlaylist && audioPlayerObject.defaultPlaylist.songsCount > 1) {
        if (audioPlayerObject.playing) {
            audioPlayerObject.stop();
        }
        audioPlayerObject.initialized = true;
        audioPlayerObject.defaultPlaylist.previousAudio = audioPlayerObject.defaultPlaylist.currentAudio;
        if (!audioPlayerObject.shuffle) {
            if (audioPlayerObject.defaultPlaylist.currentAudio < audioPlayerObject.defaultPlaylist.songsCount - 1) {
                audioPlayerObject.defaultPlaylist.currentAudio += 1;

            } else {
                endPlaylist = true;
                audioPlayerObject.defaultPlaylist.playedAudio = [];
                audioPlayerObject.defaultPlaylist.currentAudio = audioPlayerObject.defaultPlaylist.previousAudio = -1;
                audioPlayerObject.currentBuffer = null;
                audioPlayerObject.loaded = false;
                audioPlayerObject.initialized = false;
            }
        } else {
            if (audioPlayerObject.defaultPlaylist.playedAudio.length < audioPlayerObject.defaultPlaylist.songsCount) {
                var nextIndex = Math.floor(Math.random() * (audioPlayerObject.defaultPlaylist.songsCount));
                while (audioPlayerObject.defaultPlaylist.playedAudio.indexOf(nextIndex) != -1) {
                    nextIndex = Math.floor(Math.random() * (audioPlayerObject.defaultPlaylist.songsCount));
                }
                audioPlayerObject.defaultPlaylist.currentAudio = nextIndex;
            } else {
                endPlaylist = true;
                audioPlayerObject.defaultPlaylist.playedAudio = [];
                audioPlayerObject.defaultPlaylist.currentAudio = audioPlayerObject.defaultPlaylist.previousAudio = -1;
                audioPlayerObject.currentBuffer = null;
                audioPlayerObject.loaded = false;
                audioPlayerObject.initialized = false;
            }
        }
        if (!endPlaylist) {
            audioPlayerObject.loadAudio(this.defaultPlaylist.songs[audioPlayerObject.defaultPlaylist.currentAudio].filePath);
            audioPlayerObject.play();
        }
    }
}
//Change the volume of audio that is currently being played
AudioPlayer.prototype.changeVolume = function(value) {
    var audioPlayerObject = this,
        fraction = parseInt(value) / parseInt(audioPlayerObject.maxVolume);
    // Let's use an x*x curve (x-squared) since simple linear (x) does not sound as good.
    audioPlayerObject.gainNode.gain.value = fraction * fraction;
}
//Function to create playlist event
AudioPlayer.prototype.createPlaylist = function(audioFilePathArray) {
    var i, audioPlayerObject = this,
        songsArray = audioPlayerObject.defaultPlaylist.songs;
        fileArrayLength = audioFilePathArray.length;
    if (audioFilePathArray && fileArrayLength > 0) {
        audioPlayerObject.defaultPlaylist.songsCount = fileArrayLength;
        for (i = 0; i < fileArrayLength; i++) {
            songsArray[i] = audioFilePathArray[i];
        }
    }
}
//Audio Player Class Ends
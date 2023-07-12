myAudio = new Audio('shuffle.mp3'); 
if (typeof myAudio.loop == 'boolean') {myAudio.loop = true;}
else
{
    myAudio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
myAudio.volume = 0.13;
myAudio.play();
var isPlaying = true;

function togglePlay() {
  isPlaying ? myAudio.pause() : myAudio.play();
};
myAudio.onplaying = function() {
  isPlaying = true;
  document.getElementById("shufflee").src = "play_shuffle.svg";
};
myAudio.onpause = function() {
  isPlaying = false;
  document.getElementById("shufflee").src = "pause_shuffle.svg";
};
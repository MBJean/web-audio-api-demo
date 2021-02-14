const musicBoxModule = ({
  frequencyDefault,
  frequencyMax,
  speedDefault,
  speedMax,
  visualizerBeat,
  visualizerPitch,
  visualizerPlay,
  volumeDefault
}) => {

  const state = {
    clearNextTimer: false,
    frequency: frequencyDefault,
    playing: false,
    speed: speedDefault,
  };

  let audioContext,
      oscillator,
      gainNode,
      pulser;

  const pulseOn = () => {
    const frequencyInSixParts = Math.ceil(state.frequency / frequencyMax * 6);
    gainNode.gain.value = 0.1;
    visualizerPitch(frequencyInSixParts, state.speed);
  };

  const pulseOff = () => {
    gainNode.gain.value = 0;
    visualizerPitch(0);
  };

  const intervalCallback = () => {

    const quarter = state.speed / 6,
          eighth = quarter / 2,
          sixteenth = quarter / 4,
          bar1 = 0,
          bar2 = quarter * 3,
          breath = 100;

    setTimeout(pulseOn, bar1);
    setTimeout(pulseOff, eighth - breath);

    setTimeout(pulseOn, eighth);
    setTimeout(pulseOff, quarter - breath);

    setTimeout(pulseOn, eighth * 2);
    setTimeout(pulseOff, quarter * 3 - breath);

    setTimeout(pulseOn, bar2);
    setTimeout(pulseOff,  bar2 + eighth - breath);

    setTimeout(pulseOn, bar2 + eighth);
    setTimeout(pulseOff, bar2 + eighth + quarter * 2 - breath);

    setTimeout(pulseOn, bar2 + eighth + quarter * 2);
    setTimeout(pulseOff, bar2 + quarter * 3 - breath);

    setTimeout(() => visualizerBeat(1), 0);
    setTimeout(() => visualizerBeat(2), quarter);
    setTimeout(() => visualizerBeat(3), quarter * 2);
    setTimeout(() => visualizerBeat(4), quarter * 3);
    setTimeout(() => visualizerBeat(5), quarter * 4);
    setTimeout(() => visualizerBeat(6), quarter * 5);

    if (state.clearNextTimer) {
      state.clearNextTimer = false;
      resetPattern();
    }
  };

  const resetPattern = () => {
    clearInterval(pulser);
    intervalCallback();
    pulser = setInterval(intervalCallback, state.speed);
  };

  const togglePlaying = () => {
    if (!audioContext) {
       audioContext = new AudioContext;
    }

    state.playing = !state.playing;

    if (state.playing) {
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();
      oscillator.type = 'square';
      oscillator.connect(gainNode).connect(audioContext.destination);
      oscillator.frequency.value = state.frequency;
      gainNode.gain.value = volumeDefault;
      resetPattern();
      oscillator.start();
    } else {
      oscillator.stop();
      clearInterval(pulser);
      let id = window.setTimeout(function() {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
    }

    visualizerPlay(state.playing);
  };

  const setPitch = (newFrequency) => {
    state.frequency = newFrequency;
    if (oscillator) {
      oscillator.frequency.value = newFrequency;
    }
  };

  const setSpeed = (newValue) => {
    state.speed = speedMax - newValue <= 250 ? 250 : speedMax - newValue;
    state.clearNextTimer = true;
  };

  return {
    setPitch,
    setSpeed,
    togglePlaying,
  };
};

const init = () => {

  const beats = document.querySelector('[data-visualization="beats"]'),
        buttonTogglePlaying = document.querySelector('[data-action="play"]'),
        htmlEntityPlay = buttonTogglePlaying.innerHTML,
        htmlEntityPause = 'Pause &#10074;&#10074;',
        pitchBar = document.querySelector('[data-visualization="pitch"]'),
        pitchControl = document.querySelector('[data-action="volume"]'),
        frequencyDefault = pitchControl.value,
        frequencyMax = pitchControl.max,
        speedControl = document.querySelector('[data-action="speed"]'),
        speedMax = speedControl.max,
        speedDefault = speedMax - speedControl.value,
        volumeDefault = 0.1;

  const visualizerBeat = (beat) => {
    for (let i = 0; i < beats.children.length; i++) {
      beat === i + 1 ?
        beats.children[i].classList.add('beat--active'):
        beats.children[i].classList.remove('beat--active');
    }
  };

  const visualizerPlay = (playing) => {
    buttonTogglePlaying.innerHTML = playing ?
      htmlEntityPause:
      htmlEntityPlay;
  };

  const visualizerPitch = (pitch, speed) => {
    for (let i = 0; i < pitchBar.children.length; i++) {
      pitchBar.children[i].classList.remove('pitch--active');
    }

    for (let i = 0; i < pitchBar.children.length; i++) {
      if (i + 1 <= pitch) {
        setTimeout(
          () => { pitchBar.children[i].classList.add('pitch--active') },
          0 + i * 15
        );
      }
    }
  };

  const musicBox = musicBoxModule({
    frequencyDefault,
    frequencyMax,
    speedDefault,
    speedMax,
    visualizerBeat,
    visualizerPitch,
    visualizerPlay,
    volumeDefault,
  });

  buttonTogglePlaying.addEventListener('click', musicBox.togglePlaying);
  pitchControl.addEventListener('input', (e) => musicBox.setPitch(e.target.value));
  speedControl.addEventListener('input', (e) => musicBox.setSpeed(e.target.value));
};

window.addEventListener('DOMContentLoaded', init);

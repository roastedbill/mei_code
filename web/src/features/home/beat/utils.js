const BASE64_MARKER = ';base64,';

function getPeaks(data) {

  // What we're going to do here, is to divide up our audio into parts.

  // We will then identify, for each part, what the loudest sample is in that
  // part.

  // It's implied that that sample would represent the most likely 'beat'
  // within that part.

  // Each part is 0.5 seconds long - or 22,050 samples.

  // This will give us 60 'beats' - we will only take the loudest half of
  // those.

  // This will allow us to ignore breaks, and allow us to address tracks with
  // a BPM below 120.

  const partSize = 11025;
  const parts = data[0].length / partSize;
  let peaks = [];

  for (let i = 0; i < parts; i++) {
    let max = 0;
    for (let j = i * partSize; j < (i + 1) * partSize; j++) {
      const volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
      if (!max || (volume > max.volume)) {
        max = {
          volume: volume,
          timestamp: j / 44100,
        };
      }
    }

    if (max.volume >= 0.001) {
      peaks.push(max);
    }
  }

  // We then sort the peaks according to volume...

  // peaks.sort(function(a, b) {
  //   return b.volume - a.volume;
  // });
  //
  // // ...take the loundest half of those...
  //
  // peaks = peaks.splice(0, peaks.length);
  //
  // // ...and re-sort it back based on position.
  //
  // peaks.sort(function(a, b) {
  //   return a.position - b.position;
  // });

  console.log('peaks', peaks);

  return peaks;
}

function _base64ToArrayBuffer(base64Data) {
  const base64Index = base64Data.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  const base64 = base64Data.substring(base64Index);

    const binary_string = window.atob(base64);
    let bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export const handleFileUpload = (event, onFinish) => {
  const file = event.currentTarget.files[0];

  const audio = document.createElement('AUDIO');
  audio.src = URL.createObjectURL(file);
  audio.addEventListener('loadedmetadata', () => {

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(encodedFile){
      const bufferArray = _base64ToArrayBuffer(reader.result);

      // Create offline context
      let OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      let offlineContext = new OfflineContext(2, Math.ceil(audio.duration) * 44100, 44100);

      offlineContext.decodeAudioData(bufferArray, function(buffer) {
        // Create buffer source
        let source = offlineContext.createBufferSource();
        source.buffer = buffer;

        // Beats, or kicks, generally occur around the 100 to 150 hz range.
        // Below this is often the bassline.  So let's focus just on that.

        // First a lowpass to remove most of the song.
        let lowpass = offlineContext.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 150;
        lowpass.Q.value = 1;

        // Run the output of the source through the low pass.
        source.connect(lowpass);

        // Now a highpass to remove the bassline.
        let highpass = offlineContext.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 100;
        highpass.Q.value = 1;

        // Run the output of the lowpass through the highpass.
        lowpass.connect(highpass);

        // Run the output of the highpass through our offline context.
        highpass.connect(offlineContext.destination);

        // Start the source, and render the output into the offline conext.
        source.start(0);
        offlineContext.startRendering();
      });

      offlineContext.oncomplete = function(e) {
        const buffer = e.renderedBuffer;
        const peaks = getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
        const timestamps = peaks.map(peak => peak.timestamp);
        onFinish && onFinish(timestamps);
      };
    };
  });
}

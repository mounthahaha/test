<template>
      <!-- <test></test> -->
      <router-view />
</template>



<script setup lang='ts'>
import test from "@/views/test.vue"

interface IsoundFiles {
      name: string
      url: string
      buffer?: any
}

const soundFiles: Array<IsoundFiles> = [
      { name: 'withdrawal', url: 'play.mp3' },
]

const loadMp3Bytes = () => {
      const timeStamp = +new Date();
      const context = new AudioContext()
      console.log(context);
      
      soundFiles.forEach(file => {
            const request = new XMLHttpRequest();
            request.open('GET', `${file.url}?ts=${timeStamp}`, true);
            request.responseType = 'arraybuffer';
            request.onload = () => {
                  context.decodeAudioData(request.response, buffer => {
                        file.buffer = buffer;
                  });
            };
            request.send();
      });
}
loadMp3Bytes()

//withdrawal

const play = soundName => {
      const context = new AudioContext() 
      const bufferSource = context.createBufferSource();
      if(soundFiles.some((item)=>item.name === soundName)) {
            console.log(soundFiles.find((item)=>item.name === soundName).buffer);
        bufferSource.buffer = soundFiles.find((item)=>item.name === soundName).buffer;
        bufferSource.connect(context.destination);
      //   if (bufferSource.context.state !== 'running') {
      //     bufferSource.context.resume();
      //   }
        bufferSource.start();
        console.log(bufferSource.buffer);
      } else {
        throw new Error('找不到音效');
      }
    }

</script>


<style lang='scss' scoped>
</style>
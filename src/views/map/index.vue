<template>
  <div id="map-container"></div>
</template>

<script setup>
import {onMounted, ref} from "vue";

const mapObj = ref({
  map: undefined,
  tileLayer: undefined
})

function initMap() {
  mapObj.map = L.map('map-container', {
    zoom: 10,
    minZoom: 4,
    center: [30.621833394767293, 104.06472467339864],
    onWrap: true,
    attributionControl: false,
  }).setView([30.621833394767293, 104.06472467339864], 9)

  mapObj.map.pm.setLang('zh')
  mapObj.map.pm.addControls({
    position: 'topright',
    drawCircle: false,
  })

  mapObj.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapObj.map);
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
#map-container {
  width: 100vw;
  height: 100vh;
}
</style>

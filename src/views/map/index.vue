<template>
  <div id="map-container"></div>
</template>

<script setup>
import {onMounted} from "vue";

let map
function initMap() {
  map = L.map('map-container', {
    crs: L.CRS.EPSG3857,
    zoom: 10,
    center: [30.621833394767293, 104.06472467339864]
  }).setView([30.621833394767293, 104.06472467339864], 9)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  }).addTo(map);
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

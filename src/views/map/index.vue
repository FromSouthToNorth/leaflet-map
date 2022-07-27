<template>
  <div id="map-container">
  </div>
  <div @click="clearDraw" class="button-clear-draw" title="清除所以绘制">
    <a class="btn-clear-draw" href="#">
      <svg-icon icon-class="delete" color="#434343"/>
    </a>
  </div>
  <div class="map-info">
    <p v-if="mapObj.lng && mapObj.lat">{{ mapObj.lat }}, {{ mapObj.lng }}</p>
  </div>
  <div v-if="popup.visible" class="map-popup">
    <el-form ref="mapInfoRef" :model="form" label-width="60px" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="颜色" prop="color">
        <el-color-picker v-model="form.color"/>
      </el-form-item>
      <el-form-item label="菜单图标" prop="icon" v-if="mapObj.drawLayer.shape === 'Marker'">
        <el-popover
            placement="bottom-start"
            :width="540"
            v-model:visible="showChooseIcon"
            trigger="click"
            @show="showSelectIcon"
        >
          <template #reference>
            <el-input v-model="form.icon" laceholder="点击选择图标" @click="showSelectIcon" v-click-outside="hideSelectIcon"
                      readonl>
              <template #prefix>
                <svg-icon
                    v-if="form.icon"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px;width: 16px;"
                />
                <el-icon v-else style="height: 32px;width: 16px;">
                  <search/>
                </el-icon>
              </template>
            </el-input>
          </template>
          <icon-select ref="iconSelectRef" @selected="selected"/>
        </el-popover>
      </el-form-item>
      <el-form-item label="金纬度" prop="latlng" v-if="mapObj.drawLayer.shape === 'Marker'">
        <el-input-number
            :precision="15"
            style="margin-right: 6px; width: 200px"
            v-model="form.latlng[0]"
            :min="10"
            :max="600"
            size="small"
            controls-position="right"
            @change="handleChange"
        />
        <el-input-number
            :precision="15"
            style="width: 200px"
            v-model="form.latlng[1]"
            :min="10"
            :max="600"
            size="small"
            controls-position="right"
            @change="handleChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import {getCurrentInstance, onMounted, reactive, ref, toRefs} from 'vue'
import IconSelect from '@/components/IconSelect/index.vue'
import {ClickOutside as vClickOutside} from 'element-plus'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
})

const {proxy} = getCurrentInstance()

const iconSelectRef = ref(null)
const showChooseIcon = ref(false)

const popup = reactive({
  visible: false
})

const data = reactive({
  form: {},
  rules: {
    name: [{required: true, message: "名称不能为空", trigger: "blur"}],
    icon: [{required: true, message: "图标不能为空", trigger: "blur"}],
  },
})

const {form, rules} = toRefs(data)
const mapObj = reactive({
  map: undefined,
  lat: undefined,
  lng: undefined,
  tileLayer: undefined,
  drawLayer: undefined,
})

function initMap() {

  const layer = L.tileLayer('https://t{s}.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})

  const layer1_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layer1_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layerGroup1 = L.layerGroup([layer1_1, layer1_2, layer])

  const layer2_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layer2_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layerGroup2 = L.layerGroup([layer2_1, layer2_2, layer])


  const layer3_1 = L.tileLayer('https://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layer3_2 = L.tileLayer('https://t{s}.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=21cb7300e83d3e5640326c7ccf25226e', {subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']})
  const layerGroup3 = L.layerGroup([layer3_1, layer3_2, layer])

  const baseLayers = {
    '矢量': layerGroup1,
    '影像': layerGroup2,
    '地形': layerGroup3,
  }

  // mapObj.
  const map = L.map('map-container', {
    center: [30.621833394767293, 104.06472467339864],
    zoom: 10,
    maxZoom: 16,
    minZoom: 5,
    attributionControl: false,
    layers: [layerGroup1],
  })

  const layerControl = L.control.layers(baseLayers).addTo(map)

  map.on('click', (e) => {
    mapObj.lat = e.latlng.lat
    mapObj.lng = e.latlng.lng
  })

  map.pm.setLang('zh')
  map.pm.addControls({
    position: 'topleft',
  })

  map.addControl(L.control.scale({imperial: false}))

  map.on('pm:create', (e) => {
    onCancel()
    setDrawData(e)
    // 绘制后禁用绘制
    map.pm.disableDraw()
    popup.visible = true
  })

  mapObj.map = map
}

function setDrawData(e) {
  mapObj.drawLayer = e
  let {shape, layer} = e
  console.log("shape --> ", shape)
  form.value.shape = shape
  if (shape === 'Marker') {
    form.value.latlng = [layer._latlng.lat, layer._latlng.lng]
  } else {
    form.value.latlng = layer._latlngs
  }
  console.log("form.value --> ", form.value);
}

/** 清除所有绘制 */
function clearDraw() {
  mapObj.map.pm.getGeomanDrawLayers().forEach(e => {
    if (mapObj.map.hasLayer(e)) mapObj.map.removeLayer(e);
  })
}

const onSubmit = () => {
  proxy.$refs['mapInfoRef'].validate(valid => {
    if (valid) {
      if (form.value.shape === 'Marker') {
       const mIcon = L.icon({
         iconSize: [24, 24],
         iconUrl: getIconUrl(form.value.icon)
       })
        L.marker(form.value.latlng, {
          icon: mIcon
        }).addTo(mapObj.map).bindPopup(form.value.name)
      }
      onCancel()
    }
  })
}

function getIconUrl(icon) {
  return new URL(`../../assets/icons/svg/${icon}.svg`, import.meta.url).href
}

const onCancel = () => {
  if (mapObj.drawLayer
      && mapObj.map.hasLayer(mapObj.drawLayer.layer)) {
    mapObj.map.removeLayer(mapObj.drawLayer.layer)
    mapObj.drawLayer = undefined
  }
  reset()
}

/** 表单重置 */
function reset() {
  popup.visible = false
  form.value = {
    name: undefined,
    color: undefined,
    icon: undefined,
    latlng: [],
    shape: undefined,
  }
  proxy.resetForm('mapInfoRef')
}

/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset();
  showChooseIcon.value = true;
}

/** 选择图标 */
function selected(name) {
  form.value.icon = name;
  showChooseIcon.value = false;
}

/** 图标外层点击隐藏下拉列表 */
function hideSelectIcon() {
  showChooseIcon.value = false;
}

/** 改变经纬度 */
function handleChange() {

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

.map-info {
  z-index: 999;
  position: absolute;
  bottom: 6px;
  right: 6px;
  padding: 6px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 5px;
  color: #fff;
  font-size: 8px;
}

.button-clear-draw {
  z-index: 999;
  position: absolute;
  width: 30px;
  height: 30px;
  display: inline-block;
  left: 0;
  top: 464px;
  margin: 10px 0 0 10px;
  border-radius: 2px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  text-align: center;
  line-height: 30px;
  background: #fff;
}

.btn {
  display: inline-block;
  width: 100%;
  height: 100%;
}

.map-popup {
  width: 500px;
  z-index: 999;
  position: absolute;
  top: 80px;
  right: 20px;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  overflow: hidden;
  padding: 16px;
}
</style>

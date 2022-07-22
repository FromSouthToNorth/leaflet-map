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
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="颜色" prop="color">
        <el-color-picker v-model="form.color" />
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
            <el-input v-model="form.icon" laceholder="点击选择图标" @click="showSelectIcon" v-click-outside="hideSelectIcon" readonl>
              <template #prefix>
                <svg-icon
                    v-if="form.icon"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px;width: 16px;"
                />
                <el-icon v-else style="height: 32px;width: 16px;"><search /></el-icon>
              </template>
            </el-input>
          </template>
          <icon-select ref="iconSelectRef" @selected="selected" />
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
import IconSelect from '../../components/IconSelect/index.vue'
import {ClickOutside as vClickOutside} from 'element-plus'

const {proxy} = getCurrentInstance()

const iconSelectRef = ref(null)
const showChooseIcon = ref(false)

const popup = reactive({
  visible: false
})

// const form = reactive({
//   placeName: undefined,
//   color: undefined,
//   icon: undefined,
//   latlng: [],
// })

const data = reactive({
  form: {},
  rules: {
    name: [{required: true, message: "名称不能为空", trigger: "blur"}]
  },
})

const { form, rules } = toRefs(data)
const mapObj = reactive({
  map: undefined,
  lat: undefined,
  lng: undefined,
  tileLayer: undefined,
  drawLayer: undefined,
})

function initMap() {
  mapObj.map = L.map('map-container', {
    zoom: 10,
    minZoom: 4,
    center: [30.621833394767293, 104.06472467339864],
    onWrap: true,
    attributionControl: false,
  }).setView([30.621833394767293, 104.06472467339864], 9)

  mapObj.map.on('click', (e) => {
    mapObj.lat = e.latlng.lat
    mapObj.lng = e.latlng.lng
  })

  mapObj.map.pm.setLang('zh')
  mapObj.map.pm.addControls({
    position: 'topleft',
  })

  mapObj.map.addControl(L.control.scale({imperial: false}))

  // mapObj.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mapObj.map);

  var vecLayer = L.tileLayer("https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=21cb7300e83d3e5640326c7ccf25226e", { noWrap: true });
  //天地图矢量注记图层
  var cvaLayer = L.tileLayer("https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=21cb7300e83d3e5640326c7ccf25226e", { noWrap: true });
  //天地图影像图层
  var imgLayer = L.tileLayer("https://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=21cb7300e83d3e5640326c7ccf25226e", { noWrap: true });
  //天地图影像注记图层
  var ciaLayer = L.tileLayer("https://t0.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=21cb7300e83d3e5640326c7ccf25226e", { noWrap: true });
  //矢量图层组
  var vecLayerGroup = L.layerGroup([vecLayer, cvaLayer]);
  //影像图层组
  var imgLayerGroup = L.layerGroup([imgLayer, ciaLayer]);
  //设置图层组
  var baseLayers = {
    "天地图矢量": vecLayerGroup,
    "天地图影像": imgLayerGroup
  };
  //初始时加载矢量图层组
  mapObj.map.addLayer(vecLayerGroup);
  //添加图层组控件
  L.control.layers(baseLayers).addTo(mapObj.map);


  mapObj.map.on('pm:create', (e) => {
    onCancel()
    setDrawData(e)
    // 绘制后禁用绘制
    mapObj.map.pm.disableDraw()
    popup.visible = true
  });
}

function setDrawData(e) {
  mapObj.drawLayer = e
  let { shape, layer } = e
  console.log("shape --> ", shape)
  form.value.shape = shape
  if (shape === 'Marker') {
    form.value.latlng = [layer._latlng.lat, layer._latlng.lng]
  }
  else {
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
      console.log(form.value);
    }
  })
}

const onCancel = () => {
  if (mapObj.drawLayer
      && mapObj.map.hasLayer(mapObj.drawLayer.layer)) {
    mapObj.map.removeLayer(mapObj.drawLayer.layer)
    mapObj.drawLayer = undefined
  }
  popup.visible = false
  reset()
}

/** 表单重置 */
function reset() {
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

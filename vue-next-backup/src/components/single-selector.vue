<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps({
  options: {
    type: Array<Object>,
    default: []
  }
})
const emits = defineEmits(['change'])
const selectedIndex = ref(0)
const currentWidth = ref(0)
const currentLeft = ref(2)
const handleSelectNext = (index: number = 0) => {
  selectedIndex.value = index
  currentWidth.value = props.options[index].name.length * 16
  let charCount = 0
  for (let i = 0; i < index; i += 1) {
    charCount += props.options[i].name.length
  }
  currentLeft.value = 2 + charCount * 16 + index * 40
  // if (selectedIndex.value === index) return
  emits('change', props.options[index].key)
}
handleSelectNext()
</script>
<template>
  <div class="selector-container">
    <div
      :class="['selector-item', selectedIndex === index ? 'selector-item-active' : '']"
      v-for="item, index in props.options" :key="item.key"
      @click="handleSelectNext(index)">
      {{ item.name }}
    </div>
    <div class="is-selected-block" :style="{
      left: `${currentLeft}px`,
      width: `${currentWidth}px`
    }"></div>
  </div>
</template>
<style lang="less" scoped>
.selector-container {
  background: #333333;
  height: 50px;
  border-radius: 25px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 2px;
  cursor: pointer;
  .selector-item {
    height: 46px;
    line-height: 46px;
    padding: 0 20px;
    color: #FFFFFF;
    font-size: 16px;
  }
  .selector-item-active {
    color: #333333;
    z-index: 1;
  }
  .is-selected-block {
    background: #FFFFFF;
    height: 46px;
    padding: 0 20px;
    border-radius: 23px;
    position: absolute;
    transition: all, 300ms;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 0;
  }
}
</style>
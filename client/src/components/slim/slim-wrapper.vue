<template>
  <slim-cropper :options="slimOptions">
    <input type="file" name="slim" />
  </slim-cropper>
</template>

<script>
import Slim from './slim.vue'

// called when slim has initialized
function slimInit(data, slim) {
  // slim instance reference
  // console.log(slim)
  // current slim data object and slim reference
  // console.log(data)
}

// called when upload button is pressed or automatically if push is enabled
// function slimService (formdata, progress, success, failure, slim) {
//   // slim instance reference
//   // console.log(slim)

//   // form data to post to server
//   // set serviceFormat to "file" to receive an array of files
//   console.log(formdata)

//   // call these methods to handle upload state
//   // console.log(progress, success, failure)
// }

function didSave(data) {}

export default {
  name: 'slim-wrapper',
  components: {
    'slim-cropper': Slim,
  },
  props: {
    imageDidLoad: {
      type: Function,
      default: () => {},
    },
    label: {
      type: String,
      default: '点击或者拖动上传图片',
    },
  },
  data(props) {
    return {
      slimOptions: {
        ratio: '1:1',
        // service: slimService,
        didInit: slimInit,
        didSave: didSave,
        didLoad: this.didLoad,
        label: props.label,
      },
    }
  },
  methods: {
    didLoad(file, image, meta) {
      if (this.imageDidLoad) {
        this.imageDidLoad(file, image)
      }
      return true
    },
  },
}
</script>

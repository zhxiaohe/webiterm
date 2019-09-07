<template>
  <div >
    <div id="terminal-container"/>
    <el-button @click="onSubmit">Submit</el-button>
  </div>
</template>

<script>
import 'xterm/dist/xterm.css'
import 'xterm/dist/addons/fullscreen/fullscreen.css'
import { Terminal } from 'xterm'
import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'
import * as fit from 'xterm/lib/addons/fit/fit'

export default {
  data() {
    return {
      term: null,
      sshdata: '',
      wsurl: '',
      decoder: window.TextDecoder ? new window.TextDecoder('utf-8') : 'utf-8',
      style: {},
      screenWidth: document.body.clientWidth,
      innerHeight: document.body.clientHeight
    }
  },
  watch: {
    screenWidth(val) {
      if (!this.timer) {
        this.screenWidth = val
        this.timer = true
        const that = this
        setTimeout(() => {
          // that.screenWidth = that.$store.state.canvasWidth
          console.log(that.screenWidth, window.innerHeight)
          // that.init()
          that.timer = false
        }, 400)
      }
    },
    innerHeight(val) {
      if (!this.timer) {
        this.innerHeight = val
        this.timer = true
        const that = this
        setTimeout(() => {
          // that.screenWidth = that.$store.state.canvasWidth
          if (this.term) {
            var cols = parseInt(window.innerWidth / this.style.width, 10) - 1
            var rows = parseInt(that.innerHeight / this.style.height, 10)
            this.term.on_resize(cols, rows)
            this.term.resized = true
          // return {'cols': cols, 'rows': rows};
            // that.init()
          }
          that.timer = false
        }, 400)
      }
    }

  },
  mounted() {
    window.document.titlev = 'webssh'
    if (this.$route.query.wsurl) {
      this.wsurl = this.$route.query.wsurl
      this.onCancel()
    } else {
      this.$router.push({ 'path': '/404' })
    }
    Terminal.applyAddon(fullscreen)
    Terminal.applyAddon(fit)
    const that = this
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth
        window.screenHeight = document.body.clientHeight
        that.screenWidth = window.screenWidth
        that.innerHeight = window.innerHeight
      })()
    }
  },
  methods: {
    callback(text) {
      if (this.term) {
        this.term.write(text)
        if (!this.term.resized) {
          // 调整终端,先注释
          // this.resize_terminal(term)
          if (!this.style.width || !this.style.height) {
            try {
              this.style.width = this.term._core.renderer.dimensions.actualCellWidth
              this.style.height = this.term._core.renderer.dimensions.actualCellHeight
            } catch (TypeError) {
              // const text = document.getElementById('xterm-helpers style')
              const text = document.getElementsByClassName('xterm-helpers')
              var arr = text.split('xterm-normal-char{width:')
              this.style.width = parseFloat(arr[1])
              arr = text.split('div{height:')
              this.style.height = parseFloat(arr[1])
            }
          }
          var cols = parseInt(window.innerWidth / this.style.width, 10) - 1
          var rows = parseInt(window.innerHeight / this.style.height, 10)
          // return {'cols': cols, 'rows': rows};
          // var geometry = current_geometry(term)
          this.term.on_resize(cols, rows)
          this.term.resized = true
        }
      }
    },
    onSubmit() {
      this.onCancel()
    },
    onCancel() {
      const socket = new WebSocket(this.wsurl)
      const terminal = document.getElementById('terminal-container')
      this.term = new Terminal({
        cursorBlink: true,
        scrollback: 8000,
        fontSize: 12,
        fontFamily: 'Courier New'
      })
      // this.term.open(terminalContainer)
      // this.term.fit()
      this.term.on('data', data => {
        socket.send(JSON.stringify({ 'data': data }))
      })
      //
      this.term.on_resize = (cols, rows) => {
        if (cols !== this.cols || rows !== this.rows) {
          // this.resize(cols, rows)
          socket.send(JSON.stringify({ 'resize': [cols, rows] }))
          this.term.resize(parseInt(cols), parseInt(rows))
        }
      }
      // 打开终端
      socket.onopen = e => {
        this.term.open(terminal, true)
        this.term.fit()
        this.term.scrollToBottom()
        // this.term.toggleFullScreen()
      }
      // 接受message
      socket.onmessage = msg => {
        console.log('onmessage:', msg.data)
        // msg.data, term_write, this.decoder
        if (!window.TextDecoder) {
          this.read_as_text_with_encoding(msg.data)
        } else {
          this.read_as_text_with_decoder(msg.data)
        }
      }
      socket.onerror = e => {
        console.log('onerror:', e)
      }

      socket.onclose = e => {
        console.log('onclose', e)
        this.term.destroy()
        this.term = null
        // status.text(e.reason);
      }
    },
    read_as_text_with_encoding(file) {
      var reader = new window.FileReader()
      if (this.decoder === undefined) {
        this.decoder = 'utf-8'
      }
      reader.onload = () => {
        this.callback(reader.result)
      }
      reader.onerror = e => {
        console.error(e)
      }
      reader.readAsText(file, this.decoder)
    },
    read_as_text_with_decoder(file) {
      console.log('read_as_text_with_decoder', file)
      var reader = new window.FileReader()
      console.log('this.decoder', this.decoder)
      if (this.decoder === undefined) {
        this.decoder = new window.TextDecoder('utf-8', { 'fatal': true })
      }
      reader.onload = () => {
        var text
        try {
          text = this.decoder.decode(reader.result)
        } catch (TypeError) {
          console.log('Decoding error happened.')
        } finally {
          this.callback(text)
        }
      }
      reader.onerror = e => {
        console.error(e)
      }
      reader.readAsArrayBuffer(file)
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>


<template>
  <div class="app-container">
    <el-input v-model="username" placeholder="username"/>
    <el-input v-model="hostname" placeholder="hostname" />
    <el-input v-model="port" placeholder="port" />
    <el-button @click="onSubmit">web终端管理</el-button>
  </div>
</template>

<script>
import { getsshid } from '@/api/wsssh'

export default {
  data() {
    return {
      term: null,
      sshdata: '',
      wsurl: '',
      decoder: window.TextDecoder ? new window.TextDecoder('utf-8') : 'utf-8',
      style: {},
      screenWidth: document.body.clientWidth,
      innerHeight: document.body.clientHeight,
      username: 'tt',
      hostname: '127.0.0.1',
      port: '32771'
    }
  },
  methods: {
    onSubmit() {
      var params = {
        // 'hostname': this.hostname,
        // 'port': this.port,
        'username': this.username,
        // 'password': this.passwd,
        'applyquest': ''
      }
      getsshid(params).then(response => {
        if (response.status === 200) {
          if (response.data.status === 'applyquest') {
            this.popup()
          } else {
            this.wsurl = 'ws://127.0.0.1:9008/ws?id='
            this.sshdata = response.data
            this.wsurl = this.wsurl + this.sshdata.id
            const routeData = this.$router.resolve({
              name: 'Form2',
              query: { 'wsurl': this.wsurl },
              params: { 'catId': 'params.catId' }
            })
            window.open(routeData.href, '_blank')
          }
        }
      })
    },
    popup() {
      this.$prompt('请输入密码+token', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        var params = {
          'hostname': this.hostname,
          'port': this.port,
          'username': this.username,
          'password': value,
          'applyquest': 'applyquest'
        }
        getsshid(params).then(response => {
          if (response.status === 200) {
            console.log(response.data.status)
            if (response.data.status === "'password'") {
              this.$message({
                type: 'warning',
                message: '请检查密码'
              })
            } else {
              this.wsurl = 'ws://127.0.0.1:9008/ws?id='
              this.sshdata = response.data
              this.wsurl = this.wsurl + this.sshdata.id
              const routeData = this.$router.resolve({
                name: 'Form2',
                query: { 'wsurl': this.wsurl },
                params: { 'catId': 'params.catId' }
              })
              window.open(routeData.href, '_blank')
            }
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>


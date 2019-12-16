<template>
  <div class="app-container">
    <el-table
      :data="tableData"
      style="width: 100%">
      <el-table-column
        prop="datetime"
        label="日期"
        width="180">
      </el-table-column>
      <el-table-column
        prop="username"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="play"
        label="地址">
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button
            @click="onSubmit(scope.row)"
            type="text"
            size="small">
            查看录像
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getaction } from '@/api/wsssh'

export default {
  data() {
    return {
      term: null,
      tableData: [],
      url: 'http://127.0.0.1:9008/S',
      port: '22'
    }
  },
  methods: {
    onSubmit(row) {
      const url = this.url + '?file=' + row.play
      window.open(url)
    }
  },
  mounted() {
    getaction().then(response => {
      if (response.status === 200) {
        // console.log(response.data)
        this.tableData = response.data.data
        
      }
    })
  }, 
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

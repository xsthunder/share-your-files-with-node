<template>
  <div class="hello">
    <button style="position: fixed; z-index:1; right:0px" @click="sizerFlag=!sizerFlag">
      control
    </button>
    <div class="fixed">
      <div v-if="sizerFlag" >
          px
          <button @click="offsetHeight(80)">
            inc
          </button>
          <input v-model="heightInput" type="number"/>
          <button @click="offsetHeight(-80)">
            dec
          </button>
        <div style="margin-top: 100px">
          page
          <button @click="offsetPage(10)">
            inc
          </button>
          <input v-model="pageInput" @keyup.enter="enterPage" />
          <button @click="offsetPage(-10)">
            dec
          </button>
        </div>
        <div>
          remain <input type="number" v-model="remain"/>
          bench<input type="number" v-model="bench"/>
        </div>
      </div>
    </div>
    <virtual-list :size="height" :remain="Number(remain)" :bench="Number(bench)" :onscroll="onscrollFunciton" :debounce="300" :start="startPage">
      <div :style="`height: ${height}px; position: relative`" v-for="file in files" :key="file">
        <div class="absolute" v-if="sizerFlag">{{file}}</div>
        <!-- <div style="height:1000px"></div> -->
        <img :src="`api/${dirpath}/${file}`" :style="`height: ${height}px`" >
      </div>
    </virtual-list >
  </div>
</template>

<script>
 /* eslint-disable */
import virtualList from 'vue-virtual-scroll-list'
import axios from 'axios';
import getUrlParams from 'get-url-params';
export default {
  methods:{
    offsetPage(num){
      let p = this.pageInput
      p = Number(p)
      p += num
      console.log(p) // disable eslink check
      if(0<p && p < this.files.length){
        this.pageInput = p
        this.enterPage()
      }
    },
    enterPage(){
      this.startPage = Number(this.pageInput)
    },
    offsetHeight(num){
      let h = this.height;
      h += num;
      if(0 <= h && h <= 3000){
        this.heightInput = String(h)
      }
    },
    onscrollFunciton(_, {offset}){
      let n = (offset/this.height)
      if(!Number.isInteger(n)) n += 0.5
      n = Math.round(n)
      this.pageInput = String(n)
      location.hash = '#'+this.pageInput
    }
  },
  components:{
    virtualList
  },
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data(){
    return {
      bench: 5,
      remain: 2,
      startPage:0,
      sizerFlag:true,
      heightInput:'1000',
      pageInput: '0',
      files:[],
      dirpath:''
    }
  },
  computed:{
    height:function(){
      return Number(this.heightInput)
    },
  },
  mounted(){
    // axios.get('/api/list').then((res)=>this.files = res.data)
    this.dirpath = getUrlParams().dirpath
    this.pageInput = location.hash?location.hash.slice(1):"0"
    this.pageInput = this.pageInput?this.pageInput:'0'
    axios.post('/api/getfile', {
      filename: this.dirpath
    }).then((res)=>{
      this.files = res.data
      const s = ((x)=>x.substring(0, x.indexOf('.')) )
      const n = (x)=>parseInt(s(x))
      this.files.sort((a,b)=>n(a)>n(b))
      setTimeout(()=>{
        this.startPage = Number(this.pageInput)// in next vue tick
      }, 500)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.fixed {
  margin-top: 50px;
  text-align: center;
  position: fixed;
  /* before relative image */
  z-index: 1; 
  background-color: white
}
.absolute {
  position: absolute;
  background-color: white
}
</style>

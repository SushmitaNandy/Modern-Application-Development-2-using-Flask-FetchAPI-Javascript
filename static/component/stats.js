import navbar from './navbar.js'
var stats ={
    template:`
    <div>
  <navbar></navbar>
  <!-- Page Header Start -->
  <div class="container py-5 px-2 bg-primary sticky-div">         
      <div class="text-right ">
          <div class="d-inline-flex pt-2">
              <h5 class="m-0 text-white"><i class="fas fa-user-alt"></i> {this.$store.state.current_user.fname} {this.$store.state.current_user.lname}</h5>
          </div>
      </div>
      <div class="row py-2 px-4">
          <div class="col-sm-6 text-center text-md-left">
              <h1 class="mb-3 mb-md-0 text-white text-uppercase font-weight-bold">Blog Statistics</h1>
              
          </div>
      </div>
      
  </div>
  <!-- Page Header End -->
    <div class="container py-2 px-2 bg-white"> 
        <div class="row px-4">
            <h3><strong>Blog Engagements</strong></h3>
            <img :src="com_img"/>
        </div>    
    </div> 
  </div>
    `,
    data:  function(){
        return {
            username:"",
            com_img:"",
            fow1:"",
        }
    },
    delimiters: ['{', '}'],
    components: {
        navbar
    },
    computed: {
        uname:function(){
         return this.$store.state.current_user.username
        
      }
    },
    created: async function() {
        await this.$store.dispatch("get_current_user",localStorage.getItem('username'))
    },
    mounted: async function() {
        
        await this.$store.dispatch("get_current_user",localStorage.getItem('username'))
        this.username= window.location.href.split("/")[5]
        
        console.log(this.username)
        
        this.com_img='../static/stats/analysis_'+this.username+'.png'
        
    },
    methods: {
        user_profile(author_username){
            this.$router.push(`/author_blog/${author_username}`)
          },
    }

}
export default stats
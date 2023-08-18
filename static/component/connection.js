import navbar from './navbar.js'
var connection ={
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
              <h1 class="mb-3 mb-md-0 text-white text-uppercase font-weight-bold">Search Results</h1>
          </div>
      </div>
      
  </div>
  <!-- Page Header End -->
    <div class="container py-2 px-2 bg-white"> 
        <div class="row px-4">
            <h3><strong>People who are following you</strong></h3>
            <table class="table table-hover table-dark">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Followers</th>
                    <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    
                    <tr v-for="f in fow">
                        <td><img :src="f.follower_photo" alt="Image" class="mr-3 mt-1 rounded-circle" style="width:60px;"></td>
                        <td><a href=""><i class="fas fa-user-alt" style="color: aliceblue;"></i></a> {f.follower_fname} {f.follower_lname}</td>
                        <td>
                            
                            <a href="" class="btn btn-info mr-2" @click.prevent="user_profile(f.follower_username)">Visit Profile</a>
                            
                        </td>
                    </tr>
                    
                </tbody>
            </table>
        </div> 
        <div class="row px-4">
            <h3><strong>People who are following you</strong></h3>
            <table class="table table-hover table-dark">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Followers</th>
                    <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    
                    <tr v-for="f in fow1">
                        <td><img :src="f.following_photo" alt="Image" class="mr-3 mt-1 rounded-circle" style="width:60px;"></td>
                        <td><a href=""><i class="fas fa-user-alt" style="color: aliceblue;"></i></a> {f.following_fname} {f.following_lname}</td>
                        <td>
                            
                            <a href="" class="btn btn-info mr-2" @click.prevent="user_profile(f.following_username)">Visit Profile</a>
                            
                            
                            
                        </td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
            
            
    </div> 
  </div>
    `,
    data:  function(){
        return {
            username:"",
            fow:"",
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
        var response =await fetch("/connection_list/"+this.username, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          });
        var data =await response.json();
        this.fow=data['fow']
        this.fow1=data['fow1']
        
    },
    methods: {
        user_profile(author_username){
            this.$router.push(`/author_blog/${author_username}`)
          },
    }

}
export default connection
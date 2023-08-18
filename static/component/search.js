import navbar from './navbar.js'
var search ={
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
            
            
            <div v-if="results.length!=0">
                <h3><strong> Displaying your search results.... </strong></h3>
                <table class="table table-hover table-dark">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        <tr v-for="res in results">
                            <td><img :src="res.photo" alt="Image" class="mr-3 mt-1 rounded-circle" style="width:60px;"></td>
                            <td><i class="fas fa-user-alt" style="color: white;"></i> <a href="" style="color:white" @click.prevent="author_blog(res.username)">{res.fname} {res.lname}</a></td>
                        </tr>
                            
                    </tbody>
                </table>
            </div>
            <p v-else><strong> Search results did not returned any registered user... Try again!!!</strong></p>
    </div> 
  </div>
    `,
    data:  function(){
        return {
            username:"",
            search:"",
            results:""
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
    
    mounted: async function() {
        if(localStorage.getItem('auth-token')){
            await this.$store.dispatch("get_current_user",localStorage.getItem("username"))
            this.username= window.location.href.split("/")[5]
            this.search= window.location.href.split("/")[6]
            console.log(this.username, this.search)
            var response =await fetch("/user_search/"+this.username+'/'+this.search, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json'
                },
            });
            var data =await response.json();
            this.results=data
            console.log(this.results)
        }
    },
    methods: {
        author_blog(author_username){
            this.$router.push(`/author_blog/${author_username}`)
          },
    }

}
export default search
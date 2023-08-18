//import {mapState} from Vuex.mapState

var sidebar ={
    name: sidebar,
    template:`
    <div class="sidebar-wrapper">
    <div class="sidebar-text d-flex flex-column h-100 justify-content-center text-center" style="margin-top: 20px;">
        <img class="mx-auto w-75 w-75 bg-primary img-fluid rounded-circle mb-4 p-3" :src="this.$store.state.current_user.photo"
            alt="Image">
        <h1 class="font-weight-bold">{this.$store.state.current_user.fname} {this.$store.state.current_user.lname}</h1>
        <p class="mb-4">
            Bio: {this.$store.state.current_user.bio}
        </p>
        <div class="d-flex justify-content-center mb-5">
            <a class="btn btn-outline-primary mr-2" href=""> Edit Profile <i
                    class="fas fa-wrench" aria-hidden="true" style='font-size:20px;'></i></a>
            <a class="btn btn-outline-primary mr-2" href=""
                onclick="return confirm('Are you sure you want to delete your profile?')">
                Delete Profile
                <i class="fas fa-trash" style='font-size:20px;'></i>
            </a>
        </div>
        <div class="d-flex justify-content-center mb-5">
        
            <h4 class="m-0" >Blogs posted : <span class="badge badge-dark">{this.$store.state.current_user.total_blogs}</span></h4>
        </div>
        <div class="d-flex justify-content-center mb-5">
            <h4 class="m-0" >Followers : <span class="badge badge-dark">{this.$store.state.current_user.total_followers}</span></h4>
        </div>
        <div class="d-flex justify-content-center mb-5">
            <h4 class="m-0" >Following : <span class="badge badge-dark">{this.$store.state.current_user.total_following}</span></h4>
        </div>
    </div>
    </div>
    `,
    data:  function(){
        return {
            current_user:{}
        }
    },
    delimiters: ['{', '}'],
    computed: {
        uname:function(){
         return this.$store.state.current_user.username
        
      }
    },
    created: async function() {
        await this.$store.dispatch("get_current_user")
    },
    mounted: async function() {
        
    },
    methods: {
        
    }

}
export default sidebar
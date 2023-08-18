//import {mapState} from Vuex.mapState

var navbar ={
    name: navbar,
    template:`
    <div class="container p-0 ">
                
            <nav class="navbar navbar-expand-sm bg-secondary navbar-dark">
                <div class="navbar-nav m-auto">
                    <a href="" @click.prevent="news_feed" class="nav-item nav-link">News Feed </a>
                    <a href="" @click.prevent="user_profile" class="nav-item nav-link" >User Profile</a>
                    <a href="" @click.prevent="add_blog" class="nav-item nav-link">Add Blog</a>
                    <a href="" @click.prevent="connection" class="nav-item nav-link">Connections</a>
                    <a href="" @click.prevent="blog_stats" class="nav-item nav-link">Blog Stats</a>
                </div>
            
            <form class="form-inline my-2 my-lg-0" 
                method="post">

                <input class="form-control" name="search_name"  placeholder="Type to search users" v-model="search"> &nbsp;&nbsp;
                <button class="btn btn-outline-success my-2 my-sm-0" type="submit"
                    style="background-color: white" @click="user_search">Search</button>

            </form>
            <p>&nbsp;&nbsp;</p>
            <a class="btn btn-outline-success my-2 my-sm-0" href="/logout" @click.prevent="logout"
                style="background-color: white">Logout</a>
        </nav>
    </div>
    `,
    data:  function(){
        return {
            username: "",
            search: "",
        }
    },
    delimiters: ['{', '}'],
    computed: {
        uname:function(){
         return this.$store.state.current_user.username
        
      }
    },
    mounted: async function() {
        this.username= localStorage.getItem('username')
        await this.$store.dispatch("get_current_user",localStorage.getItem('username'))

    },
    methods: {
        connection() {
            console.log(this.username)
            this.$router.push(`/connection/${this.$store.state.current_user.username}`)
        },
        user_profile() {
            console.log(this.username)
            this.$router.push(`/user_profile/${this.$store.state.current_user.username}`)
        },
        news_feed() {
            console.log(this.username)
            this.$router.push(`/news_feed/${this.$store.state.current_user.username}`)
        },
        add_blog() {
            console.log(this.username)
            this.$router.push(`/add_blog/${this.$store.state.current_user.username}`)
        },
        user_search() {
            
            this.$router.push(`/search_user/${this.$store.state.current_user.username}/${this.search}`)
        },
        blog_stats() {
            //location.reload()
            fetch(`/get_plot/${localStorage.getItem('username')}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    this.$router.push(`/blog_stats/${localStorage.getItem('username')}`)
                .catch(error => {
                    // Handle error, e.g. show an error message
                });
            })
        
            
        },
        logout() {
            fetch('/logoutuser/'+localStorage.getItem('username'))
            .then((res) => res.json())
            .then((data) => {
                localStorage.removeItem('auth-token')
                localStorage.removeItem('username')
                alert(data['msg'])
                this.$router.push('/')
            })
        }
    }

}
export default navbar
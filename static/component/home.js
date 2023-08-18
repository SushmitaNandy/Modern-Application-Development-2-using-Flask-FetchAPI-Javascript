

const home = {
    template: `
    <div>
        <div class="header">
            <h1 style="color: whitesmoke;">Welcome to Blog Lite...</h1>
        </div>
        <div class="container" >
        <form>
        
            <div class="title" style="color: deeppink">Login</div>
            
            <div class="input-box underline">
                <input type="email" v-model="login_id"  placeholder="Enter Your Email or Username">
                <div class="underline"></div>
            </div>
            <div class="input-box">
                <input type="password" v-model="password"  placeholder="Password">
                <div class="underline"></div>
            </div>
            
            <br>
            <div id="error"></div>
            <div class="input-box button">
                <button type="button" class="btn btn-primary btn-lg" @click="login"
                style="background: linear-gradient(to right, #99004d 0%, #ff0080; width:50%; font-size: 30px; color:whitesmoke">   
                Login   </button>
            </div>
        </form>
        <div class="option">
            <a href="" @click.prevent="register" >or Sign up for new account</a>
        </div>
        </div>
</div>
    `,
    data:  function() {
        return {login_id:null,
            password:null,
            username:null,
        }
    },
    computed: {
      uname:function(){
       return this.$store.state.current_user.username
      }
    },
    mounted: async function() {
      document.title="Login"
    },
    methods:{
        // async loginUser() {
        //   const data = { login_id: this.login_id,
        //     password: this.password
        //    };
        //   const res = await fetch('/login?include_auth_token', {
        //     method: 'post',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(data),
        //   })
    
        //   if (res.ok) {
        //     const res_data = await res.text()
        //     console.log(res_data)
        //     // localStorage.setItem(
        //     //   'auth-token',
        //     //   res_data.response.user.authentication_token
        //     // )
        //     // localStorage.setItem('username', res_data.response.user.username)
        //     // console.log(res_data.response.user.username)
            
        //   } 
        //   else {
        //       const errdiv = document.getElementById('error');
        //       errdiv.innerHTML = "Something went wrong";
        //   }
        // },
         login(){
          const data = { login_id: this.login_id,
                         password: this.password
                        };
          fetch("/logintest" , 
              {
                method: "POST", // or 'PUT'
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              })
              .then((response) =>  response.json())
              .then((d) => {
                if (d['msg'] == "Success"){
                  // console.log(d['data'])
                  // this.username=d['data']
                  localStorage.setItem('auth-token', d['auth_data'])
                  localStorage.setItem('username', d['data'])
                  //calling action to Vuex store to set current user
                  this.$store.dispatch("get_current_user",localStorage.getItem('username'))
                  
                  console.log("From home.js: ")
                  //console.log(this.uname)
                  

                  const s=d['data']
                  //this.$router.push('/news_feed/'+this.uname)
                  this.$router.push(`/news_feed/${s}`) //${d['data']}
                  
                }
                else if (d['msg'] == "Failed")
                {
                  const errdiv = document.getElementById('error');
                  errdiv.innerHTML = d['data'];
                }

              })
              .catch((error) => {
                console.error("Error:", error);

              });
        },
        register(){
          this.$router.push('/register')
        }
  },
  
}

// const store= new Vuex.Store({
//     state: {
//         username: null,
//     },
//     mutations: {
//         setUsername(state) {
//             state.username = home.data.username;
//         }
//     }

// })


export default home 
//export {store}
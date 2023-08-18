import navbar from './navbar.js'
import sidebar from './sidebar.js'
var myblogs =  {
    
  template: `
  <div>
    <div class="container p-0 ">
        <navbar></navbar>
    </div> <!-- Nav bar end-->
    <div class="wrapper">
        <div class="row">
            <div class="col-sm-12">
                <!-- Page Header Start -->
                <div class="container py-2 px-2 bg-primary sticky-div">
                    <div class="text-right ">
                      <div class="d-inline-flex pt-2">
                          <img :src="this.$store.state.current_user.photo" alt="Image" class="mr-3 mt-1 rounded-circle" style="width:200px; height:200px">
                          
                          <div>
                              <h4 class="m-0" >Blogs posted : <span class="badge badge-dark">{this.$store.state.current_user.total_blogs}</span></h4>
                          </div>
                          <div>
                              <h4 class="m-0" >Followers : <span class="badge badge-dark">{this.$store.state.current_user.total_followers}</span></h4>
                          </div>
                          <div>
                              <h4 class="m-0" >Following : <span class="badge badge-dark">{this.$store.state.current_user.total_following}</span></h4>
                          </div>
                      </div>
                    </div>
                    <div class="row py-5 px-4">
                        <div class="col-sm-6 text-center text-md-left">
                            <h1 class="mb-3 mb-md-0 text-white text-uppercase font-weight-bold">{this.$store.state.current_user.fname} {this.$store.state.current_user.lname}'s Blogs</h1>
                            <p class="mb-4">
                              Bio: {this.$store.state.current_user.bio}
                            </p>
                            
                        </div>
                    </div>
                </div>
                <!-- Page Header End -->
            </div>
        </div>
    </div>
  <div class="container py-2 px-2 bg-white" >
    <div>    
    <!-- Blog Detail Start -->
    <div class="container bg-white">
        <div class="row px-4">  
        <p v-if="!blogs[0].length"><strong>No posts for the user yet!!!!</strong></p>
        <div class="col-12" v-for="blog in blogs[0]">
            
            <h2 class="mb-3 font-weight-bold"> { blog.blog_title }</h2>
            <div class="d-flex">
                <p class="mr-3 text-muted"> <i class="fa fa-calendar-alt"></i> {blog.blog_post_time} </p>
                
                <p class="mr-3 text-muted"> <i class="fa fa-folder"></i> <b>Category:</b> {blog.blog_category} </p>
                <p class="mr-3 text-muted">
                <i v-bind:class="'fas fa-thumbs-up like-icon-'+blog.blog_id" v-if="blog.user_liked" :id="'like-button-'+blog.blog_id" @click="like(blog.blog_id)"></i>
                <i v-bind:class="'far fa-thumbs-up like-icon-'+blog.blog_id" v-else :id="'like-button-'+blog.blog_id" @click="like(blog.blog_id)"></i>
                <span v-bind:id="'likes-count-'+blog.blog_id"> {blog.blog_likes} likes  </span>
                </p>
                <p class="mr-3 text-muted"><i class="fa fa-comments"></i> {blog.blog_comments.length} comments  </p>
                <div class="col-12"> 
                    
                    <a href="" @click.prevent="edit_blog(blog.blog_id)"> <strong> <i class="fa fa-cogs"></i> Edit Blog </strong> </a>  
                    &nbsp;
                    <a href="" @click.prevent="delete_blog(blog.blog_id)"> <strong> <i class="fa fa-trash"></i> Delete Blog </strong> </a> 
                </div>
            </div>
            <div class="d-flex col-12 py-8">
                <img class="w-50 float-left mr-4 mb-3" :src="blog.blog_img" alt="Image" style="height:400px; width:300px">
                <p style="color:black"> { blog.blog_text } </p>
            </div>
            <div class="d-flex col-12 py-8" v-for="comment in blog.blog_comments" :id="'comment-cont-'+comment.comment_id">
    
            <div class="d-flex media mb-4">
                <img :src="comment['com_author_photo']" alt="Image" class="mr-3 mt-1 rounded-circle" style="width:80px; height:80px">
                <div class="media-body">
                <h4><i class="fas fa-user-alt"></i> {comment['com_author_fname']} {comment['com_author_lname']}
                    <small><i> {comment['comment_time']} </i></small>
                </h4>
                <p style="color:black"> {comment['comment_text']} </p>
                <a class="btn btn-outline-primary mr-2" href="" v-if="comment_del_btn(comment['com_author_username'])" @click.prevent="deleteComment(comment['comment_id'])">Delete Comment</a>
                </div>
            </div>
            
            
            </div>
        
            
            <div class="col-12">
            <h3 class="mb-4 font-weight-bold">Leave a comment</h3>
            <form :action="'/add_comment/'+blog.blog_id" method="POST">
                                
                <div class="form-group">
    
                <textarea class="form-control" placeholder="Add comment here..."  rows="2" v-model="comment_text[blog.blog_id]">  </textarea>
    
                </div>
                <div class="form-group">
                <button type="button" class="btn btn-primary btn-lg" @click="postComment(blog.blog_id)">Post Comment</button>           
                </div>
            </form>
            </div>
        </div>
        </div>
    </div>
    <!-- Blog Detail End -->
    </div>
  </div>
  </div>`,
  components: {
      navbar,
      sidebar
  },
  delimiters: ['{', '}'],
  data:  function() {
       return {
          blogs: "",
          current_user: "",
          token: "",
          comment_text: [],
          username:"",
          
       }
  },
  mounted: async function() {
        document.title="My Blogs"
        if(localStorage.getItem('auth-token')){
          await this.$store.dispatch("get_current_user",localStorage.getItem('username'))
          const url = window.location.href;
          this.username = url.split('/')[5];
          //console.log(this.token)
          //if (this.token === this.username){
              var response =await fetch("/api/my_profile/"+this.username, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json'
                  },
              });
              
              var data =await response.json();
              
              this.username=data.username
              this.blogs = data.blogs
            
          }   
        // }
        // else {
        //     window.location.href='/'
        // }   
  },
  computed : {
    getBlogSize(){
      console.log(this.blogs[0])
      if (this.blogs[0]==undefined){
        return false
      }
      return true
    }
  },
  methods: {
    edit_blog: function(blog_id){
      const url1 = window.location.href;
      this.username = url1.split('/')[5];
      this.$router.push("/edit_blog/"+this.username+'/'+blog_id);
    },
    async delete_blog(blog_id){
      console.log(blog_id)
      await fetch('/delete_blog/'+blog_id)
      .then((res) => res.json())
      .then((data) => {
        
        if (data['Status'] === "Success") {
          alert(data['msg'])
          location.reload()
          // const url = window.location.href;
          // this.username = url.split('/')[5];
          // this.$router.push("/news_feed/"+this.username);
        }
        else{
          alert(data['msg'])
        }
      })
    },
    comment_del_btn(com_author_username){
      if (com_author_username==localStorage.getItem('username')){
        return true
      }
      return false
    },
      async like(blogId) {
        await this.$nextTick();
        const likeCount = document.getElementById('likes-count-' + blogId);
        let icon = document.querySelector('.like-icon-' + blogId);
  
        await fetch('/like_blog/'+localStorage.getItem('username')+'/' + blogId, { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                likeCount.innerHTML = data["liked"] + " likes";
                
                if (data["liked_user"] == true) {
                    icon.classList.remove("far");
                    icon.classList.add("fas");
                } else {
                    icon.classList.remove("fas");
                    icon.classList.add("far");
                }
            })
  
      },
      async postComment(blogId){
        const data = { comment_text: this.comment_text[blogId] };
            await fetch("/add_comment/"+localStorage.getItem('username')+'/' + blogId, 
            {
              method: "POST", // or 'PUT'
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            })
            .then((response) =>  response.json())
            .then((data) => {
              console.log(data)
              if (data['Status']=='Success'){
                    this.comment_text[blogId]=""
                    //this.username = window.location.href.split('/')[5];
                    fetch("/api/my_profile/"+localStorage.getItem('username'), {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    })
                    .then((response1) =>  response1.json())
                    .then((data1) => {
                    
                      this.blogs = data1.blogs
                    
                    })
                  }
                else{
                  alert(data["msg"])
                }
              
              })
            .catch((error) => {
              console.error("Error:", error);

            });
            
      },
       deleteComment(commentId){
        

        fetch("/delete_comment/"+ commentId)
        .then((response) => response.json())
        .then((data) => {
            alert(data);
            console.log(document.getElementById("comment-cont-"+commentId));
            document.getElementById("comment-cont-"+commentId).remove();
            this.$router.push(`/user_profile/${localStorage.getItem('username')}`);
          })
        .catch((error) => {
          console.error("Error:", error);

        });

      }
       

      
  }

};

export default myblogs;




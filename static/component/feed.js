import navbar from './navbar.js'
var feeds =  {
    
    template: `
<div>
  <!DOCTYPE html>
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
              <h1 class="mb-3 mb-md-0 text-white text-uppercase font-weight-bold">News Feed</h1>
          </div>
      </div>
      
  </div>
  <!-- Page Header End -->
  <!-- Blog Detail Start -->
  <div class="container py-2 px-2 bg-white">  
      <div class="row px-4">
          <h3 v-if="!blogs[0].length">You are not following anyone. Kindly follow others to view Feeds !!!!</h3>
          <div class="col-12" v-else v-for="blog in blogs[0]">
          
          <h2 class="mb-3 font-weight-bold"> { blog.blog_title }</h2>
          <div class="text-right">
          <button type="button" class="btn btn-success" @click.prevent="trigger_job(blog.blog_id)">Download Blog</button>
          </div>
          <div class="d-flex">
              <p class="mr-3 text-muted"> <i class="fa fa-calendar-alt"></i> {blog.blog_post_time} </p>
              <p class="mr-3 text-muted"> 
               <i class="fas fa-user-alt"></i> 
               <a href="" @click.prevent="author_blog(blog.author_username)"> {blog.author_fname} {blog.author_lname} </a>  
              </p>
              <p class="mr-3 text-muted"> <i class="fa fa-folder"></i> <b>Category:</b> {blog.blog_category} </p>
              <p class="mr-3 text-muted">
              <i v-bind:class="'fas fa-thumbs-up like-icon-'+blog.blog_id" v-if="blog.user_liked" :id="'like-button-'+blog.blog_id" @click="like(blog.blog_id)"></i>
              <i v-bind:class="'far fa-thumbs-up like-icon-'+blog.blog_id" v-else :id="'like-button-'+blog.blog_id" @click="like(blog.blog_id)"></i>
              <span v-bind:id="'likes-count-'+blog.blog_id"> {blog.blog_likes} likes  </span>
              </p>
              <p class="mr-3 text-muted" v-if="blog.blog_comments.length != 0"><i class="fa fa-comments"></i> {blog.blog_comments.length} comments  </p>
              <p class="mr-3 text-muted" v-else ><i class="fa fa-comments"></i> 0 comments  </p>
              
          </div>
          <div class="d-flex col-12 py-8">
              <img class="w-50 float-left mr-4 mb-3" :src="blog.blog_img" alt="Image" style="height:400px; width:300px">
              <p style="color:black"> { blog.blog_text } </p>
          </div>
          <div class="d-flex col-12 py-8" v-for="comment in blog.blog_comments" :id="'comment-cont-'+comment.comment_id">
            
            <div class="d-flex media mb-4" >
                <img :src="comment['com_author_photo']" alt="Image" class="mr-3 mt-1 rounded-circle" style="width:80px; height:80px">
                <div class="media-body">
                <h4><i class="fas fa-user-alt"></i> <a href="" @click.prevent="author_blog(comment['com_author_username'])"> {comment['com_author_fname']} {comment['com_author_lname']} </a>
                    <small><i> {comment['comment_time']} </i></small>
                </h4>
                <p style="color:black"> {comment['comment_text']} </p>
                <button class="btn btn-outline-primary mr-2"  @click="deleteComment(comment.comment_id)" v-if="comment_del_btn(comment.com_author_username)">Delete Comment</button>
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
</div>`,
  components: {
      navbar
  },
  delimiters: ['{', '}'],
  data:  function() {
       return {
          blogs: "",
          comment_text: [],
          username:"",
          fname:"",
          lname:"",
       }
  },
  mounted: async function() {
      document.title="News Feed"
      if(localStorage.getItem('auth-token')){
        await this.$store.dispatch("get_current_user", localStorage.getItem('username'))
        this.username = window.location.href.split('/')[5];
        var response =await fetch("/api/newsfeed/"+this.username, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        var data =await response.json();
        this.username=data.username
        this.blogs = data.blogs
        this.fname=data.fname
        this.lname=data.lname
    }
  },
  computed : {
    getBlogSize(){
      console.log(this.blogs[0])
      if (this.blogs[0]==undefined){
        return false
      }
      return true
    },
  },
  methods: {
     trigger_job(blogID){
       fetch(`/trigger-celery-job/${blogID}`).then((res) => res.json()).then((data) => {
        console.log(data)
        window.location.href = "/download-file"
      })
    },
    author_blog(author_username){
      this.$router.push(`/author_blog/${author_username}`)
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
  
        await fetch('/like_blog/'+localStorage.getItem('username')+'/'+blogId, { method: "POST" })
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
                      fetch("/api/newsfeed/"+this.username, {
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
            this.$router.push(`/news_feed/${localStorage.getItem('username')}`);
          })
        .catch((error) => {
          console.error("Error:", error);

        });

      }

      
  }

};

export default feeds;

// var app = new Vue({
//   el: '#app',
//   data: { current_user: ""},
//   created: async function() {
//     var response =await fetch("/api/current_user", {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//       });
//     var data1= await response.json();
//     this.current_user = data1['user_data'];
//   }
// })


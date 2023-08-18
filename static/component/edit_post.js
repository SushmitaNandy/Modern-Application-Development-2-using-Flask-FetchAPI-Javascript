import navbar from './navbar.js'
var edit_blog =  {
    
    template: `
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
              <h1 class="mb-3 mb-md-0 text-white text-uppercase font-weight-bold">ADD A NEW BLOG</h1>
          </div>
      </div>
      
  </div>
  <!-- Page Header End -->
  <!-- Blog Detail Start -->
  <div class="container py-2 px-2 bg-white">  
      <div class="row px-4">
      <div class="container" style="margin: 20px;">
      <form method="post" enctype=multipart/form-data id="myForm">
          <div class="form-group">
              <div style="padding-left: 10px;">
                  <div class="col-xs-6">
                      <label class="form-label" style="color:black"><strong>Blog Title</strong></label>
                      <input type="text" class="form-control" v-model="blog_title" placeholder="Blog Title" required="required">

                  </div>
                  <div class="col-xs-6">
                      <label class="form-label" style="color:black"><strong>Blog Category</strong></label>
                      
                      <select class="form-control" v-model="blog_category" placeholder="Blog Category" required="required">
                        <option value="Travel">Travel</option>
                        <option value="Food">Food</option>
                        <option value="Health">Health</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Personal">Personal</option>
                        <option value="Movies">Movies</option>
                        <option value="Sports">Sports</option>
                      </select>  
                  </div>
              </div>
          </div>
          <div class="form-group" style="padding-left: 10px;">
              <label class="form-label" style="color:black"><strong>Blog Content</strong></label>
              <textarea class="form-control" v-model="blog_text" placeholder="Add your blog content here..." rows="10" required="required"></textarea>

          </div>
          <div class="form-group">
                <img class="w-50 float-left mr-4 mb-3" :src="img" alt="Image" style="height:100px; width:200px"><br>
          </div>
          <div class="form-group" style="padding-left: 10px;">
              <label class="form-label" style="color:black"><strong>Blog Image</strong></label>
              <input type="file" ref="fileInput" @change="handleFileUpload" class="form-control" >
          </div>
          <div class="form-group">
            <button class="btn btn-primary btn-lg" @click.prevent="editBlog">Edit Blog</button>
          </div>
          <div class="hint-text" style="color:black" @click.prevent="user_profile">Go back to News Feeds <a href="">Go
              Back</a></div>
      
      </form>
      
  </div>
      </div>
  </div>
  </div>  
  
</div>`,
  components: {
      navbar
  },
  delimiters: ['{', '}'],
  data:  function() {
       return {
            blog_title: "",
            blog_category: "",
            blog_text: "",
            blog_image: "",
            blogID: "",
            img:""
       }
  },
  mounted: async function() {
      document.title="Edit Blog"
        if(localStorage.getItem('auth-token')){
        await this.$store.dispatch("get_current_user")
        this.blogID = window.location.href.split('/')[6];
        await fetch("/get_blog/" + this.blogID, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => response.json())
        .then((data) => {
            this.blog_title = data.blog_title
            this.blog_text = data.blog_text
            this.blog_category = data.blog_category
            this.img = data.blog_img             
            
        });
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
    handleFileUpload() {
        this.blog_image = this.$refs.fileInput.files[0];
    },
    user_profile() {
        console.log(this.username)
        this.$router.push('/user_profile/'+this.username)
    },
    editBlog: async function() {
        
        let formData = new FormData();
        formData.append('blog_title', this.blog_title);
        formData.append('blog_category', this.blog_category);
        formData.append('blog_text', this.blog_text);
        formData.append('blog_image', this.blog_image);
        try {
            await fetch("/edit_blog/"+window.location.href.split('/')[6], {
            method: "POST",
            
            body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if(data['Status'] == 'Success'){
                    alert(data['msg'])
                    this.$router.push('/user_profile/'+ window.location.href.split('/')[5])
                }
                else{
                    alert("Blog was not added: "+data['msg'])
                }
            })
        } 
        catch (error) {
            console.error("Error:", error);
        }
      
    }
}

};

export default edit_blog;



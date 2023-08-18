var register ={
    template:`
    <div class="signup-form" style="width:100%; height:100%">
        <form  method="post" enctype="multipart/form-data" id="myForm">
            
            <h2 class="title">Sign Up</h2>
            <hr>
            <div class="form-group">
                <div class="row">
                    <div class="col-xs-6">
                        <label>First Name</label>
                        <input  v-model="fname" class="form-control" placeholder="First Name" required="required">

                    </div>
                    <div class="col-xs-6">
                        <label>Last Name</label>
                        <input  v-model="lname" class="form-control" placeholder="Last Name" required="required">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>User Email</label>
                <input type="email"  v-model="email" class="form-control" placeholder="Enter you email" required="required">
            </div>
            <div class="form-group">
                <label>Username</label>
                <input  v-model="uname" class="form-control" placeholder="Username" required="required">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" v-model="passwd" class="form-control" placeholder="Password" required="required">

            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password"  v-model="repasswd" class="form-control" placeholder="Confirm Password" required="required">
            </div>
            <div class="form-group">
                <label>Profile Bio</label>
                <textarea class="form-control" v-model="bio"  id="w3review" rows="4" cols="40" placeholder="Profile Description"></textarea>
            </div>
            <div class="form-group">
                <label>Profile Photo</label>
                <input type="file" ref="fileInput" @change="handleFileUpload" class="form-control">

            </div>

            <div class="form-group">
                <button class="btn btn-primary btn-lg" @click.prevent="registerUser">Register</button>
                
            </div>
            
        </form>
        <div class="hint-text">Already have an account? <a href="/">Login here</a></div>
    </div>
    `,
    data: function(){
        return{
            fname:null,
            lname:null,
            email:null,
            uname:null,
            passwd:null,
            repasswd:null,
            bio:null,
            profilePicture:null,
        }
    },
    mounted(){
        document.title="Register"
    },
    methods:{
        handleFileUpload() {
            this.profilePicture = this.$refs.fileInput.files[0];
        },
        registerUser(){
            console.log(this.fname)
            if(this.passwd == this.repasswd){

                
                let formData = new FormData();
                formData.append('fname', this.fname);
                formData.append('lname', this.lname);
                formData.append('email', this.email);
                formData.append('uname', this.uname);
                formData.append('passwd', this.passwd);
                formData.append('bio', this.bio);
                formData.append('profilePicture', this.profilePicture);
                try {
                    const response = fetch("/signup", {
                    method: "POST",
                    
                    body: formData,
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data['Status'] == 'Success'){
                            alert("User Registered Successfully")
                            this.$router.push('/')
                        }
                        else{
                            alert("User Registration Failed : "+data['msg'])
                        }
                    })
                } 
                catch (error) {
                    console.error("Error:", error);
                }
            }
            else{
                alert("Passwords do not match")
            }
        }
    }
}
export default register
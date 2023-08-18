import secrets
import string
from flask import Flask, request ,session,flash,jsonify, make_response,send_file
from flask import render_template,redirect, url_for
from flask import current_app as app
from application.models import *
from sqlalchemy import exc,select,or_
from werkzeug.utils import secure_filename
from security import *
from sqlalchemy.exc import SQLAlchemyError
from flask_security import Security, login_user, current_user, auth_token_required, utils
from application.config import *
#from flask_login import *
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from sqlalchemy.exc import IntegrityError

from functools import wraps
from flask_security import login_required,logout_user
from flask_restful import Resource,Api,reqparse
from flask_caching import Cache

cache=Cache(app)

# login_manager = LoginManager()
# login_manager.login_view = 'index'
# login_manager.init_app(app)

# current_user=None
api= Api()
@app.errorhandler(404)
def page_not_found(e):
	return render_template("404.html"), 404

@app.errorhandler(500)
def page_not_found(e):
	return render_template("500.html"), 500

# @login_manager.user_loader
# def user_loader(id):
#     return User.query.get(id)

@app.route('/download-file')
def download_file():
    return send_file('static/blog_export.csv')

def photo_handler(img_name,folder):
    img_extensions =  ["JPG","JPEG","PNG","GIF"]
    upl_img_ext= img_name.split('.')[1]
    if(upl_img_ext.upper() in img_extensions):
        dest_path='static/'+folder+'/'+img_name
    return dest_path

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    fname=request.form.get('fname')
    lname=request.form.get('lname')
    e_mail=request.form.get('email')
    u_name=request.form.get('uname')
    pas= request.form.get('passwd')
    pro_desc = request.form.get('bio')
    img_= request.files.get('profilePicture')
    user = User.query.filter_by(email=e_mail).first()

    if user is None:
        user = User.query.filter_by(username=u_name).first()
        if user is None:
            hashed_pw = generate_password_hash(pas)
            if img_.filename is None:
                dest_path=f'../static/uploads/default.png'
            else:
                dest_path=photo_handler(img_.filename,'uploads')
                img_.save(dest_path)
                dest_path=f'../static/uploads/{img_.filename}'
            key=''.join(secrets.choice(string.ascii_uppercase + string.digits) for i in range(256))
            insert_user=User(username=u_name,first_name=fname,last_name=lname,email=e_mail,password=hashed_pw,
                             photo=dest_path,profile_description=pro_desc,active=True,fs_uniquifier=key)
            try:
                db.session.add(insert_user)
                db.session.commit()
                return jsonify({'Status':"Success",'msg':"User Registered Successfully"})
            except:
                db.session.rollback()
                return jsonify({'Status':"Failed",'msg':"Database insertion failed. Try Again !"}) 
        else:
            return jsonify({'Status':"Failed",'msg':"Username already exists"})
    else:
            return jsonify({'Status':"Failed",'msg':"Email already exists"})


@app.route("/", methods=["GET","POST"])
def index():
    return render_template('index.html')

@app.route("/logintest", methods=["GET","POST"])
def login():
    login_data=request.get_json()
    if "@" in login_data.get('login_id'):
        user= User.query.filter_by(email=login_data.get('login_id')).first()
    else:
        user= User.query.filter_by(username=login_data.get('login_id')).first()
    if user is not None:
        if user.verify_password(login_data.get('password')):
            #u = user_datastore.get_user(user.email)
            login_user(user)
            session['username']=user.username
            if request.args.get('include_auth_token'):
                auth_token = current_user.get_auth_token()
                #return jsonify({'auth_token': auth_token.decode('ascii')})
            #print(auth_token)
            return jsonify({'msg':"Success",'auth_data':user.fs_uniquifier,'data':user.username})
        else:
            return jsonify({'msg':"Failed",'data':"Incorrect Password"})
    else:
        return jsonify({'msg':"Failed",'data':"Not a valid Username or Email"})
    
@app.route('/logoutuser/<string:username>')
@login_required
def logout(username):
    current_user=User.query.filter_by(username=username).first()
    current_user.logout_time = datetime.datetime.now()
    try:
        db.session.add(current_user)
        db.session.commit()
    except:
        db.session.rollback()
        
    session.clear()
    logout_user()
    return jsonify({'msg':'You have been logged out'})

@app.route('/api/current_user/<username>')
@cache.cached(timeout=10)
@login_required
def get_current_user(username):
    current_user=User.query.filter_by(username=username).first()
    tot_blogs= Blog.query.filter_by(author_id=current_user.id).count()
    tot_followers = current_user.followers.filter_by(followed_id=current_user.id).count()
    tot_following = current_user.followed.filter_by(follower_id=current_user.id).count()
    user_data = {
        'id': current_user.id,
        'username': current_user.username,
        'fname': current_user.first_name,
        'lname': current_user.last_name,
        'email': current_user.email,
        'photo': current_user.photo,
        'bio': current_user.profile_description,
        'total_blogs': tot_blogs,
        'total_followers': tot_followers,
        'total_following': tot_following
    }
    return jsonify(user_data)


@app.route("/add_blog/<user_name>",methods=["GET","POST"])
@cache.cached(timeout=50)
@login_required
def add_blog(user_name):
    user = User.query.filter_by(username=user_name).first()
    b_title=request.form.get('blog_title')
    b_cat=request.form.get('blog_category')
    b_text= request.form.get('blog_text')
    b_img = request.files.get('blog_image')
    dest_path=photo_handler(b_img.filename,'blog')
    b_img.save(dest_path)
    dest_path=f'../static/blog/{b_img.filename}'  
    blog=Blog.query.filter_by(blog_title=b_title).first()
    if blog is None:  
        insert_blog=Blog(author_id=user.id,blog_post_time=datetime.datetime.now(),blog_title=b_title,
        blog_category=b_cat,blog_text=b_text,blog_img=dest_path,users=user)
        try:
            db.session.add(insert_blog)
            db.session.commit()
            return jsonify({'Status':"Success",'msg':"Blog added Successfully"})
        except exc.IntegrityError:
            return jsonify({'Status':"Fail",'msg':"Database insertion failed please try again!!!!"})
    else:
        return jsonify({'Status':"Fail",'msg':"Blog title already exsists!!!"})

@app.route("/get_blog/<int:blog_id>",methods=["GET"])
@login_required
def get_blog(blog_id):
    b_dict={}
    b= Blog.query.filter_by(blog_id=blog_id).first()
    
    b_dict['blog_title']=b.blog_title
    b_dict['blog_category']= b.blog_category
    b_dict['blog_text']=b.blog_text
    b_dict['blog_img']=b.blog_img
    return jsonify(b_dict)
        
@app.route("/edit_blog/<int:blog_id>",methods=["GET","POST"])
@login_required
def edit_blog(blog_id):
    blog=Blog.query.filter_by(blog_id=blog_id).first()
    b_title=request.form.get('blog_title')
    b_cat=request.form.get('blog_category')
    b_text= request.form.get('blog_text')
    b_img = request.files.get('blog_image')
    if b_title != blog.blog_title:
        blog.blog_title=b_title
    if b_cat != blog.blog_category:
        blog.blog_category= b_cat
    if b_text != blog.blog_text:
        blog.blog_text=b_text
    if b_img is not None:
        dest_path=photo_handler(b_img.filename,'blog')
        b_img.save(dest_path)
        dest_path=f'../static/blog/{b_img.filename}'
        blog.blog_img=dest_path    
    try:
        db.session.add(blog)
        db.session.commit()
        return jsonify({'Status':'Success','msg':'Blog edited successfully !!!!!'})
    except exc.IntegrityError:
        err = "Error"
        return jsonify({'Status':'Fail','msg':'Blog edit was unsuccessful, try again!!!!!'})
    
    
@app.route("/delete_blog/<int:blog_id>", methods=["GET","POST"])
@login_required
def delete_blog(blog_id):
    blog = Blog.query.filter_by(blog_id=blog_id).first()
    try:
        db.session.delete(blog)
        db.session.commit()
        return jsonify({'Status':'Success','msg':'Blog deleted Successfully!!!!'})
    except: 
        db.session.rollback()
        return jsonify({'Status':'Fail','msg':'Blog was not deleted, please try again !!!!'})

@app.route("/like_blog/<username>/<int:blog_id>", methods=['POST'])
@login_required
def like(username,blog_id):
    current_user=User.query.filter_by(username=username).first()
    blog = Blog.query.filter_by(blog_id=blog_id).first()
    like = Like.query.filter_by(user_id=current_user.id, blog_id=blog_id).first()
    if not blog:
        return jsonify({'error': 'Blog does not exist.'}, 400)
    elif like:
        db.session.delete(like)
        db.session.commit()
    else:
        like = Like(user_id=current_user.id, blog_id=blog_id,blogs=blog)
        db.session.add(like)
        db.session.commit()

    return jsonify({"liked": len(blog.liked), "liked_user": current_user.id in map(lambda x: x.user_id, blog.liked)})

@app.route("/add_comment/<username>/<int:blog_id>", methods=["POST"])
@login_required
def add_comment(username,blog_id):
    data=request.get_json()
    current_user=User.query.filter_by(username=username).first()
    blog= Blog.query.filter_by(blog_id=blog_id).first()
    comment=Comment(user_id=current_user.id,blog_id=blog_id,comment_text=data.get('comment_text'),comment_time=datetime.datetime.now(),blogs=blog)
    print(comment)
    try:
        db.session.add(comment)
        db.session.commit()
        return jsonify({"Status":"Success","msg":"Comment added successfully"})
    except SQLAlchemyError as e:
        print(e)
        return jsonify({"Status":"Fail","msg":"Comment could not be added, please try again !!!"})


@app.route("/delete_comment/<int:comment_id>", methods=["GET","POST"])
@login_required
def delete_comment(comment_id):
    comment= Comment.query.filter_by(comment_id=comment_id).first()
    
    try:
        db.session.delete(comment)
        db.session.commit()
    except:
        db.session.rollback()
        flash('error')
    
    return jsonify("Comment deleted successfully")

@app.route("/user_search/<username>/<search>", methods=["GET"])
@cache.cached(timeout=50)
@login_required
def user_search(username,search):
    all_search=[]
    search_nm="%{}%".format(search)
    if "@" in search_nm:
        result1= User.query.filter(email.like(search_nm)).first()
        result2= User.query.filter(username.like(search_nm)).first()
        if result1 is not None and result2 is not None:
            
    else:
        results= User.query.filter(or_(User.username.like(search_nm),User.first_name.like(search_nm),User.last_name.like(search_nm))).all()
    for i in results:
        r_dict={}
        if i.username != username:
            r_dict['fname']=i.first_name
            r_dict['lname']=i.last_name
            r_dict['username']= i.username
            r_dict['photo']= i.photo
            all_search.append(r_dict)
    
    return jsonify(all_search)


@app.route("/connection_list/<username>", methods=["GET"])
@cache.cached(timeout=50)
@login_required
def connection_list(username):
    current_user=User.query.filter_by(username=username).first()
    f=current_user.followers.filter_by(followed_id=current_user.id).all()
    f1=current_user.followed.filter_by(follower_id=current_user.id).all()
    follower_lst=[]
    following_lst=[]
    
    for i in f:
        temp={}
        temp['follower_username']=i.follower.username
        temp['follower_fname']=i.follower.first_name
        temp['follower_lname']=i.follower.last_name
        temp['follower_photo']=i.follower.photo
        temp['following_stat']=current_user.is_following(i.follower)
        print(current_user.is_following(i.follower))
        follower_lst.append(temp)
    temp={}   
    for i in f1:
        temp={}
        temp['following_username']=i.followed.username
        temp['following_fname']=i.followed.first_name
        temp['following_lname']=i.followed.last_name
        temp['following_photo']=i.followed.photo
        temp['followed_stat']=current_user.is_followed_by(i.followed)
        following_lst.append(temp)
    
    return jsonify({'fow':follower_lst,'fow1':following_lst})


@app.route('/following/<string:username1>/<string:username2>', methods=['GET', 'POST'])
@login_required
def follow(username1,username2):
    user1=User.query.filter_by(username=username1).first()
    user = User.query.filter_by(username=username2).first()

    if user1.followed.filter_by(followed_id=user.id).first() is None:
        f = Follow(follower=user1, followed=user, follow_time=datetime.datetime.now())
        db.session.add(f)
        db.session.commit()
    return jsonify({'Status':'Success','msg':'You have started following the user now !!!!'}) 


@app.route('/followers/<string:username1>/<string:username2>', methods=['GET', 'POST'])
@login_required
def unfollow(username1,username2):
    user1=User.query.filter_by(username=username1).first()
    user = User.query.filter_by(username=username2).first()
    f = user1.followed.filter_by(followed_id=user.id).first()
    if f:
        db.session.delete(f)
        db.session.commit()
    return jsonify({'Status':'Success','msg':'You have unfollowed the user successfully !!!!'})



        
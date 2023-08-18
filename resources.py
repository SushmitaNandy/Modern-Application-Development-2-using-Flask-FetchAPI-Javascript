from flask_restful import Resource,Api,fields,marshal_with,reqparse,request
from application.database import *
from application.models import *
from werkzeug.exceptions import HTTPException
from flask import make_response,jsonify
import datetime
from flask_security import login_required,logout_user, auth_required
from flask_cors import CORS
from flask import current_app as app

api=Api()


class DuplicationError(HTTPException):
    def __init__(self, status_code, mess):
        self.response = make_response(mess, status_code)

class NotFoundError(HTTPException):
    def __init__(self, status_code, mess):
        self.response = make_response(mess, status_code)

create_user_parser = reqparse.RequestParser()
create_user_parser.add_argument('username')


class NewsFeedAPI(Resource):
    
    def __init__(self):
        self.res= None

    def datetime_handler(self,now,date_created):
        self.res= "1 second ago"
        if (now - date_created).days == 1:
            self.res = str((now - date_created).days) + " day ago"

        elif (now - date_created).days > 1:
            self.res = str((now - date_created).days) + " days ago"

        elif (now - date_created).total_seconds() / 3600 == 1:
            self.res = str(((now - date_created).days * 24 + (now- date_created).seconds) // 3600) + " hour ago" 

        elif (now - date_created).total_seconds() / 3600 > 1:
            self.res = str(((now - date_created).days * 24 + (now - date_created).seconds) // 3600) + " hours ago"
                
        elif ((now - date_created).total_seconds() / 3600 < 1) and ((now - date_created).seconds % 3600 // 60 >= 1) :
            self.res = str((now - date_created).seconds % 3600 // 60) + " minutes ago"

        elif ((now - date_created).seconds % 3600 // 60 < 1) and ((now - date_created).seconds % 60 > 0) :
            self.res = str((now - date_created).seconds % 60) + " seconds ago"
    
    @login_required
    # @auth_required('token')
    def get(self,username):
        all_blogs=[]
        # token=get_jwt_identity()
        current_user=User.query.filter_by(username=username).first()
        blogs= current_user.followed_posts().all()
        #print(current_user.to_dict())
        for b in blogs:
            all_comments=[]
            dblog={}
            dblog['blog_id'] = b.blog_id
            dblog['blog_title']=b.blog_title
            dblog['author_username']= b.users.username
            dblog['author_fname']= b.users.first_name
            dblog['author_lname']= b.users.last_name
            self.datetime_handler(datetime.datetime.now(),b.blog_post_time)
            dblog['blog_post_time']= self.res
            dblog['blog_title']=b.blog_title
            dblog['blog_category']= b.blog_category
            dblog['blog_text']= b.blog_text
            dblog['blog_img']= b.blog_img
            
            comments = Comment.query.filter_by(blog_id=b.blog_id).all()
            for c in comments:
                com={}
                com['comment_id']= c.comment_id
                com['com_author_fname'] = c.users.first_name
                com['com_author_lname'] = c.users.last_name
                com['com_author_username'] = c.users.username
                com['com_author_photo'] = c.users.photo
                self.datetime_handler(datetime.datetime.now(),c.comment_time)
                com['comment_time'] = self.res
                com['comment_text']= c.comment_text
                all_comments.append(com)
            dblog['blog_comments'] = all_comments #list of dict of comments for particular blog
            
            likes = Like.query.filter_by(blog_id=b.blog_id).all()
            like_cnt=0
            for l in likes:
                if l.user_id == current_user.id:
                    dblog['user_liked']= True
                like_cnt+=1
            dblog['blog_likes'] = like_cnt
            all_blogs.append(dblog)


        return {"blogs":[all_blogs],"username":current_user.username,"fname":current_user.first_name,"lname":current_user.last_name}

api.add_resource(NewsFeedAPI, "/api/newsfeed", "/api/newsfeed/<string:username>")


class UserBlogAPI(Resource):
    
    def __init__(self):
        self.res= None

    def datetime_handler(self,now,date_created):
        self.res= "1 second ago"
        if (now - date_created).days == 1:
            self.res = str((now - date_created).days) + " day ago"

        elif (now - date_created).days > 1:
            self.res = str((now - date_created).days) + " days ago"

        elif (now - date_created).total_seconds() / 3600 == 1:
            self.res = str(((now - date_created).days * 24 + (now- date_created).seconds) // 3600) + " hour ago" 

        elif (now - date_created).total_seconds() / 3600 > 1:
            self.res = str(((now - date_created).days * 24 + (now - date_created).seconds) // 3600) + " hours ago"
                
        elif ((now - date_created).total_seconds() / 3600 < 1) and ((now - date_created).seconds % 3600 // 60 >= 1) :
            self.res = str((now - date_created).seconds % 3600 // 60) + " minutes ago"

        elif ((now - date_created).seconds % 3600 // 60 < 1) and ((now - date_created).seconds % 60 > 0) :
            self.res = str((now - date_created).seconds % 60) + " seconds ago"
    
    @login_required
    def get(self,username):
        all_blogs=[]
        #token=get_jwt_identity()
        user=User.query.filter_by(username=username).first()
        tot_blogs= Blog.query.filter_by(author_id=user.id).count()
        tot_followers = user.followers.filter_by(followed_id=user.id).count()
        tot_following = user.followed.filter_by(follower_id=user.id).count()
        tot_followers_lst = user.followers.filter_by(followed_id=user.id).all()
        id_lst=[]
        for i in tot_followers_lst:
            id_lst.append(i.follower_id)
        user_data = {
        'id': user.id,
        'username': user.username,
        'fname': user.first_name,
        'lname': user.last_name,
        'email': user.email,
        'photo': user.photo,
        'bio': user.profile_description,
        'total_blogs': tot_blogs,
        'total_followers': tot_followers,
        'total_following': tot_following,
        'fow_id_lst': id_lst
        }
        blogs= Blog.query.filter_by(author_id=user.id).order_by(Blog.blog_post_time.desc()).all()
        
        for b in blogs:
            all_comments=[]
            dblog={}
            dblog['blog_id'] = b.blog_id
            dblog['blog_title']=b.blog_title
            dblog['author_username']= b.users.username
            dblog['author_fname']= b.users.first_name
            dblog['author_lname']= b.users.last_name
            self.datetime_handler(datetime.datetime.now(),b.blog_post_time)
            dblog['blog_post_time']= self.res
            dblog['blog_title']=b.blog_title
            dblog['blog_category']= b.blog_category
            dblog['blog_text']= b.blog_text
            dblog['blog_img']= b.blog_img
            
            comments = Comment.query.filter_by(blog_id=b.blog_id).all()
            for c in comments:
                com={}
                com['comment_id']= c.comment_id
                com['com_author_fname'] = c.users.first_name
                com['com_author_lname'] = c.users.last_name
                com['com_author_username'] = c.users.username
                com['com_author_photo'] = c.users.photo
                self.datetime_handler(datetime.datetime.now(),c.comment_time)
                com['comment_time'] = self.res
                com['comment_text']= c.comment_text
                all_comments.append(com)
            dblog['blog_comments'] = all_comments #list of dict of comments for particular blog
            
            likes = Like.query.filter_by(blog_id=b.blog_id).all()
            like_cnt=0
            for l in likes:
                if l.user_id == user.id:
                    dblog['user_liked']= True
                like_cnt+=1
            dblog['blog_likes'] = like_cnt
            all_blogs.append(dblog)
        data=[]
        data.append(user.username)
        data.append(all_blogs)
        #data.append(token) return {"blogs":[all_blogs],"username":current_user.username}

        return {"blogs":[all_blogs],"user_data":user_data}

api.add_resource(UserBlogAPI, "/api/my_profile", "/api/my_profile/<string:username>")






resource_fields = {
    'id':   fields.Integer,
    'first_name':  fields.String,
    'last_name':  fields.String,
    'email':     fields.String
}

class UserApi(Resource):
    @marshal_with(resource_fields)
    def get(self,username):
        user=User.query.filter_by(username=username).first()
        if user is None:
            raise NotFoundError(404, "User not found")
        return user
    
    @marshal_with(resource_fields)
    def put(self):
        if "Exsisting Username" in request.form:
            uname=request.form['Exsisting Username']
            user= User.query.filter_by(username=uname).first()
            if request.form['New First Name']:
                user.first_name=request.form['New First Name']
            if request.form['New Last Name']:
                user.last_name=request.form['New Last Name']
            if request.form['New Password']:
                user.password=generate_password_hash(request.form['New Password'])
            db.session.add(user)
            db.session.commit()
        return user
    
    @marshal_with(resource_fields)
    def post(self):
        if "Username" in request.form:
            uname=request.form['Username']
            user= User.query.filter_by(username=uname).first()
            if user is not None:
                raise DuplicationError(409, "Username already exists")
            email_=request.form['Email']
            user1= User.query.filter_by(email=email_).first()
            if user1 is not None:
                raise DuplicationError(409, "Email already exists")
            fname=request.form['First Name']
            lname=request.form['Last Name']
            passwd=generate_password_hash(request.form['Password']) 
            bio=request.form['Profile Description']

            insert_user=User(username=uname,first_name=fname,last_name=lname,email=email_,password=passwd,
                        profile_description=bio)
            db.session.add(insert_user)
            db.session.commit()
            return insert_user


api.add_resource(UserApi,"/api/user/<username>", "/api/user")



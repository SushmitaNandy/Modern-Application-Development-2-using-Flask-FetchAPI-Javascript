from .database import db
from flask_security import UserMixin,RoleMixin
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(),
                                 db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(),
                                 db.ForeignKey('role.id')))


class Follow(db.Model):
    __tablename__ = 'follows'
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'),primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'),primary_key=True)
    follow_time = db.Column(db.DateTime, default=datetime.datetime.now())

class User(db.Model,UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    photo = db.Column(db.String)
    profile_description = db.Column(db.String)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    logout_time = db.Column(db.DateTime, default=datetime.datetime.now())
    posts = db.relationship('Blog',backref='users',cascade='all, delete-orphan')
    commented = db.relationship('Comment',backref='users',cascade='all, delete-orphan')


    followed = db.relationship('Follow',foreign_keys=[Follow.follower_id],backref=db.backref('follower', lazy='joined'),lazy='dynamic',
                                        cascade='all, delete-orphan')
    followers = db.relationship('Follow',foreign_keys=[Follow.followed_id],backref=db.backref('followed', lazy='joined'),lazy='dynamic',
                            cascade='all, delete-orphan')

    def is_authenticated(self):
        return True

    

    def verify_password(self,password):
        if check_password_hash(self.password,password):
            return True
        return False

    def follow(self, user):
        if not self.is_following(user):
            f = Follow(follower=self, followed=user)
            db.session.add(f)

    def unfollow(self, user):
        f = self.followed.filter_by(followed_id=user.id).first()
        if f:
            db.session.delete(f)

    def is_following(self, user):
        return self.followed.filter_by(followed_id=user.id).first() is not None

    def is_followed_by(self,user):
        return self.followers.filter_by(follower_id=user.id).first() is not None    

    def followed_posts(self):
        return Blog.query.join(Follow, Follow.followed_id == Blog.author_id).filter(Follow.follower_id == self.id).order_by(Blog.blog_post_time.desc())


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Blog(db.Model):
    __tablename__ = 'blogs'
    blog_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    blog_post_time =  db.Column (db.DateTime, nullable=False )   
    blog_title = db.Column (db.String, nullable=False, unique=True)
    blog_category = db.Column (db.String, nullable=False)
    blog_text = db.Column (db.String, nullable=False)
    blog_img = db.Column (db.String,nullable=False)
    liked = db.relationship('Like',backref='blogs',cascade='all, delete-orphan')
    commented = db.relationship('Comment',backref='blogs',cascade='all, delete-orphan')
    


class Like(db.Model):
    __tablename__ = 'likes'
    like_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blogs.blog_id', ondelete="CASCADE"), nullable=False)
    like_time = db.Column(db.DateTime,default=datetime.datetime.now())


class Comment(db.Model):
    __tablename__ = 'comments'
    comment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blogs.blog_id', ondelete="CASCADE"), nullable=False)
    comment_text = db.Column(db.String, nullable=False)
    comment_time = db.Column(db.DateTime)    
    
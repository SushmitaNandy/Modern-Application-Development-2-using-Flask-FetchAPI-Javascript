from datetime import timedelta
import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config():
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY ='highly secrured'
    SECURITY_PASSWORD_SALT = 'salt'
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    SECURITY_PASSWORD_HASH= 'bcrypt'
    #SESSION_KEYS = {"_user_id","_remember","_remember_seconds","_id","_fresh","next",}
    CELERY_BROKER_URL='redis://localhost:6379/1'
    CELERY_RESULT_BACKEND='redis://localhost:6379/2'
    CELERY_TASK_TRACK_STARTED = True
    #CELERY_IGNORE_RESULT = False
    

class LocalDevelopmentConfig(Config):
    SQLITE_DB_DIR = os.path.join(basedir, "../db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "blogdb_dummy.sqlite3")
    DEBUG = True
    
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = "***********@ds.study.iitm.ac.in"
    with open("password.txt", "r") as file:
        MAIL_PASSWORD = file.read()
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 300
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 9 
    #CELERY_TASK_TRACK_STARTED = True 

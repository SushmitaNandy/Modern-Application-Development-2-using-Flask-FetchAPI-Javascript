from application.workers import celery
from application.models import *
import time, csv
from flask_mail import Mail,Message
from flask import current_app as app
from jinja2 import Template
from celery.schedules import crontab
from flask import render_template
from datetime import datetime
import pandas as pd
mail=Mail()
from matplotlib import pyplot as plt
import math
import numpy as np

@celery.task()
def create_export(blogID):
    time.sleep(5)
    blog=Blog.query.filter_by(blog_id=blogID).first()
    blog_title=blog.blog_title
    blog_author= blog.users.first_name + ' ' + blog.users.last_name
    blog_time= blog.blog_post_time
    blog_cat= blog.blog_category
    blog_text = blog.blog_text
    blog_likes = Like.query.filter_by(blog_id=blogID).count()
    blog_comment = Comment.query.filter_by(blog_id=blogID).count()
    head=['Title','Author','Blog Post Time','Category','Blog Text','No. of Likes','No. of Comment']
    row=[blog_title,blog_author,blog_time,blog_cat,blog_text,blog_likes,blog_comment]
    print(head)
    print()
    with open('./static/blog_export.csv','w') as file:
        csvwriter = csv.writer(file)
        csvwriter.writerow(head)
        csvwriter.writerow(row)
    return "Blog exporting started......"

def format_message(template_file, name, time, new_comments,new_followers):
    with open(template_file) as file_:
        template = Template(file_.read())
        return template.render(name = name, time=time, new_comments = new_comments,new_followers = new_followers)

def mail_template(data):
    email_msg = Message(subject="Daily Login Reminder to Bloglite",sender=app.config.get("MAIL_USERNAME"),recipients=[data['email']])
    message = format_message("./templates/daily_email.html",data['name'],data['last_login'],data['new_comments'],data['new_followers'])
    email_msg.html = message
    # msg.body = message
    mail.send(email_msg)
    return

@celery.task()    
def daily_login_reminder():
    user=User.query.all()
    for u in user:
        c_count=0
        f_count=0
        if u.logout_time.day < datetime.now().day:
            data={}
            name=u.first_name+' '+u.last_name
            email=u.email
            data['last_login']= u.logout_time.strftime("%d/%m/%Y %H:%M:%S")
            data['name']=name
            data['email']=email
            
            #need to count new comments posted after user logged off
            blog= Blog.query.filter_by(author_id=u.id).all()
            for b in blog:
                comment=Comment.query.filter_by(blog_id=b.blog_id).all()
                for c in comment:
                    if c.comment_time > u.logout_time:
                        c_count+=1
            data['new_comments']=c_count
            
            #need to count new followers who started following the user after logged off
            new_followers=Follow.query.filter_by(followed_id=u.id).all()
            for nf in new_followers:
                if nf.follow_time > u.logout_time:
                    f_count+=1
            data['new_followers']=f_count
                
            #calling function to send notification mail
            mail_template(data)
            
            
            

    
    
@celery.task()
def blog_analytics(username):
    current_user=User.query.filter_by(username=username).first()
    blog=Blog.query.filter_by(author_id=current_user.id).all()
    blog_dict={}
    title=[]
    category=[]
    date_created=[]
    total_likes=[]
    total_comments=[]
    df=pd.DataFrame(columns=['title','total_likes','total_comments'])
    for i in blog:
        title.append(i.blog_title)
        category.append(i.blog_category)
        date_created.append(i.blog_post_time)
        l = Like.query.filter_by(blog_id=i.blog_id).count()
        total_likes.append(l)
        c = Comment.query.filter_by(blog_id=i.blog_id).count()
        total_comments.append(c)
    blog_dict={'title':title,'total_likes':total_likes,'total_comments':total_comments}   
       
    df = pd.DataFrame(blog_dict)
    
    x_data = title
    y_data = {
        'Total Likes': total_likes,
        'Total Comments': total_comments
    }

    x = np.arange(len(x_data))  # the label locations
    width = 0.25  # the width of the bars
    multiplier = 0

    fig, ax = plt.subplots(layout='constrained')

    for attribute, measurement in y_data.items():
        offset = width * multiplier
        rects = ax.bar(x + offset, measurement, width, label=attribute)
        ax.bar_label(rects, padding=3)
        multiplier += 1

    # Add some text for labels, title and custom x-axis tick labels, etc.
    ax.set_ylabel('Count')
    ax.set_title('Blog analytics')
    ax.set_xticks(x + width, x_data)
    ax.legend(loc='upper left', ncols=2)
    ax.set_ylim(0, 10)
    plt.savefig('./static/stats/analysis_'+username+'.png')
    
    
    plt.close()
    
    return "Image is ready"


def format_message1(template_file, name, time,df,blog_dict):
    with open(template_file) as file_:
        template = Template(file_.read())
        return template.render(name = name, time=time, df = df,blog_dict = blog_dict)

def monthly_mail_template(data,df,blog_dict):
    email_msg = Message(subject="Monthly Bloglite Summary",sender=app.config.get("MAIL_USERNAME"),recipients=[data['email']])
    message = format_message1("./templates/monthly_email.html",data['name'],data['last_login'],df,blog_dict)
    email_msg.html = message
    # msg.body = message
    mail.send(email_msg)
    return




@celery.task()    
def monthly_reminder():
    #user=User.query().all()
    user=User.query.filter_by(username='snandy5425').all() #hardcoded as all email in database are not real
    for u in user:
        
        
        data={}
        name=u.first_name+' '+u.last_name
        email=u.email
        data['last_login']= u.logout_time.strftime("%d/%m/%Y %H:%M:%S")
        data['name']=name
        data['email']=email
        
        
        blog= Blog.query.filter_by(author_id=u.id).all()
        blog_dict={}
        df=pd.DataFrame(columns=['title','category','total_likes','total_comments'])
        for b in blog:
            
            title=[]
            category=[]
            date_created=[]
            total_likes=[]
            total_comments=[]
            title.append(b.blog_title)
            category.append(b.blog_category)
            date_created.append(b.blog_post_time)
            l = Like.query.filter_by(blog_id=b.blog_id).count()
            total_likes.append(l)
            c = Comment.query.filter_by(blog_id=b.blog_id).count()
            total_comments.append(c)
            
        blog_dict={'title':title,'total_likes':total_likes,'category':category,'total_comments':total_comments}
        df = pd.DataFrame(blog_dict)
        
        # x_data = title
        # y_data = {
        #     'Total Likes': total_likes,
        #     'Total Comments': total_comments
        # }
        
        # x = np.arange(len(x_data))  # the label locations
        # width = 0.25  # the width of the bars
        # multiplier = 0

        # fig, ax = plt.subplots(layout='constrained')

        # for attribute, measurement in y_data.items():
        #     offset = width * multiplier
        #     rects = ax.bar(x + offset, measurement, width, label=attribute)
        #     ax.bar_label(rects, padding=3)
        #     multiplier += 1

        # # Add some text for labels, title and custom x-axis tick labels, etc.
        # ax.set_ylabel('Count')
        # ax.set_title('Blog analytics')
        # ax.set_xticks(x + width, x_data)
        # ax.legend(loc='upper left', ncols=2)
        # ax.set_ylim(0, 10)
        # filename='./static/stats/analysis_'+u.username+'.png'
        # plt.savefig(filename)
        
        
        # plt.close()
            
        #calling function to send notification mail
        monthly_mail_template(data,df,blog_dict)
    
    
@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    
    #sender.add_periodic_task(crontab(minute=0,hour=18), daily_login_reminder.s(), name='Daily Login Reminder at 6PM...')
    #sender.add_periodic_task(crontab(0, 0, day_of_month='2'), monthly_reminder.s(), name='Monthly Reminder...')
    
    sender.add_periodic_task(crontab(minute='*/10'), daily_login_reminder.s(), name='Daily Login Reminder at 6PM...')
    sender.add_periodic_task(crontab(minute='*/2'), monthly_reminder.s(), name='Monthly Reminder...')
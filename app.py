import os
from flask import Flask
from application import config
from application.config import LocalDevelopmentConfig
from application.database import db
from resources import *
from flask_cors import CORS
from security import user_datastore, sec
from flask_mail import Mail

from celery.result import AsyncResult
from application.models import *
import application.workers as workers
#from application.workers import celery
from application import task
from flask_caching import Cache
import time

app = None
celery= None


def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    sec.init_app(app, user_datastore)
    mail=Mail(app)
    app.app_context().push()
    #Create Celery
    celery = workers.celery
    celery.conf.update(
      broker_url = app.config["CELERY_BROKER_URL"],
      result_backend = app.config["CELERY_RESULT_BACKEND"]
      #task_track_started = app.config["CELERY_TASK_TRACK_STARTED"]
    )
    celery.Task = workers.ContextTask
    app.app_context().push()
    cache = Cache(app)
    app.app_context().push()
    return app, celery, mail, cache



app, celery, mail, cache = create_app()
CORS(app)
api.init_app(app)





@app.route('/trigger-celery-job/<int:blogID>',methods=['GET','POST'])
def trigger_job(blogID):
    a= task.create_export.delay(blogID)
    res= a.wait()
    return {
        'task_id': a.id,
        "task_state": a.state,
        "task_result": a.result
    }

@app.route('/get_plot/<username>',methods=['GET','POST'])
def get_analytics_job(username):
    
    r= task.blog_analytics.delay(username)
    res= r.wait()
    return {
        'task_id': r.id,
        "task_state": r.state,
        "task_result": r.result
    }
    
@app.route('/watch-task/<task_id>',methods=['GET','POST'])
def watch_task(task_id):
    result = AsyncResult(task_id, app=celery)
    while True:
        status = result.status
        print(status)
        if status == 'SUCCESS':
            # Task is complete, return the result
            return jsonify({'status': status, 'result': result.result})
        elif status == 'FAILURE':
            # Task failed, return the traceback
            return jsonify({'status': status, 'traceback': result.traceback})
        else:
            # Task is still running, wait for 1 second and check again
            time.sleep(1)

# Import all the controllers so they are loaded
from application.controllers import *

if __name__ == '__main__':
  # Run the Flask app
  db.create_all()
  #login_manager.init_app(app)
  app.run(host='0.0.0.0',port=8080)

# Local Development Run
- Open Linux Terminal and execute the following command to create the virtual environment "virtualenv .env"
- Enter into the virtual environment using command: "source .env/bin/activate"
- Install the required python libraries usind command: "pip install -r requirements.txt"
- Run the command "python app.py" to start the application
- For Celery Workers we need to open new Linux terminal and source our virtual env 
    and "celery -A app.celery worker --loglevel INFO"
- For Celery Beat we need to open new Linux terminal and source our virtual env 
    and "celery -A app.celery beat --loglevel INFO"
- For Redis server we need to open new Linux terminal and source our virtual env 
    and "redis-server"

# Folder Structure

- `db_directory` has the sqlite DB. We need to adjust the path in ``application/config.py` as I have done in config.py file. 
- `application` is where our application code is placed
- `static` - default `static` files folder. It serves at '/static' path and it is used to store images, css files. Static folder also contents different Components defined using Vue js.
- `templates` - Default flask templates folder


.
└── Project
    ├── application
    │   ├── task.py
    │   ├── config.py
    │   ├── controllers.py
    │   ├── database.py
    │   ├── workers.py
    │   └── models.py
    ├── db_directory
    │   └── blogdb_dummy.sqlite3
    ├── docs
    │   └── report.pdf
    ├── static (contains images and css files and Vue js Components files)
    ├── templates (contains all html files)
    ├── app.py
    ├── resources.py
    ├── security.py
    ├── readme.md
    └── requirements.txt






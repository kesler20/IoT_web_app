from datetime import timedelta
from flask import Flask, request, session
import os
from os import path as ps
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
import datetime

ROOT_DIR = os.path.dirname(os.getcwd())
app = Flask(
    __name__, 
    template_folder=ps.join(ROOT_DIR,'IoT_web_app', 'templates'),
    static_folder=ps.join(ROOT_DIR,'IoT_web_app', 'static')
)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'top secret!'
app.secret_key = 'password'
app.permanent_session_lifetime = timedelta(minutes=50)
db = SQLAlchemy(app)

#------------------------------ BACKEND FUNCTIONALITY-----------------------------------------------
      
def init_session_(number_of_attributes, attribute_values):
    for i in range(number_of_attributes):
        session[attribute_values[i]] = request.form[attribute_values[i]]     

def check_database_column(column_objct):
    db.create_all()
    datasess = db.session.query(column_objct).all()
    print(datasess)

# -------------------------------- DATABASE MODEL OBJECTS----------------------------------------------
class UserAccount(db.Model):
    __tablename__ = 'user_account'
    participant_id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String(80), nullable=False, default=f'username{participant_id}', unique=True)
    post = relationship('Post', backref='author', lazy=True)

    def __repr__(self):
        return f'''
        UserAccount(
                username : {self.username},
                participant id : {self.participant_id},
                session activity: {self.post}
            )
        '''
    
class Post(db.Model):

    session_id = Column(Integer, primary_key=True, nullable=False)
    content = Column(String(80), nullable=False, default='start session')
    user_id = Column(Integer, ForeignKey('user_account.participant_id'), nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow())

    def __repr__(self):
        return f'''
            Post(
                date : {self.date},
                session id : {self.session_id},
                content: {self.content},
                author : {self.user_id}
            )
        '''
from flask import redirect, url_for, render_template, request, session, send_from_directory, flash
import os
from database_ import *

#------------------------------------FLASK APPLICATION-------------------------------------------------

@app.route("/")
def render_home_page():
    return render_template('index.html')

@app.route("/<page>/")
def render_page(page):
    if page == 'favicon.ico':
        pass
    else:
        return render_template(r'{}.html'.format(page))


#----------------------------------- COMMAND TO START-----------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5500)
    db.create_all()
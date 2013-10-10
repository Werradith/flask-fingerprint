from flask import Flask, render_template
from flask.ext.assets import Environment, Bundle
from flask.ext.util_js import FlaskUtilJs
app = Flask(__name__)
assets = Environment(app)
fujs = FlaskUtilJs(app)
@app.context_processor
def inject_fujs():
    return dict(fujs=fujs)

def generate_uid():
    import hashlib, uuid
    return hashlib.md5(hex(uuid.uuid4().time)[2:-1]).hexdigest()

@app.route('/')
def index():
    return render_template("index.html")

def set_fp_callback(fp, uid, fp_hashes, geoip_result):
    return render_template("fp_result.html", fp=fp, fp_hashes=fp_hashes, gi=geoip_result, uid=uid, new_uid = uid or generate_uid())

from flask_fingerprint import fingerprint
app.register_blueprint(fingerprint)
js = Bundle('jquery-2.0.3.min.js', 'jsfunctions.js', output='gen/main.js', filters='yui_js')
assets.register('js_main', js)
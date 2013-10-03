# coding=utf-8
from flask import Flask, request, render_template, jsonify
from flask.ext.assets import Environment, Bundle
from flask_util_js import FlaskUtilJs
import os
app = Flask(__name__)
app.debug = True
assets_env = Environment(app)
fujs = FlaskUtilJs(app)

@app.context_processor
def inject_fujs():
    return dict(fujs=fujs)

@app.route('/get-nickname')
def get_nickname():
    import string, random
    CANDIDATE_CHARS = string.ascii_letters+string.digits  # lowercase and uppercase le
    return u''.join(random.choice(CANDIDATE_CHARS) for _ in range(16))


gi = None
gi_org = None
if os.path.exists('GeoIPCity.dat') and os.path.exists('GeoIPOrg.dat'):
    import pygeoip
    gi = pygeoip.GeoIP('GeoIPCity.dat') # http://rutracker.org/forum/viewtopic.php?t=4210999
    gi_org = pygeoip.GeoIP('GeoIPOrg.dat') # https://thepiratebay.sx/torrent/8521369/

@app.route('/get-my-ip')
def get_my_ip():
    return 'Your IP: ' + request.remote_addr

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        import hashlib
        uid = request.json['user_name']
        #raw = request.json.__repr__()

        acc_hash = hashlib.md5(request.json['mimetypes'].encode('utf-8') + request.json['fonts_all'].encode('utf-8') + request.json['plugins_all'].encode('utf-8')).hexdigest()
        inacc_hash = hashlib.md5(str(request.json['timezone']) + request.json['os'] + request.json['screen']).hexdigest()

        client_ip = request.headers['X-Forwarded-For'] if request.headers.get('X-Forwarded-For') else request.remote_addr
        geoip = gi.record_by_addr(client_ip) if gi else 'Not available'
        geoip_org = gi_org.org_by_addr(client_ip) if gi_org else 'Not available'

        return jsonify(result='Browser hash: %s<br>System hash: %s<br>Evercookie: %s<br>GeoIP: %s<br>ISP: %s' % (acc_hash, inacc_hash, uid, geoip, geoip_org))

    return render_template("index.html")

# On run
deps_js = Bundle('javascript/swfobject.min.js', 'javascript/jquery.min.js', 'javascript/jquery-ui-1.8.16.custom.min.js', 'javascript/jquery.json-2.3.min.js', 'javascript/jquery.flash.js', 'javascript/evercookie/evercookie.js', 'javascript/sha1.js')
fp_js = Bundle('javascript/plugindetect/plugindetect.js', 'javascript/fontdetect.js', 'javascript/fingerprint.js')
assets_env.register('js_fingerprint', Bundle(deps_js, fp_js, filters='yui_js', output='gen/fingerprint.js'))
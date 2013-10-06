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
    import random
    first_names = ['Lindsey', 'Clay', 'Leroy', 'Miles', 'Elmo', 'Shelby', 'Kurt', 'Lionel', 'Diego', 'Efrain', 'Rudy', 'Quintin', 'Elvin', 'Chester', 'Wilbur', 'Kenton', 'Jewell', 'Andrew', 'Dwayne', 'Kelvin']
    last_names = ['Lanoue', 'Cage', 'Londono', 'Mincks', 'Esteban', 'Shambo', 'Kean', 'Lukas', 'Dallman', 'Elsey', 'Ridings', 'Quinones', 'Eisele', 'Chilson', 'Weakley', 'Kreps', 'Joo', 'Aguas', 'Dietz', 'Kantz']

    return u'%s %s' % (random.choice(first_names), random.choice(last_names))


gi = None
gi_org = None
if os.path.exists('GeoIPCity.dat') and os.path.exists('GeoIPOrg.dat'):
    import pygeoip
    gi = pygeoip.GeoIP('GeoIPCity.dat') # http://rutracker.org/forum/viewtopic.php?t=4210999
    gi_org = pygeoip.GeoIP('GeoIPOrg.dat') # https://thepiratebay.sx/torrent/8521369/

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        import hashlib
        fp_hashes = dict()
        geoip_result = dict()

        fp_hashes['browser'] = hashlib.md5(request.json['mimetypes'].encode('utf-8') + request.json['fonts_all'].encode('utf-8') + request.json['navigator_hash'].encode('utf-8')).hexdigest()
        fp_hashes['system'] = hashlib.md5(str(request.json['timezone']) + request.json['os'] + request.json['screen']).hexdigest()
        #fp_hashes['navigator'] = request.json['navigator_hash']
        fp_hashes['browser_hdrs'] = hashlib.md5(request.headers['Accept'] + request.headers['Accept-Language'] + request.headers['Accept-Encoding']).hexdigest()


        geoip_result['client_ip'] = request.headers['X-Forwarded-For'] if request.headers.get('X-Forwarded-For') else request.remote_addr
        geoip_result['city'] = gi.record_by_addr(geoip_result['client_ip']) if gi else None
        geoip_result['org'] = gi_org.org_by_addr(geoip_result['client_ip']) if gi_org else None

        return jsonify(result = render_template('fp_result.html', fp = request.json, fp_hashes = fp_hashes, gi = geoip_result))

    return render_template("index.html")

# On run
deps_js = Bundle('javascript/swfobject.min.js', 'javascript/jquery.min.js', 'javascript/jquery-ui-1.8.16.custom.min.js', 'javascript/jquery.json-2.3.min.js', 'javascript/jquery.flash.js', 'javascript/evercookie/evercookie.js', 'javascript/sha1.js')
fp_js = Bundle('javascript/plugindetect/plugindetect.js', 'javascript/fontdetect.js', 'javascript/fingerprint.js')
assets_env.register('js_fingerprint', Bundle(deps_js, fp_js, filters='yui_js', output='gen/fingerprint.js'))
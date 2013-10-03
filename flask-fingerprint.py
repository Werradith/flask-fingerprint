#!/usr/bin/python
# coding=utf-8
from flask import Flask, send_from_directory, request, render_template, jsonify
from flask.ext.assets import Environment, Bundle
import os
app = Flask(__name__)
app.debug = True
assets_env = Environment(app)

@app.route('/get-nickname')
def get_nickname():
    import string
    import random
    CANDIDATE_CHARS = string.ascii_letters+string.digits  # lowercase and uppercase le
    return u''.join(random.choice(CANDIDATE_CHARS) for _ in range(16))

@app.route('/<path:filename>')
def send_file(filename):
    return send_from_directory('static', filename)

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
        uid = request.json['user_name']
        raw = request.json.__repr__()
        acc_hash = hashlib.md5(request.json['mimetypes'].encode('utf-8') + request.json['fonts_all'].encode('utf-8') + request.json['plugins_all'].encode('utf-8')).hexdigest()
        geoip = gi.record_by_addr(request.remote_addr) if gi else 'Not available'
        geoip_org = gi_org.org_by_addr(request.remote_addr) if gi_org else 'Not available'
        inacc_hash = hashlib.md5(str(request.json['timezone']) + request.json['os'] + request.json['screen']).hexdigest()
        return jsonify(result='Accurate hash: %s<br>Inaccurate hash: %s<br>Evercookie: %s<br>GeoIP: %s<br>ISP: %s' % (acc_hash, inacc_hash, uid, geoip, geoip_org))
    return render_template("index.html")

if __name__ == '__main__':
    deps_js = Bundle('javascript/swfobject.min.js', 'javascript/jquery.min.js', 'javascript/jquery-ui-1.8.16.custom.min.js', 'javascript/jquery.json-2.3.min.js', 'javascript/jquery.flash.js', 'javascript/evercookie/evercookie.js', 'javascript/sha1.js')
    fp_js = Bundle('javascript/plugindetect/plugindetect.js', 'javascript/fontdetect.js', 'javascript/fingerprint.js')
    #css = Bundle('style.css', filters='yui_css', output='get/styles.css')
    #assets_env.register('js_fingerprint_deps', deps_js)
    #assets_env.register('js_fingerprint_fp', fp_js)
    assets_env.register('js_fingerprint', Bundle(deps_js, fp_js, filters='yui_js', output='gen/fingerprint.js'))
    app.run(debug=True, threaded=True, host='0.0.0.0')
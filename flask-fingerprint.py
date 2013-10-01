#!/usr/bin/python
from flask import Flask, send_from_directory, request, render_template, jsonify
from flask.ext.assets import Environment, Bundle
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


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        import hashlib
        uid = request.json['user_name']
        raw = request.json.__repr__()
        acc_hash = hashlib.md5(request.json['mimetypes'].encode('utf-8') + request.json['fonts_all'].encode('utf-8') + request.json['plugins_all'].encode('utf-8')).hexdigest()
        inacc_hash = hashlib.md5(str(request.json['timezone']) + request.json['os'] + request.json['screen']).hexdigest()
        return jsonify(result=raw + '<br><br>Accurate hash: %s<br>Inaccurate hash: %s<br>Evercookie: %s' % (acc_hash, inacc_hash, uid))
    return render_template("index.html")

if __name__ == '__main__':
    deps_js = Bundle('javascript/swfobject.min.js', 'javascript/jquery.min.js', 'javascript/jquery-ui-1.8.16.custom.min.js', 'javascript/jquery.json-2.3.min.js', 'javascript/jquery.flash.js', 'javascript/evercookie/evercookie.js')
    fp_js = Bundle('javascript/general.js', 'javascript/plugindetect/plugindetect.js', 'javascript/fontdetect.js', 'javascript/sha1.js', 'eval/e1.js', 'eval/e2.js', 'eval/e3.js', 'javascript/fingerprint.js')
    #css = Bundle('', filters='cssmin', output='get/styles.css')
    #assets_env.register('js_deps', deps_js)
    #assets_env.register('js_fp', fp_js)
    assets_env.register('js_fingerprint', Bundle(deps_js, fp_js, filters='yui_js', output='gen/fingerprint.js'))
    app.run(debug=True, threaded=True, host='0.0.0.0')
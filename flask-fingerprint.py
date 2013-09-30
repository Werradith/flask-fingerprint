#!/usr/bin/python
from flask import Flask, send_from_directory, request, render_template, jsonify
from flask.ext.assets import Environment, Bundle
app = Flask(__name__)
app.debug = True
assets_env = Environment(app)

@app.route('/get-nickname')
def get_nickname():
    return '' # Stub

@app.route('/<path:filename>')
def send_file(filename):
    return send_from_directory('static', filename)


@app.route('/', methods=['GET', 'POST'])
def index():
    import ssdeep
    if request.method == 'POST':
        fp_data = request.json
        #print fp_data
        fp_hash = ssdeep.hash(fp_data.__repr__())
        return jsonify(fp_hash = fp_hash)
    return render_template("index.html")

if __name__ == '__main__':
    deps_js = Bundle('javascript/swfobject.min.js', 'javascript/jquery.min.js', 'javascript/jquery-ui-1.8.16.custom.min.js', 'javascript/jquery.json-2.3.min.js', 'javascript/jquery.flash.js', 'javascript/evercookie/evercookie.js')
    fp_js = Bundle('javascript/general.js', 'javascript/plugindetect/plugindetect.js', 'javascript/fontdetect.js', 'javascript/sha1.js', 'eval/e1.js', 'eval/e2.js', 'eval/e3.js', 'javascript/fingerprint.js')
    #css = Bundle('', filters='cssmin', output='get/styles.css')
    #assets_env.register('js_deps', deps_js)
    #assets_env.register('js_fp', fp_js)
    assets_env.register('js_all', Bundle(deps_js, fp_js, filters='yui_js', output='gen/scripts.js'))
    app.run(debug=True, threaded=True, host='0.0.0.0')
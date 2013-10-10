# coding=utf-8
from flask import Blueprint, request, jsonify, session
from flask.ext.assets import Environment, Bundle
import os

fingerprint = Blueprint('fingerprint', __name__)
from app import assets

gi = None
gi_org = None
if os.path.exists('GeoIPCity.dat') and os.path.exists('GeoIPOrg.dat'):
    import pygeoip
    gi = pygeoip.GeoIP('GeoIPCity.dat') # http://rutracker.org/forum/viewtopic.php?t=4210999
    gi_org = pygeoip.GeoIP('GeoIPOrg.dat') # https://thepiratebay.sx/torrent/8521369/

@fingerprint.route('/set-fp', methods=['POST'])
def set_fingerprint():
    import hashlib
    from app import set_fp_callback
    fp_hashes = dict()
    geoip_result = dict()

    fp_hashes['browser'] = hashlib.md5(request.json['mimetypes'].encode('utf-8') + (request.json['fontlist'] or request.json['fonts_all']).encode('utf-8') + request.json['navigator_hash'].encode('utf-8')).hexdigest()
    fp_hashes['system'] = hashlib.md5(str(request.json['timezone']) + request.json['os'] + request.json['screen']).hexdigest()
    #fp_hashes['navigator'] = request.json['navigator_hash']
    fp_hashes['browser_hdrs'] = hashlib.md5(request.headers['Accept'] + request.headers['Accept-Language'] + request.headers['Accept-Encoding']).hexdigest()
    fp_hashes['system_browser'] = hashlib.md5(fp_hashes['system'] + fp_hashes['browser_hdrs']).hexdigest()

    geoip_result['client_ip'] = request.headers['X-Forwarded-For'] if request.headers.get('X-Forwarded-For') else request.remote_addr
    geoip_result['city'] = gi.record_by_addr(geoip_result['client_ip']) if gi else None
    geoip_result['org'] = gi_org.org_by_addr(geoip_result['client_ip']) if gi_org else None

    return jsonify(result=set_fp_callback(request.json, request.json['uid'], fp_hashes, geoip_result))

# On run
deps_js = Bundle('javascript/swfobject.min.js', 'javascript/jquery.json-2.3.min.js', 'javascript/jquery.flash.js', 'javascript/evercookie/evercookie.js', 'javascript/sha1.js') # + Jquery
fp_js = Bundle('javascript/plugindetect/plugindetect.js', 'javascript/fontdetect.js', 'javascript/fingerprint.js')
assets.register('js_fingerprint', Bundle(deps_js, fp_js, output='gen/fingerprint.js'))
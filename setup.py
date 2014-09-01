from setuptools import setup
import os

packages = ['flask', 'flask-assets', 'yuicompressor', 'flask-util-js']

setup(name='Flask-Fingerprint',
    version='1.0',
    description='Fingerprint',
    author='Pidorashque',
    author_email='example@example.com',
    url='https://pypi.python.org/pypi',
    install_requires=packages,
)
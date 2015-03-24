from distutils.core import setup
from setuptools import find_packages

setup(
    name='painted-word',
    version='0.1.8',
    author='Mike Vattuone',
    author_email='mvattuone@gmail.com',
    url='https://github.com/mvattuone/painted-word',
    license='LICENSE.txt',
    description='A set of helpers for building an image based campaign.  Plays nicely with the Actionkit CRM.',
    long_description=open('README.txt').read(),
    install_requires=[
        "Django>=1.4.5",
    ],
    packages=find_packages(),
    include_package_data=True,
)

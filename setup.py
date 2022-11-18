"""
Copyright 2019-2022 DataRobot, Inc. and its affiliates.
All rights reserved.
"""
import os

from setuptools import find_packages, setup


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


test_requirements = [
    'black',
    'isort',
    'autoflake',
]

release_requirements = [
    'twine>=1.13.0',
]


setup(
    name='mkdocs-techdocs-redirects',
    version='0.1.2',
    description='A MkDocs plugin to redirect old links to new addresses for TechDocs.',
    long_description=read('README.md'),
    long_description_content_type="text/markdown",
    keywords='mkdocs redirect techdocs',
    url='https://github.com/matchaxnb/mkdocs-techdocs-redirects',
    author='Macha Desoutter',
    author_email='matchaxnb@proton.me',
    license='MIT',
    license_files=['LICENSE'],
    python_requires='>=3.6',
    install_requires=[
        'mkdocs>=1.1.1',
    ],
    extras_require={
        'dev': test_requirements + release_requirements,
        'test': test_requirements,
        'release': release_requirements,
    },
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Intended Audience :: Information Technology',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
    ],
    packages=find_packages(),
    entry_points={
        'mkdocs.plugins': [
            'redirects = techdocs_redirects.plugin:RedirectPlugin',
        ]
    },
)

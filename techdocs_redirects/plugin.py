"""
Copyright 2019-2022 DataRobot, Inc. and its affiliates.
All rights reserved.
"""
import json

from mkdocs.config import config_options
from mkdocs.plugins import BasePlugin


def create_or_update_techdocs_metadata(site_dir, extra_data):
    metadata = None
    try:
        with open(f'{site_dir}/techdocs_metadata.json', 'r', encoding='utf-8') as fh:
            metadata = json.load(fh)
    except FileNotFoundError:
        metadata = {}
    metadata.update(extra_data)
    with open(f'{site_dir}/techdocs_metadata.json', 'w', encoding='utf-8') as fh:
        json.dump(metadata, fh)

class RedirectPlugin(BasePlugin):
    # Any options that this plugin supplies should go here.
    config_scheme = (
        ('redirect_maps', config_options.Type(dict, default={})),  # note the trailing comma
    )

    # Create TechDocs metadata in the metadata file
    def on_post_build(self, config, **kwargs):
        create_or_update_techdocs_metadata(config['site_dir'], {'redirects': self.redirects})

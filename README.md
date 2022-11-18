# mkdocs-techdocs-redirect

Plugin to handle redirections for techdocs sites.

Uses (almost) the same config and is inspired by and initially forked from [mkdocs-redirects](https://github.com/mkdocs/mkdocs-redirects).

## Installing

> **note:** This package requires MkDocs version 1.0.4 or higher.

Install with pip:

```bash
pip install mkdocs-techdocs-redirects
```

## Using

To use this plugin, specify your desired redirects in the plugin's `redirect_maps` setting in your `mkdocs.yml`:

```yaml
plugins:
    - redirects:
        redirect_maps:
            'old': 'new'
            'old/file': 'new/file'
            'some_path': 'http://external.url.com/foobar'
```

Opposite to what mkdocs-redirects does, do not specify `.md` or `.html`. We are running in TechDocs only.

## Looking to contribute?

- Please propose tests.

## More docs? How to setup on backstage?

[Read the TechDocs](docs/index.md)

# Development - Netbox Reorder Rack

## Installation
```shell
git clone ...
cd netbox-reorder-rack
source /opt/netbox/venv/bin/activate
pip install -e .
```

Edit `configuration.py` to include the plugin:
```python
PLUGINS = ["netbox_reorder_rack"]
```

Start the development server:
```shell
python3 manage.py runserver
```

## JavaScript Development
To edit javascript you must change files contained within static_dev and then run the following command to compile the javascript:
```shell
node bundle.js
```

## Build

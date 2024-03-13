from setuptools import find_packages
from setuptools import setup

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="netbox_reorder_rack",
    version="1.0.0",
    author="Alex Gittings",
    author_email="agitting96@gmail.com",
    description="NetBox plugin to reorder rack layouts.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    install_requires=[],
    url="https://github.com/minitriga/netbox-reorder-rack/",
    project_urls={
        "Bug Tracker": "https://github.com/minitriga/netbox-reorder-rack/issues",
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Framework :: Django",
    ],
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
)

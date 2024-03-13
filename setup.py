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
    url="",
    project_urls={
        "Bug Tracker": "",
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
)

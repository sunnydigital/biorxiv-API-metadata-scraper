# biorxiv-API-metadata-scraper
Scraper for bioRxiv to obtain metadata relevant to licensing for all articles, and the metadata themselves from the publicly-available API on BioRxiv, i.e. the licenses and URLs of all preprints on BioRxiv

![](assets/BioRxiv_logo.png)

## Installation

### Prerequisites

- [Python 3.6+](https://www.python.org/downloads/)
- [Jupyter Notebook](https://jupyter.org/install)
- [requests](https://requests.readthedocs.io/en/master/)
- [json](https://docs.python.org/3/library/json.html)
- [pandas](https://pandas.pydata.org/pandas-docs/stable/getting_started/install.html)

### Clone

- Clone this repo to your local machine using from the GitHub link

## Usage

- The `full-dict` folder contains dictionaries relevant to yearly, monthly, and daily outputs for the scraper. It essentially contains all of the metadata for all articles on bioRxiv, and is updated daily.

- The `global_dicts` folder contains three individual `.json` files associated with the data:
    - `return_dict.json` contains the metadata for all articles on bioRxiv, grouped by license type/count and doi as sub objects to their own `.json`s.
    - `full_dict_by_date.json` contains the metadata for each date on bioRxiv, and is updated daily.
    - `dict_by_license.json` contains all of the metadata for each license type on bioRxiv, and is updated daily.

In the spirit of open-source, when running the notebook `continuing-scraper.ipynb`, this will automatically append any relevant `return_dict.json` and `full-dict.json` files into the correct location in the repository. Please create a pull request for this, as this open-sourced nature ensures up-to-date data.

Through running `continuing-scraper.ipynb`, all addended files will be added to the `amend_dict` folder. Thank you for your contribution!

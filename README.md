# biorxiv-scraper
Scraper for bioRxiv to obtain metadata relevant to licensing for all articles, and the metadata themselves from the publicly-available API on bioRxiv

## Usage

- The `full-dict` folder contains dictionaries relevant to yearly, monthly, and daily outputs for the scraper. It essentially contains all of the metadata for all articles on bioRxiv, and is updated daily.

- The `global_dicts` folder and in particular `return_dict.json` contain relevant metadata, and in particular metadata on licensing.

In the spirit of open-source, when running the notebook `continuous-scraper.ipynb`, this will automatically append any relevant `return_dict.json` and `full-dict` files into the correct location in the repository. Please create a pull request for this, as this open-sourced nature ensures up-to-date data.
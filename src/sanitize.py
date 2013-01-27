#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys, json
from HTMLParser import HTMLParser

class MLStripper(HTMLParser):
    def __init__(self):
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()

def main(argv = None):
    with open('export.json', 'r') as f:
        content = f.read()
        phrase_records = json.loads(content)

        for entry in phrase_records:
            if ('source' in entry) and ('source' in entry['source']) and (entry['source']['source'] is not None):
                entry['source']['source'] = strip_tags(entry['source']['source'])


            if ('sourceDescripton' in entry) and ('sourceDescripton' in entry['sourceDescripton']) and (entry['sourceDescripton']['sourceDescripton'] is not None):
                entry['sourceDescripton']['sourceDescripton'] = strip_tags(entry['sourceDescripton']['sourceDescripton'])


            if ('recognize' in entry) and ('recognized' in entry['recognize']) and (entry['recognize']['recognized'] is not None):
                entry['recognize']['recognized'] = strip_tags(entry['recognize']['recognized'])

        sanitized_json = json.dumps(phrase_records) #, ensure_ascii=False)
        print sanitized_json

if __name__ == "__main__":
    sys.exit(main());

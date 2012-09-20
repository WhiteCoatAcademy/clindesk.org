from flask_frozen import Freezer
from clindesk import app
from BaseHTTPServer import HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler
import os


freezer = Freezer(app)


if __name__ == '__main__':
    freezer.freeze()
    print("\nFrozen! Running web server on port 5000.\n Try: http://localhost:5000/")
    os.chdir('build/')  # Hack job?
    # This doesn't always terminate, unfortunately. Ctrl-C multiple times.
    httpd = HTTPServer(('0.0.0.0', 5000), SimpleHTTPRequestHandler)
    httpd.serve_forever()

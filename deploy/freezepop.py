#!/usr/bin/env python
# Freeze Flask as static files & deploy to S3, which backs CloudFront.
# Author: semenko
#
""" Auto-deploy Frozen Flask sites to S3-backed CloudFront. """

from base64 import b64encode
from boto.s3.connection import S3Connection
import boto.s3.key
import argparse
import time
from flask_frozen import Freezer
from BaseHTTPServer import HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler
import os
import sys
from hashlib import md5

def main():
    """
    Freeze clindesk/WCA, run a local web instance to test, and resync S3 staging/prod stores.
    """

    parser = argparse.ArgumentParser(description='The ClinDesk and WCA S3/AWS management script.')

    parser.add_argument('--deploy', '-d', action='store_true', default=False,
                        dest='deploy',
                        help='Deploy staging and prod to S3.')

    parser.add_argument('--no-purge', action='store_true', default=False,
                        dest='no_purge',
                        help='Don\'t purge orphan S3 files in Prod (staging always purges).')

    parser.add_argument('--no-prod', action='store_true', default=False,
                        dest='no_prod',
                        help='Don\'t touch Prod. (git branch "prod")')

    parser.add_argument('--no-staging', action='store_true', default=False,
                        dest='no_staging',
                        help='Don\'t touch Staging. (git branch "master")')

    parser.add_argument('--no-freeze', action='store_true', default=False,
                        dest='no_freeze',
                        help='Don\'t freeze Flask app first (assumes build/ is current)')

    args = parser.parse_args()

    # Special IAM user: deploy-bot
    with open('.awskey', 'r') as secret_key:
        os.environ['AWS_ACCESS_KEY_ID'] = 'AKIAI2RJXWXDP2MGMWQA'
        os.environ['AWS_SECRET_ACCESS_KEY'] = secret_key.readline()

    if args.deploy:

        if not args.no_freeze:
            if not args.no_staging:
                pass
            if not args.no_prod:
                pass
        else:
            print('*** Skipping Flask freeze. Are you sure you wanted that?')


        # Connect
        print('Connecting to AWS...')
        conn = S3Connection()


        bucket = conn.lookup('staging.clindesk.org')
        if not bucket:
            sys.stderr.write('Cannot find bucket!\n')
#            os.unlink(pidfile)
            sys.exit(1)


        cloud_set = set()
        cloud_hashes = {}
        local_set = set()
        local_hashes = {}
        print("Getting cloud file list ...")
        
        # Make a list of cloud objects & etag hashes
        # NOTE: Boto claims it provides a Content-MD5 value, but it totally lies.
        objects = bucket.list()
        for storage_object in objects:
            cloud_set.add('../build/' + storage_object.name) # TODO: Fix this hack
            cloud_hashes['../build/' + storage_object.name] = storage_object.etag

        print("Files in cloud: %s" % str(len(cloud_set)))

        # Build local files an a (more complex) hash list for Boto
        for dirname, dirnames, filenames in os.walk('../build'):
            for filename in filenames:
                full_path = os.path.join(dirname, filename)
                local_set.add(full_path)
                # Add checksums on files
                cksum = md5()
                cksum.update(open(full_path).read())
                local_hashes[full_path] = (cksum.hexdigest(), b64encode(cksum.digest()))

        print("Files on disk: %s" % str(len(local_set)))
        upload_pending = local_set.difference(cloud_set)
        delete_pending = cloud_set.difference(local_set)

        for filename, hashes in local_hashes.iteritems():
            hex_hash, b64hash = hashes
            if cloud_hashes.get(filename) != '"' + hex_hash + '"':
                print "weird. %s" % filename
                delete_pending.add(filename)
                upload_pending.add(filename)

        print("\nDelete Pending: %s" % str(len(delete_pending)))
        print("Upload Pending: %s" % str(len(upload_pending)))
        sys.exit(1)
        if len(delete_pending) > 0 and not args.no_purge:
            print("\nDeleting orhpans ...")
            for delete_file in delete_pending:
                print "\t %s" % str(delete_file)
                bucket.delete_key(delete_file)

        # Note: We don't need to setup permission here (e.g. k.make_public()), because there is
        # a bucket-wide AWS policy: http://docs.amazonwebservices.com/AmazonS3/latest/dev/WebsiteAccessPermissionsReqd.html
        if len(upload_pending) > 0:
            print("Uploading files ...")
            for upload_file in upload_pending:
                k = boto.s3.key.Key(bucket)
                web_name = ''.join(upload_file.split('/', 2)[2:])
                k.key = web_name
                k.set_metadata('Content-MD5', local_hashes[upload_file][1])
                k.set_metadata('md5', local_hashes[upload_file][0])
                k.set_metadata('base64md5', local_hashes[upload_file][0])
                k.set_contents_from_filename(upload_file, md5=local_hashes[upload_file])

        print('All done!')

    else:
        print('Doing nothing. Type -h for help.')

    return True


if __name__ == '__main__':
    main()

#    freezer.freeze(app)
#    print("\nFrozen! Running web server on port 5000.\n Try: http://localhost:5000/")
#    os.chdir('build/')  # Hack job?
#    # This doesn't always terminate, unfortunately. Ctrl-C multiple times.
#    httpd = HTTPServer(('0.0.0.0', 5000), SimpleHTTPRequestHandler)
#    httpd.serve_forever()
#!/usr/bin/python

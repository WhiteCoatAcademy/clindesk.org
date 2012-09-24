#!/usr/bin/env python
# Freeze Flask as static files & deploy to S3, which backs CloudFront.
#
# Author: semenko
#
""" Auto-deploy Frozen Flask sites to S3-backed CloudFront. """

import argparse
import imp
import os
import subprocess
import sys

from base64 import b64encode
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from flask_frozen import Freezer
from hashlib import md5


def main():
    """
    Freeze clindesk/WCA, run a local web instance to test, and resync S3 staging/prod stores.
    """

    parser = argparse.ArgumentParser(description='The ClinDesk and WCA S3/AWS management script.')

    parser.add_argument('--test', '-t', action='store_true', default=False,
                        dest='freeze_only',
                        help='Test the freeze results. Will NOT deploy.')

    parser.add_argument('--deploy', '-d', action='store_true', default=False,
                        dest='deploy',
                        help='Deploy staging and prod to S3. Will NOT test.')

    parser.add_argument('--no-delete', action='store_true', default=False,
                        dest='no_delete',
                        help='Don\'t delete orphan S3 files.')

    parser.add_argument('--no-cd', action='store_true', default=False,
                        dest='no_cd',
                        help='Don\'t touch ClinDesk')

    parser.add_argument('--no-wca', action='store_true', default=False,
                        dest='no_wca',
                        help='Don\'t touch White Coat Academy.')

    parser.add_argument('--no-freeze', action='store_true', default=False,
                        dest='no_freeze',
                        help='Don\'t freeze Flask app first (assumes build/ is current)')

    args = parser.parse_args()

    # Special IAM user: deploy-bot
    with open('.awskey', 'r') as secret_key:
        os.environ['AWS_ACCESS_KEY_ID'] = 'AKIAI2RJXWXDP2MGMWQA'
        os.environ['AWS_SECRET_ACCESS_KEY'] = secret_key.readline()

    if args.deploy or args.freeze_only:
        # Some flag constraints.
        assert((args.deploy and not args.freeze_only) or (args.freeze_only and not args.no_freeze))
        assert(not args.no_cd or not args.no_wca)

        # Find the current git branch:
        #  master -> staging
        #  prod -> prod
        current_branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).strip()
        if current_branch == "master":
            print("Working in staging (your current git branch is: master)")
        elif current_branch == "prod":
            print("Workig on **prod** (your current git branch is: prod)")
        else:
            raise Exception('Unknown branch! Cannot deploy.')

        # Freeze each app, if requested.
        # Per internal app configs, these make "frozen" static copies of these apps in:
        #    ./cd_frozen/
        #    ./wca_frozen/
        if not args.no_freeze:
            if not args.no_cd:
                print("Freezing ClinDesk app ...")
                print("*** Look for errors here *** \n")
                clindesk = imp.load_source('clindesk', '../clindesk.py')
                frozen_cd = Freezer(clindesk.app)
                frozen_cd.freeze()
                print("")
            if not args.no_wca:
                print("Freezing WCA app ...")
                print("*** Look for errors here *** \n")
                wca = imp.load_source('wca', '../wca.py')
                frozen_wca = Freezer(wca.app)
                frozen_wca.freeze()
                print("")
        else:
            print('*** Skipping Flask freeze. Are you sure you wanted that?')


        # Push the frozen apps above to S3, if we want.
        if args.deploy:
            if current_branch is "master":
                bucket_prefix = "staging"
            elif current_branch is "prod":
                bucket_prefix = None
            else:
                # We did this above, but just in case.
                raise Exception('Unknown git branch!')

            #### Connect to S3
            print('Connecting to AWS...')
            conn = S3Connection()

            # Deploy: (conn, frozen_path, remote_bucket)\
            if not args.no_cd:
                deploy_to_s3(conn, 'cd_frozen', bucket_prefix + 'clindesk.org', args.no_delete)
            if not args.no_wca:
                deploy_to_s3(conn, 'wca_frozen', bucket_prefix + 'whitecoatacademy.org', args.no_delete)

        print('All done!')
    else:
        print('Doing nothing. Type -h for help.')

    return True


def deploy_to_s3(conn, frozen_path, bucket, no_delete):
    """ Deploy a frozen app to S3, semi-intelligently. """
    
    # Get our bucket
    bucket = conn.lookup('staging.clindesk.org')
    if not bucket:
        sys.stderr.write('Cannot find bucket!\n')
        sys.exit(1)

    # Data structures
    cloud_set = set()
    cloud_hashes = {}
    local_set = set()
    local_hashes = {}
    
    print("Getting cloud file list ...")
    # Make a list of cloud objects & etag hashes
    # NOTE: Boto claims it provides a Content-MD5 value, but it totally lies.
    objects = bucket.list()
    for storage_object in objects:
        cloud_set.add('../build/' + storage_object.name)  # TODO: Fix this hack
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

    # Completely missing files
    upload_pending = local_set.difference(cloud_set)
    delete_pending = cloud_set.difference(local_set)

    # Compare local and cloud hashes
    for filename, hashes in local_hashes.iteritems():
        hex_hash, b64hash = hashes
        if cloud_hashes.get(filename) != '"' + hex_hash + '"':
            print("New hash for: %s" % filename)
            # NOTE: AWS overwrites uploads, so no need to delete first.
            upload_pending.add(filename)

    # Note: We don't need to setup permission here (e.g. k.make_public()), because there is
    # a bucket-wide AWS policy: http://docs.amazonwebservices.com/AmazonS3/latest/dev/WebsiteAccessPermissionsReqd.html
    if len(upload_pending) > 0:
        print("Upload pending: %s" % str(len(upload_pending)))
        for upload_file in upload_pending:
            k = Key(bucket)
            web_name = ''.join(upload_file.split('/', 2)[2:])
            k.key = web_name
            k.set_contents_from_filename(upload_file, md5=local_hashes[upload_file])

    # Delete orphans, maybe.
    if len(delete_pending) > 0 and not no_delete:
        print("\nDeleting: %s" % str(len(delete_pending)))
        for delete_file in delete_pending:
            print("\t %s" % str(delete_file))
            bucket.delete_key(delete_file)


if __name__ == '__main__':
    main()

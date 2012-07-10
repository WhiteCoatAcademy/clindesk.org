#!/usr/bin/env python
# Deploy ClinDesk & WCA nodes on EC2
# Author: semenko
#
# TODO: Make this not a hackjob.

from fabric.api import *
import boto.ec2
from boto.ec2.connection import EC2Connection
from boto.ec2.blockdevicemapping import BlockDeviceType
from boto.ec2.blockdevicemapping import BlockDeviceMapping
import time
import sys

NODES = {
    'ec2-us-east-1.clindesk.org': 'keys/clindesk-web-us-east-1.pem',
    'ec2-us-west-1.clindesk.org': 'keys/clindesk-web-us-west-1.pem',
    }


def main():
    """ Let's go to work! """

    # Special IAM user: deploy-bot
    # Access Key Id: AKIAJC43XOE4LZQBPETA
    with open('.awskey', 'r') as secret_key:
        conn = EC2Connection('AKIAJC43XOE4LZQBPETA', secret_key.readline())

    regions = boto.ec2.regions()
    print('Available regions: %s\n' % regions)

    # Build a list of our instances
    connections = {}
    for region in regions:
        print('Region %s' % region)
        c = region.connect()
        connections[region] = {}
        connections[region]['conn']= c
        reservations = c.get_all_instances()
        instances = []
        for i in reservations:
            instances.extend(i.instances)
        connections[region]['instances'] = instances
        running = 0
        for i in instances:
            print('\t%s: %s' % (i.id, i.state))
            if i.state == 'running':
                running += 1
        print('** %s instances running in %s\n\n' % (running, region))

    print('---------------------------------------')
    raw_input('Press any key to terminate all instances. Ctrl-C to abort.')
    raw_input('Last chance!')
    print('')

    # Kill existing running instances
    for k, v in connections.iteritems():
        kill_list = []
        for i in v['instances']:
            if i.state == 'running':
                kill_list.append(i.id)

        if len(kill_list) > 0:
            print('Terminating %s instances in %s' % (len(kill_list), k))
            v['conn'].terminate_instances(kill_list)
            print('')

    # Start two nodes
    print('Starting instance, east')
    launchBaseInstance('ami-8cfa58e5', 'us-east-1', 'clindesk-web-us-east-1')

    print('Starting instance, west')
    launchBaseInstance('ami-5d654018', 'us-west-1', 'clindesk-web-us-west-1')

    print('Sleeping 20 seconds to wait for boot...')
    time.sleep(20)

    for host, key in NODES.iteritems():
        deploy(host, key)


# Launch an instance and associate EIPs
def launchBaseInstance(ami, placement, key_name):
    conn = boto.ec2.connect_to_region(placement)
    reservation = conn.run_instances(ami, instance_type='t1.micro', key_name=key_name, security_groups=['clindesk-web'])
    # And assume that the instance we're talking about is the first in the list
    # This is not always a good assumption, and will likely depend on the specifics
    # of your launching situation. For launching an isolated instance while no
    # other actions are taking place, this is sufficient.
    instance = reservation.instances[0]

    print('Waiting for instance to start...')
    # Check up on its status every so often
    status = instance.update()
    while status == 'pending':
        time.sleep(10)
        status = instance.update()
        print '\t%s' % status
    if status == 'running':
        print('New instance "' + instance.id + '" accessible at ' + instance.public_dns_name)
    else:
        print('Instance status: ' + status)

    # Associate elastic ip. This can only handle one.
    eips = conn.get_all_addresses()
    if len(eips) == 1:
        print('Associating elastic ip: %s\n' % eips[0])
        eips[0].associate(instance.id)
    else:
        print('Too many EIPs allocated!! %s\n' % eips)
    return


# FAB deploy and install things
def deploy(host_string, key_filename):
    print host_string
    print key_filename
    with settings(host_string=host_string, user = "ubuntu", key_filename=key_filename):
        # Basic install stuff
        run('uname -ar')
        sudo('apt-get remove -y whoopsie')
        sudo('apt-get update')
        sudo('apt-get -y -V upgrade')
        sudo('apt-get -y install git python2.7-dev python-virtualenv libevent-dev nginx htop supervisor gcc')

        def deploy_app(username, git_branch_name):
            sudo('sudo adduser --disabled-password --disabled-login --system --group ' + username)
            with cd('/home/' + username + '/'):
                sudo('virtualenv .', user=username)
                sudo('mkdir -p .ssh', user=username)
                sudo('echo -e "Host github.com\n\tStrictHostKeyChecking no\n" >> /home/' + username + '/.ssh/config', user=username)
                virtualenv('/home/' + username + '/', username, 'pip install gunicorn gevent greenlet flask')

            # TODO: Move this somewhere
            put('keys/ec2-github-deploy', '/home/' + username + '/.ssh/id_rsa', use_sudo=True, mode=0400)
            sudo('chown ' + username + ':' + username + ' /home/' + username + '/.ssh/id_rsa')

            with cd('/home/' + username + '/'):
                sudo('git clone -b ' + git_branch_name + ' git@github.com:semenko/clindesk.git', user=username)

            # We gotta' make a log dir
            # The run script now does this too, but w/e
            sudo('mkdir /var/log/gunicorn-' + username + '/ ; chown ' + username + ':' + username + ' /var/log/gunicorn-' + username + '/')

            # We put w/ sudo so the executable file is not editable. Not sure about the supervisor hierarchy.
            put('scripts/run_gunicorn_' + username + '.sh', '/home/' + username + '/', use_sudo=True, mode=0555)

            # Add the nginx config
            sudo('rm -f /etc/nginx/sites-enabled/nginx_' + username + '.conf')
            put('conf/nginx_' + username + '.conf','/etc/nginx/sites-available/', use_sudo=True, mode=0444)
            sudo('ln -s /etc/nginx/sites-available/nginx_' + username + '.conf /etc/nginx/sites-enabled/')

            # Add the supervisord config
            put('conf/supervisord_' + username + '.conf','/etc/supervisor/conf.d/', use_sudo=True, mode=0444)


        # Deploy our two apps
        deploy_app('clindesk-prod', 'master')
        deploy_app('clindesk-staging', 'staging')

        # Stop supervisord.
        sudo('invoke-rc.d supervisor stop')

        # Drop the nginx default config
        sudo('rm -f /etc/nginx/sites-enabled/default')

        # A general supervisord config file
        sudo('rm /etc/supervisor/supervisord.conf')
        put('conf/supervisord.conf','/etc/supervisor/', use_sudo=True, mode=0444)

        sudo('invoke-rc.d supervisor start')

        # Give supervisord bits to clindesk-staging
        # TODO: Change this to something more secure!
        sudo('chgrp clindesk-staging /run/supervisor.sock ; chmod g+rw /run/supervisor.sock');

        # Start nginx
        sudo('invoke-rc.d nginx start')

def virtualenv(envpath, user, command):
    with cd(envpath):
        sudo('source ' + envpath + 'bin/activate' + ' && ' + command, user=user)


if __name__ == '__main__':
    main()

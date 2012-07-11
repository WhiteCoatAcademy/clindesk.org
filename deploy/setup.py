#!/usr/bin/env python
# Deploy ClinDesk & WCA nodes on EC2
# Author: semenko
#

from fabric.api import *
import boto.ec2
from boto.ec2.connection import EC2Connection
from boto.ec2.blockdevicemapping import BlockDeviceType
from boto.ec2.blockdevicemapping import BlockDeviceMapping
import argparse
import time
import sys

def main():
    """
    Dispatch our update/deploy jobs.

    Warning: This may cost you a money! EC2/AWS is not cheap -- be very careful!
    """

    parser = argparse.ArgumentParser(description='The ClinDesk and WCA EC2/AWS management script.')

    parser.add_argument('--launch', '-l', action='store_true', default=False,
                        dest='launch_ec2',
                        help='Launch EC2 instances.')

    parser.add_argument('--no-terminate', action='store_true', default=False,
                        dest='no_terminate',
                        help='Skip instance termination.')

    parser.add_argument('--no-eip-switch', action='store_true', default=False,
                        dest='no_eip_switch',
                        help='Don\'t re-associate the EIP assignments.')

    parser.add_argument('--no-setup', action='store_true', default=False,
                        dest='no_setup',
                        help='Don\'t setup the nodes in any way.')

    args = parser.parse_args()

    if args.launch_ec2:
        print('Preparing to deploy EC2 instances.')

        # Connect
        print('Connecting to AWS...')
        # Special IAM user: deploy-bot
        # Access Key Id: AKIAJC43XOE4LZQBPETA
        with open('.awskey', 'r') as secret_key:
            conn = EC2Connection('AKIAJC43XOE4LZQBPETA', secret_key.readline())

        regions = boto.ec2.regions()
        print('Available regions: %s\n' % regions)


        # Get a list of our instances
        print('Getting list of our instances...')
        instances = list_our_instances(conn, regions)


        # Run our instances
        print('Deploying two instances...')
        print('Starting instance, east')
        east_conn, east_instance = launchBaseInstance('ami-8cfa58e5', 'us-east-1', 'clindesk-web-us-east-1')

        print('Starting instance, west')
        west_conn, west_instance = launchBaseInstance('ami-5d654018', 'us-west-1', 'clindesk-web-us-west-1')

        if not args.no_setup:
            print('Setting up nodes.')
            print('Sleeping 20 seconds to wait for boot...')
            time.sleep(20)

            # TODO: Modularize this.
            deploy(east_instance, 'keys/clindesk-web-us-east-1.pem')
            deploy(west_instance, 'keys/clindesk-web-us-west-1.pem')
        else:
            print('*** Skipping node setup. Good luck, Jedi.')

        # Let's move EIPs now, to decrease downtime
        #  Not sure if AWS EIP transfers are seamless.
        if not args.no_eip_switch:
            print('Moving EIPs to new instances.')
            print('\tMoving East EIP...')
            transfer_EIPs(east_conn, east_instance)
            print('\tMoving West EIP...')
            transfer_EIPs(west_conn, west_instance)
        else:
            print('*** Leaving EIPs in place. Are you sure you wanted that?')

        # Should we terminate existing instances?
        if not args.no_terminate:
            print('Terminating existing EC2 instances.')
            terminate_connections(instances)
        else:
            print('***** WARNING ******')
            print('You have asked to not terminate existing instances.')
            print('*** THIS MAY BE VERY EXPENSIVE! BE CAREFUL! ***')

    else:
        print('Doing nothing. Type -h for help.')

    return True


def list_our_instances(conn, regions):
    """ List all EC2 instances we own in every region. """

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

    return connections


def terminate_connections(connections):
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

    print('All done!')
    return True


# Launch an instance
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
    return conn, instance

# Transfer EIPs
def transfer_EIPs(conn, instance):
    """ Associate elastic ip. This can only handle one. """
    eips = conn.get_all_addresses()
    if len(eips) == 1:
        print('\tAssociating elastic ip: %s\n' % eips[0])
        eips[0].associate(instance.id)
    else:
        print('**** OMG **** Too many EIPs allocated!! %s\n' % eips)
        print('Fix this by hand. Now.')
    return


# FAB deploy and install things
# TODO: Modularize this more
def deploy(instance, key_filename):
    host_string = instance.public_dns_name
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
                # TODO: Put in the real SSH key here.
                sudo('echo -e "Host github.com\n\tStrictHostKeyChecking no\n" >> /home/' + username + '/.ssh/config', user=username)
                # TODO: System-wide pip install? Is that cool?
                # Maybe nested virtual envs?
                # See: http://stackoverflow.com/questions/4324558/whats-the-proper-way-to-install-pip-virtualenv-and-distribute-for-python
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



        #### Deploy our two branches
        deploy_app('clindesk-prod', 'prod')
        deploy_app('clindesk-staging', 'master')


        #### Set up supervisord

        # General config
        sudo('rm /etc/supervisor/supervisord.conf')
        put('conf/supervisord.conf','/etc/supervisor/', use_sudo=True, mode=0444)

        # Clindesk config
        put('conf/supervisord_cd.conf','/etc/supervisor/conf.d/', use_sudo=True, mode=0444)

        sudo('supervisorctl reload')


        #### Set up nginx

        # Drop the nginx default config
        sudo('rm -f /etc/nginx/sites-enabled/default')

        # Add the nginx ClinDesk config
        sudo('rm -f /etc/nginx/sites-enabled/nginx_cd.conf')
        put('conf/nginx_cd.conf','/etc/nginx/sites-available/', use_sudo=True, mode=0444)
        sudo('ln -s /etc/nginx/sites-available/nginx_cd.conf /etc/nginx/sites-enabled/')
        
        # Start nginx
        sudo('invoke-rc.d nginx start')




def virtualenv(envpath, user, command):
    with cd(envpath):
        sudo('source ' + envpath + 'bin/activate' + ' && ' + command, user=user)


if __name__ == '__main__':
    main()

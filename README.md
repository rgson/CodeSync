# CodeSync

CodeSync is a platform for real-time code synchronisation and collaboration between members of a project team.



## Technical details

The project is split into two separate components with various dependencies. The website component handles web requests, users and projects while the SyncServer component handles code synchronisation, file handling and project-wide events.

The website is built in PHP with the Laravel 5 framework. Serving is handled by Apache 2 and data storage uses MySQL. The SyncServer is built in JavaScript using node.js. Redis is used for cross-server synchronisation of file locking and project subscriptions. The SyncServer also depends on the MySQL server used by the website.

The website and SyncServer can be deployed independently, as their only common dependency is the MySQL server. Additionally, multiple instances of the SyncServer can be set up independently behind a websocket load balancer with file sharing handled through a POSIX-compatible shared file systems such as CephFS mounted to `/mnt/codesync`. Duplication of the common dependencies (MySQL, Redis) can be accomplished through existing duplication solutions for each service respectively.


### Communication

Communication with the SyncServer should be handled through the SyncClient API defined in `website/public/scripts/editor.syncclient.js`. For detailed documentation of the actual protocol used for direct communication with the SyncServer, see `CodeSyncDocs.htm`.



## Setup

The project uses [Vagrant](https://www.vagrantup.com/) for easy setup of the development environment. To set the system up for development, simple clone the project and run `vagrant up`. The website can then be accessed by opening `http://localhost:8080/` in your web browser.

For deployment, consult the installation script included in the `Vagrantfile` and modify it to suit your setup. Additionally, configure the components to use correct connection information for MySQL and Redis and make sure the SyncClient's host information matches your domain.

1. Alter `website/.env` to set Laravel to production mode and to configure the MySQL connection.
2. Alter `website/public/scripts/editor.syncclient.js` to set the correct host information for the SyncServer (or the websocket proxy).
3. Alter `syncserver/config.js` to configure the MySQL and Redis connections as well as to set the ports to be used by the SyncServer.

In some environments, the permission of the `website/storage` directory needs to be set manually after setup to allow write access for the web server. For development purposes, this can be done by running `sudo chmod -R 777 /vagrant/website/storage` on the virtual machine. For deployment purposes, alter the command to allow write access only to the user running the web server.

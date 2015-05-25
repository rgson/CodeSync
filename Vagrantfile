$setup = <<SETUP
sudo -i
apt-get update
debconf-set-selections <<< 'mysql-server mysql-server/root_password password root'
debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password root'
apt-get install -y apache2 mysql-server libapache2-mod-auth-mysql php5-mysql php5 libapache2-mod-php5 php5-mcrypt nodejs nodejs-legacy npm build-essential tcl8.5
rm -rf /var/www/html
ln -fs /vagrant/website/public /var/www/html
php5enmod mcrypt
a2enmod rewrite
cat >/etc/apache2/sites-available/000-default.conf <<EOL
<VirtualHost *:80>
	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html
	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined
	<Directory /var/www/html >
		AllowOverride All
	</Directory>
</VirtualHost>
EOL
service apache2 restart
cat >/home/vagrant/.my.cnf <<EOL
[mysql]
user=root
password=root
EOL
echo "CREATE DATABASE codesync" | mysql -u root -proot
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
make install
echo -n | sudo utils/install_server.sh
cd /vagrant/website
composer update
php artisan migrate
php artisan db:seed
cd /vagrant/syncserver
bash install_dependencies.sh
mkdir /mnt/codesync
mkdir /mnt/codesync/pending_downloads
chown -R vagrant /mnt/codesync
mkdir /var/log/syncserver
chown vagrant /var/log/syncserver
SETUP

$startup = <<STARTUP
cd /vagrant/syncserver
nodejs server.js -v > "/var/log/syncserver/$(date +%Y-%m-%d_%H:%M).log" 2>&1 &
STARTUP

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty32"
  config.vm.provision "shell", inline: $setup
  config.vm.provision "shell", inline: $startup, run: "always", privileged: false
  config.vm.network :forwarded_port, host: 8080, guest: 80
  config.vm.network :forwarded_port, host: 6379, guest: 6379
  config.vm.network :forwarded_port, host: 32358, guest: 32358
  config.vm.network :forwarded_port, host: 32359, guest: 32359
  config.vm.synced_folder ".", "/vagrant", :mount_options => ["dmode=777","fmode=666"]
  config.vm.hostname = "vagrant"
end

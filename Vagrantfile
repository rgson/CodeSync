$setup = <<SETUP
apt-get update
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password root'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password root'
apt-get install -y apache2 mysql-server libapache2-mod-auth-mysql php5-mysql php5 libapache2-mod-php5 php5-mcrypt
rm -rf /var/www/html
ln -fs /vagrant/website/public /var/www/html
sudo php5enmod mcrypt
sudo a2enmod rewrite
cat >/etc/apache2/sites-available/000-default.conf <<EOL
<VirtualHost *:80>
	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html
	ErrorLog /error.log
	CustomLog /access.log combined
	<Directory /var/www/html >
		AllowOverride All
	</Directory>
</VirtualHost>
EOL
sudo service apache2 restart
echo "CREATE DATABASE kodeditor" | mysql -u root -proot
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
cd /vagrant/website
composer update
php artisan migrate
php artisan db:seed
SETUP

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty32"
  config.vm.provision "shell", inline: $setup
  config.vm.network :forwarded_port, host: 8080, guest: 80
  config.vm.synced_folder ".", "/vagrant", :mount_options => ["dmode=777","fmode=666"]
  config.vm.hostname = "vagrant"
end

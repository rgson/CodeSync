$setup = <<SETUP
apt-get update
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password root'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password root'
apt-get install -y apache2 mysql-server libapache2-mod-auth-mysql php5-mysql php5 libapache2-mod-php5 php5-mcrypt
rm -rf /var/www/html
ln -fs /vagrant/website/public /var/www/html
sudo php5enmod mcrypt
sudo service apache2 restart
SETUP

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision "shell", inline: $setup
  config.vm.network :forwarded_port, host: 8080, guest: 80
end

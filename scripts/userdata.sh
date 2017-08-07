#!/bin/bash
touch adsfjahsdkfjhasdkjfhaks.txt
curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash -
yum -y install nodejs git
git clone https://github.com/aldy120/pig-rain10.git
cd pig-rain10
npm install
touch routes/mailset.js
npm run production
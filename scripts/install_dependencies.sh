#!/bin/bash
yum update -y
curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash -
yum -y install nodejs git

# Kom Inn

This is the webapplications hosted at kom-inn.org

## Structure

The application is split into two separate parts, web and admin. They do not cross link and serve different
users. The admin parts are intended for only authorized users and is protected by HTTP Auth.

Technically, each of these two are split into a frontend (a React app written and served by NodeJS) and a
backend (a PHP webserver that provides REST JSON api endpoints).

## Install

You need to install PHP and NodeJS locally. Then each of the 4 "application" must get their dependencies installed.

## Run locally

You can run and serve the entire package locally using the `./dev.sh` bash script.
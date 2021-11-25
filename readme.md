## mercurius-postgraphile federation test

#### How to run it
```shell
docker-compose up -d
yarn start:all
yarn start (In another terminal)
```

The gateway is on port 3000. It gets the user id and name from the users service and the email from the postgraphile service
The postgraphile service (Post 3002) serves all the expected queries and mutation, but it doesn't if accessed through the gateway


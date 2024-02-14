# Firefly III KutxaBank Data Importer

This project serves as a proof of concept for importing KutxaBank data from the main account and credit card accounts into [Firefly III](https://www.firefly-iii.org/). The goal is to be able to use exported files from Kutxabank's website, to upload them to this server, parse them, and send them to the [Firefly III Data Importer](https://docs.firefly-iii.org/explanation/data-importer/about/introduction/) in CSV format.

The main account file is exported in `Q43` format, as KutxaBank otherwise truncates transaction concept texts to a maximum number of characters. Credit card files are in `XLS` format.

> **Disclaimer**: This code is specifically tailored to my needs as a proof of concept. Future updates may aim to enhance its versatility for a broader user base.

## Possible Improvements

- Integrate the FireFly III API to dynamically generate a user-friendly form, utilizing the accounts already configured in Firefly III. This enhancement would enable a more straightforward and universal experience for all users.
- Improve instalation to be able to use this project in other type of installations.

## Installation

For now, I'm using this with the [Firefly III and Data Importer installed using the docker compose](https://docs.firefly-iii.org/how-to/data-importer/installation/docker/).

### 1. Create a Firefly III Access Token

Create and save a Firefly Personal Access Token. We are going to use this Access Token for the Data Importer and KutxaBank Data Importer.

> You can generate your own Personal Access Token on the Profile page. Login to your Firefly III instance, go to "Options" > "Profile" > "OAuth" and find "Personal Access Tokens". Create a new Personal Access Token by clicking on "Create New Token". Give it a recognizable name and press "Create".

### 2. Enable Data Importer `/autoimport` route and create the `AUTO_IMPORT_SECRET`

Go to the `.importer.env` file and change the value of the `CAN_POST_AUTOIMPORT` to `true`.

Then create a random secret to use as a value for the `AUTO_IMPORT_SECRET`.

> The auto-import secret must be a string of at least 16 characters.
> [Visit this page for inspiration](https://www.random.org/passwords/?num=1&len=16&format=html&rnd=new).

### 3. Add new `.ff3_kutxa_bank_importer.env` file

Add a new `.ff3_kutxa_bank_importer.env` file with the following content:

```
PORT=8080
AUTO_IMPORT_SECRET=
AUTO_IMPORT_SECRET=
```

- For the `AUTO_IMPORT_SECRET` use the same value you created at step 2.
- For the `AUTO_IMPORT_SECRET` use the same value you created at step 1.

### 4. Modify `docker-compose.yml`

Add this to the `docker-compose.yml`:

```yaml
version: "3.3"

services:
  kutxabank_importer:
    image: ghcr.io/FerranMartin/firefly-iii-kutxabank-data-importer:latest
    restart: always
    container_name: firefly_iii_kutxabank_importer
    hostname: kutxabank_importer
    networks:
      - firefly_iii
    ports:
      - "82:8080"
    depends_on:
      - app
    env_file: PATH_TO_NEW_ENV_FILE/.ff3_kutxa_bank_importer.env
```

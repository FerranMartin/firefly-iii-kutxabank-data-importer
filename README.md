# Firefly III KutxaBank Data Importer

This project serves as a proof of concept for importing KutxaBank data from the main account and credit card accounts into [Firefly III](https://www.firefly-iii.org/). The goal is to be able to use exported files from Kutxabank's website, to upload them to this server, parse them, and send them to the [Firefly III Data Importer](https://docs.firefly-iii.org/explanation/data-importer/about/introduction/) in CSV format.

The main account file is exported in `Q43` format, as KutxaBank otherwise truncates transaction concept texts to a maximum number of characters. Credit card files are in `XLS` format.

**Disclaimer**: This code is specifically tailored to my needs as a proof of concept. Future updates may aim to enhance its versatility for a broader user base.

## Possible Improvements

- Integrate the FireFly III API to dynamically generate a user-friendly form, utilizing the accounts already configured in Firefly III. This enhancement would enable a more straightforward and universal experience for all users.
- Improve the Docker file to be able to use this project in other type of installations.

## Installation

For now, I'm using this with the [Firefly III and Data Importer installed using the docker compose](https://docs.firefly-iii.org/how-to/data-importer/installation/docker/).

### 1. Add new `.ff3_kutxa_bank_importer.env` file

Add new `.ff3_kutxa_bank_importer.env` file with the content:

```
PORT=8080
AUTO_IMPORT_SECRET=
IMORTER_SECRET=
```

### 2. Modify `docker-compose.yml`

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

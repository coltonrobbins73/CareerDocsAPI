version: "3.9"

services:
  reverse-proxy:
    restart: unless-stopped
    image: traefik:v2.9
    platform: linux/unix
    command:
      - --api.insecure=true
      - --providers.docker
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencryptresolver.acme.email=ivan.k.pedroza@gmail.com
      - --certificatesresolvers.letsencryptresolver.acme.storage=/data/acme.json
      - --certificatesresolvers.letsencryptresolver.acme.tlschallenge=true
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./acme.json:/data/acme.json

  app:
    container_name: CareerDocumentsAPI
    image: ivanpedroza/career-docs-api:latest
    tty: true
    stdin_open: true
    restart: always
    ports:
      - "3000:3000"
    environment:
      - SEQ_SERVER
      - SEQ_API_KEY
      - NODE_ENV
      - OPENAI_MODEL
      - OPENAI_API_KEY
      - GEMINI_API_KEY
      - GEMINI_MODEL

    labels:
      - "traefik.http.routers.app.rule=Host(`ec2-54-245-170-196.us-west-2.compute.amazonaws.com`)"
      - "traefik.http.routers.app.tls=true"
      - "traefik.http.routers.app.tls.certresolver=letsencryptresolver"
    depends_on:
      - seq

  seq:
    image: datalust/seq:latest
    container_name: seqhc
    restart: unless-stopped
    volumes:
      - seqhc_data:/data
    ports:
      - "5341:5341"
    environment:
      - ACCEPT_EULA=Y
    labels:
      - "traefik.http.routers.seq.rule=Host(`ec2-35-95-46-69.us-west-2.compute.amazonaws.com`)"
      - "traefik.http.routers.seq.tls=true"
      - "traefik.http.routers.seq.tls.certresolver=letsencryptresolver"

volumes:
  seqhc_data:
  acme:
htop:
  pkg.installed

python.packages:
  pkg.installed:
    - pkgs:
      - build-essential
      - python3-venv
      - python3-wheel
      - python3-dev

docker.io:
  pkg.installed

/etc/hosts:
  file.managed:
    - source: salt://server/hosts.jinja
    - template: jinja

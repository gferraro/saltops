salt_pkgrepo:
  pkgrepo.managed:
    - humanname: SaltStack
    - name: deb https://repo.saltstack.com/apt/ubuntu/18.04/amd64/2018.3 bionic main
    - file: /etc/apt/sources.list.d/saltstack.list
    #- key_url: https://repo.saltstack.com/apt/ubuntu/18.04/amd64/2018.3/SALTSTACK-GPG-KEY.pub
    - clean_file: True
    - refresh: False

